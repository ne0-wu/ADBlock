import fs from "node:fs";
import path from "node:path";

const sourceRepository = process.env.SOURCE_REPOSITORY ?? "BiliUniverse/ADBlock";
const targetRepository = process.env.RELEASE_REPOSITORY ?? process.env.GITHUB_REPOSITORY;
const serverUrl = (process.env.GITHUB_SERVER_URL ?? "https://github.com").replace(/\/$/, "");
const outputDirectory = path.resolve(process.env.RELEASE_OUTPUT_DIR ?? "dist");

if (!targetRepository) {
	throw new Error("GITHUB_REPOSITORY or RELEASE_REPOSITORY must be set");
}

if (targetRepository === sourceRepository) {
	console.log(`Release URLs already target ${sourceRepository}`);
	process.exit(0);
}

const sourceUrl = `https://github.com/${sourceRepository}`;
const targetUrl = `${serverUrl}/${targetRepository}`;
let changedFiles = 0;
let replacements = 0;

for (const file of walk(outputDirectory)) {
	const content = fs.readFileSync(file, "utf8");
	const occurrences = content.split(sourceUrl).length - 1;
	if (occurrences === 0) continue;

	fs.writeFileSync(file, content.replaceAll(sourceUrl, targetUrl));
	changedFiles += 1;
	replacements += occurrences;
}

if (replacements === 0) {
	throw new Error(`No ${sourceUrl} release URLs found in ${outputDirectory}`);
}

console.log(`Rewrote ${replacements} release URLs in ${changedFiles} files to ${targetUrl}`);

function* walk(directory) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			yield* walk(entryPath);
		} else if (entry.isFile()) {
			yield entryPath;
		}
	}
}
