var logged_in = false;

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

//load function: loads when the HTML document is ready. 
//Used as a login check for now: if there is information stored
//about the user set their github profile picture and the logout endpoint,
//if not set a default avatar and the login endpoint.
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


$()
