# Le guide complet Starlink

Site statique (HTML) pour le public francophone — Canada et Europe.

**URL publique** (dans le dépôt `premieres-nations-quebec`) :

https://socrate83.github.io/premieres-nations-quebec/starlink/

Pour un **nom d’URL dédié** (ex. `guide-starlink`), créer un dépôt GitHub séparé et copier ce dossier à la racine.

## Lien de parrainage (obligatoire)

1. Dans l’app ou le compte Starlink : **Compte → « Un mois gratuit pour vous et eux »** (Parrainage).
2. Copier le code `RC-…` ou l’URL complète.
3. Coller le code dans **`referral.json`** → champ `referralCode` (ex. `RC-123456-78901-23`).

Tous les boutons « Commander » et les liens vers starlink.com (hors support) sont mis à jour automatiquement par `assets/js/referral.js`.

**Ne pas** mettre le lien brut sans `?referral=` dans le HTML : tout passe par `referral.json`.

## Images (`assets/images/`)

| Fichier | Page |
|---------|------|
| `guide-starlink-visuel.png` | Accueil — bannière |
| `ile-lac-isole.png` | Accueil, Canada — lieux isolés |
| `test-debit-caravane.png` | Accueil, Démarrer — tests de débit |
| `van-antenne-starlink.png` | Démarrer — kit / antenne |
| `alimentation-dc.png` | Démarrer — alimentation |
| `starlink-desert-rv.png` | Démarrer — emplacement |
| `fourgon-plage.png` | Démarrer — mobilité |
| `chalet-montagne-hiver.png` | Canada — hiver |
| `camping-montagne.png` | Canada — usages |
| `carte-disponibilite-fr.png` | Europe — disponibilité |
