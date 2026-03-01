// ===============================
// VARIABLES GLOBALES
// ===============================

let viewedArticles = JSON.parse(localStorage.getItem('viewedArticles')) || [];
let tagCategories = {};
let articlesData = [];
let profile = {};

// CHRONO
let tempsDebut = null;
let articleEnCours = null;
let tempsParArticle = JSON.parse(localStorage.getItem('tempsParArticle')) || {};

// ===============================
// INITIALISATION
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    Promise.all([
        fetch('data/articles.json').then(res => res.json()),
        fetch('data/tagCategories.json').then(res => res.json())
    ])
    .then(([articles, tags]) => {
        articlesData = articles;
        tagCategories = tags;
        initProfile();
        displayArticles();
    })
    .catch(err => console.error("Erreur chargement JSON :", err));
});

// Affichage de nouveau articles lorsque l'on revient sur la page principal'
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        displayArticles();
    }
});

// ===============================
// SORTIES / PERTE DE FOCUS (INDISPENSABLE)
// ===============================

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && articleEnCours) {
        arreterChrono();
    }
});

window.addEventListener("pagehide", () => {
    if (articleEnCours) {
        arreterChrono();
    }
});

// ⛔️ CLIC PARTOUT AILLEURS QUE LA CARTE
document.addEventListener("click", (e) => {
    if (!articleEnCours) return;

    const card = document.querySelector(
        `[data-article-id="${articleEnCours}"]`
    );

    if (card && !card.contains(e.target)) {
        arreterChrono();
    }
});

// ===============================
// PROFIL UTILISATEUR
// ===============================

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

// ===============================
// AFFICHAGE DES ARTICLES
// ===============================

function displayArticles() {
    const mix = [...articlesData].sort(() => 0.5 - Math.random());
    const selected = mix.slice(0, 10);
    const container = document.getElementById("articles-container");

    container.innerHTML = "";

    selected.forEach(article => {

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.articleId = article.id;

        // 🟢 mouseenter = START
        cardDiv.addEventListener("mouseenter", () => {
            demarrerChrono(article.id);
        });

        // 🔴 mouseleave = STOP
        cardDiv.addEventListener("mouseleave", () => {
            if (articleEnCours === article.id) {
                arreterChrono();
            }
        });

        // CLICK = arrêt + redirection
        cardDiv.addEventListener("click", () => {
            track_redirect(article.id);
        });

        cardDiv.innerHTML = `
            <img src="${article.image}">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <span class="time">${article.readingTime} min</span>
            <a href="articles/article_${article.id}.html">Lire l'article</a>
        `;

        container.appendChild(cardDiv);
    });
}

// ===============================
// CHRONO
// ===============================

function demarrerChrono(articleId) {
    if (articleEnCours === articleId) return;

    if (articleEnCours) {
        arreterChrono();
    }

    articleEnCours = articleId;
    tempsDebut = Date.now();
}

function arreterChrono() {
    if (!articleEnCours || !tempsDebut) return;

    const tempsPasse = Math.floor((Date.now() - tempsDebut) / 1000);

    if (!tempsParArticle[articleEnCours]) {
        tempsParArticle[articleEnCours] = {
            id: articleEnCours,
            tempsTotal: 0
        };
    }

    tempsParArticle[articleEnCours].tempsTotal += tempsPasse;

    localStorage.setItem(
        'tempsParArticle',
        JSON.stringify(tempsParArticle)
    );

    console.log(
        `⏱️ Article ${articleEnCours} : +${tempsPasse}s (total ${tempsParArticle[articleEnCours].tempsTotal}s)`
    );

    articleEnCours = null;
    tempsDebut = null;
}

// ===============================
// REDIRECTION & TRACKING
// ===============================

function track_redirect(articleId) {

    if (articleEnCours === articleId) {
        arreterChrono();
    }

    let entry = viewedArticles.find(a => a.id === articleId);

    if (entry) {
        entry.consultationNumber++;
    } else {
        viewedArticles.push({
            id: articleId,
            consultationNumber: 1
        });
    }

    localStorage.setItem(
        'viewedArticles',
        JSON.stringify(viewedArticles)
    );

    updateProfile(articleId);

    window.location.href = `articles/article_${articleId}.html`;
}

// ===============================
// TAGS → PROFIL
// ===============================

function updateProfile(articleId) {
    const article = articlesData.find(a => a.id === articleId);
    if (!article || !article.tags) return;

    article.tags.forEach(tag => {
        const category = tagCategories[tag];
        if (category && profile[category] !== undefined) {
            profile[category]++;
        }
    });

    localStorage.setItem(
        "profile",
        JSON.stringify(profile)
    );
}

// ===============================
// RESULT PAGE
// ===============================

function goToResult() {
    if (articleEnCours) {
        arreterChrono();
    }
    window.location.href = "result.html";
}

// ===============================
// DEBUG
// ===============================

window.stats = {
    voirTemps() {
        console.table(tempsParArticle);
    },
    voirConsultations() {
        console.table(viewedArticles);
    },
    reset() {
        localStorage.clear();
        tempsParArticle = {};
        viewedArticles = [];
        profile = {};
        console.log("🧹 Données réinitialisées");
    }
};
