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

class GamerAction {
    constructor() {
        this.key = {
            ArrowDown: false,
            ArrowUp: false,
            ArrowLeft: false,
            ArrowRight: false,
            KeyS: false,
            Space: false,

        } 
        this.swipe = {
            touch: false,
            maintain: false,
            swipeUp: false,
            swipeLeft: false,
            swipeRight: false,
        }

        this.actions = {
            accelerate: false,
            hold: false,
            goLeft: false,
            goLeftSwipe: 0,
            goRight: false,
            goRightSwipe: 0,
            rotate: false,
            rotateSwipe: false,
            restart: false,
        }
    }

    updateSwipe(name, isSwipe) {
        this.swipe[name] = isSwipe ;
    }

    updateKey(event) {
        this.key[event.code] = event.type === "keydown" ;
    }

    updateActions() {
        this.actions.accelerate = this.key.ArrowDown || this.swipe.maintain ;
        this.actions.hold = this.key.KeyS || this.swipe.swipeUp;
        this.actions.goLeft = this.key.ArrowLeft ; 
        this.actions.goLeftSwipe += this.swipe.swipeLeft ? 1 : 0 ;
        this.actions.goRight = this.key.ArrowRight ; 
        this.actions.goRightSwipe += this.swipe.swipeRight ? 1 : 0;
        this.actions.rotate = this.key.ArrowUp ; 
        this.actions.rotateSwipe = this.swipe.touch ;
        this.actions.restart = this.key.Space ;
    }
    

}

const gamerAction = new GamerAction() ;

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
            // canMove = true ;
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
                // canMove = true ;
            }
        
        }
    } 

    if (name === "right") {
        if(gamerAction.actions.goRightSwipe > 0) {

            tetro.unplot(grid)
            canMove = tetro.move("r",grid) ;
            tetro.plot(grid)
            // gamerAction.actions.goRightSwipe = false ;
            gamerAction.actions.goRightSwipe -- ;
            
            if (canMove) {
                canFall = true ;
            } else {
                // canMove = true ;
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

document.addEventListener("keydown", 
    event => {
        gamerAction.updateKey(event) ;
        gamerAction.updateActions() ;

        if (!param.hasStarted && event.code === "Space") {
            param.hasStarted = true ;
            game() ;
            document.querySelector("#home-page").classList.add("is-not-visible")
            theme.play()
        }
    }
)

document.addEventListener("keyup",
    event => {
        gamerAction.updateKey(event) ;
        gamerAction.updateActions()
});


const touchMoveObject = {
    threshold: {
        default: 100,
        grid: document.querySelector("#grid").offsetWidth/10
    }, 
    lastStart: Date.now(),
    maintainInterval: 0,
    maintainCounter: 0,
    hasSwipe: false
}

document.addEventListener("touchstart", event => {

    if (param.hasStarted) {

        touchMoveObject.maintainCounter++ ;
        touchMoveObject.maintainInterval = setInterval(
            () => {
                if (touchMoveObject.maintainCounter >= 1) {
                    touchMoveObject.hasSwipe = true ;
                    gamerAction.updateSwipe("maintain",true, gamerAction.updateActions(event))
                }
        }
        , 200)
    
        touchMoveObject["xStart"] = event.changedTouches[0].pageX ;
        touchMoveObject["yStart"] = event.changedTouches[0].pageY ;
    
        touchMoveObject.lastStart = Date.now() ;
    }
});

document.addEventListener("touchmove", event => {
    touchMoveObject.hasSwipe = true ;

    if (param.hasStarted) {

        clearInterval(touchMoveObject.maintainInterval) ;
        gamerAction.updateSwipe("maintain", false)  ;

        touchMoveObject["xCurrent"] = event.changedTouches[0].pageX ;
        touchMoveObject["yCurrent"] = event.changedTouches[0].pageY ;
    
        gamerAction.updateSwipe("swipeUp", touchMoveObject["yCurrent"] - touchMoveObject["yStart"] <- touchMoveObject.threshold.default)  ;
        gamerAction.updateSwipe("swipeLeft", touchMoveObject["xCurrent"] - touchMoveObject["xStart"] < -touchMoveObject.threshold.grid)  ;
        gamerAction.updateSwipe("swipeRight", touchMoveObject["xCurrent"] - touchMoveObject["xStart"] > touchMoveObject.threshold.grid)  ;

        gamerAction.updateActions() ;

        if(touchMoveObject["xCurrent"] - touchMoveObject["xStart"] > touchMoveObject.threshold.grid) {
            touchMoveObject["xStart"] += touchMoveObject.threshold.grid;
        }

        if(touchMoveObject["xCurrent"] - touchMoveObject["xStart"] < -touchMoveObject.threshold.grid) {
            touchMoveObject["xStart"] -= touchMoveObject.threshold.grid;
        }
    }

});

document.addEventListener("touchend", event => { 

    event.preventDefault()
   
    gamerAction.updateSwipe("touch", !touchMoveObject.hasSwipe)
    gamerAction.updateSwipe("maintain",false)
    gamerAction.updateSwipe("swipeUp",false)
    gamerAction.updateSwipe("swipeRight",false)
    gamerAction.updateSwipe("swipeLeft",false)

    gamerAction.updateActions(event) ;

    clearInterval(touchMoveObject.maintainInterval)
    touchMoveObject.maintainCounter = 0 ;

    if (!param.hasStarted && !touchMoveObject.hasSwipe) {
        param.hasStarted = true ;
        game() ;
        document.querySelector("#home-page").classList.add("is-not-visible")
        theme.play()
    }

    if (param.gameOver && param.gameOverCounter > 120) {
        gamerAction.actions.restart = true ;
    }

    touchMoveObject.hasSwipe = false ;
});
