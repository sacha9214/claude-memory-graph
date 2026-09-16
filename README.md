# Claude Memory Graph

Visualisation en graphe de la mémoire persistante de Claude Code et du vault Obsidian qui la synchronise : quels fichiers existent, comment ils se relient, quels sujets forment des communautés.

**[Explorer le graphe →](https://sacha9214.github.io/claude-memory-graph/)**

![Graphe interactif](docs/apercu.png)

## Contenu

| Fichier | Rôle |
|---|---|
| `graph.json` | Le graphe : 122 nœuds, 128 liens, 9 communautés |
| `GRAPH_REPORT.md` | Synthèse : nœuds les plus connectés, communautés, liens inférés |
| `index.html` | Rendu interactif : recherche, fiche de chaque nœud, filtre par communauté |
| `vis-network.min.js` | Bibliothèque de rendu [vis-network](https://github.com/visjs/vis-network), servie localement |

Instantané du 31 mai 2026, généré avec graphify.

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Licence

[MIT](LICENSE). `vis-network.min.js` garde sa propre licence (Apache-2.0 ou MIT).
