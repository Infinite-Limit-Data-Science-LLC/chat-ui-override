import { MONGODB_URL, MONGODB_DB_NAME, MONGODB_DIRECT_CONNECTION } from "$env/static/private";
import { GridFSBucket, MongoClient, Db } from "mongodb";
import type { Conversation } from "$lib/types/Conversation";
import type { SharedConversation } from "$lib/types/SharedConversation";
import type { AbortedGeneration } from "$lib/types/AbortedGeneration";
import type { Settings } from "$lib/types/Settings";
import type { User } from "$lib/types/User";
import type { MessageEvent } from "$lib/types/MessageEvent";
import type { Session } from "$lib/types/Session";

export default class DatabaseAdapter {
	chain: (() => any)[] = [];
	client: MongoClient;
	db: Db | null = null;
	#lazy = process.env.LAZY_LOAD_DB === "true";

	constructor() {
		if (!MONGODB_URL) {
			throw new Error(
				"Please specify the MONGODB_URL environment variable inside .env.local. Set it to mongodb://localhost:27017 if you are running MongoDB locally, or to a MongoDB Atlas free instance for example."
			);
		}

		this.client = new MongoClient(MONGODB_URL, {
			directConnection: MONGODB_DIRECT_CONNECTION === "true",
		});
	}

	lazy() {
		return this.#lazy;
	}

	connect() {
		if(this.#lazy){
			this.chain.push(() => {
				return this.client?.connect();
			});
			this.chain.push(() => {
				this.db = this.client?.db(MONGODB_DB_NAME + (import.meta.env.MODE === "test" ? "-test" : ""));
			});
		} else {
			this.client?.connect().catch(console.error);
			this.client?.db(MONGODB_DB_NAME + (import.meta.env.MODE === "test" ? "-test" : ""));
		}
	}

	get conversations(){
		if (this.#lazy) this.memoizeChain();
		return this.db?.collection<Conversation>("conversations");
	}

	get sharedConversations(){
		if (this.#lazy) this.memoizeChain();
		return this.db?.collection<SharedConversation>("sharedConversations");
	}

	get abortedGenerations() {
		if (this.#lazy) this.memoizeChain();
		return this.db?.collection<AbortedGeneration>("abortedGeneration");
	}

	get settings() {
		if (this.#lazy) this.memoizeChain();
		return this.db?.collection<Settings>("settings");
	}

	get users() {
		if (this.#lazy) this.memoizeChain();
		return this.db?.collection<User>("users");
	}

	get sessions() {
		if (this.#lazy) this.memoizeChain();
		return this.db?.collection<Session>("sessions");
	}

	get messageEvents() {
		if (this.#lazy) this.memoizeChain();
		return this.db?.collection<MessageEvent>("messageEvents");
	}

	get bucket() {
		if (this.#lazy) this.memoizeChain();
		return this.db && new GridFSBucket(this.db, { bucketName: "files" });
	}

	memoizeChain(){
		if(!this.db){
			for(const fn of this.chain){fn()};
		};
	}
}
