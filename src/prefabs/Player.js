export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, initialExtraJumps = 0) {
        // Inicia o sprite com o primeiro frame da animação 'idle'
        super(scene, x, y, 'idle_1');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.10);

        this.body.setSize(this.width * 0.2, this.height * 0.77);
        this.body.setOffset(this.width * 0.35, this.height * 0.15);

        this.setBounce(0);
        this.body.setAllowGravity(false);

        this.isDead = false;
        this.isShooting = false;
        this.onMovingPlatform = false
        this.platformVelocity = new Phaser.Math.Vector2();
        this.jumpForce = 300

        this.extraJumps = initialExtraJumps;

        this.on('animationcomplete', this.handleAnimationComplete, this);

        this.play('idle');
    }

    // A função de mudar de cor pode ser usada para um power-up futuro
    changeColor() {
        this.setTint(0xff00ff);
        this.scene.time.delayedCall(500, () => {
            this.clearTint();
        });
    }

    addExtraJump() {
        this.extraJumps++;
        this.emit('playerDataChanged');
    }

jump() {
    // Se estiver morto ou em cooldown, não faz nada.
    if (this.isDead || this.jumpCooldown) return;

    const canJump = this.body.touching.down;
    const canDoubleJump = !this.body.touching.down && this.extraJumps > 0;

    if (canJump || canDoubleJump) {
        this.setVelocityY(-this.jumpForce);

        if (canDoubleJump) {
            this.extraJumps--;
            this.emit('playerDataChanged');
        }

        this.jumpCooldown = true;
        this.scene.time.delayedCall(250, () => {
            this.jumpCooldown = false;
        }, [], this);
    }
}


    shoot() {
        if (this.isDead || this.isShooting) return;

        this.isShooting = true;

        if (!this.body.touching.down) {
            this.play('jumpShoot', true);
        } else if (this.body.velocity.x !== 0) {
            this.play('runShoot', true);
        } else {
            this.setVelocityX(0);
            this.play('shoot', true);
        }

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
        this.play('dead', true);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.onMovingPlatform = false;
        this.platformVelocity.reset();
    }

    update(cursors) {
        if (this.isDead || !this.body) return;

        const upJustPressed = Phaser.Input.Keyboard.JustDown(cursors.up);
        if (upJustPressed) {
            this.jump();
        }else{
            
        }

        if (cursors.left.isDown) {
            // Só permite mudar a velocidade se não estiver atirando parado
            if (!(this.isShooting && this.body.velocity.x === 0)) {
                this.setVelocityX(-200);
                this.setFlipX(true);

                // Ajusta o offset da hitbox para a esquerda
                this.body.setOffset(this.width * 0.45, this.height * 0.15);
            }
        } else if (cursors.right.isDown) {
            if (!(this.isShooting && this.body.velocity.x === 0)) {
                this.setVelocityX(200);
                this.setFlipX(false);
                // Ajusta o offset da hitbox para a direita (original)
                this.body.setOffset(this.width * 0.35, this.height * 0.15);
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
