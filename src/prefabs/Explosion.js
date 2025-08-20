// Explosion.js: Um efeito temporário de dano e visual.
export default class Explosion extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'explosion_1');
        this.setScale(2);

    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.anims.isPlaying && this.anims.currentFrame.isLast) {
            this.setActive(false);
            this.setVisible(false);
            this.body.enable = false;
        }
    }

    launch(x, y, radius) {
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        this.setPosition(x, y);

        this.body.setCircle(radius);

        const offsetX = (this.displayWidth - this.body.width) / 4;
        const offsetY = (this.displayHeight - this.body.height) / 4;
        this.body.setOffset(offsetX , offsetY);

        this.play('explosion');
    }
}
