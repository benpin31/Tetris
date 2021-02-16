const initialSpeed = 40 ;

const InitialTimings = 
        {
            fallings: {
                value: initialSpeed,
                current: initialSpeed,
                counter: initialSpeed,
            } ,
        
            reachFloor: {
                value: 40 ,
                counter: 0
            } ,
        
            noActionFrame: {
                value: 10,
                counter: 10,
                chainMoveCounter: {
                    left: 0,
                    right: 0, 
                    rotate: 0
                }
            } ,
        }

const initialScore = {
    total: 0,
    nbLines: 0,
    nbSingle: 0,
    nbDouble: 0,
    nbTripple: 0,
    nbTetris: 0,
    currentCombo: 0,
    longestCombo: 0
}

export class GameParameters {
    constructor() {
        this.timings = JSON.parse(JSON.stringify(InitialTimings)) ;

        this.level = 1 ;

        this.gameOver = false ;

        this.score = JSON.parse(JSON.stringify(initialScore))

        this.tetroHoldCounter = 0 ;
    }   

    reset() {
        this.timings = JSON.parse(JSON.stringify(InitialTimings)) ;

        this.level = 1 ;

        this.gameOver = false ;

        this.score = JSON.parse(JSON.stringify(initialScore))

        this.tetroHoldCounter = 0 ;
    }

    updateNbLines(fullLines) {

        this.score.nbLines += fullLines.length ;

        if (fullLines.length === 1) {
            this.score.nbSingle ++ ;
            this.score.total += 100*this.level ;
        } else if (fullLines.length === 2) {
            this.score.nbDouble ++ ;
            this.score.total += 300*this.level ;
        } else if (fullLines.length === 3) {
            this.score.nbTripple ++ ;
            this.score.total += 500*this.level ;
        } else if (fullLines.length === 4) {
            this.score.nbTetris ++ ;
            this.score.total += 800*this.level ;
        }

    }

    updateCombos(fullLines) {
        if (fullLines.length > 0) {
            this.score.currentCombo++ ;
            this.score.longestCombo = this.score.currentCombo > this.score.longestCombo ? this.score.currentCombo : this.score.longestCombo ;
            this.score.total += 50*(this.score.currentCombo-1)*this.level ;
        } else {
            this.score.currentCombo = 0 ;
        }
    }

    increaseLevel() {
        this.level = this.level <= 9 ? Math.floor(this.score.nbLines/10)+1 : 10 ;
    }

    increaseSpeed() {
        this.timings.fallings.value = initialSpeed-(this.level-1)*(initialSpeed-2)/9 ;
        this.timings.fallings.current = this.timings.fallings.value ;
        console.log(this.timings.fallings.value)
        console.log(this.level)

    }

    plotScore() {
        document.querySelector("#level > span").innerText = this.level;
        document.querySelector("#score-total > span").innerText = this.score.total;
        document.querySelector("#combo > span").innerText = this.score.currentCombo;
        document.querySelector("#max-combo > span").innerText = this.score.longestCombo;
        document.querySelector("#single > span").innerText = this.score.nbSingle;
        document.querySelector("#double > span").innerText = this.score.nbDouble;
        document.querySelector("#tripple > span").innerText = this.score.nbTripple;
        document.querySelector("#tetris > span").innerText = this.score.nbTetris;
    }

    updateScore(fullLines) {
        this.updateNbLines(fullLines) ;
        this.updateCombos(fullLines) ;
        this.increaseLevel() ;
        this.increaseSpeed() ;

        this.plotScore() ;
    }
}
