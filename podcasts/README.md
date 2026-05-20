# Dossier podcasts — Premières Nations (français)

Ce dossier répertorie les balados et émissions **en français** liés aux Premières Nations du Québec et du Canada.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `index.html` | Page publique : lecteurs, liens direct et téléchargement |
| `catalog.json` | Liste des podcasts (métadonnées, URLs officielles) |
| `latest-episodes.json` | Derniers épisodes avec URL audio (flux RSS) |

## Mettre à jour les lecteurs intégrés

```bash
node scripts/fetch-podcast-rss.mjs
```

Puis committer `latest-episodes.json` si les URLs ont changé.

## Téléchargement

Les MP3 ne sont **pas** stockés dans ce dépôt. Les visiteurs téléchargent via les plateformes officielles (OHdio, BaladoQuébec, Podbean, etc.) — bouton **« Télécharger / épisodes »** sur chaque fiche.
