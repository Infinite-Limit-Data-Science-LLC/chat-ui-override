import type { Tensor, Pipeline } from "@xenova/transformers";

let webSearchDisabled = false;
let dot;
let pipeline;

(async () => {
	try {
		const transformers = await import("@xenova/transformers");
		({ dot, pipeline } = transformers);
	} catch {
		webSearchDisabled = true;
	}
})();

function innerProduct(tensor1: Tensor, tensor2: Tensor) {
	if (!dot) return;
	return 1.0 - dot(tensor1.data, tensor2.data);
}

// see https://huggingface.co/thenlper/gte-small/blob/d8e2604cadbeeda029847d19759d219e0ce2e6d8/README.md?code=true#L2625
export const MAX_SEQ_LEN = 512 as const;

// see here: https://github.com/nmslib/hnswlib/blob/359b2ba87358224963986f709e593d799064ace6/README.md?plain=1#L34
export async function findSimilarSentences(
	query: string,
	sentences: string[],
	{ topK = 5 }: { topK: number }
) {
	if (webSearchDisabled) return [];

	// Use the Singleton pattern to enable lazy construction of the pipeline.
	class PipelineSingleton {
		static modelId = "Xenova/gte-small";
		static instance: Promise<Pipeline> | null = null;
		static async getInstance() {
			if (this.instance === null) {
				this.instance = pipeline("feature-extraction", this.modelId);
			}
			return this.instance;
		}
	}

	const input = [query, ...sentences];

	const extractor = await PipelineSingleton.getInstance();
	const output: Tensor = await extractor(input, { pooling: "mean", normalize: true });

	const queryTensor: Tensor = output[0];
	const sentencesTensor: Tensor = output.slice([1, input.length - 1]);

	const distancesFromQuery: { distance: number; index: number }[] = [...sentencesTensor].map(
		(sentenceTensor: Tensor, index: number) => {
			return {
				distance: innerProduct(queryTensor, sentenceTensor),
				index: index,
			};
		}
	);

	distancesFromQuery.sort((a, b) => {
		return a.distance - b.distance;
	});

	// Return the indexes of the closest topK sentences
	return distancesFromQuery.slice(0, topK).map((item) => item.index);
}
