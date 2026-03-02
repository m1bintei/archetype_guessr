/* viewedArticles architecture
 id: X,
 consultationNumber: X,
 tempsTotal: X,
 tempsSurvol: X
*/


const articleData = JSON.parse(localStorage.getItem("viewedArticles")) || {};
const pubData = JSON.parse(localStorage.getItem("viewedPub")) || {};

let profile = {};
let archetypesData = {};
let articlesDB = [];
let pubDB = [];

//RECUP JSON
document.addEventListener("DOMContentLoaded", () => {

    Promise.all([
    fetch('data/archetype.json').then(res => res.json()),
    fetch('data/articles.json').then(res => res.json()),
    fetch('data/publicite.json').then(res => res.json())
            ])
    .then(([archetypes, articles, pubs]) => {
        articlesDB = Array.isArray(articles) ? articles : articles.articles;
        pubDB = Array.isArray(pubs) ? pubs : pubs.publicites;
        archetypesData = archetypes.archetypes;

        profile = buildWeightedProfile();
        calculateArchetype();
    })
    .catch(err => {
        console.error("Erreur chargement archetypes :", err);
    });

});


function buildWeightedProfile() {

    let weightedProfile = {};

    //POUR ARTICLE
    articleData.forEach(article => {
        const original = articlesDB.find(a => a.id == article.id);
        if (!original) return;

        let weight = 0;
        const temps = article.tempsTotal || 0;
        const survol = article.tempsSurvol || 0;

        if (temps > 90) weight = 3;
        else if (temps > 20) weight = 1.5;

        original.tags.forEach(tag => {
            weightedProfile[tag] = (weightedProfile[tag] || 0) + weight;
        });

    });

    pubData.forEach(pub =>{
        const original = pubDB.find(p => p.id == pub.id);
        if (!original || !original.tags) return;

        // Calcul : Temps de survol (>0.5s) + Bonus si clic
        let survol;
        if(pub.tempsSurvol>0.5) survol = pub.tempsSurvol * 0.2;
        let weight = (survol) + (pub.clics * 1);

        original.tags.forEach(tag => {
            weightedProfile[tag] = (weightedProfile[tag] || 0) + weight;
        });
    });

    return weightedProfile;

}

//calcul de l'archetype
function calculateArchetype() {

    let totalClicks = articleData.length;
    if (totalClicks < 5) { // minimum 5 clicks sur article
        displayInsufficient(totalClicks);
        return;
    }

    let scores = [];

    for (let archetypeKey in archetypesData) {
        let archetype = archetypesData[archetypeKey];
        let score = 0;

        archetype.tags.forEach(tagCategory => {

            // on ignore couple et celibataire dans le classement
            if (tagCategory === "couple" || tagCategory === "celibataire") return;

            if (profile[tagCategory]) {
                score += profile[tagCategory];
            }

        });

        scores.push({
            key: archetypeKey,
            desc: archetype.desc,
            score: score
        });
    }

    // trier du plus grand au plus petit
    scores.sort((a, b) => b.score - a.score);

    // on garde les 3 premiers
    const top3 = scores.slice(0, 3);
    displayPersonalInfo()
    displayTop3(top3);

}

function displayPersonalInfo() {

    const personalDiv = document.getElementById("personal-info");
    let infos = [];

    const coupleScore = profile["couple"] || 0;
    const celibScore = profile["celibataire"] || 0;
    const enfantScore = profile["enfant"] || 0;
    const mariageScore = profile["mariage"] || 0;

    if (mariageScore > 3) {
        infos.push("Projet : Mariage / Engagement");
    } else if (Math.abs(coupleScore - celibScore) > 2) {
        infos.push(coupleScore > celibScore ? "Situation : En couple" : "Situation : Célibataire");
    }

    if (enfantScore > 2) {
        infos.push("Profil : Parent / Proche d'enfants");
    }

    if (infos.length > 0) {
        personalDiv.innerHTML = infos.map(info => `<span class="badge-info">${info}</span>`).join("");
    } else {
        personalDiv.innerHTML = "";
    }

    if (profile["couple"] > profile["celibataire"] + 3) {
        infos.push("En couple");
    } else if (profile["celibataire"] > profile["couple"] + 3) {
        infos.push("Célibataire");
    }
}


function displayInsufficient(totalClicks) {

    const nameEl = document.getElementById("archetype-name");
    const descEl = document.getElementById("archetype-desc");

    nameEl.innerText = "Profil en cours de construction";
    descEl.innerText = `Vous avez consulté ${totalClicks} article(s). Consultez au moins 5 articles pour révéler votre archétype.`;
}


//on affiche
function displayTop3(top3) {

    const nameEl = document.getElementById("archetype-name");
    const descEl = document.getElementById("archetype-desc");

    if (!top3 || top3.length < 3) {
        nameEl.innerText = "Profil insuffisant";
        descEl.innerText = "Consultez plus d'articles pour obtenir un résultat.";
        return;
    }

    // Nettoyage des noms (remplacer _ par espace + capitaliser)
    function formatName(name) {
        return name
        .replace(/_/g, " ")
        .replace(/\b\w/g, l => l.toUpperCase());
    }

    const top1name = formatName(top3[0].key);
    const top2name = formatName(top3[1].key);
    const top3name = formatName(top3[2].key);

    nameEl.innerText = `Vous êtes ${top1name}, ${top2name} et ${top3name}.`;

    descEl.innerHTML = `
    <p>Tout d'abord, ${top3[0].desc}</p>
    <p>De plus, ${top3[1].desc}</p>
    <p>On dit aussi de vous que ${top3[2].desc}</p>
    `;
}



function goHome() {
    window.location.href = "index.html";
}

function clearData(){
    localStorage.clear();
    window.location.reload();
}

// DEBUG
window.voirPoids = function() {
    console.log("%c📊 ANALYSE DES POIDS PAR TAGS", "color: #6a5acd; font-size: 15px; font-weight: bold;");

    if (Object.keys(profile).length === 0) {
        console.warn("Profil vide. Attendez le chargement ou consultez des articles.");
        return;
    }

    // On transforme l'objet en tableau pour le trier
    const trie = Object.entries(profile)
    .map(([tag, score]) => [tag, isNaN(score) ? 0 : score])
    .sort(([,a], [,b]) => b - a) // Du plus grand au plus petit
    .map(([tag, score]) => ({
        "Tag / Catégorie": tag,
        "Points accumulés": score.toFixed(2) + " pts"
    }));

    console.table(trie);
};
