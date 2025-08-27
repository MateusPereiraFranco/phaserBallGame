export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, initialExtraJumps = 0) {
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
        this.jumpForce = 300;
        this.extraJumps = initialExtraJumps;

        this.platformStuckOn = null;

        this.on('animationcomplete', this.handleAnimationComplete, this);
        this.play('idle');
    }

    changeColor() {
        this.setTint(0xff00ff);
        this.scene.time.delayedCall(500, () => this.clearTint());
    }

    addExtraJump() {
        this.extraJumps++;
        this.emit('playerDataChanged');
    }

    jump() {
        if (this.isDead || this.jumpCooldown) return;

        const canJump = this.body.touching.down || this.platformStuckOn || this.body.blocked.down; // <-- ALTERADO: Permite pular se estiver grudado
        const canDoubleJump = !canJump && this.extraJumps > 0;

        if (canJump || canDoubleJump) {
            if (this.platformStuckOn) {
                this.platformStuckOn = null;
            }

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
        if (!this.body.touching.down || !this.body.blocked.down && !this.platformStuckOn) {
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
        if (animation.key === 'shoot' || animation.key === 'runShoot' || animation.key === 'jumpShoot') {
            this.isShooting = false;
        }
        if (animation.key === 'dead') {
            this.emit('deathComplete');
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.setVelocity(0, 0);
        this.body.setEnable(false);
        this.play('dead', true);
    }

    // <-- REMOVIDO: O método preUpdate não é mais necessário para esta lógica
    // preUpdate(time, delta) { ... }

    update(cursors) {
        if (this.isDead || !this.body) return;

        const upJustPressed = Phaser.Input.Keyboard.JustDown(cursors.up);
        if (upJustPressed) {
            this.jump();
        }

        if (cursors.left.isDown) {
            if (!(this.isShooting && this.body.velocity.x === 0)) {
                this.setVelocityX(-200);
                this.setFlipX(true);
                this.body.setOffset(this.width * 0.45, this.height * 0.15);
            }
        } else if (cursors.right.isDown) {
            if (!(this.isShooting && this.body.velocity.x === 0)) {
                this.setVelocityX(200);
                this.setFlipX(false);
                this.body.setOffset(this.width * 0.35, this.height * 0.15);
            }
        } else {
            // <-- ALTERADO: Só para o jogador se ele NÃO estiver grudado em uma plataforma.
            // A GameScene cuidará da velocidade quando ele estiver grudado.
            if (!this.platformStuckOn) {
                this.setVelocityX(0);
            }
        }

        // Lógica de animação
        const onGround = this.body.touching.down || this.body.blocked.down || this.platformStuckOn; // <-- ALTERADO

        if (this.isShooting) {
            if (this.body.velocity.x === 0 && this.anims.currentAnim.key === 'runShoot') {
                this.play('shoot', true);
            }
        } else if (!onGround) {
            this.play('jump', true);
        } else if (cursors.left.isDown || cursors.right.isDown) {
            this.play('run', true);
        } else {
            this.play('idle', true);
        }
    }
}