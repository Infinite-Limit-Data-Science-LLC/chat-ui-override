import { building } from "$app/environment";
import { MONGODB_URL, MONGODB_DB_NAME, MONGODB_DIRECT_CONNECTION } from "$env/static/private";
import { GridFSBucket, MongoClient } from "mongodb";
import type { Conversation } from "$lib/types/Conversation";
import type { SharedConversation } from "$lib/types/SharedConversation";
import type { AbortedGeneration } from "$lib/types/AbortedGeneration";
import type { Settings } from "$lib/types/Settings";
import type { User } from "$lib/types/User";
import type { MessageEvent } from "$lib/types/MessageEvent";
import type { Session } from "$lib/types/Session";
import DatabaseAdapter from "./databaseAdapter";

const adapter = new DatabaseAdapter();
let connectPromise;
let client;
let db;
let collections;

if (adapter.lazy()) {
	adapter.connect();

	// Proxy Collection
	collections = {
		get conversations() { return adapter.conversations },
		get sharedConversations() { return adapter.sharedConversations },
		get abortedGenerations() { return adapter.abortedGenerations },
		get settings() { return adapter.settings },
		get users() { return adapter.users },
		get sessions() { return adapter.sessions },
		get messageEvents() { return adapter.messageEvents },
		get bucket() { return adapter.bucket },
	};
} else {
	if (!MONGODB_URL) {
		throw new Error(
			"Please specify the MONGODB_URL environment variable inside .env.local. Set it to mongodb://localhost:27017 if you are running MongoDB locally, or to a MongoDB Atlas free instance for example."
		);
	}

	if (!building) {
		client = new MongoClient(MONGODB_URL, {
			directConnection: MONGODB_DIRECT_CONNECTION === "true",
		});
	}

	connectPromise = client?.connect().catch(console.error);
	db = client?.db(MONGODB_DB_NAME + (import.meta.env.MODE === "test" ? "-test" : ""));

	const conversations = db?.collection<Conversation>("conversations");
	const sharedConversations = db?.collection<SharedConversation>("sharedConversations");
	const abortedGenerations = db?.collection<AbortedGeneration>("abortedGenerations");
	const settings = db?.collection<Settings>("settings");
	const users = db?.collection<User>("users");
	const sessions = db?.collection<Session>("sessions");
	const messageEvents = db?.collection<MessageEvent>("messageEvents");
	const bucket = db && new GridFSBucket(db, { bucketName: "files" });

	collections = {
		conversations: conversations,
		sharedConversations: sharedConversations,
		abortedGenerations: abortedGenerations,
		settings: settings,
		users: users,
		sessions: sessions,
		messageEvents: messageEvents,
		bucket: bucket,
	};

	client?.on("open", () => {
		conversations
			?.createIndex(
				{ sessionId: 1, updatedAt: -1 },
				{ partialFilterExpression: { sessionId: { $exists: true } } }
			)
			.catch(console.error);
		conversations
			?.createIndex(
				{ userId: 1, updatedAt: -1 },
				{ partialFilterExpression: { userId: { $exists: true } } }
			)
			.catch(console.error);
		abortedGenerations
			?.createIndex({ updatedAt: 1 }, { expireAfterSeconds: 30 })
			.catch(console.error);
		abortedGenerations?.createIndex({ conversationId: 1 }, { unique: true }).catch(console.error);
		sharedConversations?.createIndex({ hash: 1 }, { unique: true }).catch(console.error);
		settings?.createIndex({ sessionId: 1 }, { unique: true, sparse: true }).catch(console.error);
		settings?.createIndex({ userId: 1 }, { unique: true, sparse: true }).catch(console.error);
		users?.createIndex({ hfUserId: 1 }, { unique: true }).catch(console.error);
		users?.createIndex({ sessionId: 1 }, { unique: true, sparse: true }).catch(console.error);
		messageEvents?.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 }).catch(console.error);
		sessions?.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(console.error);
		sessions?.createIndex({ sessionId: 1 }, { unique: true }).catch(console.error);
	});
}

export { collections, connectPromise, client, db };
