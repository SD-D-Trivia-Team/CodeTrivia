class Leaderboard {

    constructor(cat){
        this.category = cat;
        this.scores = [];
    }

    //viewLeaderboard:
    //preconditions: Category has to be defined/one of the defined categories with a leaderboard button
    //postconditions: Client is served a view of the scores for the selected category
    viewLeaderboard(){
        var init_score = true;
        this.scores = [];
        //fetch the data from the server side
        fetch(`http://localhost:3000/scores?category=${this.category}`, {
            method: 'GET'
        }).then(response => response.json())
        .then(data => {
            //start by sorting the array based on score values
            data.sort((firstItem, secondItem) => secondItem.score - firstItem.score);

            //Then, go through and append the individual elements using jquery's .append and .html methods
            for(const elem of data){
                let scoreObj = new Score(elem.name, this.category, elem.Leaderboard);
                this.scores.push(scoreObj);
                if(init_score){
                    //set score string to use commas
                    let score_str = elem.score.toLocaleString('en-US');
                    //using .html since we can have an empty message in leadaerboard-container if there are no 
                    //scores, and then .html would overwrite that content in the event that we do have scores
                    $("#leaderboard-container").html(` <div id="top-leaderboard-entry" class="leaderboard-entry row w-75">
                    <h4 id="top-leaderboard-number auto-marg" class="leaderboard-number col-sm-1">1</h4>
                    <div class="img-cont col-sm-2 auto-marg">
                        <img id="top-leaderboard-img" class="leaderboard-img auto-marg" src="../images/default_avatar.png" alt="A placeholder for the avatar image">
                    </div>
                    <h5 id="top-leaderboard-name" class="leaderboard-name auto-marg col-sm-6">${elem.name}</h5>
                    <h5 id="top-leaderboard-score" class="leaderboard-score auto-marg col-sm-3">${score_str}</h5>
                    </div>`);
                    //set initial score to false since there is a top score
                    init_score = false;
                }
                else{
                    //set score string to use commas
                    let score_str = elem.score.toLocaleString('en-US');
                    //append the element
                    $("#leaderboard-container").append(` <div class="leaderboard-entry row w-75">
                        <h4 class="leaderboard-number auto-marg col-sm-1">2</h4>
                        <div class="img-cont col-sm-2">
                            <img class="leaderboard-img" src="../images/default_avatar.png" alt="A placeholder for the avatar image">
                        </div>
                        <h5 class="leaderboard-name auto-marg col-sm-6">${elem.name}</h5>
                        <h5 class="leaderboard-score auto-marg col-sm-3">${score_str}</h5>
                    </div>`);
                }
            }
        });
    }

}
/*A score class: Class mainly consists of one constructor function and then several different get/set methods*/
class Score {
    constructor(name, cat, val){
        this.username = name;
        this.category = cat;
        this.score = val;
    }

    get getScore(){
        var score_val = this.score;
        return score_val;
    }

    set setScore(value){
        this.score = value;
        return;
    }

    get getName(){
        var name_val = this.username;
        return name_val;
    }

    set setName(value){
        this.username = value;
        return; 
    }
}

/*A simple user class:*/
class User {
    /*Constructor: Stores username, email, and a list of score objects, one for each category */
    constructor(name, mail, scoreList) {
        this.username = name;
        this.email = mail;
        this.scores = [];
        for(const scoreVal in scoreList){
            this.scores.append(scoreVal);
        }
    }
}


$(document).ready(function() {
    //on load, create a new Leaderboard object for the category and then
    //set the viewLeaderboard method into motion
    var currentLeaderboard = new Leaderboard("Javascript");
    currentLeaderboard.viewLeaderboard();
});