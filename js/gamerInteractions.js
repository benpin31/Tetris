//  gamerInteraction contains the classes and methode usefull for the gamer interaction with the game.
//  It essentially contains methods for  listeners

export class GamerAction {
    constructor() {
        //  instance of object GamerAction consists in :
        //   - key which model the interaction with a key bord
        //   - swipe which model interaction with the screen
        //   - touchMoveObject (incredibly bad name) which precise some parameters for swipe
        //   - actions which model the actions the gamer can do

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

        this.touchMoveObject = {
            threshold: {
                default: 100,
                grid: document.querySelector("#grid").offsetWidth/10
            }, 
            // lastStart: Date.now(),
            maintainInterval: 0,
            maintainCounter: 0,
            hasSwipe: false
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

    updateKey(event) {
        // in handler : update key there is an interaction with a key
        this.key[event.code] = event.type === "keydown" ;
    }

    updateSwipe(name, isSwipe) {
        // in handler : update swipe
        this.swipe[name] = isSwipe ;
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

    pressKey(event, param, game, theme, nextTetro, grid) {
        //  handler for keyboard press
        this.updateKey(event) ;
        this.updateActions() ;
            // when a key is pressed : update key and associated actions

        if (!param.hasStarted && event.code === "Space") {
            // special case for a space press if the game has not started yet : it launch is
            param.hasStarted = true ;
            nextTetro.plotNextTetro(grid)
            game() ;
            document.querySelector("#home-page").classList.add("is-not-visible")
            theme.play()
        }
    }

    deletePressKey(event) {
        // handler for "keyup" advance listener
        this.updateKey(event) ;
        this.updateActions()
    }

    touchStart(event, param) {
        //  handler for touchstart listener (when a user put a finger on the screen)
        if (param.hasStarted) {
            // only when the game has been launch
    
            this.touchMoveObject.maintainCounter++ ;
            this.touchMoveObject.maintainInterval = setInterval(
                () => {
                    if (this.touchMoveObject.maintainCounter >= 1) {
                        this.touchMoveObject.hasSwipe = true ;
                        this.updateSwipe("maintain",true, this.updateActions(event))
                    }
            }
            , 200)
            // when we touch the screen : a setInterval is launched and stop only when we remove the finger (touchend event).
            // it is used to identify when the player maintain his/her fincger on the screen.
            // if the player remove his/her finger, a cleartimout is launch and touchMoveObject.hasSwipe stay false which means
            // that the touch was a click, and not a "maintain". In the other case, this parameter become true and the swipe object is updated 
        
            this.touchMoveObject["xStart"] = event.changedTouches[0].pageX ;
            this.touchMoveObject["yStart"] = event.changedTouches[0].pageY ;
            // when first touch, we save the coordinate of the touch to compute move when there is a swipe
        
            // this.touchMoveObject.lastStart = Date.now() ;
            // used when there were a double touch
        }
    }

    touchMove(event, param) {
        // handler for touch move.
        
        event.preventDefault()
        this.touchMoveObject.hasSwipe = true ;
            // indcate that the touch is not just a click

        if (param.hasStarted) {
            // only when the game has been launch
    
            clearInterval(this.touchMoveObject.maintainInterval) ;
            this.updateSwipe("maintain", false)  ;
                // remove the interval for maintain : it is not a maintain but a swipe

            this.touchMoveObject["xCurrent"] = event.changedTouches[0].pageX ;
            this.touchMoveObject["yCurrent"] = event.changedTouches[0].pageY ;
                // get new corrdinate of the fincer
        
            this.updateSwipe("swipeUp", this.touchMoveObject["yCurrent"] - this.touchMoveObject["yStart"] < -this.touchMoveObject.threshold.default)  ;
            this.updateSwipe("swipeLeft", this.touchMoveObject["xCurrent"] - this.touchMoveObject["xStart"] < -this.touchMoveObject.threshold.grid)  ;
            this.updateSwipe("swipeRight", this.touchMoveObject["xCurrent"] - this.touchMoveObject["xStart"] > this.touchMoveObject.threshold.grid)  ;
                // using this.touchMoveObject["y/xStart"], we compute if the finger move more than a given distance. In that case, that 
                //  mean thta there is  a true swipe
    
            if(this.touchMoveObject["xCurrent"] - this.touchMoveObject["xStart"] > this.touchMoveObject.threshold.grid) {
                this.touchMoveObject["xStart"] += this.touchMoveObject.threshold.grid
            }
    
            if(this.touchMoveObject["xCurrent"] - this.touchMoveObject["xStart"] < -this.touchMoveObject.threshold.grid) {
                this.touchMoveObject["xStart"] -= this.touchMoveObject.threshold.grid 
            }
            //  to chain the swipe, we modify the starting point for distance computation

            this.updateActions() ;
            //  update actions dues to the swipe

        }

    }

    touchEnd(event, param, game, theme, nextTetro, grid) { 
        // handler for touch move.
        event.preventDefault()

        this.updateSwipe("touch", !this.touchMoveObject.hasSwipe)
            //  if the touch was noit a swipe, then is is true, else false
        this.updateSwipe("maintain",false)
        this.updateSwipe("swipeUp",false)
        this.updateSwipe("swipeRight",false)
        this.updateSwipe("swipeLeft",false)
            // end of the touch, all swipe are finihed

        this.updateActions(event) ;
            // update action corresponding to the swipe
    
        clearInterval(this.touchMoveObject.maintainInterval)
        this.touchMoveObject.maintainCounter = 0 ;
            // clear interval of the maintain : if before the 200ms, the touch will be consider as a click
    
        if (!param.hasStarted && !this.touchMoveObject.hasSwipe) {
            // special case for a space press if the game has not started yet : it launch is
            param.hasStarted = true ;
            game() ;
            document.querySelector("#home-page").classList.add("is-not-visible")
            nextTetro.plotNextTetro(grid)
            theme.play()
        }
    
        if (param.gameOver && param.gameOverCounter > 120) {
            // the user can't restart immadiatly if win : en let 2 seconds (the frame rate of the game is 60fps)
            this.actions.restart = true ;
        }
    
        this.touchMoveObject.hasSwipe = false ;

        // return true
    }






}