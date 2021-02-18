//  Tetrominos.js contains all the classes which model tetrominos.
//  There is 3 principal classes : 
//  - polyomino, the principal solve the problem of all polyyomino (no matter the number of there square). 
//  - tetromino extends the previous classe for the 4-polyominos : the tetrominos
//  - TetrominosBag is used to choose randomly tetrominos

export class Polyomino {
    constructor(form, position, positionNext,  rotation, rotationNext, name) {
        this.name = name ;

        this.form = form ;
        // form is an array of corrdinates [Abs, ord] given in a spacial system whose (0,0) is the rotation point of the tetrominos.
        // The coordinates are the center of the square composent of the tetromino. 
        // Tetromninos egdes length is one, so because of the possible rotations, the coordinates are :
        //  - integers l : in that case, the tetromino rotation point is the center of a square
        //  - half integer : in that case, the tetromino rotation point is on an edge of the tetromino
        //  To know the position of a tetrmonino on the grid, we use its position and rotation properties.

        this.position = position ;
        // position of the center of the tetromino on the the grid game

        this.positionNext = positionNext ;
        // position of the center of the tetromino on the the next container (The game plot the tetromnios to 
        // com in a special containe on the left)

        this.rotation = rotation ;        
        // integer which code the rotation rotation of the tetromino : only four positions 0 (initial), 1, 2, 3

        this.rotationNext  = rotationNext ;
        // rotation the tetromino on the the next container (The game plot the tetromnios to 
        // com in a special containe on the left)


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
        //  return true if the the polyomino occupied only cells on the right od the left side
        return this.getOccupiedCells(rotation, position).map(pos =>  pos[0] >= 0).reduce((acc, curr) => acc && curr) 
    }

    positionRightOk(position, rotation, grid) { 
        //  return true if the the polyomino occupied only cells on the left od the left right
        return this.getOccupiedCells(rotation, position).map(pos => pos[0] < grid.nCol).reduce((acc, curr) => acc && curr) 
    }

    positionBottomOk(position, rotation, grid) { 
        //  return true if the the polyomino occupied only cells above the grid
        return this.getOccupiedCells(rotation, position).map(pos => pos[1] >= 0).reduce((acc, curr) => acc && curr)
    }

    positionOk(position,rotation, grid) {
        //  return true if the the polyomino occupied only cells in the grid
        return  this.positionLeftOk(position, rotation, grid) && 
                this.positionRightOk(position, rotation, grid) && 
                this.positionBottomOk(position, rotation, grid)
    }

    collisionOk(position, rotation, grid) {
        if(this.positionOk(position, rotation, grid)) {
            //  return true if the the polyomino occupied only cells which are not occupîed by other polyomino
            return this.getOccupiedCells(rotation, position).map(pos =>  grid.isEmpty(pos[0], pos[1])).reduce((acc, curr) => acc && curr) ;
        } else {
            return false ;
        }
    }

    isAboveGrid() {
        //  retrun true if the polyomino occupy one cell above the grid
        return this.getOccupiedCells(this.rotation, this.position).some(cell => cell[1] > 19) ;
    }

    getNextPosition(direction) {
        //  give the position of the polyiomino at time t+1 according to the position at time t
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
        //  if possible, move the polyomino. return false if the move is impossible. this information is usefull to know when 
        //  to stop the step and call a new polyomino
        const newPosition = this.getNextPosition(direction) ;

        if (this.positionOk(newPosition, this.rotation, grid) && this.collisionOk(newPosition, this.rotation, grid)) {
            this.position = newPosition ;
            return true ;
        } else {
            return false ;
        }
    }
    
    rotate(grid) {
        //  if possible, rotate the polyomino. return false if the rotate is impossible. this information is usefull to know when 
        //  to stop the step and call a new polyomino
        //  If the polyomino can't turn because of wall obstacle, we retry moving it left, right then up. It seill impossible, the 
        //  rotate is impossible
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
        //  plot the tetromino on the grid by adding to the cells the appropriate class
        this.getOccupiedCells(this.rotation, this.position).forEach(cell => {
            grid.addClasses(cell[0], cell[1], "tetro", "gui")
            grid.addClasses(cell[0], cell[1], "tetro-"+this.name, "gui")
        })
    }

    unplot(grid) {
        //  unplot the tetromino on the grid by adding to the cells the appropriate class
        this.getOccupiedCells(this.rotation, this.position).forEach(cell => {
            grid.removeClasses(cell[0], cell[1], "tetro", "gui")
            grid.removeClasses(cell[0], cell[1], "tetro-"+this.name, "gui")
        })
    }

    plotNextTetro(grid) {
        //  plot the tetromino on the next tetrnomino div by adding to the cells the appropriate class
        this.getOccupiedCells(this.rotationNext, [this.positionNext[0] , this.positionNext[1]]).forEach(cell => {
            grid.addClasses(cell[0], cell[1], "tetro", "next")
            grid.addClasses(cell[0], cell[1], "tetro-"+this.name, "next")
        })
    }

