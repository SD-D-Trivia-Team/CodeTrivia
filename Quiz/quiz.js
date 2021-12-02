/*jshint esversion: 8 */
/*globals $, URLSearchParams*/
/*exported verifyAnswer*/

//global variables
let questionnumber = 0;
let correctindex = -1;
let points = 0;
let qdata;
let userdata;
let currentscore = 0;

/*
shuffle()
precondition:array must contain a set number of questions
postcondition: choices in the array are randomly sorted
*/
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

/*
document.ready function
precondition: page has loaded
postcondition: questions for quiz are gotten
*/
$(document).ready(function() {
    console.log('ready');
    fetch("http://localhost:3000/user", {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            userdata = data;
            getQuestions();
    });
});

/*
populate()
precondition: Questions are gotten from getQuestions()
postcondition: the HTML page is appropriately populated with the question values
*/
function populate(){

    if(qdata.length == questionnumber){
        quizEndPopulate();
        let scoreobj = {
            username: userdata.username,
            category: sessionStorage.getItem('cat_tag'),
            score: currentscore
        };

        fetch("http://localhost:3000/scores/updateScore", {
                method: 'POST',
                body: JSON.stringify(scoreobj),
                headers: {"Content-Type": "application/json"}
            })
            .then(response => console.log(response));

        setTimeout(() => { document.body.style.backgroundColor = "#1F2521";}, 1000);
        setTimeout(() => {window.location.replace('http://localhost:3000/Leaderboard/index.html');}, 3000);
        return;
    }

    let questionContainer = document.getElementById("container");
    questionContainer.style.opacity = "1";
    questionContainer.innerHTML = '';

    for(var question of qdata){
        console.log(question);
    }


    shuffle(qdata[questionnumber].answers);

    let corr = qdata[questionnumber].correct_answer;

    let qamount = qdata[questionnumber].answers.length;

    for(var i = 0; i < qamount ; i++){
        if(qdata[questionnumber].answers[i] == corr){
            correctindex = i;
            console.log(correctindex);
        }
    }

    switch(qdata[questionnumber].difficulty) {
        case 'easy':
          // code block
          points = 10000;
          break;
        case 'medium':
          // code block
          points = 125000;
          break;
        case 'hard':
        // code block
            points = 250000;
            break;
        default:
          // code block
      }

    let html = ` <h4> Question number: ${questionnumber + 1 } <br> ${points} points</h4>

    <section class="questioncontainer">
      ${qdata[questionnumber].question}
    </section>`;
    
    if (qamount == 2){
        html += `<div id = "questions">
        <div class="row">
        <div onclick="verifyAnswer(0, points)" class="col-sm">
        <section class="questiontext">
        ${qdata[questionnumber].answers[0]}
        </section>
        </div>
    
        <div onclick="verifyAnswer(1, points)" class="col-sm">
        <section class="questiontext">
        ${qdata[questionnumber].answers[1]}
        </section>
        </div>`;
        if(userdata.username != '' && userdata.username != undefined){
            html += `</div>
            <h2 class="text-center"> <img src="http://github.com/${userdata.username}.png" width="40" height="40" class="rounded-circle">  ${userdata.username}:  ${currentscore}</h2>
            </div>`;
        }
        else{
            html += `</div>
            <h2 class="text-center"> <img src="/images/default_avatar.png" width="40" height="40" class="rounded-circle"> Guest:  ${currentscore}</h2>
            </div>`;
        }
    }
    else{
        html += `<div id = "questions">
            <div class="row">
            <div onclick="verifyAnswer(0, points)" class="col-sm">
            <section class="questiontext">
            ${qdata[questionnumber].answers[0]}
            </section>
            </div>

            <div onclick="verifyAnswer(1, points)" class="col-sm">
            <section class="questiontext">
            ${qdata[questionnumber].answers[1]}
            </section>
            </div>

            </div>
            <div class="row">
            <div onclick="verifyAnswer(2, points)" class="col-sm">
            <section class="questiontext">
            ${qdata[questionnumber].answers[2]}
            </section>
            </div>

            <div onclick="verifyAnswer(3, points)" class="col-sm">
            <section class="questiontext">
            ${qdata[questionnumber].answers[3]}
            </section>
            </div>
            </div>
            </div>`;

            if(userdata.username != '' && userdata.username != undefined){
                html += `</div>
                <h2 class="text-center"> <img src="http://github.com/${userdata.username}.png" width="40" height="40" class="rounded-circle">  ${userdata.username}:  ${currentscore}</h2>
                </div>`;
            }
            else{
                html += `</div>
                <h2 class="text-center"> <img src="/images/default_avatar.png" width="40" height="40" class="rounded-circle"> Guest:  ${currentscore}</h2>
                </div>`;
            }
    }
    questionContainer.innerHTML = html;
}


/*
quizEndPopulate()
precondition: User has put in a wrong question or has answered all questions correctly
postcondition: HTML page is changed to briefly show the quiz score before redirecting to category
*/
function quizEndPopulate(){
    let questionContainer = document.getElementById("container");
    let html = `<div class="row">
        <div class="col-sm-12">
            <h2>Quiz ended</h2>
            <h3>Score: ${currentscore}</h3>
            <h3>Redirecting to leaderboard for category...</h3>
        </div>
    </div>`;
    questionContainer.innerHTML = html;
    return;
}

/*
verifyAnswer(index, points)
precondition: index is within the number of choices for the answer
postcondiion: if user gets the question correct then they get points and are moved to the next question.
If they get it wrong they have the quiz end.
*/
function verifyAnswer(index, points){

    if(index == correctindex){
        // alert("CORRECT")
        document.body.style.backgroundColor = "#42d66a";
        setTimeout(() => { document.body.style.backgroundColor = "#1F2521"; }, 1000);
        currentscore += points;
        questionnumber++;
        populate();
        return;
    }
    document.body.style.backgroundColor = "#B80034";
    quizEndPopulate();
    
    let scoreobj = {
        username: userdata.username,
        category: sessionStorage.getItem('cat_tag'),
        score: currentscore
    };

    fetch("http://localhost:3000/scores/updateScore", {
            method: 'POST',
            body: JSON.stringify(scoreobj),
            headers: {"Content-Type": "application/json"}
        })
        .then(response => console.log(response));

    setTimeout(() => { document.body.style.backgroundColor = "#1F2521";}, 1000);
    setTimeout(() => {window.location.replace('http://localhost:3000/Leaderboard/index.html');}, 3000);
    return;
}

/*
getQuestions()
precondition: none, page has loaded
postcondition: the quiz array is appropriately gotten and the first question is populated.
*/
function getQuestions() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let category = urlParams.get("category");

    fetch("http://localhost:3000/get-questions/" + category, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            qdata = data;
            populate(qdata);
            // console.log(data);
        });
}
