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

const theme = new Audio('./audio/tetris-theme.mp3'); 
theme.loop = true ;
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
            param.timings.noActionFrame.counter = 
                param.timings.noActionFrame.chainMoveCounter[name] === 0 ? 0 : 
                name === "rotate" ? 3 : 8 ;
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

const gamerSwipeAction = (name) => {
    if(name === "left") {
        if(key["swipeLeft"]) {        
            tetro.unplot(grid)
            tetro.move("l",grid) ;
            tetro.plot(grid)
            key["swipeLeft"] = false ;
        }
    } else {
        if(key["swipeRight"]) {
            tetro.unplot(grid)
            tetro.move("r",grid) ;
            tetro.plot(grid)
            key["swipeRight"] = false ;

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

        gamerAction("rotate") ;
        gamerAction("left") ;
        gamerAction("right") ;

        gamerSwipeAction("left") ;
        gamerSwipeAction("right") ;

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
            gameOverSound.pause() ;
            theme.currentTime = 0 ;
            theme.play() ;
        }
    }

    window.requestAnimationFrame(game)
}

window.addEventListener("keydown", 
    event => {
        key[event.code] = event.type === "keydown" ;
        if (!param.hasStarted) {
            param.hasStarted = true ;
            game() ;
            document.querySelector("#home-page").classList.add("is-not-visible")
            theme.play()
        }
    });
window.addEventListener("keyup", event => key[event.code] = event.type === "keydown");


const touchMoveObject = {
    threshold: {
        default: 100,
        grid: document.querySelector("#grid").offsetWidth/10
    }, 
    lastStart: Date.now(),
    maintainInterval: 0,
    maintainCounter: 0
}

window.addEventListener("touchstart", event => {

    if (param.hasStarted) {
        touchMoveObject.maintainInterval = setInterval(() => {
            !key["ArrowUp"] ? touchMoveObject.maintainCounter++ : "" ;
            if (touchMoveObject.maintainCounter >= 1) {
                key["ArrowDown"] = true ;
            }
        }, 200)
    
    
        touchMoveObject["xStart"] = event.changedTouches[0].pageX ;
        touchMoveObject["yStart"] = event.changedTouches[0].pageY ;
    
        if(Date.now() - touchMoveObject.lastStart < 200) {
            key["ArrowUp"] = true ;
        }
    
    
    
        touchMoveObject.lastStart = Date.now() ;
    }

});

window.addEventListener("touchmove", event => {

    if (param.hasStarted) {
        clearInterval(touchMoveObject.maintainInterval) ;
        key["ArrowDown"] = false ;
    
        touchMoveObject["xCurrent"] = event.changedTouches[0].pageX ;
        touchMoveObject["yCurrent"] = event.changedTouches[0].pageY ;
    
        touchMoveObject.isToucheMove = true
    
        if(touchMoveObject["yCurrent"] - touchMoveObject["yStart"] < -touchMoveObject.threshold.default) {
            key["KeyS"] = true ;
        }
    
        if(touchMoveObject["yCurrent"] - touchMoveObject["yStart"] > touchMoveObject.threshold.default) {
            key["ArrowDown"] = true ;
        }
    
        if(touchMoveObject["xCurrent"] - touchMoveObject["xStart"] < -touchMoveObject.threshold.grid) {
            key["swipeLeft"] = true ;
            touchMoveObject["xStart"] = touchMoveObject["xCurrent"] ;
        }
    
        if(touchMoveObject["xCurrent"] - touchMoveObject["xStart"] > touchMoveObject.threshold.grid) {
            key["swipeRight"] = true ;
            touchMoveObject["xStart"] = touchMoveObject["xCurrent"] ;
        }
    }

});

window.addEventListener("touchend", event => { 
    event.preventDefault()
   
    key["ArrowUp"] = false ; 
    key["ArrowDown"] = false ;
    key["KeyS"] = false ;
    key["swipeLeft"] = false ;
    key["swipeRight"] = false ;
    clearInterval(touchMoveObject.maintainInterval)
    touchMoveObject.maintainCounter = 0 ;

    if (!param.hasStarted) {
        param.hasStarted = true ;
        game() ;
        document.querySelector("#home-page").classList.add("is-not-visible")
        theme.play()
    }
})

