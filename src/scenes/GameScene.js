export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.jumps = 0;
        this.extraJumps = 0; // **MUDANÇA**: Contador para pulos extras
        this.currentLevel = 1;
        this.lives = 3;
        this.livesText = null;
        this.isGamePaused = false; // Flag para controlar o estado do jogo
    }

    init(data) {
        // Recebe o NÚMERO do nível, VIDAS e PULOS EXTRAS
        this.currentLevel = data.level || 1;
        this.lives = data.lives !== undefined ? data.lives : 3;
        this.extraJumps = data.extraJumps || 0;
    }

    create() {
        this.isGamePaused = true; // Pausa o jogo no início da fase
        const levelDataKey = `level${this.currentLevel}Data`;
        const levelData = this.cache.json.get(levelDataKey);

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
        this.player.body.setAllowGravity(false); // Desativa a gravidade inicialmente
        
        // --- CRIAÇÃO DOS ITENS DE PULO DUPLO (AGORA COMO UM GRUPO) ---
        this.doubleJumpItemsGroup = this.physics.add.group({
            allowGravity: false 
        });
        if (levelData.doubleJumpItems) {
            levelData.doubleJumpItems.forEach(itemData => {
                const item = this.doubleJumpItemsGroup.create(itemData.x, itemData.y, 'doubleJump');
                item.setScale(itemData.scale);
                item.setCollideWorldBounds(true);
            });
        }
        this.physics.add.overlap(this.player, this.doubleJumpItemsGroup, this.collectDoubleJumpItem, null, this);


        // --- CRIAÇÃO DO ITEM DE FIM DE FASE ---
        if (levelData.goal) {
            const goalData = levelData.goal;
            this.goalItem = this.physics.add.sprite(goalData.x, goalData.y, 'goal').setScale(goalData.scale);
            this.goalItem.setCollideWorldBounds(true);
            this.physics.add.collider(this.goalItem, this.platforms);
            this.physics.add.overlap(this.player, this.goalItem, this.goToNextLevel, null, this);
        }

        // --- CONFIGURAÇÃO DAS COLISÕES ---
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.spikes, this.loseLife, null, this);

        // --- CONTROLES E ESTADO INICIAL ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumps = 0;

        // --- CRIAÇÃO DO TEXTO DE VIDAS ---
        this.livesText = this.add.text(16, 16, `Vidas: ${this.lives}`, { fontSize: '24px', fill: '#FFFFFF' });
        this.livesText.setScrollFactor(0); 

        // --- MOSTRAR NOME DA FASE NO INÍCIO ---
        this.showLevelTitle();
    }

    update() {
        // Não faz nada se o jogador não existir ou se o jogo estiver pausado
        if (!this.player || !this.player.body || this.isGamePaused) return;

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
            this.loseLife();
        }

        // Lógica de pulo
        const isTouchingDown = this.player.body.touching.down;
        const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up);

        if (isTouchingDown) {
            this.jumps = 0;
        }

        if (upJustPressed) {
            // Pulo 1: Se estiver no chão, pula normalmente
            if (isTouchingDown) {
                this.player.setVelocityY(-330);
                this.jumps = 1;
            } 
            // **MUDANÇA**: Pulos extras: se estiver no ar e o número de pulos feitos for menor que o total permitido (1 + extras)
            else if (this.jumps > 0 && this.jumps < (1 + this.extraJumps)) {
                this.player.setVelocityY(-300);
                this.jumps++; // Incrementa o contador de pulos feitos
            }
        }
    }
    
    showLevelTitle() {
        const levelText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            `Level ${this.currentLevel}`, 
            { fontSize: '64px', fill: '#FFFFFF', align: 'center' }
        ).setOrigin(0.5);
        levelText.setScrollFactor(0);

        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: levelText,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    levelText.destroy();
                }
            });
            
            this.player.body.setAllowGravity(true);
            this.isGamePaused = false;
        });
    }

    // --- FUNÇÕES DE CALLBACK ---
    loseLife() {
        if (this.isGamePaused) return;
        this.isGamePaused = true; 

        this.lives--;
        
        if (this.lives > 0) {
            this.cameras.main.fade(250, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) {
                    // **MUDANÇA**: Passa o contador de pulos extras ao reiniciar
                    this.scene.restart({ level: this.currentLevel, lives: this.lives, extraJumps: this.extraJumps });
                }
            });
        } else {
            console.log('GAME OVER');
            // No Game Over, os pulos extras são resetados
            this.scene.start('GameScene', { level: 1, lives: 3 });
        }
    }

    collectDoubleJumpItem(player, item) {
        item.disableBody(true, true);
        // **MUDANÇA**: Incrementa o contador de pulos extras
        this.extraJumps++;
        this.cameras.main.flash(200, 255, 255, 0);
    }

    goToNextLevel(player, goal) {
        const nextLevel = this.currentLevel + 1;
        const nextLevelDataKey = `level${nextLevel}Data`;

        if (this.cache.json.has(nextLevelDataKey)) {
            // **MUDANÇA**: Passa o contador de pulos extras para a próxima fase
            this.scene.start('GameScene', { level: nextLevel, lives: this.lives, extraJumps: this.extraJumps });
        } else {
            console.log('VOCÊ VENCEU!');
            this.scene.start('GameScene', { level: 1, lives: 3 });
        }
    }
}
