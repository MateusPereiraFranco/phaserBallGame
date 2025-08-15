export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Inicia o sprite com o primeiro frame da animação 'idle'
        super(scene, x, y, 'idle_1');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- AJUSTES FÍSICOS E VISUAIS ---
        this.setScale(0.10);

        // **CORREÇÃO**: Ajusta a caixa de colisão para ser menor e mais centralizada no personagem,
        // ignorando o espaço transparente excessivo da imagem.
        // Estes valores foram ajustados para melhor corresponder à arte do personagem.
        this.body.setSize(this.width * 0.4, this.height * 0.8);
        this.body.setOffset(this.width * 0.3, this.height * 0.15);


        this.setBounce(0.1);
        this.body.setAllowGravity(false);

        // Inicia com a animação 'idle'
        this.play('idle');
    }

    // A função de mudar de cor pode ser usada para um power-up futuro
    changeColor() {
        this.setTint(0xff00ff);
        this.scene.time.delayedCall(500, () => {
            this.clearTint();
        });
    }

    update(cursors) {
        if (!this.body) return;

        // --- LÓGICA DE MOVIMENTO ---
        if (cursors.left.isDown) {
            this.setVelocityX(-200);
            this.setFlipX(true); // Vira o sprite para a esquerda
        } else if (cursors.right.isDown) {
            this.setVelocityX(200);
            this.setFlipX(false); // Vira o sprite para a direita (padrão)
        } else {
            this.setVelocityX(0);
        }

        // --- MÁQUINA DE ESTADOS DE ANIMAÇÃO ---
        // Verifica o estado do jogador e toca a animação correta.
        if (!this.body.touching.down) {
            // Se não está tocando o chão, está pulando.
            this.play('jump', true);
        } else if (this.body.velocity.x !== 0) {
            // Se está no chão e se movendo, está correndo.
            this.play('run', true);
        } else {
            // Se está no chão e parado, está ocioso.
            this.play('idle', true);
        }
    }
}
