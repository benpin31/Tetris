//  grid.js contains all classes and methods link to the grids of the games :
//  - the grid chere the game takes place
//  - the two little grid for hold and next tetro

export class Grid {
    constructor(nCol, nRow) {
        //  The principal grid is devided in two propertie :
        //  the first is a matrix which contains string information : E for empty, and I, J, L, O, S, T, Z (name of the tetromino)
        //  if a tetromino occupied the cell. Be carreful : only tetrominos which have been stoped are addiing to the grid. The current
        //  falling tetrmonos stay outside. Tha,nks to that, one don't have to do any modification each time the tetrominos is moving.
        //  The grid is essentially usefull to detect collision an save what can of tetrominos stoped in a cell to have the good class color
        //  in html.
        //  One add another grid link to the previous : each of its cells are the nodeLiost which represent the cell of row k, column l
        //  of the hmtl grid. Thanks to that, if we want to modify the html grid, we just have to work using this other grid, and not
        //  redo every time queryselectors.

        this.nCol = nCol ;
        this.nRow = nRow ;
        //  grid size : actually, always 10 and 20

        const grid = [] ;
        for (let k = 0 ; k < nRow ; k++) {
            grid.push("E".repeat(nCol).split(""))
        }
        this.grid = grid ;
        //  "JS model" of the grid

        const guiCells = [...document.querySelectorAll("#grid > .cell")] ;
        const guiGrid = [] ;
        for (let k = 0; k < nRow ; k++) {
            guiGrid.unshift(guiCells.filter(cell => cell.classList.contains("row-"+(k+1)))) ;
        }
        this.guiGrid = guiGrid ;   
        //  "DOM model" of the grid

        //  In the graphical interface, there is two other grids use to plot the next tetrominos and the hold one.
        //  because there is no move fo tetrominos in thos grids, one jut have to create a "DOM model" for them
        const nextTetroCells = [...document.querySelectorAll("#next-tetro > .cell")] ;
        const nextTetroGrid = [] ;
        for (let k = 0; k < 4 ; k++) {
            nextTetroGrid.unshift(nextTetroCells.filter(cell => cell.classList.contains("row-"+(k+1)))) ;
        }
        this.nextTetroGrid = nextTetroGrid ;   

        const saveTetroCells = [...document.querySelectorAll("#hold-tetro > .cell")] ;
        const saveTetroGrid = [] ;
        for (let k = 0; k < 4 ; k++) {
            saveTetroGrid.unshift(saveTetroCells.filter(cell => cell.classList.contains("row-"+(k+1)))) ;
        }
        this.saveTetroGrid = saveTetroGrid ;   
    }

    getPropriety(col, row) {
        //  return the value of the cell (row, col) of the "JS grid"
        return col < this.nCol && row < this.nRow ? this.grid[row][col] : "not in grid" ;
    }

    isEmpty(col, row) {
        //  return true if the cell (row, col is empty)
        return this.getPropriety(col,row) === "E" || this.getPropriety(col,row) === "not in grid" ;
    }

    setPropriety(col, row, value) {
        //  add one of the value I, J, L, O, S, T, Z toe the JS grid 
        col < this.nCol && row < this.nRow ? this.grid[row][col] = value : "" ;
    }

    addClasses(col, row, classeName, whichGrid) {
        //  Add class className to the "DOM grid" whichGrid
        if(whichGrid === "gui") {
            col < this.nCol && row < this.nRow ? this.guiGrid[row][col].classList.add(classeName) : "" ;
        } else if (whichGrid === "next") {
            this.nextTetroGrid[row][col].classList.add(classeName)
        } else if (whichGrid === "save") {
            this.saveTetroGrid[row][col].classList.add(classeName)
        }
    }

    removeClasses(col, row, classeName, whichGrid) {
        //  remove class className to the "DOM grid" whichGrid
        if(whichGrid === "gui") {
            col < this.nCol && row < this.nRow ? this.guiGrid[row][col].classList.remove(classeName) : "" ;
        } else if (whichGrid === "next") {
            this.nextTetroGrid[row][col].classList.remove(classeName)
        } else if (whichGrid === "save") {
            this.saveTetroGrid[row][col].classList.remove(classeName)
        }
    }

    getFullLines() {
        // return the set of full line (all the row have cells !== E) of the grid
        return this.grid.map(row => row.every(cell => cell !== "E")).reduce((acc, curr, index) => {curr === true ? acc.push(index) : "" ; return acc} , []) ;
    }

    clearGrid(lines) {
        // at the end of the turn, update the grid, by removing the array of line which have been destroyed. lines is 
        // an array of number which give the index of thos lines 

        for(let k = 0 ; k < this.nCol ; k++) {
            for (let l = 0 ; l < this.nRow ; l++) {
                this.removeClasses(k,l,"tetro-"+this.getPropriety(k,l), "gui")
                this.removeClasses(k,l, "tetro", "gui")
            }
        }
        //  remove all classes of the "DOM grid"

        for (let k = 0 ; k < this.nRow ; k++) {
            for (let l = 0 ; l < this.nCol ; l++) {
                if(lines.includes(k)) {
                    this.addClasses(l,k,"destruct", "gui")
                }
            }
        }
        //  add explosion classe to the lines given in paramters

        setTimeout(() => {
            for (let k = 0 ; k < this.nRow ; k++) {
                for (let l = 0 ; l < this.nCol ; l++) {
                    if(lines.includes(k)) {
                        this.removeClasses(l,k,"destruct", "gui")
                    }
                }
            }
        }, 300)
        //  remove those explosion classe aftere 300ms

        this.grid = this.grid.filter((row, index) => !lines.includes(index))
        for (let k = 0 ; k < lines.length ; k++) {
            this.grid.push("E".repeat(this.nCol).split(""))
        }
        // remove the destroyed lines of the "JS lines", then add new fresh empty lines at the begining of the grid

        for(let k = 0 ; k < this.nCol ; k++) {
            for (let l = 0 ; l < this.nRow ; l++) {
                if(this.getPropriety(k,l) !== "E") {
                    this.addClasses(k,l,"tetro-"+this.getPropriety(k,l), "gui")
                    this.addClasses(k,l,"tetro", "gui")
                }
            }
        }
        //  reput classes to the DOM grid unsing the new "JS grid"


    }

}