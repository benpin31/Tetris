export class GamerAction {
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

        this.touchMoveObject = {
            threshold: {
                default: 100,
                grid: document.querySelector("#grid").offsetWidth/10
            }, 
            lastStart: Date.now(),
            maintainInterval: 0,
            maintainCounter: 0,
            hasSwipe: false
        }

    }

    pressKey(event, param, game, theme) {
        this.updateKey(event) ;
        this.updateActions() ;

        if (!param.hasStarted && event.code === "Space") {
            param.hasStarted = true ;
            game() ;
            document.querySelector("#home-page").classList.add("is-not-visible")
            theme.play()
        }
    }

    deletePressKey(event) {
        this.updateKey(event) ;
        this.updateActions()
    }

    touchStart(event, param) {

        if (param.hasStarted) {
    
            this.touchMoveObject.maintainCounter++ ;
            this.touchMoveObject.maintainInterval = setInterval(
                () => {
                    if (this.touchMoveObject.maintainCounter >= 1) {
                        this.touchMoveObject.hasSwipe = true ;
                        this.updateSwipe("maintain",true, this.updateActions(event))
                    }
            }
            , 200)
        
            this.touchMoveObject["xStart"] = event.changedTouches[0].pageX ;
            this.touchMoveObject["yStart"] = event.changedTouches[0].pageY ;
        
            this.touchMoveObject.lastStart = Date.now() ;
        }
    }

    touchMove(event, param) {
        
        // event.preventDefault()
        this.touchMoveObject.hasSwipe = true ;

        if (param.hasStarted) {
    
            clearInterval(this.touchMoveObject.maintainInterval) ;
            this.updateSwipe("maintain", false)  ;

            this.touchMoveObject["xCurrent"] = event.changedTouches[0].pageX ;
            this.touchMoveObject["yCurrent"] = event.changedTouches[0].pageY ;
        
            this.updateSwipe("swipeUp", this.touchMoveObject["yCurrent"] - this.touchMoveObject["yStart"] < -this.touchMoveObject.threshold.default)  ;
            this.updateSwipe("swipeLeft", this.touchMoveObject["xCurrent"] - this.touchMoveObject["xStart"] < -this.touchMoveObject.threshold.grid)  ;
            this.updateSwipe("swipeRight", this.touchMoveObject["xCurrent"] - this.touchMoveObject["xStart"] > this.touchMoveObject.threshold.grid)  ;
    
    
            if(this.touchMoveObject["xCurrent"] - this.touchMoveObject["xStart"] > this.touchMoveObject.threshold.grid) {
                this.touchMoveObject["xStart"] += this.touchMoveObject.threshold.grid //this.touchMoveObject["xCurrent"]
            }
    
            if(this.touchMoveObject["xCurrent"] - this.touchMoveObject["xStart"] < -this.touchMoveObject.threshold.grid) {
                this.touchMoveObject["xStart"] -= this.touchMoveObject.threshold.grid //this.touchMoveObject["xStart"] = this.touchMoveObject["xCurrent"]
            }

            this.updateActions() ;

        }


    
    }

    touchEnd(event, param, game, theme) {   
        this.updateSwipe("touch", !this.touchMoveObject.hasSwipe)
        this.updateSwipe("maintain",false)
        this.updateSwipe("swipeUp",false)
        this.updateSwipe("swipeRight",false)
        this.updateSwipe("swipeLeft",false)
    
        this.updateActions(event) ;
    
        clearInterval(this.touchMoveObject.maintainInterval)
        this.touchMoveObject.maintainCounter = 0 ;
    
        if (!param.hasStarted && !this.touchMoveObject.hasSwipe) {
            param.hasStarted = true ;
            game() ;
            document.querySelector("#home-page").classList.add("is-not-visible")
            theme.play()
        }
    
        if (param.gameOver && param.gameOverCounter > 120) {
            this.actions.restart = true ;
        }
    
        this.touchMoveObject.hasSwipe = false ;

        return true
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