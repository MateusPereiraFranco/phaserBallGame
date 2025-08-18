export default class Saw extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {
        // Chama o construtor da classe Sprite
        super(scene, x, y, key);

        // Adiciona a serra à cena e ao sistema de física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Define as propriedades com base nos dados do JSON
        this.setScale(0.20);

        // Define o corpo de colisão como um círculo para ser mais preciso
        this.setCircle(this.width / 2 * 0.85); // 85% do raio
    }
}
