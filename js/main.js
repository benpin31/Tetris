import {Grid} from "./grid.js"
import {TetrominosBag} from "./tetrominos.js"
import {GameParameters} from "./gameParameter.js"
import {GamerAction} from "./gamerInteractions.js"

const param = new GameParameters() ;
const grid = new Grid(10,20);
const tetrominos = new TetrominosBag()
const gamerAction = new GamerAction() ;

let tetro = tetrominos.shuffle() ;
let nextTetro = tetrominos.shuffle() ;
let tetroHold ;

let canFall = true ;
let canMove  ;

const myStorage = window.localStorage ;
const scores = myStorage.getItem("scores") ? JSON.parse(myStorage.getItem("scores")) : [] ;

console.log(myStorage)
console.log(scores)


const theme = new Audio('./audio/tetris-theme.mp3'); 
theme.loop = true ;
// theme.volume = 0 ;
const explodeSound = new Audio('./audio/explosion.mp3'); 
const fallSound = new Audio('./audio/punch.mp3'); 
const gameOverSound = new Audio('./audio/game-over.wav'); 
const holdSound = new Audio("./audio/holdSound.mp3")


const restart = () => {
    grid.clearGrid([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
    param.reset() ;
    param.plotScore() ;
    canFall = true ;
    document.querySelector("#game-over-message").classList.add("is-not-visible")
    gameOverSound.pause() ;
    theme.currentTime = 0 ;
    theme.play() ;
    gamerAction.actions.restart = false ;
}

const saveScore = () => {

    const gamerName = document.querySelector("#player-name").value ;
    const finalScore = param.score.total ;

    if (scores.length === 0) {
        scores.push([gamerName, finalScore])
    } else {
        let lowerScoreIndex = 0 ;
        while (lowerScoreIndex < scores.length && scores[lowerScoreIndex][1] > finalScore) {
            lowerScoreIndex ++ ;
        }
        scores.splice(lowerScoreIndex, 0, [gamerName, finalScore])

    }

    myStorage.setItem("scores", JSON.stringify(scores))

}

const gameOver = () => {

    param.gameOverCounter ++ ;
    if(gamerAction.actions.restart) {
        saveScore() ;
        restart() ;
    }
}

const nextStep = () => {
    if(!tetro.isAboveGrid()) {
        canFall = true ;
        tetro.addToGrid(grid) ;

        nextTetro.unplotNextTetro(grid)

        tetro = nextTetro ;
        nextTetro = tetrominos.shuffle() ;

        nextTetro.plotNextTetro(grid)

        param.timings.reachFloor.counter = 0 ;
        param.timings.fallings.counter = 0 ;
        param.tetroHoldCounter = 0 ;

        let fullLines = grid.getFullLines() ;
        if(fullLines.length > 0) {
            explodeSound.currentTime = 0
            explodeSound.play() ;
        } else {
            fallSound.currentTime = 0
            fallSound.play() ;
        }
        param.updateScore(fullLines) ;
        grid.clearGrid(fullLines) ;

    } else {
        param.gameOver = true ;
        theme.pause() ;
        document.querySelector("#game-over-message").classList.remove("is-not-visible")
        document.querySelector("#player-name").focus() ;
        gameOverSound.currentTime = 0
        gameOverSound.play() ;
    }
}

const gamerMove = name => {

    let callbackMove ;
    switch(name) {
        case "rotate":
            callbackMove = () => tetro.rotate(grid) ;
            break ;
        case "goLeft":
            callbackMove = () => tetro.move("l",grid) ;
            break ;
        case "goRight":
            callbackMove = () => tetro.move("r",grid) ;
    }

    if(gamerAction.actions[name] && param.timings.noActionFrame.counter >= param.timings.noActionFrame.value) {
        tetro.unplot(grid)
        canMove = callbackMove() ;
        tetro.plot(grid)
        if(canMove) {
            param.timings.reachFloor.counter = 0 ;
            param.timings.noActionFrame.counter = 
                param.timings.noActionFrame.chainMoveCounter[name] === 0 ? 0 : 
                name === "rotate" ? 3 : 8 ;
            canFall = true ;
            param.timings.noActionFrame.chainMoveCounter[name] ++ ;
        } else {
            param.timings.noActionFrame.chainMoveCounter[name] = 0 ;
        } 
    } else {
        if(!gamerAction.actions[name]) {
            param.timings.noActionFrame.chainMoveCounter[name] = 0 ;
        }
    }
}

const gamerSwipeAction = (name) => {
    if(name === "left") {
        if(gamerAction.actions.goLeftSwipe > 0) {

            tetro.unplot(grid)
            canMove = tetro.move("l",grid) ;
            tetro.plot(grid)
            gamerAction.actions.goLeftSwipe -- ;
            gamerAction.updateSwipe("swipeLeft", false)

            if (canMove) {
                canFall = true ;
            } else {
                gamerAction.actions.goLeftSwipe = 0 ;
            }
            // gamerAction.updateActions() ;


        }
    } 

    if (name === "right") {
        if(gamerAction.actions.goRightSwipe > 0) {

            tetro.unplot(grid)
            canMove = tetro.move("r",grid) ;
            tetro.plot(grid)
            gamerAction.actions.goRightSwipe -- ;
            gamerAction.updateSwipe("swipeRight", false)
            
            if (canMove) {
                canFall = true ;
            } else {
                gamerAction.actions.goRightSwipe = 0 ;
            }
            // gamerAction.updateActions() ;


        }
    }

    if (name === "rotate") {
        if(gamerAction.actions.rotateSwipe) {
            tetro.unplot(grid)
            canMove = tetro.rotate(grid) ;
            tetro.plot(grid)     
            
            if (canMove) {
                canFall = true ;
            }
        }

        gamerAction.updateSwipe("touch", false)
        gamerAction.updateActions() ;
    }

}

const accelerate = () => {
    if (canFall) {
        if (gamerAction.actions.accelerate) {
            param.timings.fallings.current = 2 ;
        } else {
            param.timings.fallings.current = param.timings.fallings.value ;
        }
    } else {
        if (gamerAction.actions.accelerate) {
            nextStep()
        } 
    }
}

const holdTetro = () => {

    let tetroHoldSauv ;

    if(gamerAction.actions.hold & param.tetroHoldCounter === 0 ) {
        holdSound.currentTime = 0 ;
        holdSound.play() ;

        canFall = true ;

        if(!tetroHold) {
            tetro.unplot(grid) ;
            nextTetro.unplotNextTetro(grid) ;
            tetroHold = tetro ;
            tetro = nextTetro ;
            nextTetro =  tetrominos.shuffle() ;
            tetro.reset() ;
            nextTetro.reset() ;
            tetroHold.reset() ;
            tetro.plot(grid) ;
            nextTetro.plotNextTetro(grid) ;
            tetroHold.plotHoldTetro(grid) ;
            param.tetroHoldCounter ++ ;
        } else {
            tetro.unplot(grid) ;
            tetroHold.unplotHoldTetro(grid) ;
            tetroHoldSauv = tetroHold ;
            tetroHold = tetro ;
            tetro = tetroHoldSauv ;
            tetro.reset() ;
            tetroHold.reset() ;
            tetro.plot(grid) ;
            tetroHold.plotHoldTetro(grid) ;
            param.tetroHoldCounter ++ ;
        }
    }  
}

const game = () => {
    if(!param.pause) {
        if (!param.gameOver) {

            gamerMove("rotate") ;
            gamerMove("goLeft") ;
            gamerMove("goRight") ;
    
            gamerSwipeAction("left") ;
            gamerSwipeAction("right") ;
            gamerSwipeAction("rotate") ;
    
            accelerate() ;
            holdTetro() ;
    
            param.timings.noActionFrame.counter++ ;
    
            if(canFall) {
                if (param.timings.fallings.counter >= param.timings.fallings.current) {
                    tetro.unplot(grid)
                    canFall = tetro.move("d", grid) ;
                    tetro.plot(grid)
        
                    param.timings.fallings.counter = 0 ;
                } else {
                    param.timings.fallings.counter++ ;
                }
            } else {
                if(param.timings.reachFloor.counter < param.timings.reachFloor.value) {
                    param.timings.reachFloor.counter++ ;
                } else {
                    nextStep() ;
                }
            }
    
        } else {
            gameOver()
         }
    }


    window.requestAnimationFrame(game)
}

document.addEventListener("keydown", event => gamerAction.pressKey(event, param, game, theme, nextTetro, grid))
document.addEventListener("keyup", event => gamerAction.deletePressKey(event))
document.querySelector("#grid").addEventListener("touchstart", event => gamerAction.touchStart(event, param));
document.querySelector("#grid").addEventListener("touchmove", event =>gamerAction.touchMove(event, param));
document.querySelector("#grid").addEventListener("touchend", event => gamerAction.touchEnd(event, param, game, theme, nextTetro, grid));

const whenPlotScores = () => {
    if (!param.hasStarted) {
        document.querySelector("#home-page").classList.toggle("is-not-visible")
    } else {
        document.querySelector("#home-page").classList.add("is-not-visible")
        document.querySelector("#grid").classList.toggle("is-not-visible")

    }
    document.querySelector("#score-page").classList.toggle("is-not-visible")

    param.pause = !param.pause ;

    console.log(param.pause)
} 


document.querySelector("#best-score").onclick = whenPlotScores ;
document.querySelector("#simplified-best-score").onclick = whenPlotScores ;






const table = document.querySelectorAll("#score-page-message table tr")
console.log(table.length)
console.log(scores.length)


for (let k = 0 ; k < Math.min(table.length, scores.length) ; k++) {
    table[k].querySelector(".playerName").innerText = scores[k][0]
    table[k].querySelector(".playerScore").innerText = scores[k][1]
}

