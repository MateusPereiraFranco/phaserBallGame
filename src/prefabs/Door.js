export default class Door extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, id) {
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.id = id; // ID único para esta porta
        this.isOpen = false;

        this.setScale(0.20);

        this.body.setSize(this.width, this.height * 0.2);
        this.body.setOffset(0, this.height * 0.8);
    }

    open() {
        if (this.isOpen) return;

        // Toca a animação de "abrindo"
        this.play('door-opening');

        this.on('animationcomplete-door-opening', () => {
            this.isOpen = true;
            // Toca a animação de "aberta" em loop
            this.play('door-open');
        }, this);
    }
}
