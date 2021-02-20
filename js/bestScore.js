//  Best score contains all the classes an methods which manage the best score management ans save

export class BestScore {
    constructor() {
        this.storage = window.localStorage ;
        this.bestScores = this.storage.getItem("scores") ? JSON.parse(this.storage.getItem("scores")) : [] ;
    }

    updateBestScore() {
        // DOM : complete the html block of best scores
        const table = document.querySelectorAll("#score-page-message table tr")
        
        for (let k = 0 ; k < Math.min(table.length, this.bestScores.length) ; k++) {
            table[k].querySelector(".playerName").innerText = this.bestScores[k][0]
            table[k].querySelector(".playerScore").innerText = this.bestScores[k][1]
        }
        
    }
    
    saveScore(param) {
        //  Save the user score in a array of all the score ordered bt best score, then update the html block of best scores
        const gamerName = document.querySelector("#player-name").value ;
        const finalScore = param.score.total ;
    
        if (this.bestScores.length === 0) {
            this.bestScores.push([gamerName, finalScore])
        } else {
            let lowerScoreIndex = 0 ;
            while (lowerScoreIndex < this.bestScores.length && this.bestScores[lowerScoreIndex][1] > finalScore) {
                lowerScoreIndex ++ ;
            }
            this.bestScores.splice(lowerScoreIndex, 0, [gamerName, finalScore])
    
        }
    
        this.storage.setItem("scores", JSON.stringify(this.bestScores))
    
        this.updateBestScore()
    
    }
}