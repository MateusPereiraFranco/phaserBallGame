export default class Barrel extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Armazena os dados do JSON, como o que o barril vai dropar
        this.dropData = data;
        this.isHit = false;

        this.setScale(data.scale || 1);
    }

    // Método chamado quando a bola de fogo atinge o barril
    hit() {
        if (this.isHit) return; // Previne múltiplos acertos
        this.isHit = true;

        // Animação de piscar (tween)
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            repeat: 4,
            yoyo: true,
            onComplete: () => {
                this.destroyAndDrop();
            }
        });
    }

    // Método para destruir o barril e dropar o item
    destroyAndDrop() {
        // Se o barril está configurado para dropar um item, avisa a GameScene
        if (this.dropData.dropsItem && this.dropData.dropType) {
            this.scene.spawnItem(this.x, this.y, this.dropData.dropType);
        }
        
        // Destrói o barril
        this.destroy();
    }
}
