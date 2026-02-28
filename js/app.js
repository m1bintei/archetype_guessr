// Variables existantes (je les garde)
let viewedArticles = JSON.parse(localStorage.getItem('viewedArticles')) || [];
let tagCategories = {};
let articlesData = [];
let profile = {};

// NOUVELLES VARIABLES POUR LE CHRONO
let tempsDebut = 0;
let articleEnCours = null;
let tempsParArticle = JSON.parse(localStorage.getItem('tempsParArticle')) || {};

// Données de secours si les fichiers ne chargent pas
const FALLBACK_ARTICLES = [
    {
        "id": 1,
        "title": "Les bienfaits de la méditation",
        "description": "Découvrez comment la méditation peut améliorer votre quotidien",
        "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600",
        "readingTime": 5,
        "tags": ["meditation"]
    },
    {
        "id": 2,
        "title": "Investir en bourse pour les débutants",
        "description": "Les bases pour commencer à investir sans risque",
        "image": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600",
        "readingTime": 8,
        "tags": ["finance"]
    },
    {
        "id": 3,
        "title": "La productivité sans stress",
        "description": "Méthodes simples pour être plus efficace",
        "image": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600",
        "readingTime": 6,
        "tags": ["productivite"]
    },
    {
        "id": 4,
        "title": "Lire 52 livres par an",
        "description": "La méthode neuroscientifique pour transformer votre vie",
        "image": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600",
        "readingTime": 18,
        "tags": ["lecture", "developpement"]
    },
    {
        "id": 5,
        "title": "La semaine de 4 jours",
        "description": "Pourquoi votre productivité va exploser",
        "image": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600",
        "readingTime": 12,
        "tags": ["travail", "productivite"]
    }
];

const FALLBACK_TAGS = {
    "meditation": "bien-etre",
    "finance": "finance",
    "productivite": "productivite",
    "lecture": "culture",
    "developpement": "developpement_personnel",
    "travail": "productivite"
};

console.log("🚀 DÉMARRAGE DE L'APPLICATION");
console.log("📂 Données chargées du localStorage:", { 
    viewedArticles, 
    tempsParArticle 
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM chargé");
    
    // MODIFICATION: Commenté pour ne pas effacer les données
    // localStorage.clear();

    // Fonction pour charger avec en-têtes explicites
    function chargerJSON(url) {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log(`📥 ${url} status:`, response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        });
    }

    Promise.all([
        chargerJSON('data/articles.json').catch(err => {
            console.warn("⚠️ articles.json non chargé, utilisation des données de secours");
            return FALLBACK_ARTICLES;
        }),
        chargerJSON('data/tagCategories.json').catch(err => {
            console.warn("⚠️ tagCategories.json non chargé, utilisation des données de secours");
            return FALLBACK_TAGS;
        })
    ])
    .then(([articles, tags]) => {
        console.log("✅ JSON chargés avec succès!");
        console.log("📚 Articles:", articles.length);
        console.log("🏷️ Tags:", Object.keys(tags).length);
        
        articlesData = articles;
        tagCategories = tags;

        initProfile();
        displayArticles();

    })
    .catch(error => {
        console.error("❌ Erreur chargement JSON :", error);
        // Dernier recours
        articlesData = FALLBACK_ARTICLES;
        tagCategories = FALLBACK_TAGS;
        initProfile();
        displayArticles();
    });

    // Sauvegarder le temps si on quitte la page
    window.addEventListener('beforeunload', () => {
        console.log("🚪 Page quittée - vérification du chrono");
        if (articleEnCours) {
            console.log("⏱️ Chrono en cours à la fermeture, arrêt automatique");
            arreterChrono();
        }
    });

    // Sauvegarde périodique pour les longues lectures
    setInterval(() => {
        if (articleEnCours && tempsDebut) {
            const tempsActuel = Math.floor((Date.now() - tempsDebut) / 1000);
            console.log(`⏱️ [INTERVAL] Lecture en cours: article ${articleEnCours} - ${tempsActuel} secondes`);
        }
    }, 5000); // Toutes les 5 secondes

});

