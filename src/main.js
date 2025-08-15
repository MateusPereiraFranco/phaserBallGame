import PreloaderScene from './scenes/PreloaderScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
        }
    },
    // Define a ordem em que as cenas serão carregadas/executadas
    scene: [PreloaderScene, GameScene]
};

// Inicia o jogo
const game = new Phaser.Game(config);
