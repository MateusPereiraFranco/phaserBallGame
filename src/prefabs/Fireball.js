export default class Fireball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Usa o primeiro frame da animação como textura base
        super(scene, x, y, 'bullet_1');
        this.setScale(0.10);
    }

    // Método para "disparar" a bola de fogo a partir de uma posição
    fire(x, y, direction) {
        this.body.reset(x, y); // Reposiciona a bola de fogo
        this.setActive(true);
        this.setVisible(true);

        // Define a velocidade com base na direção do jogador
        const speed = 400;
        if (direction === 'left') {
            this.setVelocityX(-speed);
            this.setFlipX(true); // Vira o sprite se necessário
        } else {
            this.setVelocityX(speed);
            this.setFlipX(false);
        }

        this.play('fireball-anim'); // Toca a animação
    }

    // Método de atualização, chamado a cada frame pela GameScene
    update() {
        // Se a bola de fogo sair da tela, a desativamos para ser reutilizada
        if (this.x < 0 || this.x > this.scene.cameras.main.width) {
            this.setActive(false);
            this.setVisible(false);
            this.body.stop();
        }
    }
}
