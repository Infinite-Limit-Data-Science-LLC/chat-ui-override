async function templateHandler({ fetch }): Promise<Record<string, string>> {
	// temporarily hard coded

	const templateUrl = "/templates/custom";
	const templateFun = { html: "", style: "", script: "" };

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

	// for now just use fetch
	// to get 1 style and 1 script
	// optimise later
	const templateFunRes = await Promise.all(
		Object.values(templateFun).map(async (_, i) => {
			const textData = await getFileAsText(`${templateUrl}/${fileDict[i].filePath}`);
			// console.log(i, textData);
			return textData;
		})
	);

	for (let i = 0; i < 3; i++) {
		templateFun[fileDict[i].key] = templateFunRes[i];
	}

	return templateFun;
}

export default templateHandler;
