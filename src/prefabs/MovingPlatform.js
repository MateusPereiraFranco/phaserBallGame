export default class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, data) {
        // Chama o construtor da classe Sprite
        super(scene, x, y, key);
        
        // Adiciona o objeto à cena e ao sistema de física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configurações da plataforma
        this.setScale(data.scaleX || 1, data.scaleY || 1).refreshBody();
        this.setImmovable(true);
        this.body.setAllowGravity(false);
        // A fricção padrão não funciona de forma confiável com corpos imóveis,
        // por isso faremos o movimento manualmente.
        this.setFrictionX(1);

        // Guarda a posição anterior para calcular o deslocamento a cada frame
        this.prevX = this.x;
        this.prevY = this.y;

        // Inicia o movimento se os dados existirem
        if (data && data.movement) {
            this.initMovement(data.movement);
        }
    }

    /**
     * O método preUpdate é chamado automaticamente a cada frame, antes da lógica principal.
     * Usaremos para calcular o deslocamento da plataforma e aplicá-lo ao jogador.
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Calcula o quanto a plataforma se moveu desde o último frame
        const dx = this.x - this.prevX;
        const dy = this.y - this.prevY;
        
        // É crucial verificar se o jogador e seu corpo físico existem para evitar erros.
        // Isso torna a referência ao jogador mais segura.
        if (this.scene.player && this.scene.player.body) {
            // A verificação 'body.touching' garante que só moveremos o jogador
            // quando ele estiver fisicamente em cima da plataforma.
            if (this.body.touching.up && this.scene.player.body.touching.down) {
                // Movemos a POSIÇÃO do corpo físico do jogador diretamente.
                // Isso garante que o jogador se mova exatamente com a plataforma.
                this.scene.player.body.position.x += dx;
                this.scene.player.body.position.y += dy;

                /*
                 * NOTA IMPORTANTE: O seu arquivo Player.js contém a seguinte lógica em seu método update():
                 * } else {
                 * this.setVelocityX(0);
                 * }
                 * Isso cria um conflito. A plataforma move o jogador (alterando a posição), mas logo em seguida,
                 * o update do jogador zera sua velocidade se nenhuma tecla estiver pressionada, o que pode fazer
                 * com que o motor de física pare o movimento horizontal. Se o jogador ainda não se mover
                 * corretamente na horizontal, a solução definitiva é ajustar essa lógica no Player.js.
                 */
            }
        }

        // Atualiza a posição anterior para o próximo frame
        this.prevX = this.x;
        this.prevY = this.y;
    }

    /**
     * Inicia um tween para mover a plataforma com base nos dados fornecidos.
     * @param {object} movementData O objeto de movimento do JSON do nível.
     */
    initMovement(movementData) {
        const { type, start, end, speed } = movementData;
        const propertyToTween = (type === 'horizontal') ? 'x' : 'y';
        const distance = Math.abs(end - start);
        const duration = (distance / speed) * 1000;

        // Garante que a plataforma comece na posição inicial
        this[propertyToTween] = start;

        // Cria o tween de movimento
        this.scene.tweens.add({
            targets: this,
            [propertyToTween]: end,
            duration: duration,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });
    }
}
