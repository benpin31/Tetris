export class Grid {
    constructor(nCol, nRow) {
        this.nCol = nCol ;
        this.nRow = nRow ;

        const grid = [] ;
        for (let k = 0 ; k < nCol ; k++) {
            grid.push("E".repeat(nRow).split(""))
        }
        this.grid = grid ;

        const guiCells = [...document.querySelectorAll("#grid > .cell")] ;
        const guiGrid = [] ;
        for (let k = 0; k < nCol ; k++) {
            guiGrid.push(guiCells.filter(cell => cell.classList.contains("column-"+(k+1))).reverse()) ;
        }
        this.guiGrid = guiGrid ;   
    }

    getPropriety(col, row) {
        return col < this.nCol && row < this.nRow ? this.grid[col][row] : "not in grid" ;
    }

    isEmpty(col, row) {
        return this.getPropriety(col,row) === "E" || this.getPropriety(col,row) === "not in grid" ;
    }

    setPropriety(col, row, value) {
        col < this.nCol && row < this.nRow ? this.grid[col][row] = value : "" ;
    }

    addClasses(col, row, classeName) {
        col < this.nCol && row < this.nRow ? this.guiGrid[col][row].classList.add(classeName) : "" ;
    }

    removeClasses(col, row, classeName) {
        col < this.nCol && row < this.nRow ? this.guiGrid[col][row].classList.remove(classeName) : "" ;
    }
}