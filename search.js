#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function getApiKey() {
	if (process.env.EXA_API_KEY?.trim()) return process.env.EXA_API_KEY.trim();
	const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
	const keyPath = join(configHome, "exa", "key");
	if (existsSync(keyPath)) {
		const k = readFileSync(keyPath, "utf8").trim();
		if (k) return k;
	}
	console.error("Error: no Exa API key found.");
	console.error("  Set EXA_API_KEY env var, or write the key to ~/.config/exa/key");
	console.error("  Get a free key at https://dashboard.exa.ai/api-keys");
	process.exit(1);
}

function printHelp() {
	console.error(
		[
			"Usage: search.js <query> [options]",
			"",
			"Options:",
			"  -n, --num N            Number of results (default 5, max 100)",
			"  --contents             Include full page text as markdown",
			"  --highlights           Include top excerpts (~10x fewer tokens than --contents)",
			"  --type T               auto|fast|instant|deep-lite|deep|deep-reasoning (default: auto)",
			"  --domain D             Restrict to a domain (repeatable)",
			"  --days N               Only results published in the last N days",
			"  --category C           Filter by category (e.g. 'research paper', 'company')",
			"  --fresh                Force livecrawl for current content (slower)",
			"  -h, --help             Show this help",
		].join("\n"),
	);
}

function parseArgs(argv) {
	const args = {
		query: "",
		n: 5,
		contents: false,
		highlights: false,
		type: "auto",
		domains: [],
		days: null,
		category: null,
		fresh: false,
	};
	const positional = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "-n" || a === "--num") args.n = parseInt(argv[++i], 10);
		else if (a === "--contents") args.contents = true;
		else if (a === "--highlights") args.highlights = true;
		else if (a === "--type") args.type = argv[++i];
		else if (a === "--domain") args.domains.push(argv[++i]);
		else if (a === "--days") args.days = parseInt(argv[++i], 10);
		else if (a === "--category") args.category = argv[++i];
		else if (a === "--fresh") args.fresh = true;
		else if (a === "-h" || a === "--help") {
			printHelp();
			process.exit(0);
		} else positional.push(a);
	}
	args.query = positional.join(" ").trim();
	if (!args.query) {
		printHelp();
		process.exit(1);
	}
	if (!Number.isFinite(args.n) || args.n < 1) args.n = 5;
	if (args.n > 100) args.n = 100;
	return args;
}

function indent(text, prefix = "      ") {
	return text
		.split("\n")
		.map((l) => prefix + l)
		.join("\n");
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const apiKey = getApiKey();

	const body = {
		query: args.query,
		numResults: args.n,
		type: args.type,
	};

	// --fresh implies highlights if no content mode was selected, since maxAgeHours lives under contents
	if (args.fresh && !args.contents && !args.highlights) args.highlights = true;
	if (args.contents || args.highlights || args.fresh) {
		body.contents = {};
		if (args.contents) body.contents.text = { maxCharacters: 4000 };
		// Pass `true` for highest-quality highlights per Exa docs
		if (args.highlights) body.contents.highlights = true;
		if (args.fresh) body.contents.maxAgeHours = 0;
	}
	if (args.domains.length) body.includeDomains = args.domains;
	if (args.category) body.category = args.category;
	if (args.days != null && Number.isFinite(args.days)) {
		const start = new Date(Date.now() - args.days * 86_400_000).toISOString().slice(0, 10);
		body.startPublishedDate = start;
	}

	let res;
	try {
		res = await fetch("https://api.exa.ai/search", {
			method: "POST",
			headers: { "Content-Type": "application/json", "x-api-key": apiKey },
			body: JSON.stringify(body),
		});
	} catch (e) {
		console.error(`Network error: ${e.message}`);
		process.exit(1);
	}

	if (!res.ok) {
		console.error(`Exa API error ${res.status}: ${await res.text()}`);
		process.exit(1);
	}

	const data = await res.json();
	const results = data.results || [];
	if (results.length === 0) {
		console.log("No results.");
		return;
	}

	for (let i = 0; i < results.length; i++) {
		const r = results[i];
		console.log(`[${i + 1}] ${r.title || "(untitled)"}`);
		console.log(`    URL: ${r.url}`);
		if (r.publishedDate) console.log(`    Date: ${r.publishedDate.slice(0, 10)}`);
		if (r.author) console.log(`    Author: ${r.author}`);
		if (r.highlights?.length) {
			console.log(`    Highlights:`);
			for (const h of r.highlights) console.log(indent(h));
		}
		if (r.text) {
			console.log(`    Content:`);
			console.log(indent(r.text));
		}
		console.log();
	}
}

main().catch((e) => {
	console.error(e?.stack || String(e));
	process.exit(1);
});
