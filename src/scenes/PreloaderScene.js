export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        this.load.json('level1Data', 'assets/levels/level1.json');
        this.load.tilemapTiledJSON('mapa_laboratorio', 'assets/images/background/json/backgroundPlatform.json');
        this.load.json('level2Data', 'assets/levels/level2.json');
        this.load.tilemapTiledJSON('mapa_laboratorio2', 'assets/images/background/json/backgroundPlatform2.json');
        this.load.json('level3Data', 'assets/levels/level3.json');
        this.load.json('level4Data', 'assets/levels/level4.json');
        this.load.json('level5Data', 'assets/levels/level5.json');
        this.load.json('level6Data', 'assets/levels/level6.json');
        this.load.tilemapTiledJSON('mapa_laboratorio3', 'assets/images/background/json/backgroundPlatform6.json');
        this.load.json('level7Data', 'assets/levels/level7.json');
        this.load.json('level8Data', 'assets/levels/level8.json');
        this.load.json('level9Data', 'assets/levels/level9.json');
        this.load.json('level10Data', 'assets/levels/level10.json');
        this.load.json('level11Data', 'assets/levels/level11.json');
        this.load.json('level12Data', 'assets/levels/level12.json');
        this.load.json('level13Data', 'assets/levels/level13.json');
        this.load.json('level14Data', 'assets/levels/level14.json');

        this.load.image('meu_tileset', 'assets/images/background/tileset/level_tileset1.png');

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

        for (let i = 11; i <= 20; i++) {
            this.load.image(`specialCoins_${i}`, `assets/images/colectibles/specialCoins/Gold_${i}.png`);
        }



        this.load.spritesheet('drone_walk_sheet', 'assets/images/enemies/drone/Walk.png', {
            frameWidth: 48, // IMPORTANTE: Ajuste se a largura de cada frame for diferente
            frameHeight: 48 // IMPORTANTE: Ajuste se a altura de cada frame for diferente
        });

        this.load.spritesheet('drone_death_sheet', 'assets/images/enemies/drone/drone_death_sheet.png', {
            frameWidth: 64,  // Largura de cada frame na sua imagem
            frameHeight: 64  // Altura de cada frame na sua imagem
        });

        // Carrega o spritesheet de 'soltar bomba'
        this.load.spritesheet('drone_drop_sheet', 'assets/images/enemies/drone/Drop.png', {
            frameWidth: 48, // IMPORTANTE: Ajuste se a largura de cada frame for diferente
            frameHeight: 48 // IMPORTANTE: Ajuste se a altura de cada frame for diferente
        });

        this.load.image('bomb', 'assets/images/effects/bomb/bomb_1.png'); // Imagem estática da bomba caindo

        for (let i = 1; i <= 10; i++) {
            this.load.image(`explosion_${i}`, `assets/images/effects/explosion/Explosion01_frame${i}.png`);
        }


        this.load.image('door_closed', 'assets/images/world/door/door_closed.png');
        this.load.image('door_opening', 'assets/images/world/door/door_opening.png');
        this.load.image('door_open', 'assets/images/world/door/door_open.png');
        this.load.image('switch', 'assets/images/world/switch/switchOff.png');
        this.load.image('switch-on', 'assets/images/world/switch/switchOn.png');
        this.load.image('saw', 'assets/images/world/saw/Saw.png');
        this.load.image('barrel', 'assets/images/world/barrel/barrel.png');
        this.load.image('spike', 'assets/images/world/spike/spike.png');
        this.load.image('movingPlatform', 'assets/images/world/platform/movingPlatform/movingPlatform.png');
        this.load.image('fallingPlatform', 'assets/images/world/platform/fallingPlatform/fallingPlatform.png');

        //BACKGROUND -------------------------------------------

    }

    create() {
        // --- GERAÇÃO DAS TEXTURAS DOS ITENS E CENÁRIO ---
        this.textures.generate('platform', { data: ['1'], pixelWidth: 1, palette: { 0: '#a2d934ff', 1: '#f8faf7ff' } });
        this.textures.generate('wall', { data: ['1'], pixelWidth: 1, palette: { 0: '#0000', 1: '#888888' } });
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

        const specialCoins = [];
        for (let i = 11; i <= 20; i++) {
            specialCoins.push({ key: `specialCoins_${i}` });
        }
        this.anims.create({
            key: 'special-coins',
            frames: specialCoins,
            frameRate: 10,
            repeat: -1
        });

        // Enemies *******************************************************************

        this.anims.create({
            key: 'drone-walk',
            // Usa todos os frames do spritesheet 'drone_walk_sheet'
            frames: this.anims.generateFrameNumbers('drone_walk_sheet'),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'drone-death',      // O nome da animação que usamos no Drone.js
            // Gera os frames do 0 ao 12 a partir do spritesheet
            frames: this.anims.generateFrameNumbers('drone_death_sheet', { start: 0, end: 12 }),
            frameRate: 12,           // Aumentamos a velocidade para uma explosão mais impactante
            repeat: 0                // Toca a animação apenas uma vez
        });

        this.anims.create({
            key: 'drone-drop',
            // Usa todos os frames do spritesheet 'drone_drop_sheet'
            frames: this.anims.generateFrameNumbers('drone_drop_sheet'),
            frameRate: 12,
            repeat: 0 // Toca só uma vez
        });

        this.anims.create({
            key: 'explosion',
            frames: [
                { key: 'explosion_1' },
                { key: 'explosion_2' },
                { key: 'explosion_3' },
                { key: 'explosion_4' },
                { key: 'explosion_5' },
                { key: 'explosion_6' },
                { key: 'explosion_7' },
                { key: 'explosion_8' },
                { key: 'explosion_9' },
                { key: 'explosion_10' },
            ],
            frameRate: 40,
            repeat: 0 // Toca só uma vez
        });

        this.scene.start('GameScene', { level: 2 });
    }
}
