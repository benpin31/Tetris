import {Grid} from "./grid.js"
import {TetrominosBag} from "./tetrominos.js"
import {GameParameters} from "./gameParameter.js"
import {GamerAction} from "./gamerInteractions.js"

const param = new GameParameters() ;
const grid = new Grid(10,20);
const tetrominos = new TetrominosBag()
const gamerAction = new GamerAction() ;
console.log(gamerAction.touchMoveObject.threshold.grid)

let tetro = tetrominos.shuffle() ;
let nextTetro = tetrominos.shuffle() ;
nextTetro.plotNextTetro(grid)
let tetroHold ;

let canFall = true ;
let canMove  ;

const theme = new Audio('./audio/tetris-theme.mp3'); 
theme.loop = true ;
theme.volume = 0 ;
const explodeSound = new Audio('./audio/explosion.mp3'); 
const fallSound = new Audio('./audio/punch.mp3'); 
const gameOverSound = new Audio('./audio/game-over.wav'); 
const holdSound = new Audio("./audio/holdSound.mp3")


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

            if (canMove) {
                canFall = true ;
            } else {
            }
        
        }
    } 

    if (name === "right") {
        if(gamerAction.actions.goRightSwipe > 0) {

            tetro.unplot(grid)
            canMove = tetro.move("r",grid) ;
            tetro.plot(grid)
            gamerAction.actions.goRightSwipe -- ;
            
            if (canMove) {
                canFall = true ;
            }
        

        }
    }

    if (name === "rotate") {
        if(gamerAction.actions.rotateSwipe) {
            tetro.unplot(grid)
            canMove = tetro.rotate(grid) ;
            tetro.plot(grid)        
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
        document.querySelector("#game-over-message").classList.remove("is-not-visible")
        param.gameOverCounter ++ ;
        if(gamerAction.actions.restart) {
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
     }

    window.requestAnimationFrame(game)
}

document.addEventListener("keydown", event => gamerAction.pressKey(event, param, game, theme))
document.addEventListener("keyup", event => gamerAction.deletePressKey(event))
document.addEventListener("touchstart", event => gamerAction.touchStart(event, param));
document.addEventListener("touchmove", event =>gamerAction.touchMove(event, param));
document.addEventListener("touchend", event => gamerAction.touchEnd(event, param, game, theme));
