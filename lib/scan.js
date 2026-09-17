// Lecture des fichiers de mémoire. Aucune dépendance : on lit ce que l'outil
// mémoire de Claude Code écrit, c'est-à-dire du Markdown avec un en-tête YAML
// simple (name / description / metadata.type) et des liens [[wikilink]].
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const RE_FRONT = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const RE_LINK = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
// L'index MEMORY.md pointe vers les fichiers : `- [Titre](fichier.md) — accroche`
const RE_INDEX = /\]\(([^)]+\.md)\)/g;

/** Dossiers de mémoire par défaut : un par projet Claude Code. */
export function defaultDirs(home = os.homedir()) {
  const root = path.join(home, ".claude", "projects");
  let projects = [];
  try {
    projects = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch {
    return [];
  }
  return projects
    .map((d) => path.join(root, d.name, "memory"))
    .filter((p) => fs.existsSync(p));
}

/** En-tête YAML, version minimale : clés à plat + un niveau d'indentation. */
function parseFrontMatter(text) {
  const m = RE_FRONT.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  let section = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const indented = /^\s/.test(raw);
    const kv = /^\s*([\w.-]+)\s*:\s*(.*)$/.exec(raw);
    if (!kv) continue;
    const [, key, rawVal] = kv;
    const val = rawVal.trim().replace(/^["']|["']$/g, "");
    if (indented && section) meta[`${section}.${key}`] = val;
    else if (!val) { section = key; meta[key] = ""; }
    else { section = null; meta[key] = val; }
  }
  return { meta, body: text.slice(m[0].length) };
}

/** Normalise un nom de mémoire : `feedback_persona.md`, `feedback-persona` -> même clé. */
export function slug(s) {
  return path
    .basename(String(s), ".md")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function firstSentence(body, max = 220) {
  const clean = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`]/g, " ")
    .replace(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  const cut = clean.slice(0, max);
  return cut.length < clean.length ? cut.trimEnd() + "…" : cut;
}

function readDir(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"))
      .map((e) => path.join(dir, e.name));
  } catch {
    return [];
  }
}

/**
 * Lit les dossiers demandés et retourne {nodes, edges, stats}.
 *
 * Deux signaux que rien d'autre ne donne, et qui sont l'intérêt de la vue :
 *  - un [[lien]] qui ne pointe sur rien (mémoire à écrire, ou renommée) ;
 *  - un fichier absent de MEMORY.md, donc jamais chargé au démarrage.
 */
export function scan(dirs, { withContent = true } = {}) {
  const byId = new Map();
  const edges = [];
  const indexed = new Set();
  let indexSeen = false;

  for (const dir of dirs) {
    for (const file of readDir(dir)) {
      const text = fs.readFileSync(file, "utf8");
      const base = path.basename(file);
      const { meta, body } = parseFrontMatter(text);

      // MEMORY.md n'est pas une mémoire : c'est l'index chargé à chaque session.
      if (base.toUpperCase() === "MEMORY.MD") {
        indexSeen = true;
        for (const m of body.matchAll(RE_INDEX)) indexed.add(slug(m[1]));
        continue;
      }

      const id = slug(meta.name || base);
      const stat = fs.statSync(file);
      const node = {
        id,
        label: meta.name || path.basename(base, ".md"),
        type: (meta["metadata.type"] || meta.type || "other").toLowerCase(),
        description: withContent ? meta.description || firstSentence(body) : "",
        // `--no-content` sert à partager le graphe : il ne doit rien laisser
        // fuiter, ni contenu ni chemin absolu (le nom d'utilisateur est dedans).
        file: withContent ? file : path.join(path.basename(dir), base),
        dir: withContent ? dir : path.basename(dir),
        words: body.split(/\s+/).filter(Boolean).length,
        modified: stat.mtime.toISOString().slice(0, 10),
        missing: false,
      };
      // Deux fichiers peuvent porter le même `name` (vault + mémoire) : on garde
      // le plus fourni plutôt que d'en inventer un second nœud.
      const prev = byId.get(id);
      if (!prev || prev.words < node.words) byId.set(id, node);

      for (const m of body.matchAll(RE_LINK)) {
        const target = slug(m[1]);
        if (target && target !== id) edges.push({ from: id, to: target });
      }
    }
  }

  // Cibles inexistantes : on les matérialise, c'est le signal le plus utile.
  for (const e of edges) {
    if (!byId.has(e.to)) {
      byId.set(e.to, {
        id: e.to, label: e.to, type: "missing", description: "",
        file: "", dir: "", words: 0, modified: "", missing: true,
      });
    }
  }

  const nodes = [...byId.values()];
  const degree = new Map(nodes.map((n) => [n.id, 0]));
  const seen = new Set();
  const unique = [];
  for (const e of edges) {
    const key = e.from < e.to ? `${e.from}|${e.to}` : `${e.to}|${e.from}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(e);
    degree.set(e.from, degree.get(e.from) + 1);
    degree.set(e.to, degree.get(e.to) + 1);
  }
  for (const n of nodes) {
    n.degree = degree.get(n.id) || 0;
    n.orphan = indexSeen && !n.missing && !indexed.has(n.id);
  }

  community(nodes, unique);
  return {
    nodes,
    edges: unique,
    stats: {
      generated: new Date().toISOString(),
      dirs: withContent ? dirs : dirs.map((_, i) => `source ${i + 1}`),
      memories: nodes.filter((n) => !n.missing).length,
      links: unique.length,
      dangling: nodes.filter((n) => n.missing).length,
      orphans: nodes.filter((n) => n.orphan).length,
      isolated: nodes.filter((n) => !n.missing && n.degree === 0).length,
      indexSeen,
    },
  };
}

/**
 * Communautés par propagation d'étiquettes. Déterministe : parcours trié et
 * départage par identifiant, sinon deux exécutions donnent deux couleurs.
 */
function community(nodes, edges) {
  const adj = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    adj.get(e.from)?.push(e.to);
    adj.get(e.to)?.push(e.from);
  }
  const label = new Map(nodes.map((n) => [n.id, n.id]));
  const order = [...nodes].map((n) => n.id).sort();
  for (let pass = 0; pass < 12; pass++) {
    let moved = 0;
    for (const id of order) {
      const counts = new Map();
      for (const nb of adj.get(id) || []) {
        const l = label.get(nb);
        counts.set(l, (counts.get(l) || 0) + 1);
      }
      if (!counts.size) continue;
      const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
      if (best !== label.get(id)) { label.set(id, best); moved++; }
    }
    if (!moved) break;
  }
  const groups = new Map();
  for (const id of order) {
    const l = label.get(id);
    if (!groups.has(l)) groups.set(l, groups.size);
  }
  for (const n of nodes) n.community = groups.get(label.get(n.id)) ?? 0;
}
