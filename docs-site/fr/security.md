# Politique de sécurité

## Signaler une vulnérabilité

**N'ouvrez pas un ticket GitHub public pour signaler une faille de sécurité.**

Veuillez signaler les problèmes de sécurité via [GitHub Security Advisories](https://github.com/SoftZenIT/b-board/security/advisories/new) (divulgation privée). Nous accuserons réception dans les 72 heures et coordonnerons un correctif et un calendrier de divulgation avec vous.

## Versions supportées

Seule la dernière version publiée sur npm reçoit des correctifs de sécurité.

| Version   | Supportée |
| --------- | --------- |
| Dernière  | ✅        |
| Anciennes | ❌        |

## Périmètre

b-board est une bibliothèque UI sans composant côté serveur. La surface d'attaque se limite à :

- La validation des entrées dans le moteur clavier
- Les opérations d'insertion dans le DOM
- La gestion des événements

Hors périmètre : problèmes dans votre propre code applicatif, dépendances tierces sans lien avec b-board.
