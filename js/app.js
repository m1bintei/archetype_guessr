let viewedArticles = JSON.parse(localStorage.getItem('viewedArticles')) || [];
let tagCategories = {};
let articlesData = [];
let profile = {};

// Variables pour le chrono
let tempsDebut = null;
let articleEnCours = null;
let tempsParArticle = JSON.parse(localStorage.getItem('tempsParArticle')) || {};

document.addEventListener("DOMContentLoaded", () => {

    Promise.all([
        // CORRECTION ICI : data/articles.json
        fetch('data/articles.json').then(response => {
            if (!response.ok) {
                throw new Error('articles.json non trouvé dans data/');
            }
            return response.json();
        }),
        fetch('data/tagCategories.json').then(res => {
            if (!res.ok) {
                throw new Error('tagCategories.json non trouvé dans data/');
            }
            return res.json();
        })
    ])
    .then(([articles, tags]) => {

        articlesData = articles;
        tagCategories = tags;

        initProfile();
        displayArticles();

    })
    .catch(error => {
        console.error("Erreur chargement JSON :", error);
        document.getElementById('articles-container').innerHTML = 
            '<div style="text-align:center; padding:50px; color:red;">❌ Erreur de chargement des articles<br>Vérifiez la console (F12)</div>';
    });

    // Sauvegarder le chrono si on quitte la page
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
    if (!articlesData || articlesData.length === 0) {
        console.error("Aucun article à afficher");
        return;
    }

    const mix = articlesData.sort(() => 0.5 - Math.random());
    const selected = mix.slice(0, 10);
    const container = document.getElementById("articles-container");

    container.innerHTML = "";

    selected.forEach(article => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.setAttribute('data-article-id', article.id);
        
        // Événements pour le chrono
        cardDiv.onmouseenter = function() {
            demarrerChrono(article.id);
        };
        
        cardDiv.onmouseleave = function() {
            if (articleEnCours === article.id) {
                arreterChrono();
            }
        };
        
        cardDiv.onclick = function() {
            track_redirect(article.id);
        };
        
        cardDiv.innerHTML = `
            <img src="${article.image || ''}">
            <h3>${article.title || 'Sans titre'}</h3>
            <p>${article.description || ''}</p>
            <span class="time">⏱️ ${article.readingTime || 5} min</span>
            <a href="articles/article_${article.id}.html"> Lire l'article </a>
        `;
        
        container.appendChild(cardDiv);
    });
    
    console.log("✅ Articles affichés :", selected.length);
}

function demarrerChrono(articleId) {
    if (articleEnCours && articleEnCours !== articleId) {
        arreterChrono();
    }
    
    articleEnCours = articleId;
    tempsDebut = Date.now();
    console.log("⏱️ Lecture début: article " + articleId);
}

function arreterChrono() {
    if (articleEnCours && tempsDebut) {
        const tempsFin = Date.now();
        const tempsPasse = Math.floor((tempsFin - tempsDebut) / 1000);
        
        if (!tempsParArticle[articleEnCours]) {
            tempsParArticle[articleEnCours] = {
                id: articleEnCours,
                tempsTotal: 0,
                dernierTemps: null
            };
        }
        
        tempsParArticle[articleEnCours].tempsTotal += tempsPasse;
        tempsParArticle[articleEnCours].dernierTemps = new Date().toISOString();
        
        localStorage.setItem('tempsParArticle', JSON.stringify(tempsParArticle));
        
        console.log(`⏱️ Lecture fin: article ${articleEnCours} - ${tempsPasse} secondes (total: ${tempsParArticle[articleEnCours].tempsTotal}s)`);
        
        articleEnCours = null;
        tempsDebut = null;
    }
}

function track_redirect(articleId) {
    if (articleEnCours === articleId) {
        arreterChrono();
    }
    
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
    
    updateProfile(articleId);
    
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
    if (articleEnCours) {
        arreterChrono();
    }
    window.location.href = "result.html";
}

// Helper pour la console
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
        console.log("✅ Stats réinitialisées");
    }
};