    unplotNextTetro(grid) {
        //  unplot the tetromino on the next tetrnomino div by adding to the cells the appropriate class
        this.getOccupiedCells(this.rotationNext, [this.positionNext[0] , this.positionNext[1]]).forEach(cell => {
            grid.removeClasses(cell[0], cell[1], "tetro", "next")
            grid.removeClasses(cell[0], cell[1], "tetro-"+this.name, "next")
        })
    }

    plotHoldTetro(grid) {
        //  plot the tetromino on the next hold div by adding to the cells the appropriate class
        this.getOccupiedCells(this.rotationNext, [this.positionNext[0] , this.positionNext[1]]).forEach(cell => {
            grid.addClasses(cell[0], cell[1], "tetro", "save")
            grid.addClasses(cell[0], cell[1], "tetro-"+this.name, "save")
        })
    }

    unplotHoldTetro(grid) {
        //  unplot the tetromino on the next hold div by adding to the cells the appropriate class
        this.getOccupiedCells(this.rotationNext, [this.positionNext[0] , this.positionNext[1]]).forEach(cell => {
            grid.removeClasses(cell[0], cell[1], "tetro", "save")
            grid.removeClasses(cell[0], cell[1], "tetro-"+this.name, "save")
        })
    }

    addToGrid(grid) {
        // add the tetro to the grid: it is not plooting, the grid class contain an array grid wich indicate the 
        // stat of the grid : empty or first letter of the tetromino game 
        this.getOccupiedCells(this.rotation, this.position).forEach(cell => {
            grid.setPropriety(cell[0], cell[1], this.name)
        })
        this.plot(grid)
    }

}

export class Tetromino extends Polyomino {
    //  Extend the class polynomio creating the 7 type of tetrnomino (polyomino with 4 squares)
    constructor(name) {
        switch(name) {
            case 'I' :
                super([[-3/2, 1/2], [-1/2, 1/2], [1/2, 1/2], [3/2, 1/2]], [5,20], [2,2], 0, 1, name) ;
                break ;
            case 'J':
                super([[-1,1],[-1,0], [0,0], [1,0]] , [5.5, 20.5] ,[1.5,1.5], 0, 0, name) ;
                break ;
            case 'L':
                super([[-1,0], [0,0], [1,0], [1,1]] , [5.5, 20.5] ,[1.5,1.5], 0, 0, name) ;
                break ;
            case 'O':
                super([[-1/2,1/2], [-1/2,-1/2], [1/2,-1/2], [1/2,1/2]] , [5, 21] ,[2,2], 1, 1, name) ;
                break ;    
            case 'S':
                super([[-1,0], [0,0], [0,1], [1,1]] , [5.5, 20.5] , [1.5,1.5], 0, 0, name) ;
                break ;
            case 'T':
                super([[-1,0], [0,0], [1,0], [0,1]] , [5.5, 20.5] , [1.5,1.5], 0, 0, name) ;
                break ;
            case 'Z':
                super([[-1,1], [0,1], [0,0], [1,0]] , [5.5, 20.5] , [1.5,1.5], 0, 0, name) ;
                break ;        
        }
    }

    reset() {
        //  reinitialize the tetrnominos : use when we hold a tetrnomino
        switch(this.name) {
            case 'I' :
                this.position = [5,20] ;
                break ;
            case 'J':
                this.position = [5.5, 20.5] ;
                break ;
            case 'L':
                this.position = [5.5, 20.5] ;
                break ;
            case 'O':
                this.position =  [5, 21] ;
                break ;    
            case 'S':
                this.position = [5.5, 20.5] ;
                break ;
            case 'T':
                this.position = [5.5, 20.5] ;
                break ;
            case 'Z':
                this.position = [5.5, 20.5] ;
                break ;        
        }
        this.rotation = 0 ;
    }
}

export class TetrominosBag {
    // bag od tetronmino , use to shuffle according the the follong algorithm : 
    // The Random Generator solves these problems by using a new system called bags. 
    // In a bag system, a list of pieces are put into a bag, and piece by piece are randomly 
    // picked out until it’s empty. Once the bag is empty, the pieces go back in and the process 
    // is repeated. The Random Generator has a 7-bag... or a bag filled with one of each of the 7
    // tetrominoes. Other types of bags are possible, such as a 14-bag, which includes two of each tetromino.
    //  (ref https://simon.lc/the-history-of-tetris-randomizers)



    constructor() {
        this.tetrominos =  ['I', 'J', 'L', 'O', 'S', 'T', 'Z'] ;
        this.bag = [...this.tetrominos] ;
    }

    shuffle() {
        if(this.bag.length === 0) {
            this.bag = [...this.tetrominos] ;
        }
        return new Tetromino(this.bag.splice(Math.floor(Math.random()*this.bag.length),1)[0]) ;
    }
}

