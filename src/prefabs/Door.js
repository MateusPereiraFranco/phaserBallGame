export default class Door extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, id) {
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.id = id; // ID único para esta porta
        this.isOpen = false;

        this.setScale(0.20);

        // A caixa de colisão terá a mesma largura, mas apenas 40% da altura da imagem.
        this.body.setSize(this.width, this.height * 0.2);
        // Desloca a caixa de colisão para baixo para cobrir apenas a parte mais baixa da porta.
        this.body.setOffset(0, this.height * 0.8);
    }

    // Método chamado pelo interruptor para iniciar a abertura
    open() {
        if (this.isOpen) return;

        // Toca a animação de "abrindo"
        this.play('door-opening');

        // Ouve o evento de conclusão da animação
        this.on('animationcomplete-door-opening', () => {
            this.isOpen = true;
            // Toca a animação de "aberta" em loop
            this.play('door-open');
        }, this);
    }
}
