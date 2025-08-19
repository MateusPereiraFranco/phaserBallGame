export default class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(data.scaleX || 1, data.scaleY || 1).refreshBody();
        this.setImmovable(true);
        this.body.setAllowGravity(false);

        // Criamos uma variável para controlar a direção. 1 = ida, -1 = volta.
        this.directionMultiplier = 1;

        if (data && data.movement) {
            this.initMovement(data.movement);
        }
    }

    initMovement(movementData) {
        const { type, start, end, speed } = movementData;
        const propertyToTween = (type === 'horizontal') ? 'x' : 'y';
        const distance = Math.abs(end - start);
        const duration = (distance / speed) * 1000;

        // Determina a direção inicial do movimento (1 para direita/baixo, -1 para esquerda/cima)
        const initialDirection = Math.sign(end - start);

        this[propertyToTween] = start;

        this.scene.tweens.add({
            targets: this,
            [propertyToTween]: end,
            duration: duration,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
            // --- A SOLUÇÃO ESTÁ AQUI ---
            // Evento que dispara QUANDO a volta (yoyo) começa.
            onYoyo: () => {
                // Invertemos a direção para a volta.
                this.directionMultiplier = -1;
            },
            onRepeat: () => {
                this.directionMultiplier = 1;
            },
            onUpdate: (tween, target) => {
                target.body.velocity[propertyToTween] = speed * initialDirection * this.directionMultiplier;
            }
        });
    }
}
