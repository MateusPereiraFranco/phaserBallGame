export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.jumps = 0;
        this.canDoubleJump = false;
    }

    init(data) {
        // Recebe a chave dos dados da fase que a PreloaderScene enviou
        this.levelDataKey = data.levelDataKey;
    }

    create() {
        const levelData = this.cache.json.get(this.levelDataKey);

        // --- CRIAÇÃO DAS PLATAFORMAS DINAMICAMENTE ---
        this.platforms = this.physics.add.staticGroup();
        levelData.platforms.forEach(p => {
            this.platforms.create(p.x, p.y, 'platform').setScale(p.scaleX, p.scaleY).refreshBody();
        });

        // --- CRIAÇÃO DOS ESPINHOS DINAMICAMENTE ---
        this.spikes = this.physics.add.staticGroup();
        levelData.spikes.forEach(s => {
            this.spikes.create(s.x, s.y, 'spike').setScale(s.scale).refreshBody();
        });

        // --- CRIAÇÃO DO JOGADOR ---
        this.player = this.physics.add.sprite(levelData.playerStart.x, levelData.playerStart.y, 'ball');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);

        // --- CRIAÇÃO DO ITEM DE PULO DUPLO ---
        const itemData = levelData.doubleJumpItem;
        this.doubleJumpItem = this.physics.add.sprite(itemData.x, itemData.y, 'doubleJump').setScale(itemData.scale);
        this.doubleJumpItem.setCollideWorldBounds(true);

        // --- CONFIGURAÇÃO DAS COLISÕES ---
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.doubleJumpItem, this.platforms);
        this.physics.add.collider(this.player, this.spikes, this.hitSpike, null, this);
        this.physics.add.overlap(this.player, this.doubleJumpItem, this.collectDoubleJumpItem, null, this);

        // --- CONTROLES E ESTADO INICIAL ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumps = 0;
        this.canDoubleJump = false;
    }

    update() {
        // Lógica de movimento
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        // Morte por queda
        if (this.player.y > 600) {
            this.scene.restart({ levelDataKey: this.levelDataKey });
        }

        // Lógica de pulo
        const isTouchingDown = this.player.body.touching.down;
        const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up);

        if (isTouchingDown) {
            this.jumps = 0;
        }

        if (upJustPressed) {
            if (isTouchingDown) {
                this.player.setVelocityY(-330);
                this.jumps = 1;
            } else if (this.canDoubleJump && this.jumps < 2) {
                this.player.setVelocityY(-300);
                this.jumps = 2;
                this.canDoubleJump = false;
            }
        }
    }

    // --- FUNÇÕES DE CALLBACK ---
    hitSpike(player, spike) {
        this.scene.restart({ levelDataKey: this.levelDataKey });
    }

    collectDoubleJumpItem(player, item) {
        item.disableBody(true, true);
        this.canDoubleJump = true;
        this.cameras.main.flash(200, 255, 255, 0);
    }
}
