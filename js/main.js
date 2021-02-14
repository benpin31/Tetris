import {Grid} from "./grid.js"
import {Polyomino, Tetromino, generateRandomTetro} from "./tetrominos.js"

const grid = new Grid(10,20);


let tetro = generateRandomTetro() ;

let canFall = true ;
let canMove  ;

const timings = {
    nbFrameBeforeNextFallLevel: 60 ,
    nbFrameBeforeNextFall: 60 ,
    nbFrameSinceLastFall: 60 ,

    nbFrameBeforNewTetroInit: 60 ,
    nbFrameBeforNewTetro: 60 ,
    nbFrameSinceReachFloor: 0 ,

    nbFrameBeforNextMove: 10 ,
    nbFrameSinceLastMove: 10 ,

    nbChainMoveLeft: 0 ,
    nbChainMoveRight: 0 ,
    nbChainMoveRotate: 0 ,

}

const key = {} ;
window.addEventListener("keydown",(event) => {key[event.code] = event.type === "keydown"});
window.addEventListener("keyup",(event) => {key[event.code] = event.type === "keydown"});

const tetroTransition = () => {
    tetro.addToGrid(grid) ;
    timings.nbFrameSinceReachFloor = 0 ;
    timings.nbFrameSinceLastFall = 0 ;
    canFall = true ;
    tetro = generateRandomTetro() ;
    grid.clearFullLines()
}

const move = (KeyArrowName, chainMoveName, callBackMove) => {
    if(key[KeyArrowName] && timings.nbFrameSinceLastMove >= timings.nbFrameBeforNextMove) {
        timings[chainMoveName] ++ ;
        tetro.unplot(grid)
        canMove = callBackMove() ;
        console.log(canMove)
        tetro.plot(grid)
        if(canMove) {
            timings.nbFrameSinceReachFloor = 0 ;
            timings.nbFrameSinceLastMove = timings[chainMoveName] > 1 ? 8 : 0 ;
            canFall = true ;
            timings[chainMoveName] ++ ;
        } else {
            canMove = true ;
            timings[chainMoveName] = 0 ;
        } 
    } else {
        if(!key[KeyArrowName]) {
            timings[chainMoveName] = 0
        }
    }
}

const accelerate = () => {
    if(canFall) {
        if (key.ArrowDown) {
            timings.nbFrameBeforeNextFall = 2 ;
        } else {
            timings.nbFrameBeforeNextFall = timings.nbFrameBeforeNextFallLevel ;
        }
    } else {
        if (key.ArrowDown) {
            tetroTransition()
        } 
    }

}

const game = () => {

    move("ArrowUp", "nbChainMoveRotate", () => tetro.rotate(grid)) ;
    move("ArrowLeft", "nbChainMoveLeft", () => tetro.move("l",grid)) ;
    move("ArrowRight", "nbChainMoveRight", () => tetro.move("r",grid)) ;
    accelerate() ;

    if (canFall && timings.nbFrameSinceLastFall >= timings.nbFrameBeforeNextFall) {
        tetro.unplot(grid)
        canFall = tetro.move("d", grid) ;
        tetro.plot(grid)

        timings.nbFrameSinceLastFall = 0 ;
    } else {
        canFall ? timings.nbFrameSinceLastFall++ : "" ;
    }

    if (!canFall) {
        if(timings.nbFrameSinceReachFloor < timings.nbFrameBeforNewTetro) {
            timings.nbFrameSinceReachFloor++ ;
        } else {
            tetroTransition()
        }
    } 

    timings.nbFrameSinceLastMove++ ;

    window.requestAnimationFrame(game);
}

game()

