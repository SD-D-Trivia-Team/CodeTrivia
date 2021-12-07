/*jshint esversion: 8 */
/*globals $*/
/*exported storeCategory, goToLeaderboard, goToQuiz*/

/*
storeCategory(categoryShort, categoryLong)
precondition: user clicked on quiz or leaderboard button which has onClick set
postcondition: stores the full name and 'tag' name for the selected category
*/
function storeCategory(categoryShort, categoryLong){
    sessionStorage.setItem('cat_tag', categoryShort);
    sessionStorage.setItem('cat_full', categoryLong);
}

/*
goToLeaderboard()
precondition: none
postcondition: user is redirected to leaderboard html page
*/
function goToLeaderboard(){
    window.location = ('http://localhost:3000/Leaderboard/index.html');
}

function goToQuiz(){
    window.location = ('http://localhost:3000/Quiz/quiz.html');
}

/*
document.ready() function
precondition: page is loaded (document.ready does this)
postcondition: user has the appropriate information depending if they are
logged in/out. Add other functionalities as needed.
*/
var loggedIn = false;
$(document).ready(function() {
    fetch("http://localhost:3000/user", {
        method: 'GET'
    })
    .then(response => response.json()
    ).then(data => {
        console.log(data);
        if (data.username != '' && typeof data.username != 'undefined'){
            console.log(data.username);
            console.log('logged in');
            $("#profile-image-header").attr("src", `http://github.com/${data.username}.png`);
            $("#log-text").html("Log Out");
            $("#log-text").attr("href", `http://localhost:3000/user/logout`);
            loggedIn = true;
        }
        else {
            console.log('logged out');
            $("#profile-image-header").attr("src", `../images/default_avatar.png`);
            $("#log-text").html("Log In");
            $("#log-text").attr("href", `http://localhost:3000/user/login`);
            loggedIn = false;
        }
    });
});
