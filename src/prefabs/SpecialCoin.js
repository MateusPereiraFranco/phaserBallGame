export default class SpecialCoin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        // Inicia com o primeiro frame da animação para evitar um "pisca"
        super(scene, x, y, 'specialCoins_11');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.setScale(0.03);
        this.body.setAllowGravity(false);

        this.play('special-coins');
    }
}
