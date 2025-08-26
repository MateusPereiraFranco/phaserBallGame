// Drone.js: O inimigo que patrulha e solta bombas.
export default class Drone extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, data) {
        // --- CORREÇÃO AQUI ---
        // Usa a chave do spritesheet de 'andar' como textura inicial
        super(scene, x, y, 'drone_walk_sheet');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.bombData = data.bomb;
        this.isDropping = false;

        // Configurações físicas
        this.setCollideWorldBounds(true);

        // Inicia o movimento de patrulha
        this.initMovement(data.movement);

        // Inicia o timer para soltar bombas
        this.dropTimer = scene.time.addEvent({
            delay: this.bombData.dropInterval,
            callback: this.prepareToDrop,
            callbackScope: this,
            loop: true
        });

        this.play('drone-walk');
    }

    initMovement(movementData) {
        const { start, end, speed } = movementData;
        const distance = Math.abs(end - start);
        const duration = (distance / speed) * 1000;

        // Cria o tween para o movimento horizontal
        this.moveTween = this.scene.tweens.add({
            targets: this,
            x: end,
            duration: duration,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
            onYoyo: () => { this.setFlipX(true); }, // Vira o sprite na volta
            onRepeat: () => { this.setFlipX(false); } // Desvira o sprite na ida
        });
    }

    prepareToDrop() {
        if (this.isDropping) return; // Se já estiver a soltar, não faz nada

        this.isDropping = true;
        this.moveTween.pause(); // Pausa o movimento
        this.play('drone-drop'); // Toca a animação de soltar

        // Quando a animação 'drone-drop' terminar, chama o método dropBomb
        this.once('animationcomplete-drone-drop', this.dropBomb, this);
    }

    dropBomb() {
        // A cena (GameScene) é responsável por criar a bomba
        this.scene.addBomb(this.x, this.y + 15, this.bombData);

        // Volta ao estado normal
        this.play('drone-walk', true);
        this.moveTween.resume();
        this.isDropping = false;
    }

    takeHit() {
        // Se já estiver morto, não faz nada
        if (this.isDead) {
            return;
        }

        this.isDead = true;

        // Para todos os timers e movimentos
        this.dropTimer.destroy();
        if (this.moveTween) {
            this.moveTween.stop();
        }

        // Desativa o corpo físico para que não interaja mais
        this.body.setEnable(false);

        // Toca a animação de morte, que agora deve funcionar
        this.play('drone-death', true);

        // Ouve o evento de conclusão da animação ESPECÍFICA para se autodestruir
        this.once('animationcomplete-drone-death', () => {
            this.destroy();
        });
    }


    // Limpa o timer quando o drone for destruído para evitar memory leaks
    destroy(fromScene) {
        this.dropTimer.destroy();
        super.destroy(fromScene);
    }
}
