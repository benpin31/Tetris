export class Grid {
    constructor(nCol, nRow) {
        this.nCol = nCol ;
        this.nRow = nRow ;

        const grid = [] ;
        for (let k = 0 ; k < nRow ; k++) {
            grid.push("E".repeat(nCol).split(""))
        }
        this.grid = grid ;

        const guiCells = [...document.querySelectorAll("#grid > .cell")] ;
        const guiGrid = [] ;
        for (let k = 0; k < nRow ; k++) {
            guiGrid.unshift(guiCells.filter(cell => cell.classList.contains("row-"+(k+1)))) ;
        }
        this.guiGrid = guiGrid ;   

        const nextTetroCells = [...document.querySelectorAll("#next-tetro > .cell")] ;
        const nextTetroGrid = [] ;
        for (let k = 0; k < 4 ; k++) {
            nextTetroGrid.unshift(nextTetroCells.filter(cell => cell.classList.contains("row-"+(k+1)))) ;
        }
        this.nextTetroGrid = nextTetroGrid ;   

        const saveTetroCells = [...document.querySelectorAll("#save-tetro > .cell")] ;
        const saveTetroGrid = [] ;
        for (let k = 0; k < 4 ; k++) {
            saveTetroGrid.unshift(saveTetroCells.filter(cell => cell.classList.contains("row-"+(k+1)))) ;
        }
        this.saveTetroGrid = saveTetroGrid ;   
    }

    getPropriety(col, row) {
        return col < this.nCol && row < this.nRow ? this.grid[row][col] : "not in grid" ;
    }

    isEmpty(col, row) {
        return this.getPropriety(col,row) === "E" || this.getPropriety(col,row) === "not in grid" ;
    }

    setPropriety(col, row, value) {
        col < this.nCol && row < this.nRow ? this.grid[row][col] = value : "" ;
    }

    addClasses(col, row, classeName, whichGrid) {
        if(whichGrid === "gui") {
            col < this.nCol && row < this.nRow ? this.guiGrid[row][col].classList.add(classeName) : "" ;
        } else if (whichGrid === "next") {
            this.nextTetroGrid[row][col].classList.add(classeName)
        } else if (whichGrid === "save") {
            this.saveTetroGrid[row][col].classList.add(classeName)
        }
    }

    removeClasses(col, row, classeName, whichGrid) {
        if(whichGrid === "gui") {
            col < this.nCol && row < this.nRow ? this.guiGrid[row][col].classList.remove(classeName) : "" ;
        } else if (whichGrid === "next") {
            this.nextTetroGrid[row][col].classList.remove(classeName)
        } else if (whichGrid === "save") {
            this.saveTetroGrid[row][col].classList.remove(classeName)
        }
    }

    getFullLines() {
        return this.grid.map(row => row.every(cell => cell !== "E")).reduce((acc, curr, index) => {curr === true ? acc.push(index) : "" ; return acc} , []) ;
    }

    clearGrid(lines) {

        for(let k = 0 ; k < this.nCol ; k++) {
            for (let l = 0 ; l < this.nRow ; l++) {
                this.removeClasses(k,l,"tetro-"+this.getPropriety(k,l), "gui")
            }
        }

        this.grid = this.grid.filter((row, index) => !lines.includes(index))
        for (let k = 0 ; k < lines.length ; k++) {
            this.grid.push("E".repeat(this.nCol).split(""))
        }

        for(let k = 0 ; k < this.nCol ; k++) {
            for (let l = 0 ; l < this.nRow ; l++) {
                this.addClasses(k,l,"tetro-"+this.getPropriety(k,l), "gui")
            }
        }

    }

}