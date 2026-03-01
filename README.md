# archetype_guessr

> **Rendre visible l'invisible** – Une démonstration pédagogique de collecte et profilage de données.
Réalisé par:

---

## Contexte académique

Ce projet est réalisé dans le cadre du cours **8INF886 – Gestion de la cybersécurité et des données personnelles** à l'**Université du Québec à Chicoutimi (UQAC)**.

**Objectif pédagogique :**  
Mettre en lumière les mécanismes de récolte et de traitement des données utilisateurs afin de cibler son "archétype".  
Notre site web, composé d'articles variés, collecte des interactions pour déduire :
- Centres d'intérêt
- Tranche d'âge approximative
- Genre
- Situation personnelle (couple/célibataire)

**Thématique démontrée :**  
> *"Ce qui se passe quand je navigue sur un site classique : traçage invisible, profilage comportemental et exploitation des données."*

---

## Problématique

Dans un site web ordinaire, des mécanismes discrets collectent des données sans que l'utilisateur en ait conscience :

| Question | Mécanisme associé |
|----------|-------------------|
| Combien de temps je lis un article ? | Chronomètre au survol |
| Quelles publicités attirent mon regard ? | Tracking de survol des bannières |
| Combien de fois je consulte un même sujet ? | Compteur de consultations |
| Peut-on déduire ma situation personnelle ? | Analyse des tags "couple" vs "célibataire" |

**Archetype Guessr** simule ces mécanismes et **les expose clairement** à l'utilisateur.

---

## Fonctionnalités

### Collecte de données
| Fonctionnalité | Déclencheur | Donnée collectée |
|----------------|-------------|------------------|
| Chronomètre article | Survol de la carte article | Temps de lecture (secondes) |
| Tracking publicité | Survol des bannières | Temps de survol + nombre |
| Compteur de clics | Clic sur "Lire l'article" | Nombre de consultations |
| Tags thématiques | Lecture d'article | Catégories d'intérêt |

### Traitement et profilage
- **Pondération** : Les lectures longues (> 3 min) comptent double
- **Seuils** : Les lectures courtes (< 40s) comptent moitié moins
- **Classification** : Calcul automatique de l'archétype dominant
- **Détection sociale** : Comparaison des tags "couple" vs "célibataire"

### Visualisation
- **Console développeur** : Logs horodatés de chaque interaction
- **Page "Mon Profil"** :
  - Archétype détecté (ex: "Vous êtes Le Sage")
  - Statistiques détaillées de lecture
  - Historique des survols publicitaires
  - Situation personnelle estimée

---

## Démonstration vidéo

**Lien vers la vidéo :** ................

*La vidéo montre :*
- Présentation du mécanisme
- Démonstration en direct (interface + console)
- Visualisation des données collectées
- Analyse des risques et implications
- Proposition d'atténuation

---

##  Installation

### Prérequis
- Navigateur moderne (Chrome, Firefox, Edge)
- Python 3 (pour le serveur local)

### Étapes d'installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-username/archetype_guessr.git

# 2. Se déplacer dans le dossier
cd archetype_guessr

# 3. Lancer le serveur local
python -m http.server 8000

# 4. Ouvrir dans le navigateur
http://localhost:8000

Réalisé par
Nom	Rôle
[Votre nom]	Tracking publicités + README
[Nom collègue 1]	Chrono articles + profil
[Nom collègue 2]	JSON + articles
[Nom collègue 3]	UI/Design
Encadré par : Samuel Desbiens (s6desbie@uqac.ca)
