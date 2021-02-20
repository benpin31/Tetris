//  main.js contains the principal function of the games. it aggregate classes and methods of grid.js, tetrmonios.js, gameParameter.js
//  and gameInteraction.js to create the game experience.

//  -----------------------------------------------------
//  Create principal objects and contants
//  -----------------------------------------------------

    //  Import classes and create instance

import {Grid} from "./grid.js"
import {TetrominosBag} from "./tetrominos.js"
import {GameParameters} from "./gameParameter.js"
import {GamerAction} from "./gamerInteractions.js"
import {Sounds} from "./sound.js"
import {BestScore} from "./bestScore.js"

const param = new GameParameters() ;
const grid = new Grid(10,20);
const tetrominos = new TetrominosBag()
const gamerAction = new GamerAction() ;
const sounds = new Sounds() ;
const bestScore = new BestScore() ;

    //  Create music and sounds objects

const theme = sounds.theme; 
theme.loop = true ;
const explodeSound = sounds.explodeSound; 
const fallSound = sounds.fallSound; 
const gameOverSound = sounds.gameOverSound; 
const holdSound = sounds.holdSound

    //  Update the best score HTML block

bestScore.updateBestScore()

    //  Create tetrominos.
    //  there is only three tetrminos object during the games whose values are replace when a new tetromino arrive.
    //  The three tetrominos are the current and the next tetrominos and the hold tetrominos.
    //  I initiate them at this place in the code, it could have been done when the player start the game
let tetro = tetrominos.shuffle() ;
let nextTetro = tetrominos.shuffle() ;
let tetroHold ;
    // currently, no tetrmonios are hold

let hasFall = true ;
let hasMove  ;
    //  the previous variables will be used to save the fact that a move (left, right or rotate) or a fall have been done.


//  --------------------------------------------------------
//  Principal function of the game. 
//
//  Those functions the user actions and their consequences on the game
//  --------------------------------------------------------

    // Game chronology

const restart = () => {
    // restart is yse to to only start the game the first time :')
    grid.clearGrid([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]) // clear the grid
    param.reset() ; // reset all parameter
    param.plotScore() ; //after reset the parameeter we need yo replot the score to 0,0
    hasFall = true ; // if hasFall is false, the game will launch the next tetrmoninos or game over. So for the first move, th default value is true 
    document.querySelector("#game-over-message").classList.add("is-not-visible") // remove game over message (in the case of a "true" restart)
    gameOverSound.pause() ; // stop the game over soud if not already done
    theme.currentTime = 0 ;
    theme.play() ;
        // replay the theme from the begning
    gamerAction.actions.restart = false ;
        // gamerAction.actions.restart is indicating that the player has done the action restart. Now it's done, the parameter is reset to false ;
}

const nextStep = () => {
    //  here is what happen when a tetro can't move anymore
    if(!tetro.isAboveGrid()) {
        // if tetro is not above grid, it is not game over
        hasFall = true ;
            // the new tetro can fall
        tetro.addToGrid(grid) ;
            // one fixed the current tetro on the gris
        nextTetro.unplotNextTetro(grid)
            // unplot the next tetro from the next grid

        tetro = nextTetro ;
        nextTetro = tetrominos.shuffle() ;
            // create new pair of tetro/nextTetro

        nextTetro.plotNextTetro(grid)
        // plot the next tetro in nextTetro grid. no need to plot new current tetro because it will be done in the next frame of game function

        param.timings.reachFloor.counter = 0 ;
        param.timings.fallings.counter = 0 ;
        param.tetroHoldCounter = 0 ;
            // rest necessary counter

        let fullLines = grid.getFullLines() ;
        if(fullLines.length > 0) {
            //  if full lines exists, exploed them
            explodeSound.currentTime = 0
            explodeSound.play() ;
        } else {
            //  let let just the tetro fall
            fallSound.currentTime = 0
            fallSound.play() ;
        }   
            // that could be in clearGrid method of Grid class

        param.updateScore(fullLines) ;
            // update score
        grid.clearGrid(fullLines) ;
            // clear grid with new parameters

    } else {
        param.gameOver = true ;
        theme.pause() ;
            // cut off the musique
        document.querySelector("#game-over-message").classList.remove("is-not-visible")
            // print game over screen
        document.querySelector("#player-name").focus() ;
            // focus on the input to enter name
        gameOverSound.currentTime = 0
        gameOverSound.play() ;
            // play gameover sound
    }
}


