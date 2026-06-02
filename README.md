# Exa Search Skill for Pi

A Pi agent skill that adds Exa-powered neural web search, clean page-content extraction, highlights, fresh/live results, domain filters, and direct cited answers.

## Install

Install directly from GitHub as a Pi package:

```bash
pi install https://github.com/Naveenxyz/exa-search
```

Equivalent shorthand:

```bash
pi install git:github.com/Naveenxyz/exa-search
```

For a project-local install that can be shared in `.pi/settings.json`, run:

```bash
pi install -l https://github.com/Naveenxyz/exa-search
```

Restart `pi` or run `/reload` in an existing Pi session so it discovers the new skill.

Manual clone alternative:

```bash
mkdir -p ~/.pi/agent/skills
git clone https://github.com/Naveenxyz/exa-search.git ~/.pi/agent/skills/exa-search
```

## Set up an Exa API key

Get a free API key from <https://dashboard.exa.ai/api-keys>.

Use either an environment variable:

```bash
export EXA_API_KEY=your-key-here
```

Or store it in a local config file:

```bash
mkdir -p ~/.config/exa
printf '%s' 'your-key-here' > ~/.config/exa/key
chmod 600 ~/.config/exa/key
```

Requires Node.js 18+ because the scripts use built-in `fetch`. No `npm install` is needed.

## Use in Pi

After installation, Pi will load the skill automatically when a task needs semantic web search, current information, citations, or clean extracted page content.

You can also force-load it with:

```text
/skill:exa-search search the web for the latest Pi coding agent docs
```

Example prompts:

```text
Find documentation for configuring custom providers in pi and cite sources.
```

```text
Use Exa to search GitHub for code that implements streaming tool calls.
```

```text
What changed in the latest Node.js LTS release? Use fresh sources.
```

## Direct command-line usage

If you installed with `pi install`, Pi clones the package under `~/.pi/agent/git/github.com/Naveenxyz/exa-search/`.

Search:

```bash
~/.pi/agent/git/github.com/Naveenxyz/exa-search/search.js "query"
~/.pi/agent/git/github.com/Naveenxyz/exa-search/search.js "query" -n 10 --highlights
~/.pi/agent/git/github.com/Naveenxyz/exa-search/search.js "query" --contents
~/.pi/agent/git/github.com/Naveenxyz/exa-search/search.js "query" --domain github.com --days 30
~/.pi/agent/git/github.com/Naveenxyz/exa-search/search.js "query" --fresh
```

Direct cited answer:

```bash
~/.pi/agent/git/github.com/Naveenxyz/exa-search/answer.js "Who founded Anthropic?"
~/.pi/agent/git/github.com/Naveenxyz/exa-search/answer.js "What is Exa search?" --text
```

For manual clone installs, replace that prefix with `~/.pi/agent/skills/exa-search/`.

## Files

- `package.json` - Pi package manifest so `pi install` can load the root skill
- `SKILL.md` - skill instructions and metadata for Pi
- `search.js` - Exa search helper
- `answer.js` - Exa direct-answer helper

## Security note

Skills can include executable code and instructions for AI agents. Review any skill before installing it.

## License

MIT
