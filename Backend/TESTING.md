# Guide Complet des Tests Automatisés - Backend

## Table des matières
1. [Présentation générale](#présentation-générale)
2. [Architecture des tests](#architecture-des-tests)
3. [Stack technologique](#stack-technologique)
4. [Exécution des tests](#exécution-des-tests)
5. [Anatomie d'un test](#anatomie-dun-test)
6. [Mocks et isolation](#mocks-et-isolation)
7. [Couverture par route](#couverture-par-route)
8. [Ajouter de nouveaux tests](#ajouter-de-nouveaux-tests)
9. [Bonnes pratiques](#bonnes-pratiques)
10. [Dépannage](#dépannage)

---

## Présentation générale

### Objectif
Tester automatiquement les routes API du backend (Auth, Admin, Contact) **sans dépendre** d'une vraie base de données MongoDB ou d'un serveur SMTP.

### Approche
- **Isolation**: Chaque test s'exécute de manière isolée avec des fausses données (mocks)
- **Rapide**: Pas d'attentes réseau, exécution en < 2 secondes pour 15 tests
- **Fiable**: Reproductible, même résultat à chaque fois
- **Maintenable**: Code de test lisible et proche du code de production

### Bénéfices
✅ Détection rapide de régressions  
✅ Confiance lors des refactorings  
✅ Documentation exécutable  
✅ Zéro dépendance externe au runtime  

---

## Architecture des tests

### Structure des fichiers

```
Backend/
├── app.js                    ← App Express exportée (testable)
├── server.js                 ← Démarre l'app + connexion DB
├── tests/
│   ├── auth.test.js          ← Tests Auth (register, login, logout)
│   ├── admin.test.js         ← Tests Admin (auth middleware, role check)
│   └── contact.test.js       ← Tests Contact (CRUD messages, replies)
├── routes/
│   ├── Auth.js
│   ├── Admin.js
│   └── Contact.js
├── middleware/
│   ├── authMiddleware.js     ← JWT verification
│   └── admin.js              ← Role check
├── models/
│   ├── User.js
│   └── Message.js
└── package.json              ← Scripts de test
```

### Flux d'un test

```
1. Setup
   ├─ Initialiser les mocks
   └─ Configurer les env vars

2. Exécution
   ├─ Faire une requête HTTP (GET/POST/DELETE/PATCH)
   └─ Intercepter la réponse

3. Assertion
   ├─ Vérifier status code (200, 400, 401, etc)
   ├─ Vérifier le contenu JSON
   └─ Vérifier les appels aux mocks

4. Cleanup
   └─ Réinitialiser les mocks pour le test suivant
```

---

## Stack technologique

### Vitest
Framework de test moderne (remplaçant rapide de Jest)

**Pourquoi Vitest?**
- Plus rapide que Jest (~3x)
- Compatible ES modules
- Syntaxe identique à Jest
- Zéro config requis

### Supertest
Client HTTP pour tester les routes Express

```javascript
// Exemple
const response = await request(app)
  .post('/api/auth/login')
  .send({ email: 'user@test.com', password: 'pass' });

expect(response.status).toBe(200);
expect(response.body.token).toBeDefined();
```

### vi (de Vitest)
API de mocking et de spies

```javascript
vi.fn()           ← Crée une fonction mockée
vi.mock()         ← Remplace un module
vi.hoisted()      ← Hoiste les variables avant le mock
.mockResolvedValue() ← Configure la réponse async
.mockImplementation() ← Fonction custom
```

---

## Exécution des tests

### Commande simple (une fois)
```bash
cd Backend
npm test
```

Affichage:
```
 Test Files  3 passed (3)
      Tests  15 passed (15)
   Duration  1.56s
```

### Mode watch (développement)
```bash
npm run test:watch
```

Relance automatiquement les tests à chaque sauvegarde de fichier. Idéal pour l'itération rapide.

### Exécuter un seul fichier de test
```bash
npx vitest run tests/auth.test.js
```

### Exécuter un seul test (par nom)
```bash
npx vitest run -t "POST /api/auth/login retourne un token"
```

---

## Anatomie d'un test

### Structure générale

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

// 1. MOCKS (hoistés)
const { userModelMock } = vi.hoisted(() => ({
  userModelMock: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

// 2. VIM MOCK (remplace le module réel)
vi.mock('../models/User.js', () => ({
  default: userModelMock,
}));

// 3. IMPORT (après les mocks)
import app from '../app.js';

// 4. BLOC DE TESTS
describe('Auth API', () => {
  // 5. SETUP
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  // 6. TEST INDIVIDUAL
  it('POST /api/auth/login retourne un token', async () => {
    // Arrange: prépare les fausses données
    userModelMock.findOne.mockResolvedValue({
      _id: 'u1',
      password: 'hash',
      role: 'admin',
    });

    // Act: exécute l'action
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@site.com', password: 'pass' });

    // Assert: vérifie les résultats
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: 'mock-jwt-token' });
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      email: 'admin@site.com',
    });
  });
});
```

### Les 3 phases (AAA Pattern)

| Phase | Description |
|-------|-------------|
| **Arrange** | Préparer les données: configurer les mocks |
| **Act** | Faire la requête au endpoint |
| **Assert** | Vérifier la réponse (status, body, appels mocks) |

### Méthodes courantes

#### Expect (assertions)
```javascript
expect(value).toBe(expected)              // Égalité stricte
expect(value).toEqual(expected)           // Égalité profonde (objets)
expect(array).toHaveLength(5)             // Longueur
expect(fn).toHaveBeenCalled()             // Fonction appelée
expect(fn).toHaveBeenCalledWith(arg1, arg2) // Appelée avec args spécifiques
expect(value).toBeDefined()               // Pas undefined
expect(value).toThrow()                   // Lance une erreur
```

#### Async/Await
```javascript
// Test async
it('test async', async () => {
  const response = await request(app).get('/api/contact');
  expect(response.status).toBe(200);
});

// Mock resolve
mockFn.mockResolvedValue({ data: 'result' });

// Mock reject
mockFn.mockRejectedValue(new Error('failed'));
```

---

## Mocks et isolation

### Pourquoi mocker?

**Sans mocks** (problématique):
```
Test → API → MongoDB (vraie) → Test lent ❌
          → SMTP (vrais emails envoyés) ❌
```

**Avec mocks** (idéal):
```
Test → API → Fausses données en mémoire ✅
          → Pas de vraies dépendances ✅
```

### Comment fonctionnent les mocks

#### vi.hoisted()
Place les variables de mock **avant** les imports. Vitest exécute `vi.mock()` avant les imports, donc les variables doivent être déclarées avant.

```javascript
// ❌ MAUVAIS
const userMock = vi.fn();
vi.mock('../models/User.js', () => ({
  default: userMock,  // userMock n'existe pas encore!
}));

// ✅ BON
const { userMock } = vi.hoisted(() => ({
  userMock: vi.fn(),
}));
vi.mock('../models/User.js', () => ({
  default: userMock,  // userMock existe maintenant
}));
```

#### Configurer les mocks

```javascript
// Mock d'une fonction async
mockFn.mockResolvedValue({ id: 1 });
// Au lieu d'appel réel: return Promise.resolve({ id: 1 })

// Mock avec effet custom
mockFn.mockImplementation((email) => {
  if (email === 'admin@test.com') {
    return Promise.resolve({ role: 'admin' });
  }
  return Promise.resolve(null);
});

// Vérifier l'appel
expect(mockFn).toHaveBeenCalledWith('admin@test.com');
expect(mockFn).toHaveBeenCalledTimes(1);
```

#### Réinitialiser entre les tests

```javascript
beforeEach(() => {
  vi.clearAllMocks();  // Efface tous les appels précédents
  // Chaque test démarre avec un état vierge
});
```

### Mocks dans le projet

#### Models (Mongoose)
```javascript
// Réel (production)
const user = await User.findOne({ email });

// Mock (test)
userModelMock.findOne.mockResolvedValue({ _id: 'u1' });
```

#### Nodemailer
```javascript
// Réel (production)
await transporter.sendMail({ from, to, subject, text });

// Mock (test)
nodemailerMock.sendMail.mockResolvedValue({ accepted: ['user@test.com'] });
// Pas de vrai email envoyé!
```

#### JWT
```javascript
// Réel (production)
const token = jwt.sign({ id, role }, SECRET);

// Mock (test)
jwtMock.sign.mockReturnValue('mock-token-abc123');
```

---

## Couverture par route

### Auth (`/api/auth`)

| Route | Méthode | Test |
|-------|---------|------|
| `/register` | POST | ✅ User existant → 400 |
| `/register` | POST | ✅ Création valide → 200 |
| `/login` | POST | ✅ User introuvable → 404 |
| `/login` | POST | ✅ Mot de passe incorrect → 400 |
| `/login` | POST | ✅ Credentials valides → 200 + token |
| `/logout` | POST | ❌ À ajouter |

### Admin (`/api/admin`)

| Route | Méthode | Test |
|-------|---------|------|
| `/admin-data` | GET | ✅ Pas de token → 401 |
| `/admin-data` | GET | ✅ Token invalide → 401 |
| `/admin-data` | GET | ✅ Role user (non-admin) → 403 |
| `/admin-data` | GET | ✅ Role admin → 200 |

### Contact (`/api/contact`)

| Route | Méthode | Test |
|-------|---------|------|
| `/` | GET | ✅ Récupère les messages |
| `/` | POST | ✅ Crée message + envoie email |
| `/:id` | DELETE | ✅ 404 si absent |
| `/:id/read` | PATCH | ✅ Marque comme lu |
| `/:id/reply` | POST | ✅ 404 si message absent |
| `/:id/reply` | POST | ✅ Envoie réponse + sauvegarde |

---

## Ajouter de nouveaux tests

### Étape 1: Identifier la route
Exemple: `POST /api/contact/:id/reply` (un test de ce endpoint existe déjà)

### Étape 2: Identifier le cas de test
Cas à tester: "Réponse à un message absent"

### Étape 3: Écrire le test

Ouvre [Backend/tests/contact.test.js](Backend/tests/contact.test.js) et ajoute:

```javascript
it('POST /api/contact/:id/reply retourne 404 si message absent', async () => {
  // Arrange
  messageModelMock.findById.mockResolvedValue(null);

  // Act
  const response = await request(app)
    .post('/api/contact/507f1f77bcf86cd799439011/reply')
    .send({ reply: 'Ma réponse' });

  // Assert
  expect(response.status).toBe(404);
  expect(response.body).toEqual({ error: 'Message non trouvé' });
});
```

### Étape 4: Lancer le test
```bash
npm test
```

Ou en mode watch:
```bash
npm run test:watch
```

### Template générique

```javascript
describe('[Endpoint] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup env vars si nécessaire
  });

  it('[Méthode] [Route] [Cas de test]', async () => {
    // Arrange: configure les mocks
    mockFunc.mockResolvedValue({ data: 'result' });

    // Act: fais la requête
    const response = await request(app)
      .get('/api/endpoint')
      .send({ /* payload */ });

    // Assert: vérifie
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ /* expected */ });
  });
});
```

---

## Bonnes pratiques

### ✅ À faire

1. **Un test = Un cas**
   ```javascript
   // ✅ BON
   it('retourne 404 si user absent', async () => { ... });
   it('retourne token si login valide', async () => { ... });
   ```

2. **Noms explicites**
   ```javascript
   // ✅ BON
   it('POST /api/auth/login retourne 401 si pas de token', async () => {});

   // ❌ MAUVAIS
   it('test', async () => {});
   ```

3. **Isolation complète**
   ```javascript
   beforeEach(() => {
     vi.clearAllMocks();  // Réinitialiser état
     process.env.JWT_SECRET = 'test-secret';
   });
   ```

4. **Vérifier les appels**
   ```javascript
   // Pas seulement la réponse, mais aussi les mocks
   expect(userModel.create).toHaveBeenCalledWith({
     email: 'user@test.com',
     password: 'hashed',
     role: 'user',
   });
   ```

5. **Données réalistes**
   ```javascript
   // ✅ BON (ID MongoDB réel)
   const id = '507f1f77bcf86cd799439011';

   // ❌ MAUVAIS
   const id = 'abc123';
   ```

### ❌ À éviter

1. **Tests interdépendants**
   ```javascript
   // ❌ MAUVAIS
   it('test 1', async () => {
     await request(app).post('/api/auth/register').send(...);
     // Dépend du test 2
   });
   it('test 2', async () => { ... });
   ```

2. **Pas de cleanup**
   ```javascript
   // ❌ MAUVAIS - pas de beforeEach
   describe('Tests', () => {
     it('test 1', async () => { ... });
     it('test 2', async () => { ... }); // état pollué du test 1
   });
   ```

3. **Trop de logique**
   ```javascript
   // ❌ MAUVAIS
   it('test complexe', async () => {
     // 10 lignes de setup
     // 20 lignes d'assertions
     // Difficile à debugger
   });
   ```

4. **Fichiers de test trop gros**
   ```javascript
   // ✅ BON
   tests/auth.test.js       (seuls tests auth)
   tests/admin.test.js      (seuls tests admin)
   tests/contact.test.js    (seuls tests contact)

   // ❌ MAUVAIS
   tests/all.test.js        (500 lignes, chaotique)
   ```

---

## Dépannage

### Erreur: "Cannot access 'mockVar' before initialization"

**Cause**: Variable de mock déclarée après `vi.mock()`

**Solution**:
```javascript
// ✅ CORRECT
const { mockVar } = vi.hoisted(() => ({
  mockVar: vi.fn(),
}));

vi.mock('../module', () => ({
  default: mockVar,
}));
```

### Erreur: "Cannot find module"

**Cause**: Chemin d'import incorrect

**Solution**: 
```javascript
// Vérifier les chemins relatifs
../models/User.js    ← Depuis tests/auth.test.js
../../../models/User.js  ← NON, trop loin!
```

### Test timeout

**Cause**: Mock async non configuré

**Solution**:
```javascript
// ✅ À faire
mockFn.mockResolvedValue({ data: 'result' });

// ❌ À éviter
mockFn.mockReturnValue(Promise.resolve()); // Retourne la promise elle-même, pas la valeur
```

### Mock ne retourne pas le bon format

**Cause**: Configuration du mock incorrecte

**Solution**:
```javascript
// Debug: affiche ce que le mock retourne
console.log('Mock result:', await mockFn());

// Ou utilise un mock implementation custom
mockFn.mockImplementation(async (email) => {
  console.log('findOne appelée avec:', email);
  if (email === 'test@test.com') {
    return { _id: 'u1', email, role: 'user' };
  }
  return null;
});
```

### Vérifier quelle réponse est retournée

**Utilise un fichier `.test.js` temporaire**:
```javascript
it('debug', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@test.com', password: 'pass' });

  console.log('Status:', response.status);
  console.log('Body:', JSON.stringify(response.body, null, 2));

  // Puis c'est facile de vérifier
  expect(response.status).toBe(200);
});
```

---

## Prochaines étapes

### À implémenter
1. **Tests du logout** → `POST /api/auth/logout`
2. **Tests d'intégration** → Plusieurs endpoints ensemble
3. **E2E tests** → Avec Playwright (frontend + backend)
4. **Coverage report** → `npm test -- --coverage`

### Exemple: Ajouter des tests logout

[Backend/tests/auth.test.js](Backend/tests/auth.test.js)

```javascript
it('POST /api/auth/logout retourne un message de succès', async () => {
  const response = await request(app).post('/api/auth/logout');

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ message: 'Logged out successfully' });
});
```

---

## Résumé rapide

| Besoin | Commande |
|--------|----------|
| Lancer les tests | `npm test` |
| Mode développement | `npm run test:watch` |
| Un seul test | `npx vitest run -t "nom du test"` |
| Ajouter un test | Copier le template dans le fichier |
| Modifier un mock | Chercher `.mockResolvedValue()` |
| Réinitialiser l'état | `vi.clearAllMocks()` dans `beforeEach` |

