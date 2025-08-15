import Player from '../prefabs/Player.js'; // Importa a classe Player

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.extraJumps = 0;
        this.currentLevel = 1;
        this.lives = 3;
        this.isGamePaused = false;
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.lives = data.lives !== undefined ? data.lives : 3;
        this.extraJumps = data.extraJumps || 0;
    }

    create() {
        this.isGamePaused = true;
        const levelDataKey = `level${this.currentLevel}Data`;
        const levelData = this.cache.json.get(levelDataKey);

        // --- INICIA A CENA DE UI EM PARALELO ---
        this.scene.launch('UIScene');
        this.updateUI(); // Emite os valores iniciais para a UI

        // --- CRIAÇÃO DOS OBJETOS DA FASE ---
        this.platforms = this.physics.add.staticGroup();
        levelData.platforms.forEach(p => this.platforms.create(p.x, p.y, 'platform').setScale(p.scaleX, p.scaleY).refreshBody());

        this.walls = this.physics.add.staticGroup();
        if (levelData.walls) {
            levelData.walls.forEach(w => this.walls.create(w.x, w.y, 'wall').setScale(w.scaleX, w.scaleY).refreshBody());
        }

        this.spikes = this.physics.add.staticGroup();
        levelData.spikes.forEach(s => this.spikes.create(s.x, s.y, 'spike').setScale(s.scale).refreshBody());

        // --- CRIAÇÃO DO JOGADOR USANDO A CLASSE ---
        this.player = new Player(this, levelData.playerStart.x, levelData.playerStart.y);

        // --- CRIAÇÃO DOS ITENS ---
        this.doubleJumpItemsGroup = this.physics.add.group({ allowGravity: false });
        if (levelData.doubleJumpItems) {
            levelData.doubleJumpItems.forEach(itemData => this.doubleJumpItemsGroup.create(itemData.x, itemData.y, 'doubleJump').setScale(itemData.scale));
        }

        this.colorChangeItemsGroup = this.physics.add.group({ allowGravity: false });
        if (levelData.colorChangeItems) {
            levelData.colorChangeItems.forEach(itemData => this.colorChangeItemsGroup.create(itemData.x, itemData.y, 'colorChange').setScale(itemData.scale));
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
        this.physics.add.overlap(this.player, this.doubleJumpItemsGroup, this.collectDoubleJumpItem, null, this);
        this.physics.add.overlap(this.player, this.colorChangeItemsGroup, this.collectColorChangeItem, null, this);
        if (this.goalItem) this.physics.add.overlap(this.player, this.goalItem, this.goToNextLevel, null, this);

        // --- CONTROLES ---
        this.cursors = this.input.keyboard.createCursorKeys();

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
                this.updateUI(); // Emite evento para atualizar a UI
            }
        }

        if (this.player.y > 600) this.loseLife();
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
            extraJumps: this.extraJumps
        });
    }

    // --- FUNÇÕES DE CALLBACK ---
    loseLife() {
        if (this.isGamePaused) return;
        this.isGamePaused = true;
        this.lives--;
        this.updateUI(); // Emite evento para a UI antes de reiniciar

        if (this.lives > 0) {
            this.cameras.main.fade(250, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) this.scene.restart({ level: this.currentLevel, lives: this.lives, extraJumps: this.extraJumps });
            });
        } else {
            this.scene.start('GameScene', { level: 1, lives: 3 });
        }
    }

    collectDoubleJumpItem(player, item) {
        item.disableBody(true, true);
        this.extraJumps++;
        this.updateUI(); // Emite evento para atualizar a UI
        this.cameras.main.flash(200, 255, 255, 0);
    }

    collectColorChangeItem(player, item) {
        item.disableBody(true, true);
        this.player.changeColor();
        this.cameras.main.flash(200, 255, 0, 255);
    }

    goToNextLevel(player, goal) {
        const nextLevel = this.currentLevel + 1;
        const nextLevelDataKey = `level${nextLevel}Data`;
        if (this.cache.json.has(nextLevelDataKey)) {
            this.scene.start('GameScene', { level: nextLevel, lives: this.lives, extraJumps: this.extraJumps });
        } else {
            console.log('VOCÊ VENCEU!');
            this.scene.start('GameScene', { level: 1, lives: 3 });
        }
    }
}
