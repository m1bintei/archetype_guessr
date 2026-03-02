// ===============================
// VARIABLES GLOBALES
// ===============================

let viewedArticles = JSON.parse(localStorage.getItem('viewedArticles')) || [];
let tagCategories = {};
let articlesData = [];

let viewedPub = JSON.parse(localStorage.getItem('viewedPub')) || [];
let profile = {};
let pubData = [];

// CHRONO
let tempsDebut = null;
let articleEnCours = null;
let tempsParArticle = JSON.parse(localStorage.getItem('tempsParArticle')) || {};

// PUB
let adEnCours = null;
let tempsDebutAd = null;


// ===============================
// INITIALISATION
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    Promise.all([
        fetch('data/articles.json').then(res => res.json()),
        fetch('data/tagCategories.json').then(res => res.json()),
        fetch('data/publicite.json').then(res =>res.json())
    ])
    .then(([articles, tags, publicite]) => {
        articlesData = articles;
        tagCategories = tags;
        pubData = publicite;
        initProfile();
        displayArticles();
        displayAd();
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
            <a href="data/articles/article_${article.id}.html">Lire l'article</a>
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

    if(tempsPasse > 0.5){
        //RECUP DU TEMPS DE SURVOL DE L'ARTICLE
        let articleEntry = viewedArticles.find(a => a && a.id == articleEnCours);

        if(articleEntry){ //AJOUT TEMPS SI OBJ DEJA EXISTANT
            articleEntry.tempsSurvol = (articleEntry.tempsSurvol || 0) + tempsPasse;
        } else { //CREE OBJET SI INEXISTANT
            articleEntry = {
                id: articleEnCours,
                consultationNumber: 0,
                tempsTotal: 0,
                tempsSurvol: tempsPasse
            };
            viewedArticles.push(articleEntry);
        }
        //SAUVEGARDE DU TEMPS
        localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));

        console.log(
            `⏱️ Article ${articleEnCours} : +${tempsPasse}s (total ${articleEntry.tempsSurvol}s)`
        );

        articleEnCours = null;
        tempsDebut = null;
    }
}

// ===============================
// REDIRECTION & TRACKING
// ===============================


function track_redirect(articleId) {
    if (articleEnCours === articleId) {
        arreterChrono();
    }
    let entry = viewedArticles.find(a => a && a.id == articleId);
    if (entry) {
        entry.consultationNumber++;
    } else {
        viewedArticles.push({
            id: articleId,
            consultationNumber: 1,
            tempsTotal: 0,
            tempsSurvol: 0
        });
    }

    localStorage.setItem(
        'viewedArticles',
        JSON.stringify(viewedArticles)
    );

    updateProfile(articleId);

    window.location.href = `data/articles/article_${articleId}.html`;
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

// Fausses pub

function displayAd() {
	// RANDOMIZER
    const mix = [...pubData].sort(() => 0.5 - Math.random());
    const selected = mix.slice(0, 20);
    // SEPARATION
    const leftSelection = selected.slice(0,10);
    const rightSelection = selected.slice(10,20)

    const leftContainer = document.getElementById("ad-left-sidebar");
    const rightContainer = document.getElementById("ad-right-sidebar");

    // AFFICHAGE GAUCHE
    if(leftContainer) {
        leftContainer.innerHTML = "";

        leftSelection.forEach(publicite => {

            const cardDiv = document.createElement('div');

            cardDiv.addEventListener("mouseenter", () => {
                startChronoAd(publicite.id, publicite.tags);
            });

            cardDiv.addEventListener("mouseleave", () => {
                stopChronoAd();
            });

            cardDiv.addEventListener("click", () => {
                trackAdClick(publicite.id);
            });

            cardDiv.className = 'card';
            cardDiv.dataset.pubId = publicite.id;

            cardDiv.innerHTML = `
            <img src="${publicite.img}">
            <h3>${publicite.title}</h3>
            `;

            leftContainer.appendChild(cardDiv);
        });
    }

    // AFFICHAGE DROIT
    if(rightContainer){
        rightContainer.innerHTML = "";

        rightSelection.forEach(publicite => {

            const cardDiv = document.createElement('div');

            cardDiv.addEventListener("mouseenter", () => {
                startChronoAd(publicite.id, publicite.tags);
            });

            cardDiv.addEventListener("mouseleave", () => {
                stopChronoAd();
            });

            cardDiv.addEventListener("click", () => {
                trackAdClick(publicite.id);
            });

            cardDiv.className = 'card';
            cardDiv.dataset.pubId = publicite.id;

            cardDiv.innerHTML = `
            <img src="${publicite.img}">
            <h3>${publicite.title}</h3>
            `;

            rightContainer.appendChild(cardDiv);
        });
    }
}

function startChronoAd(adId, tags) {
    if (adEnCours && adEnCours.id === adId) return;
    if (adEnCours) stopChronoAd();

    adEnCours = { id: adId, tags: tags };
    tempsDebutAd = Date.now();
}

function stopChronoAd(){ //A FINIR
    if (!adEnCours || !tempsDebutAd) return;

    const tempsPasse = Math.floor((Date.now() - tempsDebutAd) / 1000); // en secondes

    if (tempsPasse > 0.5) {
        let adEntry = viewedPub.find(p => p && p.id == adEnCours.id);
        if (adEntry) {
            adEntry.tempsSurvol = (adEntry.tempsSurvol || 0) + tempsPasse;
        } else {
            // 2. On assigne l'objet à pubEntry ET on le push
            adEntry = {
                id: adEnCours.id,
                clic: 0,
                tempsSurvol: tempsPasse
            };
            viewedPub.push(adEntry);
        }
        localStorage.setItem('viewedPub', JSON.stringify(viewedPub));
        localStorage.setItem("profile", JSON.stringify(profile));
    }

    adEnCours = null;
    tempsDebutAd = null;
}

function trackAdClick(adId){
    console.log(`Pub ${adId} cliqué`);
    let adEntry = viewedPub.find(p => p && p.id == adEnCours.id);
    if (adEntry) {
        adEntry.clics = (adEntry.clics || 0) + 1;
    } else {
        adEntry = {
            id: adId,
            clics: 1,
            tempsSurvol: 0
        };
        viewedPub.push(adEntry);
    }

    localStorage.setItem('viewedPub', JSON.stringify(viewedPub));
}



// ===============================
// DEBUG
// ===============================

window.stats = {
    voirConsultations() {
        console.table(viewedArticles);
    },
    voirPub(){
        console.table(viewedPub)
    },
    reset() {
        localStorage.clear();
        tempsParArticle = {};
        viewedArticles = [];
        viewedPub = []
        profile = {};
        console.log("🧹 Données réinitialisées");
    }
};
