// Ajout d'un écouteur d'événement sur la soumission du formulaire de connexion
document.getElementById("login-form").addEventListener("submit", async function loginForm(event) {
    try {
        event.preventDefault(); // Empêcher le comportement par défaut du formulaire

        // Récupération des valeurs des champs email et mot de passe // Requête qui permet d’envoyer les valeurs des entrées de mon formulaire
        const emailInputValue = document.getElementById("email-input").value;
        const passwordInputValue = document.getElementById("password-input").value;

        // Envoi de la requête de connexion au serveur
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Spécification du type de contenu JSON
            },
            body: JSON.stringify({ // Conversion des données en JSON
                email: emailInputValue,
                password: passwordInputValue,
            }),
        });

        // Traitement de la réponse en fonction du statut HTTP
        if (response.status === 200) { // Si la connexion est réussie (statut 200)
            const loginData = await response.json(); 
            localStorage.setItem("token", loginData.token); // Stockage du token d'authentification
            window.location.href = "./index.html"; // Redirection vers la page d’accueil
        } else if (response.status === 401) { 
            alert("Mot de passe erroné !", response.statusText); // Connexion fausse // Si la combinaison est fausse prévenir l’utilisateur (message d’erreur)
        } else if (response.status === 404) { 
            alert("Email ou mot de passe incorrect !", response.statusText); // Si la combinaison est fausse prévenir l’utilisateur (message d’erreur)
        } else { // Pour tout autre statut indéfini
            alert("Status indéfini !"); 
        }
    } catch (error) { // Gestion des erreurs
        console.error("Erreur : ", error); 
    }
});