function initProfile() {
    console.log("👤 Initialisation du profil");
    const saved = localStorage.getItem("profile");

    if (saved) {
        profile = JSON.parse(saved);
        console.log("👤 Profil chargé:", profile);
    } else {
        console.log("👤 Création nouveau profil");
        profile = {};
        Object.values(tagCategories).forEach(category => {
            profile[category] = 0;
        });
        localStorage.setItem("profile", JSON.stringify(profile));
        console.log("👤 Nouveau profil créé:", profile);
    }
}

function displayArticles() {
    console.log("🖼️ Affichage des articles");
    const mix = articlesData.sort(() => 0.5 - Math.random());
    const selected = mix.slice(0, 10);
    const container = document.getElementById("articles-container");

    if (!container) {
        console.error("❌ Conteneur d'articles non trouvé!");
        return;
    }

    container.innerHTML = "";
    console.log(`📋 Affichage de ${selected.length} articles`);

    selected.forEach((article, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.setAttribute('data-article-id', article.id);
        
        // Quand on clique sur l'article
        cardDiv.onclick = function() {
            console.log(`🖱️ Clic sur article ${article.id}`);
            track_redirect(article.id);
        };
        
        // Quand la souris entre dans l'article
        cardDiv.onmouseenter = function() {
            console.log(`🖱️ Souris ENTRE sur article ${article.id}`);
            demarrerChrono(article.id);
        };
        
        // Quand la souris quitte l'article
        cardDiv.onmouseleave = function() {
            console.log(`🖱️ Souris QUITTE article ${article.id}`);
            if (articleEnCours === article.id) {
                arreterChrono();
            }
        };
        
        cardDiv.innerHTML = `
            <img src="${article.image}">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <span class="time">${article.readingTime} min</span>
            <a href="articles/article_${article.id}.html"> Lire l'article </a>
        `;
        
        container.appendChild(cardDiv);
    });
    console.log("✅ Affichage terminé");
}

// Fonction : Démarrer le chrono
function demarrerChrono(articleId) {
    console.log(`⏱️ [DEMARRAGE] Tentative pour article ${articleId}`);
    
    // Si on lisait déjà un autre article, on arrête son chrono
    if (articleEnCours && articleEnCours !== articleId) {
        console.log(`⏱️ Changement d'article: arrêt de ${articleEnCours}`);
        arreterChrono();
    }
    
    // Démarrer le chrono pour ce nouvel article
    articleEnCours = articleId;
    tempsDebut = Date.now();
    console.log(`✅⏱️ Lecture DÉBUT: article ${articleId} à ${new Date(tempsDebut).toLocaleTimeString()}`);
}

// Fonction : Arrêter le chrono et sauvegarder
function arreterChrono() {
    console.log(`⏱️ [ARRET] Tentative d'arrêt - articleEnCours=${articleEnCours}`);
    
    if (articleEnCours && tempsDebut) {
        const tempsFin = Date.now();
        const tempsPasse = Math.floor((tempsFin - tempsDebut) / 1000); // en secondes
        
        console.log(`⏱️ Calcul temps: durée=${tempsPasse}s`);
        
        // Initialiser l'article dans tempsParArticle si pas encore fait
        if (!tempsParArticle[articleEnCours]) {
            console.log(`📝 Première lecture pour article ${articleEnCours}`);
            tempsParArticle[articleEnCours] = {
                id: articleEnCours,
                tempsTotal: 0,
                dernierTemps: null
            };
        }
        
        // Ajouter le temps
        const ancienTotal = tempsParArticle[articleEnCours].tempsTotal;
        tempsParArticle[articleEnCours].tempsTotal += tempsPasse;
        tempsParArticle[articleEnCours].dernierTemps = new Date().toISOString();
        
        console.log(`📊 Mise à jour temps: ${ancienTotal} -> ${tempsParArticle[articleEnCours].tempsTotal}s (ajout de ${tempsPasse}s)`);
        
        // Sauvegarder
        localStorage.setItem('tempsParArticle', JSON.stringify(tempsParArticle));
        console.log(`💾 Données sauvegardées`);
        
        console.log(`✅⏱️ Lecture FIN: article ${articleEnCours} - ${tempsPasse}s (total: ${tempsParArticle[articleEnCours].tempsTotal}s)`);
        
        // Remettre à zéro
        articleEnCours = null;
        tempsDebut = 0;
    } else {
        console.log(`⚠️ arreterChrono appelé mais pas de lecture en cours`);
    }
}

