// Fonction asynchrone pour initialiser les filtres
async function initFilters() {
  try {
    // Sélectionne le formulaire des filtres par son ID
    const filterForm = document.querySelector("#projectOrganization");
    // Effectue une requête pour obtenir les catégories depuis l'API
    const response = await fetch("http://localhost:5678/api/categories");

    // Vérifie si la réponse est un succès (code 200)
    if (response.status === 200) {
      // Récupère les catégories au format JSON
      const categories = await response.json();
     
      // Crée un bouton "Tous" pour afficher toutes les catégories
      const buttonAll = document.createElement("button");
      buttonAll.className = "projectSelection";
      buttonAll.type = "submit";
      buttonAll.dataset.id = "0";
      buttonAll.textContent = "Tous";
      filterForm.appendChild(buttonAll);

      // Parcours les catégories récupérées et crée un bouton pour chaque catégorie
      for (const category of categories) {
        const buttonFilter = document.createElement("button");
        buttonFilter.className = "projectSelection";
        buttonFilter.type = "submit";
        buttonFilter.dataset.id = category.id;
        buttonFilter.textContent = category.name;
        filterForm.appendChild(buttonFilter);
      }
      // Retourne les catégories récupérées
      return categories;

    } else {
      // Affiche une erreur si la réponse n'est pas un succès
      console.error(response.status, response);
    }

  } catch (error) {
    // Capture et affiche toute erreur survenue lors de l'exécution
    console.error(error);
  }
}

// Fonction asynchrone pour initialiser les projets
async function initProjects() {
  try {
    // Effectue une requête pour obtenir les projets depuis l'API
    const response = await fetch("http://localhost:5678/api/works");

    // Vérifie si la réponse est un succès (code 200)
    if (response.status === 200) {
      // Récupère la liste des projets au format JSON
      let worksList = await response.json();
     
      // Rafraîchit les projets dans l'interface
      refreshProjects(worksList);
      // Retourne la liste des projets récupérée
      return worksList;
    } else {
      // Affiche une erreur si la réponse n'est pas un succès
      console.error(response.status, response);
    }

  } catch (error) {
    // Capture et affiche toute erreur survenue lors de l'exécution
    console.error(error);
  }
}

// Fonction pour rafraîchir les projets dans l'interface
function refreshProjects(worksList) {
  const galleryContainer = document.querySelector(".gallery");
  galleryContainer.innerHTML = "";

  // Parcours la liste des projets et affiche chaque projet dans la galerie
  for (const work of worksList) {
    const projectHTML = `<figure><img src="${work.imageUrl}" alt="${work.title}"><figcaption>${work.title}</figcaption></figure>`;
    galleryContainer.insertAdjacentHTML("beforeend", projectHTML);
  }
}

// Fonction pour filtrer les projets en fonction de la catégorie sélectionnée
function filterProjects(projectId, worksList) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  // Filtre la liste des projets en fonction de l'ID de la catégorie sélectionnée
  filteredWorksList = worksList.filter((project) => {
    if (projectId === "0") {
      return true;
    } else {
      return projectId == project.categoryId;
    }
  });

  // Affiche les projets filtrés dans la galerie
  for (const work of filteredWorksList) {
    const projectContainer = document.createElement("figure");
    gallery.appendChild(projectContainer);
    const projectImg = document.createElement("img");
    projectImg.src = work.imageUrl;
    projectImg.alt = work.title;
    projectContainer.appendChild(projectImg);
    const projectTitle = document.createElement("figcaption");
    projectTitle.innerHTML = work.title;
    projectContainer.appendChild(projectTitle);
  }
}

