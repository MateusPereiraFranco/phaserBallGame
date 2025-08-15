export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Chama o construtor da classe Sprite
        super(scene, x, y, 'player_sheet');

        // Adiciona o jogador à cena e ao sistema de física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configurações físicas
        this.setBounce(0.1);
        this.body.setAllowGravity(false); // Começa sem gravidade

        // Estado inicial
        this.currentColor = 'blue';
        this.play('roll-blue'); // Inicia a animação padrão
    }

    // Método para mudar a cor e a animação
    changeColor() {
        if (this.currentColor === 'blue') {
            this.currentColor = 'red';
            this.play('roll-red');
        } else {
            this.currentColor = 'blue';
            this.play('roll-blue');
        }
    }

    // Método de atualização, chamado a cada frame pela GameScene
    update(cursors) {
        if (!this.body) return;

        // Lógica de movimento vive aqui agora
        if (cursors.left.isDown) {
            this.setVelocityX(-200);
        } else if (cursors.right.isDown) {
            this.setVelocityX(200);
        } else {
            this.setVelocityX(0);
        }
    }
}
