/* 
getQuestions()
precondition: none
postcondition: perform get request to server for questions, log in console
*/
// function getQuestions() {
//     alert("GETTING");
//     fetch("http://localhost:3000/get-questions", {
//             method: 'GET'
//         })
//             .then(response => response.json())
//             .then(data => {
//                 console.log(data);
//             });
// }

function storeCategory(category_short, category_long){
    sessionStorage.setItem('cat_tag', category_short);
    sessionStorage.setItem('cat_full', category_long)
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
    window.location = ('http://localhost:3000/Quiz/quiz.html')
}

/*
document.ready() function
precondition: page is loaded (document.ready does this)
postcondition: user has the appropriate information depending if they are
logged in/out. Add other functionalities as needed.
*/
var logged_in = false;
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