// Fonction pour créer l'interface des utilisateurs connectés
function createInterfaceForLoggedUsers(worksList, categories) {
  if (localStorage.getItem("token")) {
    // Modifie l'apparence de l'interface pour les utilisateurs connectés
    document.getElementById("stock-header").style.margin = "100px 0";
    const loggedHeader = document.createElement("header");
    loggedHeader.innerHTML = `
    <i class='fa-solid fa-pen-to-square'></i>
    <p>Mode édition</p>`;
    loggedHeader.id = "logged-header";
    document.getElementById("log-button-event").innerText = "logout";
    document.getElementById("log-button-event").setAttribute("href", "./index.html");
    document.querySelector("body").insertAdjacentElement("afterbegin", loggedHeader);

    // Modifie les boutons de modification pour chaque projet
    const modifyButtons = document.querySelectorAll(".modify-marker");
    for (const modifyButton of modifyButtons) {
      modifyButton.innerHTML = `<i class='fa-solid fa-pen-to-square'></i>
      <p>modifier</p>`;
      modifyButton.querySelector("p").style.color = "#000000";
    }

    // Masque la galerie modale
    document.querySelector("#modal-gallery").style.display = "none";

    // Ajoute un événement pour activer la galerie modale
    const activateModal = document.querySelector("#start-modal");
    activateModal.addEventListener("click", function displayModal() {
      document.querySelector("#modal-gallery").style.display = "flex";
      document.querySelector("#modal-wrapper").style.display = "flex";
      const modalGallery = document.querySelector("#modal-wrapper");
      modalGallery.innerHTML = `
      <i class='fa-solid fa-xmark'></i>
      <h2 id='modal-title'>Galerie photo</h2>
      <div id='modal-elements'></div>
      <div id='buttons-inside-modal'>
      <div class="separation-line"></div>
      <button id='add-picture-modal'>Ajouter une photo</button>
      <a id='delete-element' href='#'></a> `;

      // Fonction pour fermer la galerie modale
      function closeModal() {
        document.querySelector("#modal-gallery").style.display = "none";
        document.querySelector("#modal-wrapper").style.display = "none";
        document.querySelector("#modal-wrapper").innerHTML = "";
      }
      document.querySelector(".fa-solid.fa-xmark").addEventListener("click", closeModal);
      document.querySelector("#modal-gallery").addEventListener("click", closeModal);

      // Affiche les projets dans la galerie modale
      function displayWorksOnModal() {
        for (work of worksList) {
          const modalElement = document.createElement("div");
          modalElement.innerHTML = `
          <img class='element-picture-modal' src="${work.imageUrl}">
          <i data-id="${work.id}" class="fa-solid fa-trash-can delete-work"></i> `;
          document.getElementById("modal-elements").appendChild(modalElement);

          // Ajoute un événement pour supprimer un projet depuis la galerie modale
          modalElement.querySelector(".delete-work").addEventListener("click", async function deleteSingleWork() {
            const workId = modalElement.querySelector(".delete-work").getAttribute("data-id");

            try {
              const response = await fetch(`http://localhost:5678/api/works/${workId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });

              if (response.status === 200 || 204) {
                const index = worksList.findIndex(work => work.id == workId);
                worksList.splice(index, 1);
              
                refreshProjects(worksList);
                displayModal();

              } else if (response.status === 401) {
                console.error("Unauthorized", response.statusText);
              } else if (response.status === 500) {
                console.error("Unexpected Behaviour", response.statusText);
              }
            } catch (error) {
              console.error(error);
            }
          });
        }
      }

      displayWorksOnModal(worksList);

      // Ajoute un événement pour ajouter un projet depuis la galerie modale
      document.getElementById("add-picture-modal").addEventListener("click", function addPartForModal() {

        let modalWrapper = document.getElementById("modal-wrapper");
        modalWrapper.innerHTML = "";
        modalWrapper.innerHTML = `
        <form id="addImageForm" enctype="multipart/form-data">
        <div id="modalWrapperAddContainer">
        <i class="fa-solid fa-arrow-left"></i>
        <i class="fa-solid fa-xmark"></i>
        </div>
        <h2 id="modal-title">Ajout photo</h2>
        <div id="uploadAddImagecontainer">
        <i class="fa-sharp fa-regular fa-image" id="iconImageUpload"></i>
        <label for="picture" id="buttonImageUpload">+ Ajouter photo</label>
        <input id="picture" class="invisible-picture" type="file" name="image" onchange="previewPicture(this)">
        <img name="imageUrl" style='display:none' src="#" id="image">
        <p class="little-text">jpg, png : 4mo max</p>
        </div>
        <h3>Titre</h3>
        <input name="title" id="form-add-title" class="input-field-area" type="text"/>
        <h3>Catégorie</h3>
        <select class="input-field-area" name="category">
        <option disabled selected hidden></option>
        </select>
        <div class="separation-line"></div>
        <button id="add-picture-modal" type="submit">Valider</button>
        </form> `;

        // Ajoute les options de catégorie dans le formulaire d'ajout de projet
        for (category of categories) {
          let categorySelection = document.createElement("option");
          categorySelection.setAttribute("value", `${category.id}`);
          categorySelection.innerHTML = `${category.name}`;
          document.getElementsByClassName("input-field-area")[1].appendChild(categorySelection);
        }

        // Ajoute un événement pour fermer la galerie modale depuis le formulaire d'ajout
        document.querySelector(".fa-solid.fa-xmark").addEventListener("click", closeModal);
        document.querySelector(".fa-solid.fa-arrow-left").addEventListener("click", function returnToPhotoGallery() {
          modalWrapper.innerHTML = "";
          displayModal();
        });

        let image = document.getElementById("image");
        // Fonction pour prévisualiser l'image sélectionnée
        previewPicture = function (e) {
          document.getElementById("image").style.display = "block";
          document.getElementById("buttonImageUpload").style.display = "none";
          document.getElementById("iconImageUpload").style.display = "none";
          document.getElementsByClassName("little-text")[0].style.display = "none";
          const [file] = e.files;
          if (file) {
            image.src = URL.createObjectURL(file);
          }
        };

        // Ajoute un événement pour soumettre le formulaire d'ajout de projet
        document.getElementById("addImageForm").addEventListener("submit", async function addSingleWork(event) {
          try {
            event.preventDefault();

            let inputImage = document.getElementById('picture');
            if (inputImage.files.length == 0)
            {
              alert("Veuillez ajouter une photo !");
              return false;
            }

            let form = document.getElementById("addImageForm");
            let formData = new FormData(form);

            // Envoie une requête pour ajouter un nouveau projet
            const response = await fetch("http://localhost:5678/api/works", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: formData,
            });

            if (response.status === 201) {
              // Ajoute le nouveau projet à la liste et rafraîchit l'interface
              let newObjectToAdd = await response.json();
              newObjectToAdd.categoryId = parseInt(newObjectToAdd.categoryId);
              worksList.push(newObjectToAdd);
              refreshProjects(worksList);
              displayModal();

            } else if (response.status === 400) {
              console.error("Bad Request", response);
              alert("Veuillez remplir tous les champs !");
            } else if (response.status === 401) {
              console.error("Unauthorized", response);
            } else if (response.status === 500) {
              console.error("Unexpected Error", response);
            }
          } catch (error) {
            // Capture et affiche toute erreur survenue lors de l'exécution
            console.error(error);
          }
        });
      });
    });

    // Ajoute un événement pour déconnecter l'utilisateur
    document.getElementById("log-button-event").addEventListener("click", () => {
      localStorage.removeItem("token");
    });

  } else {
    // Modifie l'apparence de l'interface pour les utilisateurs non connectés
    document.getElementById("log-button-event").innerText = "login";
    document.getElementById("log-button-event").setAttribute("href", "./login.html");
    document.getElementById("modal-gallery").style.display = "none";
  }
}

// Fonction principale pour charger l'interface
async function index() {
  try {
    // Initialise les filtres et les projets
    let categories = await initFilters();
    let worksList = await initProjects();

    // Ajoute des événements pour les boutons de filtre
    const buttons = document.getElementsByClassName("projectSelection");
    for (const button of buttons) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const projectId = e.target.getAttribute("data-id");
        filterProjects(projectId, worksList);
      });
    }

    // Crée l'interface pour les utilisateurs connectés
    createInterfaceForLoggedUsers(worksList, categories);

  } catch (error) {
    // Capture et affiche toute erreur survenue lors de l'exécution
    console.error(error);
  }
}

// Appelle la fonction principale pour charger l'interface
index();
