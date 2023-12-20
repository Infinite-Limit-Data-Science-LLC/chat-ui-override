import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import Icons from "unplugin-icons/vite";

export default defineConfig({
	build: {
		rollupOptions: {
			external: ["aws4fetch", "openai", "@xenova/transformers"],
		},
	},
	plugins: [
		sveltekit(),
		Icons({
			compiler: "svelte",
		}),
	],
	server: {
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd()), "/static"],
		},
	},
});
