import {Grid} from "./grid.js"
import {Polyomino, Tetromino} from "./tetrominos.js"



const grid = new Grid(10,20);

const tetro = new Tetromino("Z");
const tetroB = new Polyomino([[0,0]], [7.5,4.5], 0, "J");
tetroB.addToGrid(grid)
tetro.plot(grid)



const buttonLeft = document.querySelector("#goleft") ;
buttonLeft.onclick = () => {
    tetro.unplot(grid)
    tetro.move("l", grid)
    tetro.plot(grid)
}

const buttonRight = document.querySelector("#goright") ;
buttonRight.onclick = () => {
    tetro.unplot(grid)
    tetro.move("r", grid)
    tetro.plot(grid)
}

let titi = 1;
const buttonFall = document.querySelector("#fall") ;
buttonFall.onclick = (event) => {
    tetro.unplot(grid)
    tetro.move("d", grid)
    tetro.plot(grid) ;
}

const buttonRot = document.querySelector("#rotate") ;
buttonRot.onclick = () => {
    tetro.unplot(grid)
    tetro.rotate(grid)
    tetro.plot(grid)
}

tetro.plot(grid) ;


// function toto() {
//     let newTime = Date.now() ;
//     if (tetro.position[1] > 0) {
//         tetro.unplot(grid) ;
//         tetro.move("d", grid) ;
//         tetro.plot(grid) ;
//         lastTime = newTime ;
//         //setTimeout(toto, 1000)
//     } else if (counter < 10) {
//         tetro.unplot(grid) ;
//         tetro.position[1] =  19.5 ;
//         lastTime = Date.now() ;
//         counter++
//         toto()
//     }

// }

// let lastTime = Date.now() ;
// let counter = 0 ;
// //toto()

// const key = {}

// window.addEventListener("keydown",(event) => key[event.code] = event.type === "keydown");
// window.addEventListener("keyup",(event) => key[event.code] = event.type === "keydown");
// window.addEventListener("mousedown",(event) => {key["click"] = event.type === "mousedown"; console.log(event)});
// window.addEventListener("mouseup",(event) => key["click"] = event.type === "mousedown");
// window.addEventListener("touchmove",(event) =>console.log(event));


// //setInterval(() => console.log(key.click), 10)