const gameOver = () => {

    param.gameOverCounter ++ ;
        //  game over counter if used to avoid the player to retsart the gam les than 2 seconds afeter game over. then hanfder to restart
        //  it is take into account only when this parameter is > 120 (the game is in 60fps)
    if(gamerAction.actions.restart) {
        bestScore.saveScore(param) ;
        restart() ;
    }
}

    // player Moves

const gamerMove = name => {
    //  manage move generate by keyboard event ! moves generate by touchevent are in the function gamerSwipeAction

    let moveFunction ;
    switch(name) {
        case "rotate":
            moveFunction = () => tetro.rotate(grid) ;
            break ;
        case "goLeft":
            moveFunction = () => tetro.move("l",grid) ;
            break ;
        case "goRight":
            moveFunction = () => tetro.move("r",grid) ;
    }
    //  Choose the move type according to the name

    if(gamerAction.actions[name] && param.timings.noActionFrame.counter >= param.timings.noActionFrame.value) {
        //  gamerAction.actions[name] = the player have triggered the move
        //  param.timings.noActionFrame.counter >= param.timings.noActionFrame.value : the number of frame 
        //  since last move is enought large so that the move is taken ointo account. It is necessary because without that the game 
        //  wouldn't be playable : because it's in 60 gps, it the player pres a key, it will stay more than one fps (unless he is no human)
        //  so the moves will chain at this speed which is unplayable
        tetro.unplot(grid)
        hasMove = moveFunction() ;
        tetro.plot(grid)
            // unplot tetro, move it if possible, the plot the new version of the tetro

        if(hasMove) {
            // if the tetro has managed to move
            hasFall = true ;
            // if the tetro rach the floor but we manage to move, we reset hasFall ha true because the tetro could now be in
            // a situation where it can fall.

            param.timings.reachFloor.counter = 0 ;
            // when the tero reach the floor : this counter is triggerd. if it's > param.timings.reachFloor.value, then the next step is triggerd.
            // but if the player manage to move, to counter is reset to 0 : like that the player have time to replace the tetro which is
            //  usefull when the speed id fast

            param.timings.noActionFrame.counter = 
                param.timings.noActionFrame.chainMoveCounter[name] === 0 ? 0 : 
                name === "rotate" ? 3 : 8 ;
                // count then nupmber of chaining moves. If 0, the next move is possible in 10 frame, else, we set the counter
                // of chain move to 8 for latteral maves, or 3 for rotate, to accelerate the moves when the player keep the key press
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

const gamerSwipeAction = name => {
    //  manage move generate by keyboard event ! moves generate by touchevent are in the function gamerSwipeAction
    if(name === "left") {
        if(gamerAction.actions.goLeftSwipe > 0) {
            tetro.unplot(grid)
            hasMove = tetro.move("l",grid) ;
            tetro.plot(grid)
            gamerAction.actions.goLeftSwipe--  ;
            //  each time the player move his/her finger with a distance a gridwidth/10, gamerAction.actions.goLeftSwipe is 
            //  increment of 1 saying that there is one move left more to do. Each time this move is done, there is one less 
            //  gamerAction.updateSwipe("swipeLeft", false) (see gamerInteraction) updateActionsmethod for more details
            // gamerAction.updateActions() ;

            if (hasMove) {
                hasFall = true ;
                // ad in gamerMove function
            } else {
                gamerAction.actions.goLeftSwipe = 0 ;
            }
        }
    } 

    if (name === "right") {
        if(gamerAction.actions.goRightSwipe  > 0) {

            tetro.unplot(grid)
            hasMove = tetro.move("r",grid) ;
            tetro.plot(grid)
            gamerAction.actions.goRightSwipe = 0 ;

            if (hasMove) {
                hasFall = true ;
            } else {
                gamerAction.actions.goRightSwipe = 0 ;
            }
        }
    }

    if (name === "rotate") {
        if(gamerAction.actions.rotateSwipe) {
            tetro.unplot(grid)
            hasMove = tetro.rotate(grid) ;
            tetro.plot(grid)     
            
            if (hasMove) {
                hasFall = true ;
            }

            gamerAction.updateSwipe("touch", false)
            // retate is declenche by a touch event which is triggered when touchEnd. Once the rotate has been done, the action is finished
            gamerAction.updateActions() ;
        }
    }

}

const accelerate = () => {
    if (hasFall) {
        // if the tetromino can fall, then accelerate
        if (gamerAction.actions.accelerate) {
            param.timings.fallings.current = 2 ;
            // icrese speed
        } else {
            param.timings.fallings.current = param.timings.fallings.value ;
            // icrese speed
        }
    } else {
        //  transaction between two stemp last param.timings.reachFloor.value. If the tetromino can't fall, accelerate it triggered immedialty nextStep
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

        hasFall = true ;

        if(!tetroHold) {
            // if fisrt hold for a tetro : the current tetro become the nextTetro, a nexw nexttetro is generated and the current tetro is hold 
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
            // in that case, hold an current tetro are interverted 
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

    //  game chronology





const game = () => {
    // The game is in 60fps, manage by a recusrive window.requestAnimationFrame at the end of the function.
    // Each frame, the game check for player inputs and act in consquence

    if(!param.pause) {
        // if pause, nothing happen
        if (!param.gameOver) {
            // when no game over

            gamerMove("rotate") ;
            gamerMove("goLeft") ;
            gamerMove("goRight") ;
    
            gamerSwipeAction("left") ;
            gamerSwipeAction("right") ;
            gamerSwipeAction("rotate") ;
    
            accelerate() ;
            holdTetro() ;
                // check all player inputs
    
            param.timings.noActionFrame.counter++ ;
                // each frame, the counter is incrrease so that if next frame, it is above param.timings.noActionFrame.value, the previosu actions
                // will be triggered
    
            if(hasFall) {
                // if the tetro managed to fall on previous fall
                if (param.timings.fallings.counter >= param.timings.fallings.current) {
                    // if the fall counter frame is above its trhshold, it means that the frame is a falling frames. The tetro don't fall
                    // the others frames. param.timings.fallings.current is decrease depending of the level so that the game acclerate
                    tetro.unplot(grid)
                    hasFall = tetro.move("d", grid) ;
                    tetro.plot(grid)
                    // try to move the tetro : if impossible, has fall become false
        
                    param.timings.fallings.counter = 0 ;
                    //reput the falling counter to 0
                } else {
                    param.timings.fallings.counter++ ;
                }
            } else {
                if(param.timings.reachFloor.counter < param.timings.reachFloor.value) {
                    // if the tetro can' fall, the there is param.timings.reachFloor.value frames before next step. during
                    // thuis time interval the player can try to move the tetro. Each time the tetro can move, 
                    // param.timings.reachFloor.counter is set to 0 so that the player can have as time as he wan't to choose the final position 
                    // (of course if the move succed)
                    param.timings.reachFloor.counter++ ;
                } else {
                    // when the crhono is finihed, it's next step
                    nextStep() ;
                }
            }
    
        } else {
            gameOver()
         }
    }


    window.requestAnimationFrame(game)
}

//  -------------------------------------------------
//  add eventListeners
//  -------------------------------------------------

document.addEventListener("keydown", event => gamerAction.pressKey(event, param, game, theme, nextTetro, grid))
document.addEventListener("keyup", event => gamerAction.deletePressKey(event))
document.querySelector("#grid").addEventListener("touchstart", event => gamerAction.touchStart(event, param));
document.querySelector("#grid").addEventListener("touchmove", event =>gamerAction.touchMove(event, param));
document.querySelector("#grid").addEventListener("touchend", event => gamerAction.touchEnd(event, param, game, theme, nextTetro, grid));
document.querySelector("#best-score").onclick = () => gamerAction.plotScore(param) ;
document.querySelector("#simplified-best-score").onclick = () => gamerAction.plotScore(param) ;





