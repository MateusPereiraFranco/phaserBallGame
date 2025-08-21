export default class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(data.scaleX || 1, data.scaleY || 1).refreshBody();
        this.setImmovable(true);
        this.body.setAllowGravity(false);

        // Apenas para colisões na parte de cima ******************************************************************************
        //this.body.checkCollision.down = false;
        //this.body.checkCollision.left = false;
        //this.body.checkCollision.right = false;

        // Guarda os dados de movimento e o estado atual
        this.movementData = data.movement;
        this.isMoving = false;
        this.playerIsOn = false;
        this.playerWasOn = false; // Guarda o estado do frame anterior
        this.isAtTop = false; // Flag para saber se a plataforma está no destino superior

        // Inicia o movimento com base no tipo
        if (this.movementData) {
            this.initMovement();
        }
    }

    initMovement() {
        const {
            type,
            start,
            end,
            speed
        } = this.movementData;
        const property = (type === 'horizontal') ? 'x' : 'y';

        // Se for horizontal, cria um loop contínuo
        if (type === 'horizontal') {
            this[property] = start;
            const distance = Math.abs(end - start);
            const duration = (distance / speed) * 1000;
            const initialDirection = Math.sign(end - start);
            let directionMultiplier = 1;

            this.scene.tweens.add({
                targets: this,
                [property]: end,
                duration: duration,
                ease: 'Linear',
                yoyo: true,
                repeat: -1,
                onYoyo: () => {
                    directionMultiplier = -1;
                },
                onRepeat: () => {
                    directionMultiplier = 1;
                },
                onUpdate: () => {
                    this.body.setVelocityX(speed * initialDirection * directionMultiplier);
                }
            });
        }
        // Se for vertical, define a posição inicial
        else if (type === 'vertical') {
            this[property] = start;
        }
    }

    // Este método é chamado a cada frame
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.movementData || this.movementData.type !== 'vertical') {
            return;
        }

        if (this.isAtTop && !this.isMoving && this.playerWasOn && !this.playerIsOn) {
            this.moveDown();
        }

        this.playerWasOn = this.playerIsOn;
        this.playerIsOn = false;
    }

    // Move a plataforma para cima
    moveUp() {
        if (this.movementData.type !== 'vertical' || this.isMoving) return;

        const {
            end,
            speed
        } = this.movementData;
        const property = 'y';

        if (this[property] === end) return;

        this.scene.tweens.getTweensOf(this).forEach(tween => tween.stop());

        const distance = Math.abs(end - this[property]);
        const duration = (distance / speed) * 1000;

        this.isMoving = true;
        this.isAtTop = false;

        this.scene.tweens.add({
            targets: this,
            [property]: end,
            duration: duration,
            ease: 'Linear',
            onUpdate: () => {
                this.body.setVelocityY(-speed);
            },
            onComplete: () => {
                this.isMoving = false;
                this.body.setVelocityY(0);
                this.isAtTop = true;

                this.scene.time.delayedCall(2000, () => {
                    if (!this.active) return;
                    if (!this.playerIsOn) {
                        this.moveDown();
                    }
                });
            }
        });
    }

    moveDown() {
        if (this.movementData.type !== 'vertical' || this.isMoving) return;

        const {
            start,
            speed
        } = this.movementData;
        const property = 'y';

        if (this[property] === start) return;

        this.scene.tweens.getTweensOf(this).forEach(tween => tween.stop());

        const distance = Math.abs(this[property] - start);
        const duration = (distance / speed) * 1000;

        this.isMoving = true;
        this.isAtTop = false; // Não está mais no topo

        this.scene.tweens.add({
            targets: this,
            [property]: start,
            duration: duration,
            ease: 'Linear',
            onUpdate: () => {
                this.body.setVelocityY(speed);
            },
            onComplete: () => {
                this.isMoving = false;
                this.body.setVelocityY(0);
            }
        });
    }
}
