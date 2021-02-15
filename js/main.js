import {Grid} from "./grid.js"
import {TetrominosBag} from "./tetrominos.js"
import {GameParameters} from "./gameParameter.js"


const grid = new Grid(10,20);

const tetrominos = new TetrominosBag()
let tetro = tetrominos.shuffle() ;

let canFall = true ;
let canMove  ;

const param = new GameParameters() ;

const key = {} ;
window.addEventListener("keydown",(event) => {key[event.code] = event.type === "keydown"});
window.addEventListener("keyup",(event) => {key[event.code] = event.type === "keydown"});

const tetroTransition = () => {
    if(!tetro.isAboveGrid()) {
        tetro.addToGrid(grid) ;
        param.timings.reachFloor.counter = 0 ;
        param.timings.fallings.counter = 0 ;
        canFall = true ;
        tetro = tetrominos.shuffle() ;
        let fullLines = grid.getFullLines() ;
        param.updateScore(fullLines) ;
        grid.clearGrid(fullLines) ;
    } else {
        param.gameOver = true ;
    }
}

const move = (KeyArrowName, chainMoveName, callBackMove) => {
    if(key[KeyArrowName] && param.timings.noActionFrame.counter >= param.timings.noActionFrame.value) {
        param.timings.noActionFrame.chainMoveCounter[chainMoveName] ++ ;
        tetro.unplot(grid)
        canMove = callBackMove() ;
        tetro.plot(grid)
        if(canMove) {
            param.timings.reachFloor.counter = 0 ;
            param.timings.noActionFrame.counter = param.timings.noActionFrame.chainMoveCounter[chainMoveName] > 1 ? 8 : 0 ;
            canFall = true ;
            param.timings.noActionFrame.chainMoveCounter[chainMoveName] ++ ;
        } else {
            canMove = true ;
            param.timings.noActionFrame.chainMoveCounter[chainMoveName] = 0 ;
        } 
    } else {
        if(!key[KeyArrowName]) {
            param.timings.noActionFrame.chainMoveCounter[chainMoveName] = 0 ;
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
            tetroTransition()
        } 
    }
}

const game = () => {

    move("ArrowUp", "rotate", () => tetro.rotate(grid)) ;
    move("ArrowLeft", "left", () => tetro.move("l",grid)) ;
    move("ArrowRight", "right", () => tetro.move("r",grid)) ;
    accelerate() ;

    if (canFall && param.timings.fallings.counter >= param.timings.fallings.current) {
        tetro.unplot(grid)
        canFall = tetro.move("d", grid) ;
        tetro.plot(grid)

        param.timings.fallings.counter = 0 ;
    } else {
        canFall ? param.timings.fallings.counter++ : "" ;
    }

    if (!canFall) {
        if(param.timings.reachFloor.counter < param.timings.reachFloor.value) {
            param.timings.reachFloor.counter++ ;
        } else {
            tetroTransition() ;
        }
    } 

    param.timings.noActionFrame.counter++ ;

    if (!param.gameOver) {
        window.requestAnimationFrame(game);
    } else {
        document.querySelector("#game-over-message").classList.remove("is-not-visible")
        if(key.Space) {
            grid.clearGrid([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
            param.reset() ;
            canFall = true ;
            document.querySelector("#game-over-message").classList.add("is-not-visible")
        }
        window.requestAnimationFrame(game) ;
    }
}

game()

