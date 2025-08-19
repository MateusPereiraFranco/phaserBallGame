export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, initialExtraJumps = 0) {
        // Inicia o sprite com o primeiro frame da animação 'idle'
        super(scene, x, y, 'idle_1');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- AJUSTES FÍSICOS E VISUAIS ---
        this.setScale(0.10);

        // ignorando o espaço transparente excessivo da imagem.
        // Estes valores foram ajustados para melhor corresponder à arte do personagem.
        this.body.setSize(this.width * 0.3, this.height * 0.8);
        this.body.setOffset(this.width * 0.3, this.height * 0.15);

        this.setBounce(0.1);
        this.body.setAllowGravity(false);

        this.isDead = false;
        this.isShooting = false;
        this.onMovingPlatform = false
        this.platformVelocity = new Phaser.Math.Vector2();
        this.jumpForce = 300

        // --- NOVA LÓGICA DE PULO ---
        this.extraJumps = initialExtraJumps;

        this.on('animationcomplete', this.handleAnimationComplete, this);

        // Inicia com a animação 'idle'
        this.play('idle');
    }

    // A função de mudar de cor pode ser usada para um power-up futuro
    changeColor() {
        this.setTint(0xff00ff);
        this.scene.time.delayedCall(500, () => {
            this.clearTint();
        });
    }

    // --- NOVO MÉTODO ---
    // Adiciona um pulo extra e avisa a GameScene para atualizar a UI
    addExtraJump() {
        this.extraJumps++;
        // Avisa a GameScene que os dados do jogador mudaram
        this.emit('playerDataChanged');
    }

    // --- NOVO MÉTODO ---
    // Centraliza a lógica de pulo
    jump() {
        if (this.isDead) return;

        if (this.body.touching.down) {
            this.setVelocityY(-this.jumpForce); // Pulo normal
        } else if (this.extraJumps > 0) {
            this.setVelocityY(-this.jumpForce); // Pulo extra
            this.extraJumps--;
            this.emit('playerDataChanged'); // Avisa a GameScene que os dados mudaram
        }
    }


    shoot() {
        if (this.isDead || this.isShooting) return;

        this.isShooting = true;

        // Toca a animação correta com base no movimento
        if (!this.body.touching.down) {
            this.play('jumpShoot', true);
        } else if (this.body.velocity.x !== 0) {
            this.play('runShoot', true);
        } else {
            this.setVelocityX(0);
            this.play('shoot', true);
        }

        // Emite um evento para a GameScene saber que é para criar a bola de fogo
        this.emit('fire');
    }

    handleAnimationComplete(animation) {
        // Se a animação de tiro (parado ou correndo) terminou, reseta o estado
        if (animation.key === 'shoot' || animation.key === 'runShoot' || animation.key === 'jumpShoot') {
            this.isShooting = false;
        }

        // Se a animação de morte terminou, avisa a GameScene
        if (animation.key === 'dead') {
            this.emit('deathComplete');
        }
    }

    die() {
        if (this.isDead) return; // Previne que a função seja chamada múltiplas vezes
        this.isDead = true;
        this.setVelocity(0, 0); // Para o jogador completamente
        this.body.setEnable(false);
        this.play('dead', true); // Toca a animação de morte
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.onMovingPlatform = false;
        this.platformVelocity.reset();
    }

    update(cursors) {
        if (this.isDead || !this.body) return;

        // --- LÓGICA DE PULO MOVIDA PARA CÁ ---
        const upJustPressed = Phaser.Input.Keyboard.JustDown(cursors.up);
        if (upJustPressed) {
            this.jump();
        }

        // **CORREÇÃO**: A lógica de movimento agora SEMPRE é executada,
        // permitindo que o jogador pare de se mover mesmo durante a animação de tiro.
        if (cursors.left.isDown) {
            // Só permite mudar a velocidade se não estiver atirando parado
            if (!(this.isShooting && this.body.velocity.x === 0)) {
                this.setVelocityX(-200);
                this.setFlipX(true);
            }
        } else if (cursors.right.isDown) {
            if (!(this.isShooting && this.body.velocity.x === 0)) {
                this.setVelocityX(200);
                this.setFlipX(false);
            }
        } else {
            this.setVelocityX(this.platformVelocity.x);
        }

        if (this.isShooting) {
            // Se o jogador para de se mover no meio da animação de tiro correndo,
            // troca para a animação de tiro parado.
            if (this.body.velocity.x === 0 && this.anims.currentAnim.key === 'runShoot') {
                this.play('shoot', true);
            }
        } else if (!this.body.touching.down) {
            this.play('jump', true);
        } else if (cursors.left.isDown || cursors.right.isDown) {
            this.play('run', true);
        } else {
            this.play('idle', true);
        }
    }
}
