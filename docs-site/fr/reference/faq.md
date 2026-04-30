# Foire aux questions

## b-board fonctionne-t-il sans framework ?

Oui. b-board est un Web Component construit avec Lit. Il fonctionne dans tout environnement qui prend en charge l'API Custom Elements — les projets HTML simple, JavaScript Vanilla et TypeScript fonctionnent tous sans framework requis :

```html
<script type="module" src="/node_modules/b-board/dist/bboard.es.js"></script>
<benin-keyboard language="yoruba"></benin-keyboard>
```

Les adaptateurs pour frameworks (React, Vue, Angular) fournissent des helpers pratiques mais ne sont pas nécessaires pour les fonctionnalités de base.

---

## Quelles langues sont prises en charge ?

b-board prend actuellement en charge quatre langues béninoises :

| Identifiant | Nom anglais | Nom natif |
| ----------- | ----------- | --------- |
| `yoruba`    | Yoruba      | Yorùbá    |
| `fon-adja`  | Fon/Adja    | Fon/Adjà  |
| `baatonum`  | Baatɔnum    | Baatɔnum  |
| `dendi`     | Dendi       | Dendi     |

Vous pouvez ajouter votre propre profil de langue sans forker le projet. Consultez [Ajouter une nouvelle langue](/fr/guides/language-customization#etape-par-etape-ajouter-une-nouvelle-langue).

---

## Puis-je utiliser b-board dans une application mobile ?

b-board est un Web Component basé sur le DOM, il fonctionne donc partout où un moteur de navigateur complet est disponible.

| Plateforme       | Pris en charge | Notes                                                                                                                                                |
| ---------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Native     | Non            | React Native utilise un bridge JavaScript vers des vues natives, pas un DOM. Le Web Component ne peut pas s'y afficher.                              |
| Ionic            | Oui            | Ionic s'exécute dans une WebView (Capacitor ou Cordova). Importez b-board comme vous le feriez dans n'importe quelle application web.                |
| Capacitor        | Oui            | Utilisez b-board dans la couche web de votre application Capacitor exactement comme dans un navigateur.                                              |
| React Native Web | Partiel        | Si votre application s'affiche dans un vrai DOM (ex. via `react-native-web`), b-board peut fonctionner — mais ce n'est pas une configuration testée. |

---

## Est-ce gratuit ?

Oui. b-board est open source et publié sous licence MIT. Vous pouvez l'utiliser dans des projets personnels, commerciaux et à but non lucratif sans frais. L'attribution est appréciée mais non obligatoire.

---

## Comment fonctionne la composition des marques de ton ?

b-board utilise un modèle de **séquence de touche morte**. Lorsque vous appuyez sur une touche modificatrice de ton (ex. l'accent aigu ´), le moteur entre en état armé — aucun caractère n'est inséré. Lorsque vous appuyez sur la touche suivante, le moteur recherche une `CompositionRule` correspondant au déclencheur et au caractère de base. Si une règle existe, le caractère composé (ex. `á`) est inséré. Si aucune règle ne correspond, le caractère déclencheur et le caractère de base sont insérés séparément.

Exemple pour le yoruba :

1. Appuyer sur ´ → moteur armé (pas de sortie)
2. Appuyer sur e → le moteur trouve `{ trigger: "´", base: "e", result: "é" }` → insère `é`

Appuyer sur Échap pendant que le moteur est armé annule la séquence sans insérer quoi que ce soit.

Consultez la [section Moteur de composition](/fr/guides/language-customization#fonctionnement-du-moteur-de-composition) pour une explication plus approfondie.

---

## Puis-je ajouter ma propre langue ?

Oui. Les profils de langue sont des fichiers JSON — aucune modification TypeScript n'est requise pour les données elles-mêmes. Vous devez :

1. Ajouter votre identifiant de langue au tuple `LANGUAGE_IDS` dans `src/public/types.ts`
2. Créer `data/languages/<id>.json` en suivant le schéma `LanguageProfile`
3. L'enregistrer dans `data/registry.json`
4. Exécuter `npm run validate:data` pour confirmer la validité

Les instructions complètes se trouvent dans le [Guide de personnalisation des langues](/fr/guides/language-customization).

---

## b-board prend-il en charge les scripts RTL ?

Pas actuellement. Le moteur de disposition du clavier est conçu pour les orthographes de gauche à droite. Les quatre langues béninoises prises en charge utilisent des systèmes d'écriture Latin LTR. La prise en charge RTL ne figure pas sur la feuille de route actuelle, mais les contributions sont les bienvenues.

---

## Puis-je utiliser une disposition personnalisée ?

La forme de disposition (positions des touches, hauteurs de rangée, largeurs de slots) est définie par des fichiers JSON `LayoutShape` dans `data/layouts/`. Vous pouvez créer une disposition personnalisée en :

1. Ajoutant un `LayoutVariantId` dans `src/public/types.ts`
2. Créant `data/layouts/<id>.json` en suivant le schéma `LayoutShape`
3. L'enregistrant dans `data/registry.json`
4. Transmettant votre identifiant de variante via l'attribut `layout-variant`

```html
<benin-keyboard language="yoruba" layout-variant="my-custom-layout"></benin-keyboard>
```

Consultez `docs/DATA_SCHEMA.md` pour la référence complète des champs `LayoutShape`.

---

## Fonctionne-t-il hors ligne ?

b-board récupère les profils de langue et de disposition JSON au moment de l'exécution. Cela signifie qu'une requête réseau initiale est nécessaire la première fois qu'une langue est chargée. Après cela :

- Si vous avez un service worker qui met en cache les fichiers de données, les chargements ultérieurs fonctionnent hors ligne
- Si vous regroupez et servez vous-même les fichiers de données (ex. en copiant `data/` vers votre racine web), le clavier fonctionne sans aucun accès réseau externe

Il n'y a pas de service worker intégré — la mise en cache hors ligne est de la responsabilité de l'application hôte.

---

## Quels navigateurs sont pris en charge ?

b-board cible les navigateurs qui prennent en charge la spécification Custom Elements v1 et la spécification CSS Shadow Parts. En pratique, cela signifie :

| Navigateur       | Version minimale |
| ---------------- | ---------------- |
| Chrome / Edge    | 67+              |
| Firefox          | 63+              |
| Safari           | 10.1+            |
| iOS Safari       | 10.3+            |
| Samsung Internet | 6.0+             |

Internet Explorer n'est pas pris en charge.

---

## Quelle version de Node.js est requise ?

**Node.js 20 ou version ultérieure** est requis pour le développement (construire la bibliothèque, exécuter les tests et construire le site de documentation). La sortie compilée (`dist/bboard.es.js` et `dist/bboard.umd.js`) peut être consommée dans tout environnement supportant ES2020 — aucune exigence Node.js pour les utilisateurs finaux.
