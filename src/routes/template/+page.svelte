<script>
	import { onMount } from "svelte";
	// import templateHandler from '$lib/utils/templateHandler';

	export let data;
	const { templates } = data?.props;
</script>

<h2>template test</h2>

{#if Object.values(data?.props?.templates)?.length}
	{@html templates?.template?.html}
{:else}
	<p>svelte native</p>
{/if}
