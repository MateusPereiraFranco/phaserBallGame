export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        this.load.json('level1Data', 'assets/levels/level1.json');
        this.load.json('level2Data', 'assets/levels/level2.json');
        this.load.json('level3Data', 'assets/levels/level3.json');
        this.load.json('level4Data', 'assets/levels/level4.json');
        this.load.json('level5Data', 'assets/levels/level5.json');
        this.load.json('level6Data', 'assets/levels/level6.json');
        this.load.json('level7Data', 'assets/levels/level7.json');
        this.load.json('level8Data', 'assets/levels/level8.json');
        this.load.json('level9Data', 'assets/levels/level9.json');
        this.load.json('level10Data', 'assets/levels/level10.json');

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
            this.load.image(`jumpShoot_${i}`, `assets/images/player/jumpShoot/jumpShoot_${i}.png`);
        }

        for (let i = 1; i <= 5; i++) {
            this.load.image(`bullet_${i}`, `assets/images/effects/fireball/bullet_${i}.png`);
        }

        this.load.image('door_closed', 'assets/images/world/door/door_closed.png');
        this.load.image('door_opening', 'assets/images/world/door/door_opening.png');
        this.load.image('door_open', 'assets/images/world/door/door_open.png');
        this.load.image('switch', 'assets/images/world/switch/switchOff.png');
        this.load.image('switch-on', 'assets/images/world/switch/switchOn.png');
        this.load.image('saw', 'assets/images/world/saw/Saw.png');
        this.load.image('barrel', 'assets/images/world/barrel/barrel.png');
    }

    create() {
        // --- GERAÇÃO DAS TEXTURAS DOS ITENS E CENÁRIO ---
        this.textures.generate('platform', { data: ['1'], pixelWidth: 1, palette: { 0: '#a2d934ff', 1: '#f8faf7ff' } });
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

        const jumpShootFrames = []; for (let i = 1; i <= 5; i++) jumpShootFrames.push({ key: `jumpShoot_${i}` });
        this.anims.create({ key: 'jumpShoot', frames: jumpShootFrames, frameRate: 15, repeat: 0 });

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

        // WORLD ***********************************************************************************************************************

        this.anims.create({
            key: 'door-opening',
            frames: [{ key: 'door_opening' }], // Animação de um frame só para o estado "abrindo"
            frameRate: 10
        });

        this.anims.create({
            key: 'door-open',
            frames: [{ key: 'door_open' }], // Animação de um frame só para o estado "aberta"
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'switch-on',
            frames: [{ key: 'switch-on' }],
            frameRate: 10
        });

        this.scene.start('GameScene', { level: 10 });
    }
}
