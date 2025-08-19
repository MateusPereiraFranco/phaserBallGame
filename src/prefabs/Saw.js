export default class Saw extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {

        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.20);

        this.body.setSize(this.displayWidth * 4, this.displayHeight * 4);

        this.setCircle((this.body.width / 2));


        // Verifica se existem dados de movimento no JSON
        if (data && data.movement) {
            this.initMovement(data.movement);
        }
    }

    /**
     * Inicia um tween para mover a serra com base nos dados fornecidos.
     * @param {object} movementData O objeto de movimento do JSON do nível.
     */
    
    initMovement(movementData) {
        const { type, start, end, speed } = movementData;
        const propertyToTween = (type === 'horizontal') ? 'x' : 'y';
        const distance = Math.abs(end - start);
        const duration = (distance / speed) * 1000;

        this[propertyToTween] = start;

        this.scene.tweens.add({
            targets: this,
            [propertyToTween]: end,
            duration: duration,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });
    }
}
