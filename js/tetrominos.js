export class Polyomino {
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
        return this.getOccupiedCells(rotation, position).map(pos => pos[0] < grid.nCol).reduce((acc, curr) => acc && curr) 
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
            return this.getOccupiedCells(rotation, position).map(pos =>  grid.isEmpty(pos[0], pos[1])).reduce((acc, curr) => acc && curr) ;
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
            grid.addClasses(cell[0], cell[1], "tetro-"+this.name)
        })
    }

    unplot(grid) {
        this.getOccupiedCells(this.rotation, this.position).forEach(cell => {
            grid.removeClasses(cell[0], cell[1], "tetro-"+this.name)
        })
    }

    addToGrid(grid) {
        this.getOccupiedCells(this.rotation, this.position).forEach(cell => {
            grid.setPropriety(cell[0], cell[1], this.name)
        })
        this.plot(grid)
    }

}

export class Tetromino extends Polyomino {
    constructor(name) {
        switch(name) {
            case 'I' :
                super([[-3/2, 1/2], [-1/2, 1/2], [1/2, 1/2], [3/2, 1/2]], [5,20], 0, name) ;
                break ;
            case 'J':
                super([[-1,1],[-1,0], [0,0], [1,0]] , [4.5, 20.5] , 0, name) ;
                break ;
            case 'L':
                super([[-1,0], [0,0], [1,0], [1,1]] , [4.5, 20.5] , 0, name) ;
                break ;
            case 'O':
                super([[-1/2,1/2], [-1/2,-1/2], [1/2,-1/2], [1/2,1/2]] , [5, 21] , 0, name) ;
                break ;    
            case 'S':
                super([[-1,0], [0,0], [0,1], [1,1]] , [4.5, 20.5] , 0, name) ;
                break ;
            case 'T':
                super([[-1,0], [0,0], [1,0], [0,1]] , [4.5, 20.5] , 0, name) ;
                break ;
            case 'Z':
                super([[-1,1], [0,1], [0,0], [1,0]] , [4.5, 20.5] , 0, name) ;
                break ;        
        }
    }
}

export const generateRandomTetro = () => {
    const tetroList = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'] ;
    return new Tetromino(tetroList[Math.floor(Math.random() * tetroList.length)])
}