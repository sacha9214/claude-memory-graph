#!/usr/bin/env node
// Entrée en ligne de commande. Zéro dépendance : Node >= 18 suffit, donc
// `npx github:sacha9214/claude-memory-graph` démarre sans rien installer.
import { createServer } from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { defaultDirs, scan } from "../lib/scan.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const TYPES = ["user", "feedback", "project", "reference", "other", "missing"];

const HELP = `claude-memory-graph — see your Claude Code memory as a graph

  npx github:sacha9214/claude-memory-graph            open the graph in a browser
  npx github:sacha9214/claude-memory-graph --report   print a Markdown summary
  npx github:sacha9214/claude-memory-graph --json     print the graph as JSON

Options
  --dir <path>      scan this directory (repeatable; default: every
                    ~/.claude/projects/*/memory)
  --vault <path>    also scan an Obsidian vault (alias of --dir)
  --out <file>      write graph.json here as well
  --port <n>        port for the viewer (default 4477)
  --no-open         do not open the browser
  --no-content      drop descriptions and absolute paths — for sharing
  -h, --help        this text
`;

function parseArgs(argv) {
  const o = { dirs: [], port: 4477, open: true, content: true, mode: "serve", out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir" || a === "--vault") o.dirs.push(path.resolve(argv[++i]));
    else if (a === "--out") o.out = path.resolve(argv[++i]);
    else if (a === "--port") o.port = Number(argv[++i]);
    else if (a === "--no-open") o.open = false;
    else if (a === "--no-content") o.content = false;
    else if (a === "--report") o.mode = "report";
    else if (a === "--json") o.mode = "json";
    else if (a === "-h" || a === "--help") o.mode = "help";
    else if (a.startsWith("-")) { console.error(`unknown option: ${a}`); process.exit(2); }
    else o.dirs.push(path.resolve(a));
  }
  return o;
}

function report(g) {
  const s = g.stats;
  const byType = {};
  for (const n of g.nodes.filter((n) => !n.missing)) byType[n.type] = (byType[n.type] || 0) + 1;
  const top = [...g.nodes].filter((n) => !n.missing).sort((a, b) => b.degree - a.degree).slice(0, 10);
  const dangling = g.nodes.filter((n) => n.missing);
  const orphans = g.nodes.filter((n) => n.orphan);
  const alone = g.nodes.filter((n) => !n.missing && n.degree === 0);

  const L = [];
  L.push(`# Claude memory graph\n`);
  L.push(`${s.memories} memories · ${s.links} links · ${s.dangling} dangling · ${s.orphans} not in MEMORY.md\n`);
  L.push(`## By type\n`);
  for (const t of TYPES) if (byType[t]) L.push(`- **${t}** — ${byType[t]}`);
  L.push(`\n## Most connected\n`);
  for (const n of top) L.push(`- **${n.label}** (${n.degree} links) — ${n.description || n.type}`);
  if (dangling.length) {
    L.push(`\n## Links pointing nowhere\n`);
    L.push(`A \`[[link]]\` with no file behind it: either a memory worth writing, or a rename to fix.\n`);
    for (const n of dangling) {
      const from = g.edges.filter((e) => e.to === n.id).map((e) => e.from).join(", ");
      L.push(`- \`${n.label}\` ← ${from}`);
    }
  }
  if (orphans.length) {
    L.push(`\n## Missing from MEMORY.md\n`);
    L.push(`These files exist but no index line points to them, so they are never loaded at session start.\n`);
    for (const n of orphans) L.push(`- \`${n.label}\``);
  }
  if (alone.length) {
    L.push(`\n## Linked to nothing\n`);
    for (const n of alone) L.push(`- \`${n.label}\``);
  }
  return L.join("\n") + "\n";
}

function serve(graph, port, open) {
  const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
                 ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8" };
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/graph.json") {
      res.writeHead(200, { "content-type": mime[".json"] });
      res.end(JSON.stringify(graph));
      return;
    }
    // Sert le visualiseur du paquet, et RIEN d'autre : la liste est close, sinon
    // un serveur local ouvert sur le disque de l'utilisateur.
    const allowed = { "/": "index.html", "/index.html": "index.html",
                      "/vis-network.min.js": "vis-network.min.js" };
    const file = allowed[url.pathname];
    if (!file) { res.writeHead(404); res.end("not found"); return; }
    const p = path.join(ROOT, file);
    res.writeHead(200, { "content-type": mime[path.extname(p)] || "text/plain" });
    fs.createReadStream(p).pipe(res);
  });
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.error(`port ${port} is busy — try --port ${port + 1}`);
      process.exit(1);
    }
    throw e;
  });
  server.listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log(`graph: ${graph.stats.memories} memories, ${graph.stats.links} links`);
    console.log(`viewer: ${url}   (Ctrl+C to stop)`);
    if (open) {
      const cmd = process.platform === "darwin" ? "open"
                : process.platform === "win32" ? "start" : "xdg-open";
      spawn(cmd, [url], { stdio: "ignore", detached: true, shell: process.platform === "win32" }).unref();
    }
  });
}

const opts = parseArgs(process.argv.slice(2));
if (opts.mode === "help") { process.stdout.write(HELP); process.exit(0); }

const dirs = opts.dirs.length ? opts.dirs : defaultDirs();
if (!dirs.length) {
  console.error(`no memory directory found under ${path.join(os.homedir(), ".claude/projects")}`);
  console.error(`pass one explicitly:  --dir <path>`);
  process.exit(1);
}
const graph = scan(dirs, { withContent: opts.content });
if (!graph.nodes.length) {
  console.error(`no .md memory file in:\n  ${dirs.join("\n  ")}`);
  process.exit(1);
}
if (opts.out) fs.writeFileSync(opts.out, JSON.stringify(graph, null, 2));

if (opts.mode === "report") process.stdout.write(report(graph));
else if (opts.mode === "json") process.stdout.write(JSON.stringify(graph, null, 2) + "\n");
else serve(graph, opts.port, opts.open);
