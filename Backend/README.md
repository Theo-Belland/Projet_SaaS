# Backend - Tests automatises

## Installation

```bash
npm install
```

## Lancer les tests

```bash
npm test
```

Mode watch:

```bash
npm run test:watch
```

## Couverture actuelle

### Auth (`/api/auth`)
- Register: utilisateur deja existant
- Register: creation utilisateur valide
- Login: utilisateur introuvable
- Login: mot de passe invalide
- Login: token genere si credentials valides

### Admin (`/api/admin`)
- Refus sans token (401)
- Refus token invalide (401)
- Refus role non admin (403)
- Acces role admin (200)

### Contact (`/api/contact`)
- Recuperation des messages
- Creation message + envoi email
- Suppression message introuvable
- Marquage message lu
- Reponse message introuvable
- Reponse message existant + sauvegarde reply

## Stack utilisee
- `vitest`
- `supertest`
- Mocks de `mongoose` models et `nodemailer`

## Notes
- Les tests backend n'utilisent pas de vraie base MongoDB.
- Les envois mail sont mockes (aucun email reel envoye).
