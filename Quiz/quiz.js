let questionnumber = 0;
let correct_answer = -1;
let points = 0;
let qdata;
let currentscore = 0;

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }

$(document).ready(function() {
    console.log('ready');
    getQuestions();
});


function populate(){
    let questionContainer = document.getElementById("container");
    questionContainer.style.opacity = "1";
    questionContainer.innerHTML = '';

    for(question of qdata){
        console.log(question);
    }


    shuffle(qdata[questionnumber]['answers']);

    corr = qdata[questionnumber]['correct_answer']

    let qamount = qdata[questionnumber]['answers'].length;

    for(i = 0; i < qamount ; i++){
        if(qdata[questionnumber]['answers'][i] == corr){
            correctindex = i;
            console.log(correctindex);
        }
    }

    switch(qdata[questionnumber]['difficulty']) {
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

    let html = ` <h4> Question n: ${questionnumber + 1 } <br> ${points} </h4>

    <section class="questioncontainer">
      ${qdata[questionnumber]['question']}
    </section>`
    
    if (qamount == 2){
        html += `<div id = "questions">
        <div class="row">
        <div onclick="verifyAnswer(0, points)" class="col-sm">
        <section class="questiontext">
        ${qdata[questionnumber]['answers'][0]}
        </section>
        </div>
    
        <div onclick="verifyAnswer(1, points)" class="col-sm">
        <section class="questiontext">
        ${qdata[questionnumber]['answers'][1]}
        </section>
        </div>
    
        </div>
        <h2 class="text-center"> <img src="/images/default_avatar.png" width="40" height="40"> Username:  ${currentscore}</h2>
        </div>`
    }
    else{
        html += `<div id = "questions">
            <div class="row">
            <div onclick="verifyAnswer(0, points)" class="col-sm">
            <section class="questiontext">
            ${qdata[questionnumber]['answers'][0]}
            </section>
            </div>

            <div onclick="verifyAnswer(1, points)" class="col-sm">
            <section class="questiontext">
            ${qdata[questionnumber]['answers'][1]}
            </section>
            </div>

            </div>
            <div class="row">
            <div onclick="verifyAnswer(2, points)" class="col-sm">
            <section class="questiontext">
            ${qdata[questionnumber]['answers'][2]}
            </section>
            </div>

            <div onclick="verifyAnswer(3, points)" class="col-sm">
            <section class="questiontext">
            ${qdata[questionnumber]['answers'][3]}
            </section>
            </div>
            </div>
            </div>

            <div>
            <h2 class="text-center"> <img src="/images/default_avatar.png" width="40" height="40"> Username:  ${currentscore}</h2>
            </div>`
    }
    questionContainer.innerHTML = html;
}

function verifyAnswer(index, points){

    if(index == correctindex){
        // alert("CORRECT")
        document.body.style.backgroundColor = "#42d66a";
        setTimeout(() => { document.body.style.backgroundColor = "#1F2521"; }, 1000);
        currentscore += points;
        questionnumber++;
        populate();
        return
    }
    document.body.style.backgroundColor = "#B80034";
    setTimeout(() => { document.body.style.backgroundColor = "#1F2521"; }, 1000);
    questionnumber++;
    populate();
    return
}

function getQuestions() {
    fetch("http://localhost:3000/get-questions", {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            qdata = data;
            populate(qdata);
            // console.log(data);
        });
};