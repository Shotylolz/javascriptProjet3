window.onload = function () {
    let user = {};

    let formConnexionElement = document.getElementsByClassName("formConnexion")[0];
    let inputEmail = document.getElementById("emailInput");
    let inputPassword = document.getElementById("passwordInput");
    let errorMessageText=  document.getElementsByClassName("errorMessageText")[0];

    let timeDataSaveCookies = new Date(Date.now() + 17000000000);

    formConnexionElement.addEventListener("submit", (e) => {
        e.preventDefault();
        user.email = inputEmail.value;
        user.password = inputPassword.value;

        let responseTwo = fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body : JSON.stringify(user)
    })
        .then(function (responseUserFetch) {
            if(!responseUserFetch.ok) {
                errorMessageText.textContent = "Adresse email ou mot de passe incorect";
                throw new Error(`erreur HTTP! Statut: ${responseUserFetch.status}`);
                
            }
            responseUserFetch.json().then((data) => {
                document.cookie = `tokenSave=${data.token}; expires=${timeDataSaveCookies}`;
                document.cookie = `userId=${data.userId}; expires=${timeDataSaveCookies}`;
                window.location = "http://localhost/code/openclassroomProjetOne/Portfolio-architecte-sophie-bluel-master/FrontEnd/index.html";
            })
        })
    })


        
}