export class Grid {
    constructor(nCol, nRow) {
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
}