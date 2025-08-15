export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Carrega o arquivo JSON da fase 1
        this.load.json('level1Data', 'assets/levels/level1.json');

        // Em um jogo real, você carregaria imagens e sons aqui
        // this.load.image('player', 'assets/images/player.png');
        // this.load.audio('jumpSound', 'assets/audio/jump.mp3');
    }

    create() {
        // Gera as texturas que criamos antes, para não depender de imagens
        this.textures.generate('ball', { data: ['2'], pixelWidth: 24, palette: { 0: '#0000', 1: '#0000', 2: '#87ceeb' } });
        this.textures.generate('platform', { data: ['1'], pixelWidth: 1, palette: { 0: '#0000', 1: '#4d4d4d' } });
        this.textures.generate('spike', { data: ['010', '111'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ff4d4d' } });
        this.textures.generate('doubleJump', { data: ['010', '111', '010'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ffd700' } });

        // Quando o carregamento terminar, inicia a cena principal do jogo
        this.scene.start('GameScene', { levelDataKey: 'level1Data' });
    }
}
