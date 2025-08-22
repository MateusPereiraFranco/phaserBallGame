export default class FallingPlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Guarda a posição inicial para poder reaparecer
        this.initialX = x;
        this.initialY = y;

        // Configurações da plataforma
        this.setScale(data.scaleX || 0.2, data.scaleY || 0.2).refreshBody();

        // Estado para controlar se a queda já foi acionada
        this.fallTriggered = false;
    }

    startFall() {
        // Impede que a função seja chamada várias vezes
        if (this.fallTriggered) {
            return;
        }
        this.fallTriggered = true;

        // Animação de "tremor" antes de cair
        this.scene.tweens.add({
            targets: this,
            x: this.x + 3,
            duration: 50,
            ease: 'Linear',
            yoyo: true,
            repeat: 10, // Repete o tremor por um tempo
        });

        // Timer para a queda (3 segundos)
        this.scene.time.delayedCall(1000, () => {
            this.setImmovable(false);
            this.body.setAllowGravity(true);
            this.body.setVelocityY(100); // Dá um pequeno impulso para baixo

            // Timer para reaparecer (5 segundos após começar a cair)
            this.scene.time.delayedCall(5000, this.resetPlatform, [], this);
        });
    }

    resetPlatform() {
        // Para a física e o movimento
        this.body.setAllowGravity(false);
        this.body.setVelocity(0, 0);
        
        // Reposiciona
        this.setPosition(this.initialX, this.initialY);
        this.refreshBody();
        
        // Torna-a sólida novamente
        this.setImmovable(true);

        // Permite que seja acionada novamente
        this.fallTriggered = false;
    }
}
