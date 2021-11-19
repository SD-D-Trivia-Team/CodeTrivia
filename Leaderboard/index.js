/*score class*/
class Score {
    constructor(name, cat, val){
        this.username = name;
        this.category = cat;
        this.score = val;
    }
    /*
    getScore()
    precondition: none
    postcondition: return score value
     */
    get getScore(){
        var score_val = this.score;
        return score_val;
    }
    /*
    setScore(value)
    precondition: none
    postcondition: set score value
    */
    set setScore(value){
        this.score = value;
        return;
    }
    /*
    getName()
    precondition: none
    postcondition: return username of score
    */
    get getName(){
        var name_val = this.username;
        return name_val;
    }
    /*
    setName(value)
    precondition:none
    postcondition: set the username of score
    */
    set setName(value){
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
        var init_score = true;
        this.scores = [];
        
        //fetch the data from the server side
        fetch(`http://localhost:3000/scores?category=${this.category}`, {
            method: 'GET'
        }).then(response => response.json())
          .then(data => {

            data.sort((first_item, second_item) => second_item.score - first_item.score);
            var leaderboard_ind = 1;

            for(const elem of data){

                let score_obj = new Score(elem.name, this.category, elem.score);
                this.scores.push(score_obj);

                //top score
                if(init_score){
                    let score_str = elem.score.toLocaleString('en-US');
                    $("#leaderboard-container").html(` <div id="top-leaderboard-entry" class="leaderboard-entry row w-75">
                    <h4 id="top-leaderboard-number auto-marg" class="leaderboard-number col-sm-1">${leaderboard_ind}</h4>
                    <div class="img-cont col-sm-2 auto-marg">
                        <img id="top-leaderboard-img" class="leaderboard-img auto-marg" src="../images/default_avatar.png" alt="A placeholder for the avatar image">
                    </div>
                    <h5 id="top-leaderboard-name" class="leaderboard-name auto-marg col-sm-6">${elem.name}</h5>
                    <h5 id="top-leaderboard-score" class="leaderboard-score auto-marg col-sm-3">${score_str}</h5>
                    </div>`);
                    init_score = false;
                    leaderboard_ind = leaderboard_ind + 1;
                }

                //bottom scores
                else{
                    let score_str = elem.score.toLocaleString('en-US');
                    $("#leaderboard-container").append(` <div class="leaderboard-entry row w-75">
                        <h4 class="leaderboard-number auto-marg col-sm-1">${leaderboard_ind}</h4>
                        <div class="img-cont col-sm-2">
                            <img class="leaderboard-img" src="../images/default_avatar.png" alt="A placeholder for the avatar image">
                        </div>
                        <h5 class="leaderboard-name auto-marg col-sm-6">${elem.name}</h5>
                        <h5 class="leaderboard-score auto-marg col-sm-3">${score_str}</h5>
                    </div>`);
                    leaderboard_ind = leaderboard_ind + 1;
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
