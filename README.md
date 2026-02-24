# 🔍 JobFinder - Plateforme de Recherche d'Emploi Intelligente V1.0

<div align="center">

![Angular](https://img.shields.io/badge/Angular-17+-dd0031?style=for-the-badge&logo=angular)
![NgRx](https://img.shields.io/badge/NgRx-State--Management-ba2bd2?style=for-the-badge&logo=ngrx)
![RxJS](https://img.shields.io/badge/RxJS-Reactive--Extensions-b7178c?style=for-the-badge&logo=reactivex)
![JSON Server](https://img.shields.io/badge/JSON--Server-Persistence-black?style=for-the-badge&logo=json)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3?style=for-the-badge&logo=bootstrap)

**Application Web moderne de recherche d'emploi utilisant l'API "The Muse" avec gestion d'état avancée et persistance des données.**

</div>

## 🎯 Présentation du Projet
JobFinder est une Single Page Application (SPA) conçue pour aider les chercheurs d'emploi à trouver les meilleures opportunités. L'application agrège des données réelles, permet une gestion fluide des favoris via NgRx, et assure le suivi des candidatures grâce à une persistance côté serveur avec JSON Server.

## 🌟 Fonctionnalités Clés

### 💼 Recherche & Consultation
- **Consommation API REST** : Intégration de l'API "The Muse" pour des offres d'emploi en temps réel.
- **Filtrage Dynamique** : Recherche par mots-clés, localisation et niveau d'expérience.
- **Pagination Intelligente** : Gestion de la pagination côté API pour des performances optimales.

### 🧠 Gestion d'État & Persistance
- **NgRx Store** : Gestion centralisée des favoris (Ajout/Suppression/Sync).
- **JSON Server** : Persistance réelle des candidatures (statuts, notes) et des favoris liés à l'ID utilisateur.
- **Authentification Sécurisée** : Gestion de la session utilisateur via `sessionStorage` (justifié par la sécurité des données volatiles).

### 🛡️ Sécurité & Navigation
- **AuthGuard** : Protection des routes sensibles (Profil, Mes Candidatures, Favoris).
- **Resolvers** : Pré-chargement des détails de l'offre avant l'affichage du composant pour une UX fluide.
- **Lazy Loading** : Optimisation du temps de chargement initial par le chargement à la demande des modules de fonctionnalités.

## 🛠️ Stack Technique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Frontend** | Angular 17 (Standalone) | Framework principal |
| **State Management** | NgRx (Store, Effects, Selectors) | Gestion de l'état des favoris |
| **Programmation** | RxJS & Observables | Gestion des flux de données asynchrones |
| **Styling** | Bootstrap 5 / CSS3 | Design responsive et UI/UX |
| **API Backend** | The Muse API | Source des données métier |
| **Base de données** | JSON Server (db.json) | Stockage des candidatures et favoris |
| **Outils** | Angular CLI, NPM, Git | Développement et versionnage |

## 📐 Architecture du Projet (Flux NgRx)
L'application suit le pattern Redux pour une prédictibilité totale :
1. **Component** : Dispatch une Action (ex: `addFavorite`).
2. **Effect** : Intercepte l'Action et communique avec **JSON Server** via le **HttpClient**.
3. **Reducer** : Met à jour le **Store** après succès de l'opération.
4. **Selector** : Met à jour la vue (Navbar, Listes) de manière réactive.



## 🚀 Démarrage Rapide

### 1. Prérequis
- **Node.js** (v18+)
- **Angular CLI** (`npm install -g @angular/cli`)
- **JSON Server** (`npm install -g json-server`)

### 2. Installation
```bash
# Cloner le projet
git clone [https://github.com/ichrakjaifra/job-finder.git](https://github.com/ichrakjaifra/job-finder.git)
cd job-finder
```
# Installer les dépendances
npm install

### 3. Lancer le Backend (JSON Server)
Dans un nouveau terminal :
```Bash
json-server --watch db.json --port 3000
```
### 4. Lancer l'Application Angular
```Bash
ng serve
```
Accédez à l'application via : http://localhost:4200

## ⚙️ Configuration du Proxy
Pour éviter les erreurs CORS lors de la communication avec l'API externe, un fichier proxy.conf.json est configuré :
```
{
  "/api/muse": {
    "target": "[https://www.themuse.com/api/public](https://www.themuse.com/api/public)",
    "secure": true,
    "changeOrigin": true,
    "pathRewrite": { "^/api/muse": "" }
  }
}
```
