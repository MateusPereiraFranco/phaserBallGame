export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        this.load.json('level1Data', 'assets/levels/level1.json');
        this.load.json('level2Data', 'assets/levels/level2.json');
        this.load.json('level3Data', 'assets/levels/level3.json');
        this.load.json('level4Data', 'assets/levels/level4.json');

        // --- CARREGANDO OS FRAMES INDIVIDUAIS DO ROBÔ ---
        // Assumimos que você renomeou e colocou os arquivos em 'assets/images/player/'

        // Carrega os 10 frames da animação 'idle' (parado)
        for (let i = 1; i <= 10; i++) {
            this.load.image(`idle_${i}`, `assets/images/player/idle_${i}.png`);
        }

        // Carrega os 8 frames da animação 'run' (correndo)
        for (let i = 1; i <= 8; i++) {
            this.load.image(`run_${i}`, `assets/images/player/run_${i}.png`);
        }

        // **MUDANÇA**: Carrega os 10 frames da animação 'jump' (pulo)
        for (let i = 1; i <= 10; i++) {
            this.load.image(`jump_${i}`, `assets/images/player/jump_${i}.png`);
        }
    }

    create() {
        // --- GERAÇÃO DAS TEXTURAS DOS ITENS E CENÁRIO ---
        this.textures.generate('platform', { data: ['1'], pixelWidth: 1, palette: { 0: '#0000', 1: '#4d4d4d' } });
        this.textures.generate('wall', { data: ['1'], pixelWidth: 1, palette: { 0: '#0000', 1: '#888888' } });
        this.textures.generate('spike', { data: ['010', '111'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ff4d4d' } });
        this.textures.generate('doubleJump', { data: ['010', '111', '010'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ffd700' } });
        this.textures.generate('goal', { data: ['111', '101', '111'], pixelWidth: 3, palette: { 0: '#0000', 1: '#00ff00' } });
        this.textures.generate('colorChange', { data: ['1', '2'], pixelWidth: 2, palette: { 0: '#0000', 1: '#ff00ff', 2: '#a020f0' } });

        // --- CRIAÇÃO DAS ANIMAÇÕES GLOBAIS DO ROBÔ ---

        const idleFrames = [];
        for (let i = 1; i <= 10; i++) {
            idleFrames.push({ key: `idle_${i}` });
        }
        this.anims.create({
            key: 'idle',
            frames: idleFrames,
            frameRate: 10,
            repeat: -1
        });

        const runFrames = [];
        for (let i = 1; i <= 8; i++) {
            runFrames.push({ key: `run_${i}` });
        }
        this.anims.create({
            key: 'run',
            frames: runFrames,
            frameRate: 10,
            repeat: -1
        });

        // **MUDANÇA**: Animação de pulo com 10 frames, sem repetir
        const jumpFrames = [];
        for (let i = 1; i <= 10; i++) {
            jumpFrames.push({ key: `jump_${i}` });
        }
        this.anims.create({
            key: 'jump',
            frames: jumpFrames,
            frameRate: 8, // Um pouco mais rápida para dar impacto
            repeat: 0 // Toca a animação apenas uma vez
        });

        this.scene.start('GameScene', { level: 1 });
    }
}
