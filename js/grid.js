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

    addClasses(col, row, classeName) {
        col < this.nCol && row < this.nRow ? this.guiGrid[row][col].classList.add(classeName) : "" ;
    }

    removeClasses(col, row, classeName) {
        col < this.nCol && row < this.nRow ? this.guiGrid[row][col].classList.remove(classeName) : "" ;
    }

    getFullLines() {
        return this.grid.map(row => row.every(cell => cell !== "E")).reduce((acc, curr, index) => {curr === true ? acc.push(index) : "" ; return acc} , []) ;
    }

    clearFullLines() {
        const fullLines = this.getFullLines() ;

        for(let k = 0 ; k < this.nCol ; k++) {
            for (let l = 0 ; l < this.nRow ; l++) {
                this.removeClasses(k,l,"tetro-"+this.getPropriety(k,l))
            }
        }

        this.grid = this.grid.filter((row, index) => !fullLines.includes(index))
        for (let k = 0 ; k < fullLines.length ; k++) {
            this.grid.push("E".repeat(this.nCol).split(""))
        }

        for(let k = 0 ; k < this.nCol ; k++) {
            for (let l = 0 ; l < this.nRow ; l++) {
                this.addClasses(k,l,"tetro-"+this.getPropriety(k,l))
            }
        }

    }

}