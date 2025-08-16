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
            this.load.image(`idle_${i}`, `assets/images/player/idle/idle_${i}.png`);
        }

        // Carrega os 8 frames da animação 'run' (correndo)
        for (let i = 1; i <= 8; i++) {
            this.load.image(`run_${i}`, `assets/images/player/run/run_${i}.png`);
        }

        // **MUDANÇA**: Carrega os 10 frames da animação 'jump' (pulo)
        for (let i = 1; i <= 10; i++) {
            this.load.image(`jump_${i}`, `assets/images/player/jump/jump_${i}.png`);
        }

        for (let i = 1; i <= 10; i++) {
            this.load.image(`dead_${i}`, `assets/images/player/dead/dead_${i}.png`);
        }

        for (let i = 1; i <= 4; i++) this.load.image(`shoot_${i}`, `assets/images/player/shoot/shoot_${i}.png`);
        for (let i = 1; i <= 9; i++) this.load.image(`runShoot_${i}`, `assets/images/player/runShoot/runShoot_${i}.png`);

        for (let i = 1; i <= 5; i++) {
            this.load.image(`bullet_${i}`, `assets/images/effects/fireball/bullet_${i}.png`);
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
        this.textures.generate('fireballItem', { data: ['212', '111', '212'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ff4500', 2: '#ff8c00' } });

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

        const deadFrames = [];
        for (let i = 1; i <= 10; i++) {
            deadFrames.push({ key: `dead_${i}` });
        }
        this.anims.create({
            key: 'dead',
            frames: deadFrames,
            frameRate: 10,
            repeat: 0
        });

        // JUMPS ****************************************************************************************************************
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

        const shootFrames = []; for (let i = 1; i <= 4; i++) shootFrames.push({ key: `shoot_${i}` });
        this.anims.create({ key: 'shoot', frames: shootFrames, frameRate: 20, repeat: 0 });

        const runShootFrames = []; for (let i = 1; i <= 8; i++) runShootFrames.push({ key: `runShoot_${i}` });
        this.anims.create({ key: 'runShoot', frames: runShootFrames, frameRate: 15, repeat: 0 });

        // FIREBALLS **************************************************************************************************************
        const fireballFrames = [];
        for (let i = 1; i <= 5; i++) {
            fireballFrames.push({ key: `bullet_${i}` });
        }
        this.anims.create({
            key: 'fireball-anim',
            frames: fireballFrames,
            frameRate: 10,
            repeat: -1
        });

        this.scene.start('GameScene', { level: 4 });
    }
}
