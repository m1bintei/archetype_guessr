// Variables existantes (je les garde)
let viewedArticles = JSON.parse(localStorage.getItem('viewedArticles')) || [];
let tagCategories = {};
let articlesData = [];
let profile = {};

// NOUVELLES VARIABLES POUR LE CHRONO
let tempsDebut = 0;
let articleEnCours = null;
let tempsParArticle = JSON.parse(localStorage.getItem('tempsParArticle')) || {};

document.addEventListener("DOMContentLoaded", () => {

    Promise.all([
        fetch('data/articles.json').then(response => response.json()),
        fetch('data/tagCategories.json').then(res => res.json())
    ])
    .then(([articles, tags]) => {

        articlesData = articles;
        tagCategories = tags;

        initProfile();
        displayArticles();

    })
    .catch(error => {
        console.error("Erreur chargement JSON :", error);
    });

    // NOUVEAU : Sauvegarder le temps si on quitte la page
    window.addEventListener('beforeunload', () => {
        if (articleEnCours) {
            arreterChrono();
        }
    });

});

function initProfile() {
    const saved = localStorage.getItem("profile");

    if (saved) {
        profile = JSON.parse(saved);
    } else {
        profile = {};
        Object.values(tagCategories).forEach(category => {
            profile[category] = 0;
        });
        localStorage.setItem("profile", JSON.stringify(profile));
    }
}

function displayArticles() {
    const mix = articlesData.sort(() => 0.5 - Math.random());
    const selected = mix.slice(0, 10);
    const container = document.getElementById("articles-container");

    container.innerHTML = "";

    selected.forEach(article => {
        // MODIFICATION : J'ajoute des événements pour le chrono
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.setAttribute('data-article-id', article.id);
        
        // Quand on clique sur l'article
        cardDiv.onclick = function() {
            track_redirect(article.id);
        };
        
        // NOUVEAU : Quand la souris entre dans l'article
        cardDiv.onmouseenter = function() {
            demarrerChrono(article.id);
        };
        
        // NOUVEAU : Quand la souris quitte l'article
        cardDiv.onmouseleave = function() {
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
}

// NOUVELLE FONCTION : Démarrer le chrono
function demarrerChrono(articleId) {
    // Si on lisait déjà un autre article, on arrête son chrono
    if (articleEnCours && articleEnCours !== articleId) {
        arreterChrono();
    }
    
    // Démarrer le chrono pour ce nouvel article
    articleEnCours = articleId;
    tempsDebut = Date.now();
    console.log("⏱️ Lecture début: article " + articleId);
}

// NOUVELLE FONCTION : Arrêter le chrono et sauvegarder
function arreterChrono() {
    if (articleEnCours && tempsDebut) {
        const tempsFin = Date.now();
        const tempsPasse = Math.floor((tempsFin - tempsDebut) / 1000); // en secondes
        
        // Initialiser l'article dans tempsParArticle si pas encore fait
        if (!tempsParArticle[articleEnCours]) {
            tempsParArticle[articleEnCours] = {
                id: articleEnCours,
                tempsTotal: 0,
                dernierTemps: null
            };
        }
        
        // Ajouter le temps
        tempsParArticle[articleEnCours].tempsTotal += tempsPasse;
        tempsParArticle[articleEnCours].dernierTemps = new Date().toISOString();
        
        // Sauvegarder
        localStorage.setItem('tempsParArticle', JSON.stringify(tempsParArticle));
        
        console.log(`⏱️ Lecture fin: article ${articleEnCours} - ${tempsPasse} secondes (total: ${tempsParArticle[articleEnCours].tempsTotal}s)`);
        
        // Remettre à zéro
        articleEnCours = null;
        tempsDebut = null;
    }
}

// MODIFICATION de la fonction existante
function track_redirect(articleId) {
    // D'abord, on arrête le chrono si on lisait cet article
    if (articleEnCours === articleId) {
        arreterChrono();
    }
    
    // Incrémente le nombre de consultation (code existant)
    let existingEntry = viewedArticles.find(item => item.id === articleId);
    
    if (existingEntry) {
        existingEntry.consultationNumber += 1;
    } else {
        let articleData = {
            id: articleId,
            consultationNumber: 1,
        };
        viewedArticles.push(articleData);
    }

    localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
    
    // Ajouter le temps total à l'objet viewedArticles
    if (tempsParArticle[articleId]) {
        console.log(`⏱️ Temps total sur cet article avant redirection: ${tempsParArticle[articleId].tempsTotal} secondes`);
    }
    
    updateProfile(articleId);
    
    // Redirection
    window.location.href = `articles/article_${articleId}.html`;
}

function updateProfile(articleId) {
    const article = articlesData.find(a => a.id === articleId);

    if (!article || !article.tags) return;

    article.tags.forEach(tag => {
        const category = tagCategories[tag];
        if (category && profile.hasOwnProperty(category)) {
            profile[category] += 1;
        }
    });

    localStorage.setItem("profile", JSON.stringify(profile));
}

function goToResult() {
    // NOUVEAU : Avant d'aller au résultat, on arrête tout chrono en cours
    if (articleEnCours) {
        arreterChrono();
    }
    window.location.href = "result.html";
}

// POUR VOIR LES STATISTIQUES (tapez dans la console du navigateur)
window.stats = {
    voirTemps: function() {
        console.log("Temps par article:", tempsParArticle);
    },
    voirConsultations: function() {
        console.log("Consultations:", viewedArticles);
    },
    reset: function() {
        localStorage.removeItem('tempsParArticle');
        localStorage.removeItem('viewedArticles');
        localStorage.removeItem('profile');
        console.log("Toutes les stats ont été réinitialisées");
    }
};
