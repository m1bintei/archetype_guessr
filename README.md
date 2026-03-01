# archetype_guessr

## Contexte académique

Ce projet est réalisé dans le cadre du cours **8INF886 – Gestion de la cybersécurité et des données personnelles** (Université du Québec à Chicoutimi).  
Il a pour objectif de **rendre visibles des mécanismes habituellement invisibles** de collecte et de traitement des données personnelles.

**Thématique démontrée :**  
> *"Ce qui se passe quand je navigue sur un site classique : traçage invisible, profilage comportemental et exploitation des données."*

---

##  Problématique illustrée

Dans un site web ordinaire, des mécanismes discrets collectent des données sans que l'utilisateur en ait conscience :

- Combien de temps je lis un article ?
- Quelles publicités attirent mon regard ?
- Combien de fois je consulte un même sujet ?
- Peut-on déduire ma situation personnelle (célibataire, en couple, âge approximatif, centres d’intérêt) à partir de ces données ?

**Archetype Guessr** simule ces mécanismes et **les expose clairement** à l’utilisateur.

---

##  Fonctionnalités

### 1. Collecte de données
- **Temps de lecture des articles** (chronomètre déclenché au survol)
- **Survol des publicités** (détection de l’attention visuelle)
- **Nombre de consultations** par article
- **Tags thématiques** associés à chaque article

### 2. Traitement et profilage
- Pondération des données selon le temps d’attention
- Calcul automatique de **l’archétype dominant** de l’utilisateur
- Détection de la **situation personnelle** (couple / célibataire)

### 3. Visualisation
- Console de débogue avec logs horodatés
- Page **“Mon Profil”** affichant :
  - L’archétype détecté
  - Les statistiques de lecture
  - L’historique des survols publicitaires
  - La situation personnelle estimée

---

## Installation

### Prérequis
- Navigateur moderne (Chrome, Firefox, Edge)
- Python (pour le serveur local)

### Étapes
```bash
# 1. Cloner ou télécharger le projet
git clone https://github.com/votre-repo/archetype_guessr.git
cd archetype_guessr

# 2. Lancer un serveur local
python -m http.server 8000

# 3. Accéder à l'application
http://localhost:8000
