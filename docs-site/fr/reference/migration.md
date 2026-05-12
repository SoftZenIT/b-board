---
title: Guide de migration
---

# Guide de migration

## Version actuelle

b-board est actuellement à la **v0.1.0**. La bibliothèque est en développement pré-1.0 actif. L'API publique se stabilise mais des changements majeurs peuvent encore survenir lors des montées de version mineure jusqu'à la publication de la v1.0.0.

---

## Politique de versionnage

| Type de publication     | Montée de version | Garanties                                                   |
| ----------------------- | ----------------- | ----------------------------------------------------------- |
| Correction de bug       | Patch (`0.1.x`)   | Pas de changements d'API                                    |
| Nouvelle fonctionnalité | Mineure (`0.x.0`) | Ajouts rétrocompatibles ; peut inclure des dépréciations    |
| **Publication stable**  | **`1.0.0`**       | **Le versionnage sémantique complet (SemVer) commence ici** |

Jusqu'à la v1.0.0, traitez chaque version mineure comme pouvant contenir des changements majeurs et consultez le [CHANGELOG](https://github.com/b-board/b-board/blob/main/CHANGELOG.md) avant toute mise à niveau.

---

## Changements majeurs

Il n'y a pas de changements majeurs dans la version actuelle.

---

## Avis de dépréciation

Il n'y a pas de dépréciations actives dans la version actuelle.

---

## CHANGELOG

Une liste complète des changements pour chaque version est suivie dans [CHANGELOG.md](https://github.com/b-board/b-board/blob/main/CHANGELOG.md).

---

## Modèle de liste de contrôle de migration

Lorsqu'une nouvelle version avec des changements majeurs est publiée, utilisez la liste de contrôle suivante pour guider votre mise à niveau :

```markdown
## Liste de contrôle de mise à niveau : v<ANCIENNE> → v<NOUVELLE>

### Avant la mise à niveau

- [ ] Lire l'entrée CHANGELOG pour v<NOUVELLE>
- [ ] Identifier les API dépréciées que vous utilisez actuellement
- [ ] Exécuter votre suite de tests existante sur la version actuelle pour établir une base de référence

### Mise à jour des dépendances

- [ ] Mettre à jour le package `b-board` : `npm install b-board@<NOUVELLE>`
- [ ] Vérifier les changements de dépendances homologues dans les notes de version

### Changements d'API

- [ ] Remplacer les API supprimées par leurs alternatives documentées
- [ ] Mettre à jour les chemins d'import qui ont changé
- [ ] Appliquer les renommages d'attributs sur `<benin-keyboard>` si listés dans le changelog
- [ ] Mettre à jour les types TypeScript qui ont été renommés ou restreints

### Adaptateurs de framework

- [ ] Vérifier que les props du wrapper React correspondent toujours (si vous utilisez `@b-board/react`)
- [ ] Vérifier que la directive Vue fonctionne toujours (si vous utilisez `@b-board/vue`)
- [ ] Vérifier que l'import du module Angular est à jour (si vous utilisez `@b-board/angular`)

### Validation

- [ ] Exécuter `npm run type-check` — résoudre les nouvelles erreurs de type
- [ ] Exécuter `npm test` — tous les tests existants doivent passer
- [ ] Exécuter `npm run e2e` — l'interaction clavier de bout en bout fonctionne toujours
- [ ] Tester en smoke chaque langue prise en charge (yoruba, fon-adja, baatonum, dendi)
- [ ] Tester en smoke chaque thème pris en charge (light, dark, auto)
```
