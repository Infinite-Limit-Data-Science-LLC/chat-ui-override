async function templateHandlerHtml({ fetch }): Promise<Record<string, string>> {
	// temporarily hard coded

	const templateUrl = "/templates/custom-html";
	const templateFun = { html: "" };

	async function getFileAsText(fileUrl: string): Promise<string> {
		const res = await fetch(fileUrl);
		const file = await res.text();
		return file;
	}

	const fileDict = {
		"0": { filePath: "index.html", key: "html" },
		"1": { filePath: "assets/css/global.css", key: "style" },
		"2": { filePath: "assets/js/index.js", key: "script" },
	};

	const templateFunRes = await Promise.all(
		Object.values(templateFun).map(async (_, i) => {
			const textData = await getFileAsText(`${templateUrl}/${fileDict[i].filePath}`);
			// console.log(i, textData);
			return textData;
		})
	);

	for (let i = 0; i < 1; i++) {
		templateFun[fileDict[i].key] = templateFunRes[i];
	}

	return templateFun;
}

async function templateHandler({ fetch }) {
	const templateUrl = "/templates/custom/src";
	const customTemplate = { svelte: "" };

	async function getFileAsText(fileUrl: string): Promise<string> {
		let file = "";
		try {
			const res = await fetch(fileUrl);
			file = await res.text();
			// console.log(`file: `, file);
			// TODO fix this
			// will return '' if 404 via catch
			// res.match(/404/g);
		} catch (error) {
			file = "";
		}
		return file;
	}

	const fileDict = {
		"0": { filePath: "index.svelte", key: "svelte" },
	};

	const customTemplateRes = await Promise.all(
		Object.values(customTemplate).map(async (_, i) => {
			const textData = await getFileAsText(`${templateUrl}/${fileDict[i].filePath}`);
			// console.log(`textData: `, textData);
			return textData;
		})
	);

	for (let i = 0; i < 1; i++) {
		customTemplate[fileDict[i].key] = customTemplateRes[i];
	}

	return customTemplate;
}

export default templateHandler;
