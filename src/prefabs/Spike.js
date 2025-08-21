export default class Spike extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {
        // Chama o construtor da classe Sprite
        super(scene, x, y, key);

        // Adiciona o espinho à cena e ao sistema de física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Define as propriedades com base nos dados do JSON
        this.setScale(data.scale || 0.25);
        if (data.angle) {
            this.setAngle(data.angle);
        }
        this.body.setSize(this.width*0.5, this.height * 0.50);
        this.body.setOffset(this.width * 0.25, this.height * 0.50);
        // Atualiza o corpo físico para corresponder às transformações
        this.refreshBody();
    }
}
