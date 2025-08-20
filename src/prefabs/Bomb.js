// Bomb.js: O projétil que cai e cria uma explosão.
import Explosion from "./Explosion.js";

export default class Bomb extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, explosionData) {
        super(scene, x, y, texture);
        scene.physics.add.existing(this);

        // Dados da explosão que será criada (ex: raio)
        this.explosionData = explosionData;
        this.setScale(0.5)
        this.body.setSize(this.displayWidth /2, this.displayHeight/2);
        this.setCircle((this.body.width / 2));
        
        this.setCollideWorldBounds(true); // Evita que a bomba saia do mundo
    }

    explode() {
        // Se a bomba já não estiver ativa, não faz nada.
        // Isto previne que o método seja chamado múltiplas vezes no mesmo frame.
        if (!this.active) {
            return;
        }

        // Desativa a bomba imediatamente para evitar colisões múltiplas
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;

        // Chama o método da cena para criar a explosão
        this.scene.addExplosion(this.x, this.y, this.explosionData.radius);

        // Agenda a destruição final do objeto para limpar a memória,
        // embora a bomba já esteja inativa e invisível.
        this.destroy();
    }
}
