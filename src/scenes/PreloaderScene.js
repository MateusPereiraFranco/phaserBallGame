export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Carrega os arquivos JSON de ambas as fases
        this.load.json('level1Data', 'assets/levels/level1.json');
        this.load.json('level2Data', 'assets/levels/level2.json');
        this.load.json('level3Data', 'assets/levels/level3.json');
    }

    create() {
        // Gera as texturas que usamos no jogo
        this.textures.generate('ball', { data: ['2'], pixelWidth: 24, palette: { 0: '#0000', 1: '#0000', 2: '#87ceeb' } });
        this.textures.generate('platform', { data: ['1'], pixelWidth: 1, palette: { 0: '#0000', 1: '#4d4d4d' } });
        this.textures.generate('spike', { data: ['010', '111'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ff4d4d' } });
        this.textures.generate('doubleJump', { data: ['010', '111', '010'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ffd700' } });
        // Nova textura para o item de fim de fase
        this.textures.generate('goal', { data: ['111', '101', '111'], pixelWidth: 3, palette: { 0: '#0000', 1: '#00ff00' } });

        // Inicia o jogo na Fase 1
        this.scene.start('GameScene', { level: 3 });
    }
}
