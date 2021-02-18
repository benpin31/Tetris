// gameParameters gather the classes and methods relatives to game parameter

const initialSpeed = 40 ;

// the two follonging object contains the initial state of the game and ae user to (re)initilise the foolowing classes

//  recall that the game is in 60fps : the speed of two conscutive move is created by counter which trigger move
//  when reach a given value 
const InitialTimings = 
        {
            fallings: {
                value: initialSpeed,
                //  value of the speed according to the level
                current: initialSpeed,
                // current value of the speed : may be faster because the user accelrate the tour
                counter: initialSpeed,
                // counter for the next move 
            } ,
        
            reachFloor: {
                // when a tetromino can't move, time before the next step
                value: 40 ,
                counter: 0
            } ,
        
            noActionFrame: {
                //  keyboard actions of the gamer are verfied each 1/60 seconds. To avoid to fast move, a move can be triggered only some 
                //  frame after the previosu one
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
    // initial score
    total: 0,
    nbLines: 0,
    nbSingle: 0,
    nbDouble: 0,
    nbTripple: 0,
    nbTetris: 0,
    currentCombo: 0,
    longestCombo: 0
}

//  initial parameters : use

export class GameParameters {
    constructor() {
        this.timings = JSON.parse(JSON.stringify(InitialTimings)) ;

        this.level = 1 ;

        this.gameOver = false ;
        this.gameOverCounter = 0 ;
        //  use to avoid the user to restart the game immedialty after a game over : the game can restar only 120fps after game over

        this.pause = false ;
        // game in pause

        this.score = JSON.parse(JSON.stringify(initialScore))

        this.tetroHoldCounter = 0 ;
        //  when the user hold a tetromino, he/her can't redo it in the same step. Don't remeber why it is not a boolean :S

        this.hasStarted = false ;
        // indicate the game has been launch. Be carrefull : the game is still consider launch chan game over : and the loop
        // to chack action is still looping. The pârameter is just to manage user interaction before the first start game
    }   

    reset() {
        //  reput the parameters in initial state, excet for this.hasStarted (see above comment)
        this.timings = JSON.parse(JSON.stringify(InitialTimings)) ;

        this.level = 1 ;

        this.gameOver = false ;
        this.gameOverCounter = 0 ;

        this.pause = false ;

        this.score = JSON.parse(JSON.stringify(initialScore))

        this.tetroHoldCounter = 0 ;
    }

    updateNbLines(fullLines) {
        // update nb lines score
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
        // update combo score

        if (fullLines.length > 0) {
            this.score.currentCombo++ ;
            this.score.longestCombo = this.score.currentCombo > this.score.longestCombo ? this.score.currentCombo : this.score.longestCombo ;
            this.score.total += 50*(this.score.currentCombo-1)*this.level ;
        } else {
            this.score.currentCombo = 0 ;
        }
    }

    increaseLevel() {
        // increase level of the game if mandatory
        this.level = this.level <= 9 ? Math.floor(this.score.nbLines/10)+1 : 10 ;
    }

    increaseSpeed() {
        // increase speed of the game if mandatory
        this.timings.fallings.value = initialSpeed/1.44**(this.level-1) ;
        this.timings.fallings.current = this.timings.fallings.value ;

    }

    updateScore(fullLines) {
        //  sum up previous methods
        this.updateNbLines(fullLines) ;
        this.updateCombos(fullLines) ;
        this.increaseLevel() ;
        this.increaseSpeed() ;

        this.plotScore() ;
    }

    plotScore() {
        // Plot score on interface
        document.querySelectorAll(".level > span").forEach(span => span.innerText = this.level);
        document.querySelectorAll(".score-total > span").forEach(span => span.innerText = this.score.total);
        document.querySelectorAll(".combo > span").forEach(span => span.innerText = this.score.currentCombo);
        document.querySelectorAll(".max-combo > span").forEach(span => span.innerText = this.score.longestCombo);
        document.querySelectorAll(".single > span").forEach(span => span.innerText = this.score.nbSingle);
        document.querySelectorAll(".double > span").forEach(span => span.innerText = this.score.nbDouble);
        document.querySelectorAll(".tripple > span").forEach(span => span.innerText = this.score.nbTripple);
        document.querySelectorAll(".tetris > span").forEach(span => span.innerText = this.score.nbTetris);
    }


}
