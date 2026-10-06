# ICIMO — location immobilière au Bénin

ICIMO est une interface de démonstration responsive pour la recherche et la location de logements au Bénin, en courte ou longue durée. Les données et parcours client, propriétaire et administration sont simulés localement dans le navigateur.

## Démarrage local

Prérequis : Node.js 22 et pnpm 10 (la version pnpm est indiquée dans `package.json`).

```bash
pnpm install --frozen-lockfile
pnpm dev:static
```

Ouvrir `http://localhost:3000`.

## Vérification et build

```bash
pnpm check
pnpm test
pnpm build:static
```

La sortie statique est générée dans `dist/public/`.

## Périmètre actuel

- Interface React, TypeScript, Vite, Wouter et Tailwind CSS.
- Parcours de démonstration : recherche et filtres, annonces, favoris, authentification simulée, réservation courte durée, demande longue durée, messagerie, profil, avis, espace propriétaire, calendrier et administration.
- Les exemples et préférences sont conservés localement dans le navigateur ; les images de démonstration sont versionnées sous `client/public/assets/`.
- Aucun compte réel, paiement, SMS, e-mail, réservation serveur, contrôle de disponibilité serveur ni stockage de documents privé n’est configuré. Il ne s’agit pas d’un backend ICIMO.

## Structure utile

- `client/src/pages/` : parcours client, propriétaire et administration.
- `client/src/components/` : coque responsive, navigation et magasin local de démonstration.
- `client/src/data/demo.ts` : types, annonces et exemples de données.
- `client/public/assets/` : visuels originaux des annonces de démonstration.
- `TODO.md` : périmètre réalisé et limites de la démo.

Le dépôt comprend encore le squelette technique générique fourni par le starter Manus ; les parcours ICIMO ne sont pas raccordés à ses services. À la prochaine étape, remplacer l’état local par le backend choisi et faire du serveur la source de vérité des comptes, rôles, annonces, disponibilités, réservations et paiements. Supabase et Saspay.me restent des choix prévus mais non intégrés.
