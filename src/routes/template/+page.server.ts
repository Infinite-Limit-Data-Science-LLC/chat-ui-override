import templateHandler from "$lib/utils/templateHandler";

export async function load({ fetch }) {
	const template = await templateHandler({ fetch });

	return {
		props: {
			templates: { template },
		},
	};
}
