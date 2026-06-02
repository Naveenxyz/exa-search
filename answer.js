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
	console.error("Usage: answer.js <question> [--text]");
	console.error("  --text   Include source page text alongside citations");
}

async function main() {
	const argv = process.argv.slice(2);
	let includeText = false;
	const positional = [];
	for (const a of argv) {
		if (a === "--text") includeText = true;
		else if (a === "-h" || a === "--help") {
			printHelp();
			process.exit(0);
		} else positional.push(a);
	}
	const query = positional.join(" ").trim();
	if (!query) {
		printHelp();
		process.exit(1);
	}

	const apiKey = getApiKey();
	let res;
	try {
		res = await fetch("https://api.exa.ai/answer", {
			method: "POST",
			headers: { "Content-Type": "application/json", "x-api-key": apiKey },
			body: JSON.stringify({ query, text: includeText }),
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
	console.log("Answer:");
	console.log(data.answer || "(no answer)");

	const citations = data.citations || [];
	if (citations.length) {
		console.log("\nCitations:");
		for (let i = 0; i < citations.length; i++) {
			const c = citations[i];
			console.log(`  [${i + 1}] ${c.title || "(untitled)"} — ${c.url}`);
			if (includeText && c.text) {
				console.log(
					c.text
						.split("\n")
						.map((l) => "      " + l)
						.join("\n"),
				);
			}
		}
	}
}

main().catch((e) => {
	console.error(e?.stack || String(e));
	process.exit(1);
});
