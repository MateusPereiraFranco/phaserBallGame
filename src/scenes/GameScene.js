import Player from '../prefabs/Player.js';
import Fireball from '../prefabs/Fireball.js';
import Spike from '../prefabs/Spike.js';
import Door from '../prefabs/Door.js';
import Switch from '../prefabs/Switch.js';
import Saw from '../prefabs/Saw.js';
import Barrel from '../prefabs/Barrel.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.spacebar = null;
        this.extraJumps = 0;
        this.ammo = 0;
        this.currentLevel = 1;
        this.lives = 3;
        this.isGamePaused = false;
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.lives = data.lives !== undefined ? data.lives : 3;
        this.extraJumps = data.extraJumps || 0;
        this.ammo = data.ammo || 0;
    }

    create() {
        this.isGamePaused = true;
        const levelDataKey = `level${this.currentLevel}Data`;
        const levelData = this.cache.json.get(levelDataKey);

        this.scene.launch('UIScene');
        this.updateUI();

        // --- CRIAÇÃO DOS OBJETOS DA FASE ---
        this.platforms = this.physics.add.staticGroup();
        levelData.platforms.forEach(p => this.platforms.create(p.x, p.y, 'platform').setScale(p.scaleX, p.scaleY).refreshBody());

        this.walls = this.physics.add.staticGroup();
        if (levelData.walls) {
            levelData.walls.forEach(w => this.walls.create(w.x, w.y, 'wall').setScale(w.scaleX, w.scaleY).refreshBody());
        }

        this.barrels = this.physics.add.group();
        if (levelData.barrels) {
            levelData.barrels.forEach(b => {
                const newBarrel = new Barrel(this, b.x, b.y, 'barrel', b);
                this.barrels.add(newBarrel);
                newBarrel.body.setAllowGravity(false);
                newBarrel.body.setImmovable(true);
            });
        }

        this.spikes = this.physics.add.group();
        levelData.spikes.forEach(s => {
            const newSpike = new Spike(this, s.x, s.y, 'spike', s);
            this.spikes.add(newSpike);
            newSpike.body.setAllowGravity(false);
            newSpike.body.setImmovable(true);
        });

        this.saws = this.physics.add.group();
        if (levelData.saws) {
            levelData.saws.forEach(s => {
                const newSaw = new Saw(this, s.x, s.y, 'saw', s);
                this.saws.add(newSaw);
                newSaw.body.setAllowGravity(false);
                newSaw.body.setImmovable(true);
                newSaw.body.setAngularVelocity(100);
            });
        }

        // --- CRIAÇÃO DO JOGADOR USANDO A CLASSE ---
        this.player = new Player(this, levelData.playerStart.x, levelData.playerStart.y);
        this.player.on('deathComplete', this.handlePlayerDeath, this);
        this.player.on('fire', this.fireFireball, this);

        // --- CRIAÇÃO DOS ITENS ---
        this.doubleJumpItemsGroup = this.physics.add.group({ allowGravity: false });
        if (levelData.doubleJumpItems) {
            levelData.doubleJumpItems.forEach(itemData => this.doubleJumpItemsGroup.create(itemData.x, itemData.y, 'doubleJump').setScale(itemData.scale));
        }

        this.fireballItemsGroup = this.physics.add.group({ allowGravity: false });
        if (levelData.fireballItems) {
            levelData.fireballItems.forEach(itemData => this.fireballItemsGroup.create(itemData.x, itemData.y, 'fireballItem').setScale(itemData.scale));
        }

        this.fireballsGroup = this.physics.add.group({
            classType: Fireball,
            runChildUpdate: true,
            allowGravity: false
        });

        this.colorChangeItemsGroup = this.physics.add.group({ allowGravity: false });
        if (levelData.colorChangeItems) {
            levelData.colorChangeItems.forEach(itemData => this.colorChangeItemsGroup.create(itemData.x, itemData.y, 'colorChange').setScale(itemData.scale));
        }

        // WORLD *********************************************************************************************************

        this.doors = this.physics.add.group();
        if (levelData.doors) {
            levelData.doors.forEach(d => {
                const newDoor = new Door(this, d.x, d.y, 'door_closed', d.id);
                this.doors.add(newDoor);
                newDoor.body.setAllowGravity(false);
                newDoor.body.setImmovable(true);
                newDoor.setDepth(-1);
            });
        }

        this.physics.add.collider(this.fireballsGroup, this.barrels, this.hitBarrel, null, this);

        this.switches = this.physics.add.group();
        if (levelData.switches) {
            levelData.switches.forEach(s => {
                const newSwitch = new Switch(this, s.x, s.y, 'switch', s.doorId);
                this.switches.add(newSwitch);
                newSwitch.body.setAllowGravity(false);
                newSwitch.body.setImmovable(true);
                newSwitch.setDepth(-1);
            });
        }

        if (levelData.goal) {
            this.goalItem = this.physics.add.sprite(levelData.goal.x, levelData.goal.y, 'goal').setScale(levelData.goal.scale);
            this.physics.world.enable(this.goalItem);
            this.goalItem.body.setAllowGravity(false);
        }

        // --- CONFIGURAÇÃO DAS COLISÕES E OVERLAPS ---
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.spikes, this.loseLife, null, this);
        this.physics.add.collider(this.player, this.saws, this.loseLife, null, this);
        this.physics.add.overlap(this.player, this.doubleJumpItemsGroup, this.collectDoubleJumpItem, null, this);
        this.physics.add.overlap(this.player, this.colorChangeItemsGroup, this.collectColorChangeItem, null, this);
        this.physics.add.overlap(this.player, this.fireballItemsGroup, this.collectFireballItem, null, this);
        if (this.goalItem) this.physics.add.overlap(this.player, this.goalItem, this.goToNextLevel, null, this);
        this.physics.add.collider(this.fireballsGroup, this.platforms, (fireball) => fireball.setActive(false).setVisible(false));
        this.physics.add.collider(this.fireballsGroup, this.walls, (fireball) => fireball.setActive(false).setVisible(false));
        this.physics.add.overlap(this.player, this.doors, this.enterDoor, null, this);  
        this.physics.add.collider(this.player, this.barrels);
        if (this.switches) {
            this.physics.add.collider(
                this.fireballsGroup,
                this.switches,
                this.hitSwitch, // Função a ser chamada SE a colisão ocorrer
                (fireball, switchInstance) => {
                    // Esta função decide SE a colisão deve acontecer.
                    // Retorna 'true' para colidir, 'false' para ignorar.
                    return !switchInstance.isHit; // Só colide se o interruptor NÃO foi atingido.
                },
                this
            );
        }

        // --- CONTROLES ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.showLevelTitle();
    }

    update() {
        if (!this.player || this.isGamePaused) return;

        this.player.update(this.cursors);

        const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up);
        if (upJustPressed) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(-330);
            } else if (this.extraJumps > 0) {
                this.player.setVelocityY(-300);
                this.extraJumps--;
                this.updateUI();
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            if (this.ammo > 0) {
                this.player.shoot();
            }
        }

        // Morte por queda
        if (this.player.y > 617) this.loseLife();
    }

    showLevelTitle() {
        const levelText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, `Level ${this.currentLevel}`, { fontSize: '64px', fill: '#FFFFFF' }).setOrigin(0.5).setScrollFactor(0);
        this.time.delayedCall(1500, () => {
            this.tweens.add({ targets: levelText, alpha: 0, duration: 500, onComplete: () => levelText.destroy() });
            this.player.body.setAllowGravity(true);
            this.isGamePaused = false;
        });
    }

    updateUI() {
        this.events.emit('updateUI', {
            lives: this.lives,
            extraJumps: this.extraJumps,
            ammo: this.ammo
        });
    }

    fireFireball() {
        const fireball = this.fireballsGroup.get();
        if (fireball) {
            const direction = this.player.flipX ? 'left' : 'right';
            // Ajusta a posição inicial da bola de fogo para sair da arma
            const spawnX = this.player.flipX ? this.player.x - 20 : this.player.x + 20;
            fireball.fire(spawnX, this.player.y, direction);

            this.ammo--;
            this.updateUI();
        }
    }

    // --- FUNÇÕES DE CALLBACK ---
    loseLife() {
        if (this.isGamePaused || this.player.isDead) return;
        this.isGamePaused = true;
        this.player.die();
    }

    handlePlayerDeath() {
        this.lives--;
        this.updateUI();

        if (this.lives > 0) {
            this.cameras.main.fade(500, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) this.scene.restart({ level: this.currentLevel, lives: this.lives, extraJumps: 0, ammo: 0 });
            });
        } else {
            console.log('GAME OVER');
            this.scene.start('GameScene', { level: 1, lives: 3 });
        }
    }

    collectDoubleJumpItem(player, item) {
        item.disableBody(true, true);
        this.extraJumps++;
        this.updateUI();
        this.cameras.main.flash(200, 255, 255, 0);
    }

    collectFireballItem(player, item) {
        item.disableBody(true, true);
        this.ammo++;
        this.updateUI();
        this.cameras.main.flash(200, 255, 69, 0);
    }


    collectColorChangeItem(player, item) {
        item.disableBody(true, true);
        this.player.changeColor();
        this.cameras.main.flash(200, 255, 0, 255);
    }

    hitSwitch(fireball, switchInstance) {
        fireball.setActive(false).setVisible(false); // Desativa a bola de fogo
        switchInstance.hit(); // Chama o método do interruptor
    }

    hitBarrel(fireball, barrel) {
        fireball.setActive(false).setVisible(false); // Desativa a bola de fogo
        barrel.hit(); // Chama o método do barril
    }

    spawnItem(x, y, type) {
        let item = null;
        if (type === 'fireball') {
            item = this.fireballItemsGroup.create(x, y, 'fireballItem');
        } else if (type === 'doubleJump') {
            item = this.doubleJumpItemsGroup.create(x, y, 'doubleJump');
        }

        if (item) {
            item.setScale(2); // Define uma escala padrão para os itens dropados
        }
    }

    enterDoor(player, door) {
        // A sequência só inicia se a porta estiver aberta, o jogador no chão, NÃO estiver pulando e o jogo não estiver pausado.
        if (door.isOpen && !this.isGamePaused) {
            this.isGamePaused = true; 

            player.setVelocity(0, 0);
            player.body.setAllowGravity(false);
            
            player.play('run', true);

            this.tweens.add({
                targets: player,
                x: door.x,
                duration: 500,
                ease: 'Linear',
                onComplete: () => {
                    this.tweens.add({
                        targets: player,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            this.goToNextLevel();
                        }
                    });
                }
            });
        }
    }

    goToNextLevel() { // Modificada para não precisar do 'goal'
        const nextLevel = this.currentLevel + 1;
        const nextLevelDataKey = `level${nextLevel}Data`;
        if (this.cache.json.has(nextLevelDataKey)) {
            this.scene.start('GameScene', { level: nextLevel, lives: this.lives, extraJumps: this.extraJumps, ammo: this.ammo });
        } else {
            console.log('VOCÊ VENCEU!');
            this.scene.start('GameScene', { level: 1, lives: 3 });
        }
    }
}
