let viewedArticles = JSON.parse(localStorage.getItem('viewedArticles')) || [];
let tagCategories = {};
let articlesData = [];
let profile = {};

document.addEventListener("DOMContentLoaded", () => {

    Promise.all([
       fetch('articles.json').then(response => response.json()),
        fetch('data/tagCategories.json').then(res => res.json())
    ])
    .then(([articles, tags]) => {

        articlesData = articles;
        tagCategories = tags;

        initProfile();
        displayArticles(); // ici on affiche les articles de manière aléatoire

    })
    .catch(error => {
        console.error("Erreur chargement JSON :", error);
    });

});

function initProfile() {
    // Fonction qui permet de mettre a jour le profil utilisateur qui contient les articles cliqués
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
    // pour afficher les articles de manière aléatoire

    const mix = articlesData.sort(() => 0.5 - Math.random());
    const selected = mix.slice(0, 10);
    const container = document.getElementById("articles-container");

    container.innerHTML = "";

    selected.forEach(article => {
        const card = `
        <div class="card" onclick="track_redirect(${article.id})">
            <img src="${article.image}">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <span class="time">${article.readingTime} min</span>
            <a href="articles/article_${article.id}"> Lire l'article </a>
        </div>
        `;
        container.innerHTML += card;
    });
}



function track_redirect(articleId){

	// trouve l'objet avec .id (si existe)
	let existingEntry = viewedArticles.find(item => item.id === articleId);
	
	// incremente le nombre de consultation
	if (existingEntry) {
        existingEntry.consultationNumber += 1;
    } else { // sinon crée objet
        let articleData = {
            id: articleId,
            consultationNumber: 1,
        };
        viewedArticles.push(articleData);
    }

	// stockage des objets artiles vues
	localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
    
    updateProfile(articleId); // permet de mettre à jour le profil utilisateur
	
	// redirection
	window.location.href = `articles/article_${articleId}.html`;

}

function updateProfile(articleId) {
    // si un article est cliqué, on cherche l'article pour prendre les catégories dans lequel il se trouve. 

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

// Pour afficher le résultat
function goToResult() {
  window.location.href = "result.html";
}
