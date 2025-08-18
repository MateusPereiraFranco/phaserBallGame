export default class Saw extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {
        // Chama o construtor da classe Sprite
        super(scene, x, y, key);

        // Adiciona a serra à cena e ao sistema de física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- Configurações Padrão da Serra ---
        this.setScale(0.20);
        // Define o corpo de colisão como um círculo para ser mais preciso
        this.setCircle(this.width / 2 * 0.85);


        // Verifica se existem dados de movimento no JSON
        if (data && data.movement) {
            this.initMovement(data.movement);
        }
    }

    /**
     * Inicia um tween para mover a serra com base nos dados fornecidos.
     * @param {object} movementData O objeto de movimento do JSON do nível.
     */
    initMovement(movementData) {
        const { type, start, end, speed } = movementData;

        // Define qual propriedade será animada ('x' ou 'y')
        const propertyToTween = (type === 'horizontal') ? 'x' : 'y';

        // Garante que a serra comece na posição inicial definida
        this[propertyToTween] = start;

        // Calcula a distância e a duração do percurso
        const distance = Math.abs(end - start);
        // Duração em milissegundos (distância / velocidade)
        const duration = (distance / speed) * 1000;

        // Cria o tween
        this.scene.tweens.add({
            targets: this,
            [propertyToTween]: end, // Anima a propriedade 'x' ou 'y' até o valor 'end'
            duration: duration,
            ease: 'Linear',         // Movimento com velocidade constante
            yoyo: true,             // Faz o movimento de ida e volta
            repeat: -1              // Repete para sempre
        });
    }
}