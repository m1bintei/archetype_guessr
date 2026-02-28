// Variables existantes (je les garde)
let viewedArticles = JSON.parse(localStorage.getItem('viewedArticles')) || [];
let tagCategories = {};
let articlesData = [];
let profile = {};

// NOUVELLES VARIABLES POUR LE CHRONO
let tempsDebut = 0;
let articleEnCours = null;
let tempsParArticle = JSON.parse(localStorage.getItem('tempsParArticle')) || {};

console.log("🚀 DÉMARRAGE DE L'APPLICATION");
console.log("📂 Données chargées du localStorage:", { 
    viewedArticles, 
    tempsParArticle 
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM chargé");
    
    // MODIFICATION: Commenté pour ne pas effacer les données
    // localStorage.clear();

    Promise.all([
        fetch('data/articles.json').then(response => {
            console.log("📥 articles.json chargé");
            return response.json();
        }),
        fetch('data/tagCategories.json').then(res => {
            console.log("📥 tagCategories.json chargé");
            return res.json();
        })
    ])
    .then(([articles, tags]) => {
        console.log("✅ Fichiers JSON chargés avec succès");
        console.log("📚 Nombre d'articles:", articles.length);
        
        articlesData = articles;
        tagCategories = tags;

        initProfile();
        displayArticles();

    })
    .catch(error => {
        console.error("❌ Erreur chargement JSON :", error);
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
        } else {
            // Pour voir si l'intervalle tourne même sans lecture
            // console.log("⏱️ [INTERVAL] Aucune lecture en cours");
        }
    }, 5000); // Toutes les 5 secondes pour être plus réactif

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
            } else {
                console.log(`⚠️ Sortie mais pas de chrono pour cet article (en cours: ${articleEnCours})`);
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

// NOUVELLE FONCTION : Démarrer le chrono
function demarrerChrono(articleId) {
    console.log(`⏱️ [DEMARRAGE] Tentative pour article ${articleId}`);
    
    // Si on lisait déjà un autre article, on arrête son chrono
    if (articleEnCours && articleEnCours !== articleId) {
        console.log(`⏱️ Changement d'article: arrêt de ${articleEnCours} avant de démarrer ${articleId}`);
        arreterChrono();
    }
    
    // Démarrer le chrono pour ce nouvel article
    articleEnCours = articleId;
    tempsDebut = Date.now();
    console.log(`✅⏱️ Lecture DÉBUT: article ${articleId} à ${new Date(tempsDebut).toLocaleTimeString()}`);
}

// NOUVELLE FONCTION : Arrêter le chrono et sauvegarder
function arreterChrono() {
    console.log(`⏱️ [ARRET] Tentative d'arrêt - articleEnCours=${articleEnCours}, tempsDebut=${tempsDebut}`);
    
    if (articleEnCours && tempsDebut) {
        const tempsFin = Date.now();
        const tempsPasse = Math.floor((tempsFin - tempsDebut) / 1000); // en secondes
        
        console.log(`⏱️ Calcul temps: début=${new Date(tempsDebut).toLocaleTimeString()}, fin=${new Date(tempsFin).toLocaleTimeString()}, durée=${tempsPasse}s`);
        
        // Initialiser l'article dans tempsParArticle si pas encore fait
        if (!tempsParArticle[articleEnCours]) {
            console.log(`📝 Première lecture pour article ${articleEnCours}, création de l'entrée`);
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
        
        console.log(`📊 Mise à jour temps: ${ancienTotal} -> ${tempsParArticle[articleEnCours].tempsTotal} secondes (ajout de ${tempsPasse}s)`);
        
        // Sauvegarder
        localStorage.setItem('tempsParArticle', JSON.stringify(tempsParArticle));
        console.log(`💾 Données sauvegardées dans localStorage`);
        
        console.log(`✅⏱️ Lecture FIN: article ${articleEnCours} - ${tempsPasse} secondes (total: ${tempsParArticle[articleEnCours].tempsTotal}s)`);
        
        // Remettre à zéro
        articleEnCours = null;
        tempsDebut = 0;
        console.log(`🔄 Chrono réinitialisé`);
    } else {
        console.log(`⚠️ arreterChrono appelé mais pas de lecture en cours (articleEnCours=${articleEnCours}, tempsDebut=${tempsDebut})`);
    }
}

// MODIFICATION de la fonction existante
function track_redirect(articleId) {
    console.log(`🔄 Redirection vers article ${articleId}`);
    
    // D'abord, on arrête le chrono si on lisait cet article
    if (articleEnCours === articleId) {
        console.log(`⏱️ Arrêt du chrono avant redirection`);
        arreterChrono();
    }
    
    // Incrémente le nombre de consultation (code existant)
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
    
    // Ajouter le temps total à l'objet viewedArticles
    if (tempsParArticle[articleId]) {
        console.log(`⏱️ Temps total sur cet article avant redirection: ${tempsParArticle[articleId].tempsTotal} secondes`);
    }
    
    updateProfile(articleId);
    
    console.log(`➡️ Redirection vers articles/article_${articleId}.html`);
    
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

    console.log(`🏷️ Tags de l'article:`, article.tags);

    article.tags.forEach(tag => {
        const category = tagCategories[tag];
        if (category && profile.hasOwnProperty(category)) {
            profile[category] += 1;
            console.log(`  +1 pour catégorie ${category} (maintenant ${profile[category]})`);
        }
    });

    localStorage.setItem("profile", JSON.stringify(profile));
    console.log(`💾 Profil sauvegardé`);
}

function goToResult() {
    console.log(`📊 Accès à la page résultat`);
    // NOUVEAU : Avant d'aller au résultat, on arrête tout chrono en cours
    if (articleEnCours) {
        console.log(`⏱️ Arrêt du chrono avant résultat`);
        arreterChrono();
    }
    window.location.href = "result.html";
}

// POUR VOIR LES STATISTIQUES (tapez dans la console du navigateur)
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
