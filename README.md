# N’Teriface

Démo front-end d’un réseau social complet inspiré de Facebook, imaginé pour le Mali et habillé de l’identité visuelle N’Teri.

> **Projet de démonstration** — toutes les données sont fictives. Le frontend peut fonctionner seul en mode local ou se connecter au backend Django N’Teriface pour l’authentification, le fil, Messenger et les actions sociales.

## Lancer le projet

```bash
npm install
npm run dev
```

Vite démarre sur `http://localhost:5174` (ou le port suivant si celui-ci est occupé).

### Compte de démonstration

- **Identifiant :** `awa.traore`
- **Mot de passe :** `nteriface2026`
- Ou cliquez simplement sur **« Entrer dans la démo »** sur l’écran de connexion.

## Deux modes de fonctionnement

### 1. Mode local autonome

Sans backend, le frontend utilise les données de `src/data.ts` et conserve les interactions dans `localStorage` (clé `nteriface:demo:v1`). Les réponses Messenger sont simulées.

### 2. Mode connecté au backend Django

Le backend se trouve dans `../py/nteriface-api` (Django, DRF, Channels, SQLite en local).

```bash
cd ../py/nteriface-api
source ../venv/bin/activate
python manage.py migrate
python manage.py seed_demo --reset
python -m daphne -b 127.0.0.1 -p 8000 nteriface_api.asgi:application
```

Puis, dans un autre terminal :

```bash
cd ../nteriface
npm run dev
```

Vite proxifie automatiquement `/api` et `/ws` vers `http://127.0.0.1:8000`, y compris avec `npm run preview` (port `4173`). La connexion utilise la session Django et le jeton CSRF ; aucun token n’est stocké dans `localStorage`.

Si l’API est indisponible ou renvoie une erreur serveur, la connexion bascule sur le mode local avec un message explicite. Une erreur d’identifiants (réponse `4xx`) ne déclenche **pas** ce repli : le message du serveur est affiché sur l’écran de connexion.

#### Intégration actuelle

- Authentification et inscription par session Django et CSRF (téléphone requis).
- Hydratation de `me`, du fil, des personnes, des demandes d’amis, des notifications et des conversations.
- Envoi de messages via l’API REST et réception temps réel par WebSocket (`/ws/inbox/`).
- Actions synchronisées : réactions, commentaires, likes de commentaires, votes, sauvegardes, masquage, partages, demandes d’amis, follow, groupes, Pages, événements, Marketplace et lecture des notifications.
- Création de publication synchronisée avec le backend.
- Les Stories, Reels, vidéos, groupes, Pages, événements, annonces et le contenu éditorial restent alimentés par les données de démonstration du frontend ; le backend expose leurs endpoints pour une intégration complète.

#### Configuration optionnelle

Pour appeler une API sur une autre origine en production :

```bash
VITE_API_BASE=https://api.nteriface.example.com npm run build
```

Laisser `VITE_API_BASE` vide pour utiliser le proxy Vite en développement ou une API servie sur la même origine. Voir `.env.example`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement Vite |
| `npm run typecheck` | Vérification TypeScript stricte |
| `npm run build` | Vérification des types + build de production |
| `npm run preview` | Prévisualisation du build |

## Fonctionnalités

- **Authentification** : connexion et inscription au backend, repli local hors ligne, compte de démonstration.
- **Fil d’actualité** : publications, réactions, commentaires, partages, Stories, suggestions, tendances.
- **Création** : composeur global pour publications, Stories et Reels, avec confidentialité et cross-posting.
- **Profil** : couverture, bio, statistiques, albums, photos, amis, publications enregistrées.
- **Relations** : demandes d’amis, suggestions, liste d’amis.
- **Vidéos et Reels** : lecteur, catégories, création, statistiques créateur.
- **Messenger** : conversations, groupes, pièces jointes, réponses simulées en local, messages persistés et temps réel avec le backend, appels audio/vidéo simulés.
- **Groupes, Pages et Événements** : listes, détails, adhésion, abonnement, participation.
- **Marketplace** : annonces, catégories, sauvegardes, détail, contact vendeur.
- **Local & Explorer** : lieux, catégories, recommandations à Bamako.
- **Rencontres** : profils, filtres, likes et matchs simulés.
- **Créateurs** : tableau de bord, audience, revenus, monétisation.
- **Publicités et portefeuille** : campagnes, budgets FCFA, transactions, retraits.
- **Recherche globale** : personnes, publications, groupes, pages, événements, Marketplace, vidéos, Reels et assistant N’Teri AI.
- **Notifications et enregistrements** : filtres, lecture, sauvegardes.
- **Paramètres** : compte, confidentialité, sécurité, notifications, apparence, langue, accessibilité, données.
- **Administration** : signalements, utilisateurs, vérifications, analytics, système, journal d’audit ; accès réservé aux comptes `is_staff`.
- **Accessibilité** : thème clair/sombre/système, contraste élevé, réduction des animations.
- **Responsive** : navigation mobile dédiée, tiroirs, rails adaptatifs de 375 px à 1440 px.

## Stack

- React 19 + TypeScript strict
- React Router 8
- Vite 8
- Tailwind CSS 4
- Lucide React
- Backend Django 6 + DRF + Channels (optionnel)
- Persistance locale via `localStorage` (clé `nteriface:demo:v1`) et API REST/WebSocket

## Organisation

```text
src/
├── components/   # Shell, composeur, cartes, lecteurs, UI partagée
├── pages/        # Une page par grande fonctionnalité
├── lib/
│   ├── api.ts         # Client HTTP, CSRF et WebSocket
│   └── apiHydrate.ts  # Mapping API → types du frontend
├── data.ts       # Données fictives maliennes
├── store.tsx     # État global, actions, hydratation et persistance
├── types.ts      # Modèle de données
└── index.css     # Design system et thèmes
```

## Réinitialiser la démo

Dans **Paramètres → Données**, utilisez **Réinitialiser la démo** pour restaurer les données d’origine. Le thème et les préférences d’accessibilité sont conservés séparément. En mode backend, relancez `python manage.py seed_demo --reset` pour réinitialiser la base.

## Identité visuelle

- Crème `#f4f0e7`
- Vert forêt `#0b7a45`
- Accents drapeau malien (vert, jaune, rouge)
- Typographies Sora et Inter
- Cartes arrondies, logo squircle et wordmark « N’Teriface »

## Notes

Le build de production affiche un avertissement de taille de bundle (> 500 kB). Il est non bloquant : l’application est volontairement regroupée dans un seul chunk pour cette démo.
