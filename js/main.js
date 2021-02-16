import {Grid} from "./grid.js"
import {TetrominosBag} from "./tetrominos.js"
import {GameParameters} from "./gameParameter.js"

const param = new GameParameters() ;
const grid = new Grid(10,20);
const tetrominos = new TetrominosBag()

let tetro = tetrominos.shuffle() ;
let nextTetro = tetrominos.shuffle() ;
nextTetro.plotNextTetro(grid)
let tetroHold ;

let canFall = true ;
let canMove  ;

const key = {} ;

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
        param.updateScore(fullLines) ;
        grid.clearGrid(fullLines) ;

    } else {
        param.gameOver = true ;
    }
}

const gamerAction = (name) => {

    let keyArrowName ;
    let callbackMove ;
    switch(name) {
        case "rotate":
            keyArrowName = "ArrowUp";
            callbackMove = () => tetro.rotate(grid) ;
            break ;
        case "left":
            keyArrowName = "ArrowLeft";
            callbackMove = () => tetro.move("l",grid) ;
            break ;
        case "right":
            keyArrowName = "ArrowRight";
            callbackMove = () => tetro.move("r",grid) ;
    }

    if(key[keyArrowName] && param.timings.noActionFrame.counter >= param.timings.noActionFrame.value) {
        tetro.unplot(grid)
        canMove = callbackMove() ;
        tetro.plot(grid)
        if(canMove) {
            param.timings.reachFloor.counter = 0 ;
            param.timings.noActionFrame.counter = param.timings.noActionFrame.chainMoveCounter[name] > 0 ? 8 : 0 ;
            canFall = true ;
            param.timings.noActionFrame.chainMoveCounter[name] ++ ;
        } else {
            canMove = true ;
            param.timings.noActionFrame.chainMoveCounter[name] = 0 ;
        } 
    } else {
        if(!key[keyArrowName]) {
            param.timings.noActionFrame.chainMoveCounter[name] = 0 ;
        }
    }
}

const accelerate = () => {
    if(canFall) {
        if (key.ArrowDown) {
            param.timings.fallings.current = 2 ;
        } else {
            param.timings.fallings.current = param.timings.fallings.value ;
        }
    } else {
        if (key.ArrowDown) {
            nextStep()
        } 
    }
}

const holdTetro = () => {

    let tetroHoldSauv ;

    if(key.KeyS & param.tetroHoldCounter === 0 ) {
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

        gamerAction("rotate") ;
        gamerAction("left") ;
        gamerAction("right") ;
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
        if(key.Space) {
            grid.clearGrid([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
            param.reset() ;
            param.plotScore() ;
            canFall = true ;
            document.querySelector("#game-over-message").classList.add("is-not-visible")
        }
    }

    window.requestAnimationFrame(game)
}

window.addEventListener("keydown", 
    event => {
        console.log("toto") ;
        key[event.code] = event.type === "keydown" ;
        if (!param.hasStarted) {
            param.hasStarted = true ;
            game() ;
            document.querySelector("#home-page").classList.add("is-not-visible")
        }
    });
window.addEventListener("keyup", event => key[event.code] = event.type === "keydown");



