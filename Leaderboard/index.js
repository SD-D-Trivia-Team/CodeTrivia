/*jshint esversion: 8 */
/*globals $*/

/*score class*/
class Score {
    constructor(name, cat, val){
        this.username = name;
        this.category = cat;
        this.score = val;
    }
    /*
    get Score()
    precondition: none
    postcondition: return score value
     */
    get Score(){
        var scoreVal = this.score;
        return scoreVal;
    }
    /*
    set Score(value)
    precondition: none
    postcondition: set score value
    */
    set Score(value){
        this.score = value;
        return;
    }
    /*
    get Name()
    precondition: none
    postcondition: return username of score
    */
    get Name(){
        var nameVal = this.username;
        return nameVal;
    }
    /*
    set Name(value)
    precondition:none
    postcondition: set the username of score
    */
    set Name(value){
        this.username = value;
        return; 
    }
}

/*Leaderboard class*/
class Leaderboard {
    /*
    Leaderboard(cat)
    precondition: none
    postcondition: new leaderboard with specified category created
    */
    constructor(cat){
        this.category = cat;
        this.scores = [];
        this.date = new Date();
    }

    //viewLeaderboard():
    //preconditions: SessionStorage category has to be a defined category
    //postconditions: Leaderboard HTML shows scores for defined category
    viewLeaderboard(){

        $("#leaderboard-header").html(`<h3 id="cat-header">${sessionStorage.getItem('cat_full')} Quiz</h3>
        <h4>Leaderboard - ${this.date.toLocaleDateString('en-US')}</h4>`);
        var initScore = true;
        this.scores = [];
        
        //fetch the data from the server side
        fetch(`http://localhost:3000/scores?category=${this.category}`, {
            method: 'GET'
        }).then(response => response.json())
          .then(data => {

            data.sort((firstItem, secondItem) => secondItem.score - firstItem.score);
            var leaderboardInd = 1;

            for(const elem of data){

                let scoreObj = new Score(elem.name, this.category, elem.score);
                this.scores.push(scoreObj);

                //top score
                if(initScore){
                    let scoreStr = elem.score.toLocaleString('en-US');
                    $("#leaderboard-container").html(` <div id="top-leaderboard-entry" class="leaderboard-entry row w-75">
                    <h4 id="top-leaderboard-number auto-marg" class="leaderboard-number col-sm-1">${leaderboardInd}</h4>
                    <div class="img-cont col-sm-2 auto-marg">
                        <img id="top-leaderboard-img" class="leaderboard-img auto-marg" src="../images/default_avatar.png" alt="A placeholder for the avatar image">
                    </div>
                    <h5 id="top-leaderboard-name" class="leaderboard-name auto-marg col-sm-6">${elem.name}</h5>
                    <h5 id="top-leaderboard-score" class="leaderboard-score auto-marg col-sm-3">${scoreStr}</h5>
                    </div>`);
                    initScore = false;
                    leaderboardInd = leaderboardInd + 1;
                }

                //bottom scores
                else{
                    let scoreStr = elem.score.toLocaleString('en-US');
                    $("#leaderboard-container").append(` <div class="leaderboard-entry row w-75">
                        <h4 class="leaderboard-number auto-marg col-sm-1">${leaderboardInd}</h4>
                        <div class="img-cont col-sm-2">
                            <img class="leaderboard-img" src="../images/default_avatar.png" alt="A placeholder for the avatar image">
                        </div>
                        <h5 class="leaderboard-name auto-marg col-sm-6">${elem.name}</h5>
                        <h5 class="leaderboard-score auto-marg col-sm-3">${scoreStr}</h5>
                    </div>`);
                    leaderboardInd = leaderboardInd + 1;
                }
            }
        });
    }

}

/*
document.ready() function
precondition: page has loaded
postcondition: new leaderboard is created and adds to page
*/
$(document).ready(function() {
    var currentLeaderboard = new Leaderboard(sessionStorage.getItem('cat_tag'));
    currentLeaderboard.viewLeaderboard();
});
