function getQuestions() {
    alert("GETTING");
    fetch("http://localhost:3000/get-questions", {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            });
}

/*Function to just store category for now*/
function storeCategory(category_short, category_long){
    sessionStorage.setItem('cat_tag', category_short);
    sessionStorage.setItem('cat_full', category_long)
}

function goToLeaderboard(){
    window.location.replace('http://localhost:3000/Leaderboard/index.html')
}

//github index.js work (Harrison):
//load function: loads when the HTML document is ready. 
//Used as a login check for now: if there is information stored
//about the user set their github profile picture and the logout endpoint,
//if not set a default avatar and the login endpoint.
var logged_in = false;
$(document).ready(function() {
    fetch("http://localhost:3000/user", {
        method: 'GET'
    })
    .then(response => response.json()
    ).then(data => {
        console.log(data);
        if (data.userName != ''){
            console.log('logged in');
            $("#profile-image-header").attr("src", `http://github.com/${data.userName}.png`);
            $("#log-text").html("Log Out");
            $("#log-text").attr("href", `http://localhost:3000/user/logout`);
            logged_in = true;
        }
        else {
            console.log('logged out');
            $("#profile-image-header").attr("src", `../images/default_avatar.png`);
            $("#log-text").html("Log In");
            $("#log-text").attr("href", `http://localhost:3000/user/login`);
            logged_in = false;
        }
    })
});
//end of github index js work
