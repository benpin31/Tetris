import {Grid} from "./grid.js"
import {Tetrominos, TetroL} from "./tetrominos.js"



const grid = new Grid(10,20);

const tetro = new TetroL();
const tetroB = new Tetrominos([[0,0]], [7.5,4.5], 0, "J");
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

tetro.plot(grid) ;


function toto() {
    let newTime = Date.now() ;
    if (tetro.position[1] > 0) {
        tetro.unplot(grid) ;
        tetro.move("d", grid) ;
        tetro.plot(grid) ;
        lastTime = newTime ;
        //setTimeout(toto, 1000)
    } else if (counter < 10) {
        tetro.unplot(grid) ;
        tetro.position[1] =  19.5 ;
        lastTime = Date.now() ;
        counter++
        toto()
    }

}

let lastTime = Date.now() ;
let counter = 0 ;
//toto()


