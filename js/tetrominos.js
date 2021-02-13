import {Grid} from "./grid.js"

export class Tetrominos {
    constructor(form, position, rotation, name) {
        this.form = form ;
        // form is an array of corrdinates [Abs, ord] given in a spacial system whose (0,0) is the rotation point of the tetrominos.
        // The coordinates are the center of the square composent of the tetromino. 
        // Tetromninos egdes length is one, so because of the possible rotations, the coordinates are :
        //  - integers l : in that case, the tetromino rotation point is the center of a square
        //  - half integer : in that case, the tetromino rotation point is on an edge of the tetromino
        this.position = position ;
        // position of the center of the tetromino On the the grid game
        this.rotation = rotation ;
        // integer which code the rotation rotation of the tetromino : only four positions 0 (initial), 1, 2, 3
        this.name = name ;
    }

    getRotatedPosition(rotation) {
        // return the coordinates of the tetromino in the spacial system center on the rotation point of the tetromino according to
        // this.rotation value

        const r = [Math.cos(rotation * Math.PI/2), Math.sin(rotation * Math.PI/2)]
        return this.form.map(square => [Number((r[0]*square[0] - r[1]*square[1]).toFixed(1)) , Number((r[0]*square[1] + r[1]*square[0]).toFixed(1))])
    }

    getOccupiedCells(rotation, position) {
        // return and array of array of integers which are the col and row number occupied by a tetromino :
        return this.getRotatedPosition(rotation).map(square => [Math.floor(square[0] + position[0]), Math.floor(square[1] + position[1])])
    }

    positionLeftOk(position, rotation, grid) {  
        return this.getOccupiedCells(rotation, position).map(pos =>  pos[0] >= 0).reduce((acc, curr) => acc && curr) 
    }
    positionRightOk(position, rotation, grid) { 
        return this.getOccupiedCells(rotation, position).map(pos => pos[0] < grid.grid.length).reduce((acc, curr) => acc && curr) 
    }
    positionBottomOk(position, rotation, grid) { 
        return this.getOccupiedCells(rotation, position).map(pos => pos[1] >= 0).reduce((acc, curr) => acc && curr)
     }
    positionOk(position,rotation, grid) {
        return  this.positionLeftOk(position, rotation, grid) && 
                this.positionRightOk(position, rotation, grid) && 
                this.positionBottomOk(position, rotation, grid)
    }

    collisionOk(position, rotation, grid) {
        if(this.positionOk(position, rotation, grid)) {
            return this.getOccupiedCells(rotation, position).map(pos =>  grid.grid[pos[0]][pos[1]] === "E").reduce((acc, curr) => acc && curr) ;
        } else {
            return false ;
        }
    }

    getNextPosition(direction) {
        if (direction === "l") {
            return [this.position[0]-1 , this.position[1]] ;
        } else if (direction === "r") {
            return [this.position[0]+1 , this.position[1]] ;
        } else if (direction === "d") {
            return [this.position[0], this.position[1]-1] ;
        } else if (direction === "u") {
            return [this.position[0], this.position[1]+1] ;
        }
    }

    move(direction, grid) {
        const newPosition = this.getNextPosition(direction) ;

        if (this.positionOk(newPosition, this.rotation, grid) && this.collisionOk(newPosition, this.rotation, grid)) {
            this.position = newPosition ;
            return true ;
        } else {
            return false ;
        }
    }
    
    rotate(grid) {
        const newRotation = (this.rotation+1)%4 ;

        if (this.positionOk(this.position, newRotation, grid)) {
            if (this.collisionOk(this.position, newRotation, grid)) {
                this.rotation = newRotation ;
                return true ;
            }
        } else {
            if (this.positionOk(this.getNextPosition("l"), newRotation, grid)) {
                if (this.collisionOk(this.getNextPosition("l"), newRotation, grid)) {
                    this.position = this.getNextPosition("l") ;                    
                    this.rotation = newRotation ;
                    return true ;
                }
            } else if (this.positionOk(this.getNextPosition("r"), newRotation, grid)) {
                if (this.collisionOk(this.getNextPosition("r"), newRotation, grid)) {
                    this.position = this.getNextPosition("r") ;
                    this.rotation = newRotation ;
                    return true ;
                }              
            } else if (this.positionOk(this.getNextPosition("u"), newRotation, grid)) {
                if (this.collisionOk(this.getNextPosition("u"), newRotation, grid)) {
                    this.position = this.getNextPosition("u") ;
                    this.rotation = newRotation ;
                }
                return true
            } 
        }
        return false ;
    }

    plot(grid) {
        this.getOccupiedCells(this.rotation, this.position).forEach(cell => {
            grid.guiGrid[cell[0]][cell[1]].classList.add("tetro-"+this.name)
        })
    }

    unplot() {
        this.getOccupiedCells(this.rotation, this.position).forEach(cell => {
            grid.guiGrid[cell[0]][cell[1]].classList.remove("tetro-"+this.name)
        })
    }

    addToGrid(grid) {
        this.getOccupiedCells(this.rotation, this.position).forEach(cell => {
            grid.grid[cell[0]][cell[1]] = this.name ;
        })
        this.plot(grid)
    }

}

export class TetroL extends Tetrominos{
    constructor() {
        super([[-1,0], [0,0], [1,0], [1,1]] , [4.5, 18.5] , 0, "L") ;
    }
}

// main

const grid = new Grid(10,20);

const tetro = new TetroL();
const tetroB = new Tetrominos([[0,0]], [6.5,4.5], 0, "J");
tetroB.addToGrid(grid)
tetro.plot(grid)



const buttonLeft = document.querySelector("#goleft") ;
buttonLeft.onclick = () => {
    tetro.unplot(grid)
    console.log(tetro.move("l", grid))
    tetro.plot(grid)
}

const buttonRight = document.querySelector("#goright") ;
buttonRight.onclick = () => {
    tetro.unplot(grid)
    console.log(tetro.move("r", grid))
    tetro.plot(grid)
}

const buttonFall = document.querySelector("#fall") ;
buttonFall.onclick = () => {
    tetro.unplot(grid)
    console.log(tetro.move("d", grid))
    tetro.plot(grid)
}

const buttonRot = document.querySelector("#rotate") ;
buttonRot.onclick = () => {
    tetro.unplot(grid)
    console.log(tetro.rotate(grid))
    tetro.plot(grid)
}

function toto() {
    let newTime = Date.now() ;
    if (tetro.position[1] > 1) {
        tetro.unplot(grid) ;
        tetro.move("d", grid) ;
        tetro.plot(grid) ;
        console.log(newTime - lastTime) ;
        lastTime = newTime ;
        setTimeout(toto, 100)
    } else if (counter < 10) {
        tetro.unplot(grid) ;
        tetro.position[1] =  18.5 ;
        console.log("-----------------")
        lastTime = Date.now() ;
        counter++
        toto()
    }

}

let lastTime = Date.now() ;
let counter = 0 ;
toto()


