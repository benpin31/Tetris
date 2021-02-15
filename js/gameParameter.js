// function InitTimings() {
//     this.fallings = new function () {
//         this.value = 60 ;
//         this.current = 60 ;
//         this.counter = 60 ;
//     } ;

//     this.reachFloor = new function () {
//         this.value = 60 ;
//         this.counter = 0 ;
//     }

//     this.noActionFrame = new function () {
//         this.value = 10 ;
//         this.counter = 10 ;
//         this.chainMoveCounter = new function () {
//             this.left = 0 ;
//             this.right = 0 ; 
//             this.rotate = 0 ;
//         }
//     }
// }

const InitialTimings = 
        {
            fallings: {
                value: 60,
                current: 60,
                counter: 60
            } ,
        
            reachFloor: {
                value: 60 ,
                counter: 0
            } ,
        
            noActionFrame: {
                value: 10,
                counter: 10,
                chainMoveCounter: {
                    left: 0,
                    right: 0, 
                    rotate: 0
                }
            } ,
        }

export class GameParameters {
    constructor() {
        this.timings = JSON.parse(JSON.stringify(InitialTimings)) ;

        this.level = 1 ;

        this.gameOver = false ;

        this.score = {
            total: 0,
            maxCombo: 0,
            nbSingle: 0,
            nbDouble: 0,
            nbTripple: 0,
            nbTetris: 0
        }
    }   

    reset() {
        this.timings = JSON.parse(JSON.stringify(InitialTimings)) ;

        this.gameOver = false ;

        this.score = {
            total: 0,
            maxCombo: 0,
            nbSingle: 0,
            nbDouble: 0,
            nbTripple: 0,
            nbTetris: 0
        }   
     }
}
