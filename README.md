# Project Manager

Application portfolio + dashboard d'administration.

Le projet est composé de :
- un frontend React (Vite + TypeScript)
- un backend Node.js (Express + MongoDB)

## Fonctionnalités principales

### Portfolio public
- page d'accueil portfolio
- section projets dynamique depuis l'API
- cartes projets avec slider d'images
- modale de détail projet (description, stack, tags, images)
- section compétences dynamique (nom, icône, pourcentage)

### Dashboard administration
- authentification par token JWT
- gestion des projets : création, modification, suppression
- upload multiple d'images projets
- gestion des compétences :
  - nom
  - catégorie
  - niveau en pourcentage (0-100)
  - icône sélectionnable

## Structure

```text
Project-Manager/
├─ src/                # Frontend React
├─ Backend/            # API Express + MongoDB
├─ public/
└─ dist/
```

## Prérequis

- Node.js 18+
- MongoDB local (ou URI Mongo distante)

## Installation

### Frontend

Depuis la racine du projet :

```bash
npm install
```

### Backend

```bash
cd Backend
npm install
```

## Variables d'environnement backend

Créer/mettre à jour `Backend/.env` :

```env
MONGO_URI=mongodb://127.0.0.1:27017/Project_Manager
JWT_SECRET=your_jwt_secret_key

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_PRO=
MAIL_PERSO=

IMAP_HOST=
IMAP_PORT=
IMAP_USER=
IMAP_PASS=
```

Note MongoDB : sur certaines installations locales, utiliser `127.0.0.1` est plus fiable que `localhost`.

## Lancement en développement

### 1. Lancer le backend

```bash
cd Backend
npm run dev
```

### 2. Lancer le frontend

Dans un autre terminal, depuis la racine :

```bash
npm run dev
```

## Build production frontend

Depuis la racine :

```bash
npm run build
```

## API utilisée par le frontend

- `GET /api/projects`
- `GET /api/projects/admin/all`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

- `GET /api/skills`
- `POST /api/skills`
- `PUT /api/skills/:id`
- `DELETE /api/skills/:id`

## Icônes de compétences

Les icônes sont choisies via une liste dans le dashboard compétences, puis stockées en clé texte en base.

Exemples de clés :
- `react`
- `html5`
- `css3`
- `javascript`
- `typescript`
- `nodejs`
- `mongodb`

Le rendu est automatique sur le dashboard et le portfolio.

## Tests backend

```bash
cd Backend
npm test
```
