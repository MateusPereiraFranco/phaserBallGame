// Spiderbot.js: O boss que patrulha e ataca o jogador.
export default class Spiderbot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, data) {
        super(scene, x, y, 'spiderbot_idle_sheet');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- Atributos do Boss ---
        this.hp = data.hp || 10;
        this.movementData = data.movement;
        this.attackRange = 100; // Distância para começar a atacar
        this.attackCooldown = 3000; // Tempo (ms) para poder considerar um novo ataque
        this.canAttack = true;

        this.setScale(data.scale || 1);

        // --- Atributos para Patrulha ---
        this.patrolDirection = 1; // 1 para direita, -1 para esquerda
        this.patrolSpeed = data.movement.speed || 50;

        // --- Flags de Estado ---
        this.isDead = false;
        this.isTakingHit = false;
        this.isAttacking = false;

        // --- Configurações Físicas ---
        this.body.setAllowGravity(false);
        this.setCollideWorldBounds(true);
        this.body.setSize(this.width * 1.05, this.height * 0.65);
        this.body.setOffset(this.width * 0.1, this.height * 0.3);
    }

    update() {
        // Se o spider está em um estado de ação (morto, tomando dano ou atacando),
        // a lógica de estado é controlada dentro de seu próprio método, evitando conflitos.
        if (this.isDead || this.isTakingHit || this.isAttacking) {
            return;
        }

        if (!this.scene.player) return;

        const player = this.scene.player;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Lógica de ataque: se estiver no alcance e puder atacar, ataca.
        if (distance < this.attackRange && this.canAttack) {
            this.attack();
        } else {
            // Se não, patrulha.
            this.patrol();
        }
    }

    /**
     * Lógica de ataque completamente refeita para ser mais robusta e previsível,
     * usando timers em vez de eventos de animação.
     */
    attack() {
        // Garante que a função não seja chamada múltiplas vezes se já estiver atacando.
        if (!this.active || this.isAttacking) return;

        this.isAttacking = true;
        this.canAttack = false; // Impede ataques consecutivos imediatamente

        // Para o movimento atual e inicia a animação de ataque.
        this.setVelocityX(0);
        this.play('spiderbot-attack', true);

        // Vira para o jogador.
        const playerIsLeft = this.scene.player.x < this.x;
        this.setFlipX(playerIsLeft);
        const attackDirection = playerIsLeft ? -1 : 1;

        // Ajusta a hitbox para a animação de ataque.
        if (playerIsLeft) {
            this.body.setOffset(this.width * 0.08, this.height * 0.3);
        } else {
            this.body.setOffset(this.width * 0.45, this.height * 0.3);
        }

        // --- Sequência de Ataque Controlada por Timers ---
        const lungeSpeed = 250;
        const lungeDuration = 400;      // Duração do avanço em ms.
        const pauseAfterAttack = 500;  // Pausa de 1 segundo após o ataque, como solicitado.

        // 1. Inicia o avanço (lunge) imediatamente.
        this.setVelocityX(lungeSpeed * attackDirection);

        // 2. Agenda o FIM do avanço.
        this.scene.time.delayedCall(lungeDuration, () => {
            if (!this.active) return; // Checagem de segurança.

            this.setVelocityX(0); // Para o movimento.
            this.play('spiderbot-idle', true); // Fica na animação de parado.

            // Restaura a hitbox para a posição de 'idle'.
            if (this.flipX) { // Virado para a esquerda
                this.body.setOffset(this.width * 0.35, this.height * 0.3);
            } else { // Virado para a direita
                this.body.setOffset(this.width * 0.1, this.height * 0.3);
            }

            // 3. Agenda o FIM da pausa para voltar a patrulhar.
            this.scene.time.delayedCall(pauseAfterAttack, () => {
                if (!this.active || this.isDead) return;

                // Libera a aranha para voltar ao seu ciclo normal no `update`.
                this.isAttacking = false;
                // A flag `canAttack` só será resetada para `true` no método `patrol`,
                // garantindo que ela complete um percurso antes de atacar de novo.
            });
        });
    }


    patrol() {
        if (this.isDead || this.isAttacking || this.isTakingHit) return;

        if (!this.anims.currentAnim || this.anims.currentAnim.key !== 'spiderbot-walk') {
            this.play('spiderbot-walk', true);
        }

        const { start, end } = this.movementData;
        let reachedEndpoint = false;

        if (this.x >= end && this.patrolDirection === 1) {
            this.patrolDirection = -1;
            this.setFlipX(true);
            this.body.setOffset(this.width * 0.35, this.height * 0.3);
            reachedEndpoint = true;
        } else if (this.x <= start && this.patrolDirection === -1) {
            this.patrolDirection = 1;
            this.setFlipX(false);
            this.body.setOffset(this.width * 0.1, this.height * 0.3);
            reachedEndpoint = true;
        }

        // A aranha só pode considerar atacar novamente depois que chegar a um extremo da patrulha.
        if (reachedEndpoint) {
            this.canAttack = true;
        }

        this.setVelocityX(this.patrolSpeed * this.patrolDirection);
    }

    takeHit() {
        if (this.isDead || this.isTakingHit) return;

        this.hp--;
        this.isTakingHit = true;
        this.isAttacking = false;
        this.canAttack = false;

        this.setVelocityX(0);
        this.play('spiderbot-takehit');
        this.setTint(0xffffff);

        if (this.hp <= 0) {
            this.die();
        } else {
            this.scene.time.delayedCall(800, () => {
                if (this.isDead || !this.active) return;
                this.clearTint();
                this.isTakingHit = false;
            });
        }
    }

    die() {
        if (this.isDead) return;

        this.isDead = true;
        this.body.setEnable(false);
        this.setVelocityX(0);

        this.clearTint();
        this.play('spiderbot-death');

        this.scene.time.delayedCall(700, () => {
            this.destroy();
        });
    }
}
