export class Sounds {
    constructor() {
        this.theme = new Audio('./audio/tetris-theme.mp3'); 
        this.explodeSound = new Audio('./audio/explosion.mp3'); 
        this.fallSound = new Audio('./audio/punch.mp3'); 
        this.gameOverSound = new Audio('./audio/game-over.wav'); 
        this.holdSound = new Audio("./audio/holdSound.mp3")
    }
}