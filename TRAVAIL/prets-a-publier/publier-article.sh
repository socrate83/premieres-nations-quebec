#!/bin/bash

# ============================================================
#  Script de publication d'article — Premières Nations Québec
#  Usage : ./publier-article.sh mon-article.md
# ============================================================

set -e

# --- Configuration ---
REPO_DIR="$(pwd)"                          # Le script doit être lancé depuis le dépôt
TEMPLATE="$REPO_DIR/templates/article-template.html"
SOURCE_DIR="$HOME/articles-a-publier"      # Dossier où tu mets tes articles sources
# ----------------------

if [ -z "$1" ]; then
  echo "Usage : ./publier-article.sh nom-du-fichier.md"
  echo "Exemple : ./publier-article.sh 82-nouveau-peuple.md"
  exit 1
fi

SOURCE_FILE="$SOURCE_DIR/$1"

if [ ! -f "$SOURCE_FILE" ]; then
  echo "Erreur : le fichier $SOURCE_FILE n'existe pas."
  exit 1
fi

# Nom du fichier HTML final
FILENAME=$(basename "$1" .md).html
OUTPUT="$REPO_DIR/$FILENAME"

# Titre (première ligne du Markdown qui commence par #)
TITRE=$(grep -m 1 '^# ' "$SOURCE_FILE" | sed 's/^# //')
if [ -z "$TITRE" ]; then
  TITRE="Nouvel article"
fi

# Conversion Markdown → HTML (nécessite pandoc)
if command -v pandoc >/dev/null 2>&1; then
  CONTENU=$(pandoc "$SOURCE_FILE" -t html)
else
  echo "Pandoc n'est pas installé. Installation recommandée :"
  echo "  sudo apt install pandoc   (Linux)"
  echo "  brew install pandoc       (Mac)"
  exit 1
fi

# Injection dans le template
sed -e "s|{{TITRE}}|$TITRE|g" \
    -e "s|{{CONTENU}}|$CONTENU|g" \
    "$TEMPLATE" > "$OUTPUT"

echo "Article généré : $FILENAME"

# Git
git add "$FILENAME"
git commit -m "Ajout de l'article : $TITRE"
git push origin main   # ou master selon ton dépôt

echo ""
echo "Publication terminée !"
echo "L'article sera en ligne dans quelques secondes :"
echo "https://socrate83.github.io/premieres-nations-quebec/$FILENAME"
