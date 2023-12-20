<script lang="ts">
	import type { Message } from "$lib/types/Message";
	import { snapScrollToBottom } from "$lib/actions/snapScrollToBottom";
	import ScrollToBottomBtn from "$lib/components/ScrollToBottomBtn.svelte";
	import { tick } from "svelte";
	import { randomUUID } from "$lib/utils/randomUuid";
	import type { Model } from "$lib/types/Model";
	import ChatIntroduction from "./ChatIntroduction.svelte";
	import ChatMessage from "./ChatMessage.svelte";
	import TemplateHandler from "$lib/components/TemplateHandler.svelte";
	import type { WebSearchUpdate } from "$lib/types/MessageUpdate";
	import { browser } from "$app/environment";
	import SystemPromptModal from "../SystemPromptModal.svelte";
	import Logo from "$lib/components/icons/Logo.svelte";
	import { PUBLIC_APP_NAME, PUBLIC_VERSION } from "$env/static/public";

	export let messages: Message[];
	export let template: Record<string, string>;
	export let loading: boolean;
	export let pending: boolean;
	export let isAuthor: boolean;
	export let currentModel: Model;
	export let models: Model[];
	export let preprompt: string | undefined;
	export let readOnly: boolean;

	let chatContainer: HTMLElement;

	export let webSearchMessages: WebSearchUpdate[] = [];

	async function scrollToBottom() {
		await tick();
		chatContainer.scrollTop = chatContainer.scrollHeight;
	}

	// If last message is from user, scroll to bottom
	$: if (browser && messages[messages.length - 1]?.from === "user") {
		scrollToBottom();
	}
</script>
<style>
  #slogan {
		margin: auto;
	}

	#slogan .splash {
		font-size: 2vw;
		color: #2c3968;
	}
</style>
<div
	class="scrollbar-custom mr-1 h-full overflow-y-auto"
	use:snapScrollToBottom={messages.length ? [...messages, ...webSearchMessages] : false}
	bind:this={chatContainer}
>
	<div class="my-auto grid grid-cols-3">
		<div></div>
		<div class="my-auto grid grid-cols-3">
			<div>
				<Logo classNames="mr-1 flex-none" />
			</div>
			<span id="slogan"><span class="splash">{PUBLIC_APP_NAME}</span></span>
		</div>
		<div></div>
	</div>
	<div class="mx-auto flex h-full max-w-3xl flex-col gap-6 px-5 pt-6 sm:gap-8 xl:max-w-4xl">
		{#if messages.length}
			{#each messages as message, i}
				{#if i === 0 && preprompt && preprompt != currentModel.preprompt}
					<SystemPromptModal preprompt={preprompt ?? ""} />
				{/if}
				<ChatMessage
					loading={loading && i === messages.length - 1}
					{message}
					{isAuthor}
					{readOnly}
					model={currentModel}
					webSearchMessages={i === messages.length - 1 ? webSearchMessages : []}
					on:retry
					on:vote
				/>
			{/each}
		{:else}
			<TemplateHandler isTemplate={!!template?.svelte}>
				<ChatIntroduction {models} {currentModel} on:message />
			</TemplateHandler>
		{/if}
		{#if pending}
			<ChatMessage
				message={{ from: "assistant", content: "", id: randomUUID() }}
				model={currentModel}
				{webSearchMessages}
			/>
		{/if}
		<div class="h-44 flex-none" />
	</div>
	<ScrollToBottomBtn
		class="bottom-36 right-4 max-md:hidden lg:right-10"
		scrollNode={chatContainer}
	/>
</div>
