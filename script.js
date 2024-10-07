document.addEventListener('DOMContentLoaded', function () {
    // Gestion des likes et dislikes
    let likeCount = 0;
    let dislikeCount = 0;

    const likeBtn = document.querySelector('.like-btn');
    const dislikeBtn = document.querySelector('.dislike-btn');
    const likeCountDisplay = document.querySelector('.like-count');
    const dislikeCountDisplay = document.querySelector('.dislike-count');

    likeBtn.addEventListener('click', function () {
        likeCount++;
        likeCountDisplay.textContent = likeCount;
    });

    dislikeBtn.addEventListener('click', function () {
        dislikeCount++;
        dislikeCountDisplay.textContent = dislikeCount;
    });

    // Gestion des commentaires
    const commentBox = document.getElementById('comment-box');
    const commentList = document.getElementById('comment-list');
    const submitCommentBtn = document.getElementById('submit-comment');

    submitCommentBtn.addEventListener('click', function () {
        const commentText = commentBox.value;
        if (commentText.trim() !== "") {
            const newComment = document.createElement('li');
            newComment.textContent = commentText;
            commentList.appendChild(newComment);
            commentBox.value = ""; // Vider la zone de texte après soumission
        }
    });
});
// Inscription
document.getElementById('register-btn').addEventListener('click', function() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            alert("Inscription réussie !");
        })
        .catch(error => {
            alert(error.message);
        });
});

// Connexion
document.getElementById('login-btn').addEventListener('click', function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            alert("Connexion réussie !");
        })
        .catch(error => {
            alert(error.message);
        });
});
// Soumettre une histoire
document.getElementById('submit-story-btn').addEventListener('click', function() {
    const title = document.getElementById('story-title').value;
    const content = document.getElementById('story-content').value;

    if (title && content) {
        // Ajout de l'histoire à Firestore
        firebase.firestore().collection('stories').add({
            title: title,
            content: content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert("Histoire soumise avec succès !");
            // Réinitialiser les champs du formulaire
            document.getElementById('story-title').value = '';
            document.getElementById('story-content').value = '';
        })
        .catch(error => {
            alert("Erreur lors de la soumission de l'histoire : " + error.message);
        });
    } else {
        alert("Veuillez remplir tous les champs !");
    }
});

// Soumettre une histoire
document.getElementById('submit-story-btn').addEventListener('click', function() {
    const title = document.getElementById('story-title').value;
    const content = document.getElementById('story-content').value;
    const tags = document.getElementById('story-tags').value.split(',').map(tag => tag.trim());

    if (title && content) {
        // Ajout de l'histoire à Firestore
        firebase.firestore().collection('stories').add({
            title: title,
            content: content,
            tags: tags, // Enregistrement des tags
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert("Histoire soumise avec succès !");
            // Réinitialiser les champs du formulaire
            document.getElementById('story-title').value = '';
            document.getElementById('story-content').value = '';
            document.getElementById('story-tags').value = ''; // Réinitialiser les tags
        })
        .catch(error => {
            alert("Erreur lors de la soumission de l'histoire : " + error.message);
        });
    } else {
        alert("Veuillez remplir tous les champs !");
    }
});

// Fonction de recherche
document.getElementById('search-input').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const stories = document.querySelectorAll('#stories-list div');

    stories.forEach(story => {
        const title = story.querySelector('h3').textContent.toLowerCase();
        if (title.includes(query)) {
            story.style.display = 'block';
        } else {
            story.style.display = 'none';
        }
    });
});

// Soumettre une histoire
document.getElementById('submit-story-btn').addEventListener('click', function() {
    const title = document.getElementById('story-title').value;
    const content = document.getElementById('story-content').value;
    const tags = document.getElementById('story-tags').value.split(',').map(tag => tag.trim());

    if (title && content) {
        // Ajout de l'histoire à Firestore
        firebase.firestore().collection('stories').add({
            title: title,
            content: content,
            tags: tags,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            // Enregistrer l'action de l'utilisateur
            firebase.firestore().collection('userActions').add({
                action: 'Soumettre une histoire',
                storyTitle: title,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert("Histoire soumise avec succès !");
            document.getElementById('story-title').value = '';
            document.getElementById('story-content').value = '';
            document.getElementById('story-tags').value = '';
        })
        .catch(error => {
            alert("Erreur lors de la soumission de l'histoire : " + error.message);
        });
    } else {
        alert("Veuillez remplir tous les champs !");
    }
});
// Ajouter des commentaires
document.getElementById('stories-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('comment-btn')) {
        const commentInput = e.target.previousElementSibling;
        const commentText = commentInput.value;

        if (commentText) {
            const storyId = e.target.closest('div').querySelector('.like-btn').getAttribute('data-id');
            
            // Enregistrer le commentaire dans Firestore
            firebase.firestore().collection('stories').doc(storyId).collection('comments').add({
                text: commentText,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                commentInput.value = ''; // Réinitialiser le champ de commentaire
                alert("Commentaire ajouté !");
            })
            .catch(error => {
                alert("Erreur lors de l'ajout du commentaire : " + error.message);
            });
        } else {
            alert("Veuillez entrer un commentaire !");
        }
    }
});

// Récupérer et afficher les commentaires
firebase.firestore().collection('stories').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
        const storyId = doc.id;

        // Récupérer les commentaires pour chaque histoire
        doc.ref.collection('comments').onSnapshot(commentSnapshot => {
            const commentsList = document.querySelector(`div[data-story-id="${storyId}"] .comments-list`);
            commentsList.innerHTML = '';

            commentSnapshot.forEach(commentDoc => {
                const comment = commentDoc.data();
                const commentDiv = document.createElement('div');
                commentDiv.textContent = comment.text;
                commentsList.appendChild(commentDiv);
            });
        });
    });
});
