<script lang="ts">
	import { onMount } from "svelte";

	export let isTemplate = false;
	let dynamicComponent: unknown;

	onMount(async () => {
		if (isTemplate) {
			const module = await import("../../../static/templates/custom/src/index.svelte");
			dynamicComponent = module?.default;
			// console.log(`dynamicComponent: `, dynamicComponent);
			// isTemplate.set(true);
		} else {
			console.warn("Template not found, loading fallback");
		}
	});
</script>

<div class="template-handler">
	{#if isTemplate}
		<svelte:component this={dynamicComponent} />
	{:else}
		<slot />
	{/if}
</div>

<style>
</style>
