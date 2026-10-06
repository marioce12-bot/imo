# ICIMO — location immobilière au Bénin

ICIMO est une interface responsive pour découvrir des logements au Bénin, en courte ou longue durée. La page « Découvrir » est centrée sur la recherche et les annonces, et le header reste visible pendant le défilement.

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
- **Supabase Auth est raccordé** : inscription, connexion, déconnexion, confirmation e-mail, récupération et changement de mot de passe. En local, si les variables publiques Supabase ne sont pas fournies, les écrans utilisent le mode de démonstration.
- Vercel fournit `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et, le cas échéant, `NEXT_PUBLIC_AUTH_REDIRECT_URL`; Vite ne publie que ces paramètres explicitement whitelistés. Un déploiement hors Vercel peut utiliser les équivalents `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` et `VITE_AUTH_REDIRECT_URL`.
- **Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` dans le navigateur.** Le code n’en fait aucun usage. La clé anonyme n’est pas un substitut aux politiques RLS.
- Les logements, filtres, favoris, recherches sauvegardées, réservations, calendrier, chat, avis, revenus, modération et préférences métier restent des données de démonstration stockées localement. Aucun schéma/table Supabase ICIMO, autorisation métier serveur, paiement, SMS, e-mail métier ni réservation réelle n’est implémenté.
- Le nom et le téléphone fournis à l’inscription sont enregistrés dans les métadonnées du compte Supabase; les autres champs de profil restent locaux.
- Les images des annonces de démonstration sont versionnées sous `client/public/assets/`.

Supabase Auth n’implémente pas l’autorisation des rôles propriétaire/admin ni la sécurité des annonces et réservations. Avant d’ouvrir ces fonctions à de vrais utilisateurs, créer le schéma Supabase, les politiques RLS, les contrôles serveur et les flux de stockage appropriés. Les paramètres Redirect URLs de Supabase doivent autoriser le domaine ICIMO.

## Structure utile

- `client/src/pages/` : parcours client, propriétaire et administration.
- `client/src/components/` : coque responsive, navigation et magasin local de démonstration.
- `client/src/lib/supabase.tsx` : client public Supabase et état de session/authentification.
- `client/src/data/demo.ts` : types, annonces et exemples de données.
- `client/public/assets/` : visuels originaux des annonces de démonstration.
- `TODO.md` : périmètre réalisé et limites de la démonstration.
