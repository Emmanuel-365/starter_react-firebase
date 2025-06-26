# 🚀 AI-Powered Email Assistant (React + Firebase + OpenAI + EmailJS + Material UI)

Ce projet est une base complète pour une application React qui permet de :
- 🔥 Utiliser Firebase comme backend (Auth, Firestore, Storage)
- 🧠 Générer des emails grâce à une API d’IA (comme OpenAI)
- ✉️ Envoyer des emails via EmailJS (sans backend)
- ⚛️ Gérer l’état avec Redux Toolkit
- 🎨 Utiliser Material UI pour un design professionnel et réactif
- ⚡ Utiliser Vite pour le développement rapide

---

## 📦 Stack Technique

| Outil         | Usage                                       |
|---------------|----------------------------------------------|
| React         | Frontend SPA                                |
| Vite          | Bundler léger                               |
| Firebase      | Authentification & Firestore                |
| Redux Toolkit | État global                                 |
| EmailJS       | Envoi d’emails frontend                     |
| OpenAI API    | Génération de contenu (IA)                  |
| **Material UI** | **Librairie de composants UI réactifs et modernes** |

---

## 🚀 Étapes de démarrage

1. **Créer un dépôt Git :**
   ```bash
   git init
   git remote add origin <TON_DEPOT_GIT>
````

2. **Cloner le projet et s’y déplacer :**

   ```bash
   git clone <TON_DEPOT_GIT>
   cd <ton-repertoire>
   ```

3. **Installation des dépendances**

   ```bash
   npm install
   ```

4. **Configuration de l’environnement**
   Renomme le fichier `.env.example` en `.env` et remplis :

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...

   VITE_EMAILJS_SERVICE_ID=...
   VITE_EMAILJS_TEMPLATE_ID=...
   VITE_EMAILJS_PUBLIC_KEY=...

   VITE_OPENAI_API_KEY=...
   ```

5. **Démarrer le serveur de développement :**

   ```bash
   npm run dev
   ```

---

## 📁 Structure du projet

```bash
.
├── src/
│   ├── components/        # Composants UI (EmailForm, AIEditor)
│   ├── redux/             # Store Redux et slices
│   ├── services/          # Services API (EmailJS, OpenAI, Firebase)
│   ├── App.jsx
│   └── main.jsx
├── .env.example           # Exemple de variables d’environnement
├── README.md
└── vite.config.js
```

---

## 🧠 Fonctionnalités principales

* `EmailForm.jsx` : formulaire d’envoi avec EmailJS
* `AIEditor.jsx` : génération automatique d’un email via IA
* `store.js` + `mailSlice.js` : stockage des champs email avec Redux
* `firebase.js` : configuration Firebase
* `openai.js` : appel à l’API GPT
* `emailjsService.js` : abstraction de l’envoi de mail
* `muiTheme.js` : configuration du thème Material UI *(optionnel)*

---

## ✅ Pré-requis pour que l’IA lance le projet

* Node.js ≥ 18
* Compte [EmailJS](https://emailjs.com)
* Compte [OpenAI](https://platform.openai.com)
* Projet [Firebase](https://console.firebase.google.com)

---

## 📌 Objectif de l’évaluation

Créer une app React capable de :

* Se connecter à Firebase
* Générer un email automatique avec IA
* Permettre à l’utilisateur de l’envoyer via EmailJS
* Sauvegarder l’historique des mails dans Firestore
* Offrir une **interface moderne avec Material UI**

---

## 🧠 Commandes utiles

```bash
npm run dev        # Lancer le serveur local
npm run build      # Générer une version de production
```

---

## ✨ Auteur

> Projet conçu pour une évaluation React avec intégration IA & Firebase.
> Par \[Emmanuel — AI Dev Assisté].
