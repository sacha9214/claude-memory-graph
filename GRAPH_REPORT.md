# Graph Report - .  (2026-05-31)

## Corpus Check
- Corpus is ~6,232 words - fits in a single context window. You may not need a graph.

## Summary
- 122 nodes · 128 edges · 9 communities
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Obsidian Core Plugins|Obsidian Core Plugins]]
- [[_COMMUNITY_Claude Memory & Feedback|Claude Memory & Feedback]]
- [[_COMMUNITY_Obsidian Graph Settings|Obsidian Graph Settings]]
- [[_COMMUNITY_Obsidian Workspace Layout|Obsidian Workspace Layout]]
- [[_COMMUNITY_Halide Vault Project|Halide Vault Project]]
- [[_COMMUNITY_Obsidian Hidden UI Items|Obsidian Hidden UI Items]]
- [[_COMMUNITY_Obsidian Left Panel|Obsidian Left Panel]]
- [[_COMMUNITY_Obsidian App Settings|Obsidian App Settings]]

## God Nodes (most connected - your core abstractions)
1. `Claude Memory Index` - 11 edges
2. `User Profile — Sacha` - 10 edges
3. `Halide Vault App` - 10 edges
4. `hiddenItems` - 8 edges
5. `Bac Français 2026 — Oral Preparation` - 8 edges
6. `right` - 7 edges
7. `left` - 6 edges
8. `SDMIS Firefighter Training Simulator` - 6 edges
9. `main` - 5 edges
10. `PC Setup` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Obsidian Vault (Claude Memory)` --conceptually_related_to--> `Obsidian Vault Configuration`  [INFERRED]
  memory/project_pc_setup.md → memory/.obsidian/app.json
- `Halide Vault App` --conceptually_related_to--> `User Profile — Sacha`  [INFERRED]
  memory/project_halide_app.md → memory/user_profile.md
- `Claude Memory Index` --references--> `Feedback: Save Memory After Every Session`  [EXTRACTED]
  memory/MEMORY.md → memory/feedback_save_memory.md
- `Claude Memory Index` --references--> `Feedback: Deploy via Netlify`  [EXTRACTED]
  memory/MEMORY.md → memory/feedback_deploy.md
- `Claude Memory Index` --references--> `Feedback: Senior Google Engineer Persona`  [EXTRACTED]
  memory/MEMORY.md → memory/feedback_persona.md

## Import Cycles
- None detected.

## Communities (9 total, 0 thin omitted)

### Community 0 - "Obsidian Core Plugins"
Cohesion: 0.06
Nodes (31): audio-recorder, backlink, bases, bookmarks, canvas, command-palette, daily-notes, editor-status (+23 more)

### Community 1 - "Claude Memory & Feedback"
Cohesion: 0.10
Nodes (26): Feedback: GitHub + Memory Workflow, Feedback: Senior Google Engineer Persona, Feedback: Save Memory After Every Session, Claude Memory Index, Obsidian Vault Configuration, Obsidian Graph View Config, Bac Français 2026 — Oral Preparation, Bac Première Générale Site (+18 more)

### Community 2 - "Obsidian Graph Settings"
Cohesion: 0.10
Nodes (20): centerStrength, close, collapse-color-groups, collapse-display, collapse-filter, collapse-forces, colorGroups, hideUnresolved (+12 more)

### Community 3 - "Obsidian Workspace Layout"
Cohesion: 0.12
Nodes (15): active, lastOpenFiles, left-ribbon, main, children, direction, id, type (+7 more)

### Community 4 - "Halide Vault Project"
Cohesion: 0.29
Nodes (8): Feedback: Deploy via Netlify, CoinGecko API, Firebase Auth + Firestore, Framer Motion, GitHub: sacha9214/halide-vault, Halide Vault App, Next.js 16 (TypeScript), Yahoo Finance API

### Community 5 - "Obsidian Hidden UI Items"
Cohesion: 0.25
Nodes (8): bases:Créer une nouvelle base, canvas:Créer une nouvelle toile, command-palette:Ouvrir la palette de commandes, daily-notes:Ouvrir la note quotidienne, graph:Ouvrir la vue graphique, switcher:Ouvrir le sélecteur rapide, templates:Insérer le modèle, hiddenItems

### Community 6 - "Obsidian Left Panel"
Cohesion: 0.33
Nodes (6): left, children, direction, id, type, width

### Community 7 - "Obsidian App Settings"
Cohesion: 0.50
Nodes (3): newFileLocation, promptDelete, showInlineTitle

## Knowledge Gaps
- **97 isolated node(s):** `collapse-filter`, `search`, `showTags`, `showAttachments`, `hideUnresolved` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Claude Memory Index` connect `Claude Memory & Feedback` to `Halide Vault Project`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `User Profile — Sacha` connect `Claude Memory & Feedback` to `Halide Vault Project`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `hiddenItems` connect `Obsidian Hidden UI Items` to `Obsidian Workspace Layout`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `User Profile — Sacha` (e.g. with `Bac Français 2026 — Oral Preparation` and `Halide Vault App`) actually correct?**
  _`User Profile — Sacha` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `collapse-filter`, `search`, `showTags` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Obsidian Core Plugins` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `Claude Memory & Feedback` be split into smaller, more focused modules?**
  _Cohesion score 0.10153846153846154 - nodes in this community are weakly interconnected._