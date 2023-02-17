window.onload = function () {

    /**
     * Prochaine étape
     * Supprimer l'image du form lors du retour ou de la fermeture de la modale
     * remettre les valeurs à zéro
     * css input 
     * css button delete et figure
     * check ce qu'il manque
     * surement le css responsive de ce qui a été ajouté
     */

    /**
     * Vérification présence de cookies user id et tokenSave
     * Si les cookies sont présent, c'est que l'utilisateur est connecté, on les garde donc en stock pour les utiliser le cas échéant
     */

    function createObjectCookies () {
        let tablCookies = document.cookie.split(" ");
        let tablForEachCookies = [];
        let tablAllCookies = [];
        tablCookies.forEach((e) => {
            tablAllCookies.push(e.split("="));
        })
        for(let i = 0; i< tablAllCookies.length; i++){
            for(let j = 0; j < tablAllCookies[i].length; j++) {
                tablAllCookies[i][j] = tablAllCookies[i][j].replace(";", "");
            }
        }
        let cookiesObject = Object.fromEntries(tablAllCookies);
        return cookiesObject;
    }

    let cookiesObject = createObjectCookies();
    let userId = cookiesObject.userId;
    let token = cookiesObject.tokenSave;


    /*
    * Fonction createElementFigure
    * Creation des élements figure, figcaption, img
    * Utiliser les information provenant du fichier json pour le title et l'image
    * Pour plus tard, on ajoute en class les category id qui pourront nous permettre de trier les projet
    * Ajouter avec append l'image et figcaption dans l'element figure
    * Enfin, retourner l'element figure crée
    * */

    

    const createElementFigure = function (classHtml, imgUrl, imgAlt, dataId){
        let figureElement = document.createElement("figure");
        figureElement.setAttribute("data-id", dataId);
        let figCaptionElement = document.createElement("figcaption");
        let imgElement = document.createElement("img");
        classHtml.forEach( (e) => {
            figureElement.classList.add(e);
        });
        //Changer par dataset la class pour filtrer ensuite
        figCaptionElement.textContent = imgAlt;
        imgElement.src = imgUrl;
        imgElement.alt = imgAlt;
        imgElement.crossOrigin = "anonymous";
        figureElement.append(imgElement, figCaptionElement);
        return figureElement;
    }

    /**
     * Appel fetch pour récupérer les works
     * On crée ensuite pour chaque work une figure avec la fonction createElementFigure
     * On enregistre les figures dans un tableau pour ne pas avoir besoin de faire un nouvel appel fetch pour retrouver les works
     */

    let galleryElementDiv = document.getElementsByClassName("gallery")[0];
    var tableInformationContenerAllWork = [];
    var tableInformationContenerAllFigureWithWork = [];

    fetch(`http://localhost:5678/api/works`)
    .then(function(responseFetch) {
        if(!responseFetch.ok) {
            throw new Error(`erreur HTTP! Statut: ${responseFetch.status}`);
        }
        responseFetch.json().then((data) => {
            console.log(data);
            let dataLenght = data.length;
            for(let i = 0; i < dataLenght; i++) {
                let figureElement = createElementFigure([data[i].category.id, "mesProjetsFigure"], data[i].imageUrl, data[i].title, data[i].id);
                galleryElementDiv.appendChild(figureElement);
                tableInformationContenerAllWork.push(data[i]);
                tableInformationContenerAllFigureWithWork.push(figureElement);
            }
        });
    })


    /*
    * On regroupe tous les filtres dans un tableau
    * chaque filtre permettant de selectionner seulement les projets correspondant à la position dans le tableau équivalent à l'id du projet obtenue dans le fichier json
    * grâce à ce lien, nous pouvons décider d'afficher ou non, avec un addEventListener les projets correspondant au filtre cliqué
    */

    let allFilter = document.getElementsByClassName("filter");
    let allFilterLenght = allFilter.length;
    let allFigureElement = document.getElementsByClassName("mesProjetsFigure");
    for(let i = 0; i < allFilterLenght; i++){
        allFilter[i].addEventListener("click", (e) => {
            let filterSelected = document.getElementsByClassName("filterSelected")[0];
            filterSelected.classList.remove("filterSelected");
            allFilter[i].classList.add("filterSelected");
            for(let j = 0; j < allFigureElement.length; j++){
                if(i === 0) {
                    allFigureElement[j].style.display = "block";
                } else {
                    if(allFigureElement[j].classList.contains(i)) {
                        allFigureElement[j].style.display = "block";
                    } else {
                        allFigureElement[j].style.display = "none";
                    }
                }
            }
            
        })
    }


    /**
     * Partie modale ajout d'un projet
     * Lors du click sur "modifier" une fenetre crée en javascript s'ouvre. Elle affiche tous les projets et permet d'ajouter ou supprimer un projet
     * Si l'on décide d'ajouter, une fenetre comprenant un formulaire (image, title et catégorie) remplace celle contenant les projet
     */

    let buttonModifier = document.getElementsByClassName("buttonModifierProject")[0];
    let pageAllProject = document.getElementById("modalProject");
    let contenerAllFigureInModal = document.getElementsByClassName("contenerAllFigureModalProject")[0];
    const allButonOpenModal = document.querySelectorAll('[aria-haspopup="modalProject"]');

    /**
     * Fonction pour ajouter une figure element html dans la modale après l'ajout grâce au formulaire rempli par l'user
     * 
     */
    function addFigureInModal(dataWork){
        let figureElementNewWorkCreatedForModal = createElementFigure([dataWork.categoryId, "figureInModalProject"], dataWork.imageUrl, dataWork.title, dataWork.id);
        let divIndividualContenerFigureInModal = document.createElement("div");
        divIndividualContenerFigureInModal.classList.add("contenerIndivFigureInModal");
        divIndividualContenerFigureInModal.appendChild(figureElementNewWorkCreatedForModal);
        let buttonDeleteProject = document.createElement("div");
        buttonDeleteProject.classList.add("buttonDeleteProject");
        buttonDeleteProject.setAttribute("data-idworkdelete", dataWork.id);
        divIndividualContenerFigureInModal.appendChild(buttonDeleteProject);
        contenerAllFigureInModal.appendChild(divIndividualContenerFigureInModal);
    }

    var allButtonDeleteEachWork;
    let boiteOpenAlreadyOpenOneTime = false;
    /**
     * Fonction pour ouvrir la boite modale
     * Changement des attribut aria hidden et modal
     */
    const open = function (boiteModale) {
        boiteModale.setAttribute('aria-hidden', false);
        boiteModale.setAttribute('aria-modal', true);
        document.getElementsByTagName("main")[0].setAttribute('aria-hidden', true);
        /**
        * Si la boite modale n'a pas été ouverte une seule fois, On crée tous les élements html composant la boite modale
        * Dans le cas contraire, on ne fait que l'ouvrir car les elements htmls sont déjà existant
        */
        if(boiteOpenAlreadyOpenOneTime === false) {
            tableInformationContenerAllWork.forEach((e) => {
            addFigureInModal(e);
            allButtonDeleteEachWork = document.getElementsByClassName("buttonDeleteProject");
            })
            boiteOpenAlreadyOpenOneTime = true;
        }

        /**
         * Pour activer la suppression possible avec un click dans la boite modale, on créer une boucle for
         */
        for(let i = 0; i < allButtonDeleteEachWork.length; i++ ) {
            allButtonDeleteEachWork[i].addEventListener("click", (e) => {
                console.log(document.querySelector(`[data-id="${allButtonDeleteEachWork[i].dataset.idworkdelete}"]`));
                let idWorkToDelete = allButtonDeleteEachWork[i].getAttribute("data-idworkdelete");
                fetch(`http://localhost:5678/api/works/${idWorkToDelete}`, {
                    method : "Delete",
                    headers : {
                        "accept" : "*/*",
                        "Authorization": `Bearer ${token}`

                    }
                })
                .then(function(responseDeleteWork) {
                    if(!responseDeleteWork.ok){
                        throw new Error("attention"); //Essayer de comprendre pourquoi la response json n'est pas bonne
                    }
                    console.log(responseDeleteWork.status);
                })

            })
        }
        
    }
    /**
     * Lors du clique sur le bouton, on ouvre la modale
     */
    allButonOpenModal.forEach((e) => {
        const modalToDisplay = document.getElementById("modalProject");
        e.addEventListener("click", (e) => {
            e.preventDefault();
            open(modalToDisplay);
        })
        
    })

    /**
     * 
     * Fonction pour ferme la boite modale
     */
    const close = function (boiteModale) {
        boiteModale.setAttribute('aria-hidden', true);
        document.getElementsByTagName("main")[0].setAttribute('aria-hidden', false);

    }

    /**
     * Si clique sur le button, on ferme la modale
     */
    var allButonCloserModal = document.querySelectorAll('[data-dismiss="modalProject"]');
    allButonCloserModal.forEach( (e) => {
        const modalToClose = document.getElementById("modalProject");

        e.addEventListener('click', (e) => {
            e.preventDefault();
            close(modalToClose);
        })
    })


    /**
     * Si l'utilisateur clique le bouton addProject, on cache la section avec les figures de la modale et on affiche le form
     * Si l'utilisateur clique sur le boutton return une fois le form affiché, on fait l'inverse
     */
    let buttonAddProject = document.getElementsByClassName("addProject")[0];
    let buttonReturnPrincipalModalProject = document.getElementsByClassName("logoReturn")[0];
    let contenerPrincipalModalProject = document.getElementsByClassName("contenerPrincipalModal")[0];
    let contenerSecondModalProject = document.getElementsByClassName("contenerSecondPageAddProject")[0];

    buttonAddProject.addEventListener("click" , (e) => {
        contenerPrincipalModalProject.classList.add("hidden");
        contenerSecondModalProject.classList.remove("hidden");
    });
    buttonReturnPrincipalModalProject.addEventListener("click" , (e) => {
        contenerSecondModalProject.classList.add("hidden");
        contenerPrincipalModalProject.classList.remove("hidden");
        formAddNewProject.reset();
    });
    ;

    /**
     * Element inputFile contenant l'image ajouté par l'user
     * On crée un element html image qui nous permettra de récupérer l'image et de l'afficher si besoin
     */
    let inputImage = document.getElementById("inputImage");
    var imageAdd = document.createElement("img");
    imageAdd.style.height = "200px";
    imageAdd.style.width = "250px";
    let imageBlob = new Image();

    let blobUrl;

    /**
     * 
     * Function permettant de récupérer le fichier de l'input file contenant normalement l'image de l'utilisateur pour le projet
     * Nous permet de le convertir en base 64 pour avoir un src convenable et qui sera nécéssaire dans le fetch
     * Retravailler cette fonction pour bien la comprendre du début à la fin
     * On se sert de file access qui reprend la variable file pour être utiliser dans le formdata en post
     */

    let fileAccess;
    function convertBase64(file) {
        return new Promise((resolve, reject) => {
            const fileReaderTest = new FileReader();
            fileReaderTest.readAsDataURL(file);

            fileReaderTest.onload = () => {
                resolve(fileReaderTest.result);
            };

            fileReaderTest.onerror = (error) => {
                reject(error);
            };
        });
    }
    async function uploadImage(event) {
        const file = event.target.files[0];
        blobUrl = URL.createObjectURL(file);
        const base64 = await convertBase64(file);
        imageAdd.src = base64;
        imageBlob.src = base64;
        fileAccess = file;
    }
    
    /**
     * On applique la fonction lorsque l'user a ajouté son fichier dans l'input
     * On ajoute aussi l'image à la place de l'input comme affiché dans le figma
     */
    let contenerInputForAddUserImage = document.getElementsByClassName("contenerInput")[0];
    let labelImage = document.getElementsByClassName("labelImage")[0];
    labelImage.addEventListener("click", (e) => {
        inputImage.click();
    })

    inputImage.addEventListener("change", (e) => {
        let contenerModalProject = document.getElementsByClassName("contenerModalProject")[0];
        contenerModalProject.appendChild(imageAdd);
        uploadImage(e);
        contenerInputForAddUserImage.classList.add("hidden");
        let contenerForImageAddByuser = document.getElementsByClassName("contenerInputAndImageAdd")[0];
        contenerForImageAddByuser.appendChild(imageAdd);
    })


    let formAddNewProject = document.getElementsByClassName("formAddProject")[0];
    let inputImg = document.getElementById("inputImage");
    let inputTitle = document.getElementById("inputTitle");
    let inputCategoryProject = document.getElementById("categoryProject");

    
    formAddNewProject.addEventListener("submit" , (e) => {
        e.preventDefault();
        
        var formDataProp = new FormData();
        formDataProp.append("category", 1)
        formDataProp.append("image", fileAccess);
        formDataProp.append("title", formAddNewProject.title.value);
        /*
        console.log(typeof formDataProp.get("imageUrl"));
        for(var pair of formDataProp.entries()) {
            console.log(pair[0]+ ', '+ pair[1]);
         }
        */



        let responseAddProject = fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body : formDataProp,
        })
            .then(function (responseAddProjectFetch) {
                if(!responseAddProjectFetch.ok) {
                    /*
                    console.log(formDataProp)
                    for(var pair of formDataProp.entries()) {
                        console.log(pair[0]+ ', '+ pair[1]);
                     }
                    console.log(responseAddProjectFetch);
                    console.log(token);
                    */
                    throw new Error(`Erreur ${responseAddProjectFetch.status}, attention`);
                }
                responseAddProjectFetch.json().then((data) => {
                    console.log(data);
                    console.log(responseAddProjectFetch.status);
                    let figureElementNewWorkCreated = createElementFigure([data.categoryId, "mesProjetsFigure"], data.imageUrl, data.title, data.id);
                    addFigureInModal(data);
                    galleryElementDiv.appendChild(figureElementNewWorkCreated);
                })
            })
    })
    

    

}