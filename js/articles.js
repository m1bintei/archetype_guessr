// RECUP ID ARTICLE
const fileName = window.location.pathname.split("/").pop();
const match = fileName.match(/article_(\d+)\.html/);
const articleId = match ? match[1] : null;
if(articleId==null){ console.error("ID inconnu")};

// CALCUL DU TEMPS DE LECTURE

const debutLecture = Date.now();

window.addEventListener("pagehide", () => {
    const finLecture = Date.now();
    const tempsLecture = Math.floor((finLecture - debutLecture) / 1000);

    //VERIF ANTI-BROUILLAGE
    if(tempsLecture > 1){

        //RECUP DU TEMPS DE L'ARTICLE
        let viewedArticles = JSON.parse(localStorage.getItem('viewedArticles')) || [];
        let articleEntry = viewedArticles.find(a => a && a.id == articleId);

        if(articleEntry){ //AJOUT TEMPS SI OBJ DEJA EXISTANT
            articleEntry.tempsTotal = (articleEntry.tempsTotal || 0) + tempsLecture;
        } else { //CREE OBJET SI INEXISTANT
            viewedArticles.push({
                id: articleId,
                consultationNumber: 1,
                tempsTotal: tempsLecture,
                tempsSurvol: 0
            });
        }
        //SAUVEGARDE DU TEMPS
        localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
    }
});