// Fonction de redirection
function track_redirect(articleId) {
    console.log(`🔄 Redirection vers article ${articleId}`);
    
    // D'abord, on arrête le chrono si on lisait cet article
    if (articleEnCours === articleId) {
        console.log(`⏱️ Arrêt du chrono avant redirection`);
        arreterChrono();
    }
    
    // Incrémente le nombre de consultation
    let existingEntry = viewedArticles.find(item => item.id === articleId);
    
    if (existingEntry) {
        existingEntry.consultationNumber += 1;
        console.log(`👀 Consultation #${existingEntry.consultationNumber} pour article ${articleId}`);
    } else {
        let articleData = {
            id: articleId,
            consultationNumber: 1,
        };
        viewedArticles.push(articleData);
        console.log(`👀 Première consultation pour article ${articleId}`);
    }

    localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
    
    // Afficher le temps total
    if (tempsParArticle[articleId]) {
        console.log(`⏱️ Temps total sur cet article: ${tempsParArticle[articleId].tempsTotal} secondes`);
    }
    
    updateProfile(articleId);
    
    // Redirection
    window.location.href = `articles/article_${articleId}.html`;
}

function updateProfile(articleId) {
    console.log(`👤 Mise à jour du profil pour article ${articleId}`);
    const article = articlesData.find(a => a.id === articleId);

    if (!article || !article.tags) {
        console.log(`⚠️ Article ${articleId} sans tags`);
        return;
    }

    console.log(`🏷️ Tags:`, article.tags);

    article.tags.forEach(tag => {
        const category = tagCategories[tag];
        if (category && profile.hasOwnProperty(category)) {
            profile[category] += 1;
            console.log(`  +1 pour ${category} (${profile[category]})`);
        }
    });

    localStorage.setItem("profile", JSON.stringify(profile));
}

function goToResult() {
    console.log(`📊 Accès à la page résultat`);
    if (articleEnCours) {
        console.log(`⏱️ Arrêt du chrono avant résultat`);
        arreterChrono();
    }
    window.location.href = "result.html";
}

// Helper pour voir les statistiques
window.stats = {
    voirTemps: function() {
        console.log("📊 TEMPS PAR ARTICLE:");
        console.table(tempsParArticle);
        return tempsParArticle;
    },
    voirConsultations: function() {
        console.log("👀 CONSULTATIONS:");
        console.table(viewedArticles);
        return viewedArticles;
    },
    voirProfil: function() {
        console.log("👤 PROFIL:");
        console.table(profile);
        return profile;
    },
    voirTout: function() {
        console.log("=".repeat(50));
        this.voirTemps();
        console.log("-".repeat(30));
        this.voirConsultations();
        console.log("-".repeat(30));
        this.voirProfil();
        console.log("=".repeat(50));
    },
    reset: function() {
        if(confirm("Réinitialiser toutes les données ?")) {
            localStorage.removeItem('tempsParArticle');
            localStorage.removeItem('viewedArticles');
            localStorage.removeItem('profile');
            tempsParArticle = {};
            viewedArticles = [];
            profile = {};
            console.log("🗑️ Toutes les stats ont été réinitialisées");
        }
    }
};

console.log("🎯 Helper 'stats' disponible - tapez stats.voirTout() pour voir les données");
