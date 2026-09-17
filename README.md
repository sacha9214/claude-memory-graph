# claude-memory-graph

**See what Claude Code remembers about you — as a graph.**

Claude Code keeps a persistent memory: one Markdown file per fact, in
`~/.claude/projects/<project>/memory/`, cross-linked with `[[wikilinks]]` and indexed by a
`MEMORY.md` that is loaded into context at the start of every session. It grows quietly,
and after a few months nobody knows what is in there any more.

This is a single command that reads those files and shows you.

```bash
npx github:sacha9214/claude-memory-graph
```

No install, no dependencies, nothing leaves your machine — it reads your memory
directory, builds the graph and serves it on `127.0.0.1`.

![The graph of a real Claude Code memory](docs/apercu.png)

**[Open the live demo →](https://sacha9214.github.io/claude-memory-graph/)** (my own
memory, contents stripped)

---

## What it shows you that a folder listing does not

The picture is the easy part. The two useful findings are the ones you cannot see by
reading files one by one:

- **Links that point nowhere.** A `[[link]]` with no file behind it is either a memory
  worth writing or a rename that was never finished. Run on my own memory, it found
  five — including a `[[project-mac-setup]]` pointing at a file actually named
  `mac-setup`, so the link had been silently dead for weeks.
- **Files missing from `MEMORY.md`.** The index is what Claude actually loads at session
  start. A memory file that no index line points to is written, saved, and **never
  read**. There were four of those.

Plus the shape of the thing: which topics cluster, which memory is the hub everything
else hangs off, and which ones are connected to nothing.

## Usage

```bash
npx github:sacha9214/claude-memory-graph                 # graph in your browser
npx github:sacha9214/claude-memory-graph --report        # Markdown summary on stdout
npx github:sacha9214/claude-memory-graph --json          # the raw graph
npx github:sacha9214/claude-memory-graph --dir ~/notes   # any folder of linked Markdown
```

| Option | |
|---|---|
| `--dir <path>` | scan this directory (repeatable). Default: every `~/.claude/projects/*/memory` |
| `--vault <path>` | alias of `--dir`, for an Obsidian vault |
| `--report` | print a Markdown summary: hubs, dangling links, orphans |
| `--json` | print the graph as JSON |
| `--out <file>` | also write `graph.json` there |
| `--port <n>` | viewer port (default 4477) |
| `--no-open` | do not open the browser |
| `--no-content` | drop descriptions and absolute paths, for sharing |

`--report` is the one to pipe into Claude itself — "here is my memory graph, what is
stale?" — or into CI if your memory lives in a repo.

## Privacy

Your memory files contain what you told an assistant about yourself. So:

- Everything runs locally. There is no network call in this tool, at all.
- The viewer is served on `127.0.0.1` and serves exactly three files — no directory is
  exposed.
- **`graph.json` contains your memory descriptions and absolute paths.** Do not publish
  it as is. `--no-content` strips descriptions, home paths and project directory names,
  which is how the demo above was generated.

## Requirements

Node 18 or newer. Nothing else — the graph rendering
([vis-network](https://github.com/visjs/vis-network), Apache-2.0/MIT) ships vendored in
this repository, so the viewer works offline.

## How it reads a memory file

```markdown
---
name: feedback-persona
description: How I want you to work
metadata:
  type: feedback
---

Body text, linking to [[project-ladderbot]] and [[user-profile]].
```

- `name` (or the filename) is the node id; `metadata.type` colors it: `user`,
  `feedback`, `project`, `reference`.
- `[[wikilinks]]` in the body are the edges, in either direction.
- `MEMORY.md` is treated as the index, not as a memory: its `[title](file.md)` lines are
  what decides whether a file counts as indexed.

The same format is what Obsidian writes, so `--vault ~/Documents/MyVault` works too.

## License

MIT — see [LICENSE](LICENSE). `vis-network.min.js` keeps its own license.
