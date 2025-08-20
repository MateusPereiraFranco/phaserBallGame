import Player from "../prefabs/Player.js";
import Fireball from "../prefabs/Fireball.js";
import Spike from "../prefabs/Spike.js";
import Door from "../prefabs/Door.js";
import Switch from "../prefabs/Switch.js";
import Saw from "../prefabs/Saw.js";
import Barrel from "../prefabs/Barrel.js";
import MovingPlatform from "../prefabs/MovingPlatform.js";
import FallingPlatform from "../prefabs/FallingPlatform.js";
import SpecialCoin from "../prefabs/SpecialCoin.js";
import Drone from "../prefabs/Drone.js";
import Bomb from "../prefabs/Bomb.js";
import Explosion from "../prefabs/Explosion.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.player = null;
        this.cursors = null;
        this.spacebar = null;
        this.ammo = 0;
        this.currentLevel = 1;
        this.lives = 3;
        this.isGamePaused = false;
        this.specialCoins = 0;
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.lives = data.lives !== undefined ? data.lives : 666;
        this.initialExtraJumps = data.extraJumps || 0;
        this.ammo = data.ammo || 0;
        this.specialCoins = data.specialCoins || 0;
    }

    create() {
        this.physics.world.createDebugGraphic();
        this.isGamePaused = true;
        const levelDataKey = `level${this.currentLevel}Data`;
        const levelData = this.cache.json.get(levelDataKey);

        this.scene.launch("UIScene", {
            lives: this.lives,
            extraJumps: this.initialExtraJumps,
            ammo: this.ammo,
            specialCoins: this.specialCoins
        });

        // --- CRIAÇÃO DOS OBJETOS DA FASE ---
        this.platforms = this.physics.add.staticGroup();
        this.movingPlatforms = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
        this.fallingPlatforms = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
        levelData.platforms.forEach((p) => {
            if (p.type === "moving") {
                const newPlatform = new MovingPlatform(this, p.x, p.y, "platform", p);
                this.movingPlatforms.add(newPlatform);
            } else if (p.type === "falling") {
                const newPlatform = new FallingPlatform(this, p.x, p.y, "platform", p);
                newPlatform.setImmovable(true);
                newPlatform.body.setAllowGravity(false);
                this.fallingPlatforms.add(newPlatform);
            } else {
                this.platforms
                    .create(p.x, p.y, "platform")
                    .setScale(p.scaleX, p.scaleY)
                    .refreshBody();
            }
        });

        this.walls = this.physics.add.staticGroup();
        if (levelData.walls) {
            levelData.walls.forEach((w) =>
                this.walls
                .create(w.x, w.y, "wall")
                .setScale(w.scaleX, w.scaleY)
                .refreshBody()
            );
        }

        this.specialCoinsGroup = this.physics.add.group({
            classType: SpecialCoin,
            runChildUpdate: true,
            allowGravity: false,
            immovable: true
        });
        if (levelData.specialCoins) {
            levelData.specialCoins.forEach(coinData => {
                const newCoin = new SpecialCoin(this, coinData.x, coinData.y, 'special-coins');
                this.specialCoinsGroup.add(newCoin);
            });
        }

        this.barrels = this.physics.add.group();
        if (levelData.barrels) {
            levelData.barrels.forEach((b) => {
                const newBarrel = new Barrel(this, b.x, b.y, "barrel", b);
                this.barrels.add(newBarrel);
                newBarrel.body.setAllowGravity(false);
                newBarrel.body.setImmovable(true);
            });
        }

        this.spikes = this.physics.add.group();
        levelData.spikes.forEach((s) => {
            const newSpike = new Spike(this, s.x, s.y, "spike", s);
            this.spikes.add(newSpike);
            newSpike.body.setAllowGravity(false);
            newSpike.body.setImmovable(true);
        });

        this.saws = this.physics.add.group();
        if (levelData.saws) {
            levelData.saws.forEach((s) => {
                const newSaw = new Saw(this, s.x, s.y, "saw", s);
                this.saws.add(newSaw);
                newSaw.body.setAllowGravity(false);
                newSaw.body.setImmovable(true);
                newSaw.body.setAngularVelocity(150);
            });
        }

        this.dronesGroup = this.physics.add.group({
            classType: Drone,
            runChildUpdate: true,
            allowGravity: false,
            immovable: true
        });
        this.bombsGroup = this.physics.add.group({
            classType: Bomb,
            runChildUpdate: true
        });
        // O grupo de explosões não precisa de uma classe, pois são sprites temporários
        this.explosionsGroup = this.physics.add.group({
            classType: Explosion,
            runChildUpdate: true
        });

        // --- CRIAÇÃO DO JOGADOR USANDO A CLASSE E PASSANDO OS PULOS ---
        this.player = new Player(
            this,
            levelData.playerStart.x,
            levelData.playerStart.y,
            this.initialExtraJumps // Passa o valor para o construtor do Player
        );
        this.player.on("deathComplete", this.handlePlayerDeath, this);
        this.player.on("fire", this.fireFireball, this);
        // Ouve o evento do jogador para saber quando atualizar a UI
        this.player.on("playerDataChanged", this.updateUI, this);


        // --- CRIAÇÃO DOS ITENS ---
        this.doubleJumpItemsGroup = this.physics.add.group({ allowGravity: false });
        if (levelData.doubleJumpItems) {
            levelData.doubleJumpItems.forEach((itemData) =>
                this.doubleJumpItemsGroup
                .create(itemData.x, itemData.y, "doubleJump")
                .setScale(itemData.scale)
            );
        }

        this.fireballItemsGroup = this.physics.add.group({ allowGravity: false });
        if (levelData.fireballItems) {
            levelData.fireballItems.forEach((itemData) =>
                this.fireballItemsGroup
                .create(itemData.x, itemData.y, "fireballItem")
                .setScale(itemData.scale)
            );
        }

        this.fireballsGroup = this.physics.add.group({
            classType: Fireball,
            runChildUpdate: true,
            allowGravity: false,
        });

        this.colorChangeItemsGroup = this.physics.add.group({
            allowGravity: false,
        });
        if (levelData.colorChangeItems) {
            levelData.colorChangeItems.forEach((itemData) =>
                this.colorChangeItemsGroup
                .create(itemData.x, itemData.y, "colorChange")
                .setScale(itemData.scale)
            );
        }

        // WORLD
        this.doors = this.physics.add.group();
        if (levelData.doors) {
            levelData.doors.forEach((d) => {
                const newDoor = new Door(this, d.x, d.y, "door_closed", d.id);
                this.doors.add(newDoor);
                newDoor.body.setAllowGravity(false);
                newDoor.body.setImmovable(true);
                newDoor.setDepth(-1);
            });
        }

        this.physics.add.collider(
            this.fireballsGroup,
            this.barrels,
            this.hitBarrel,
            null,
            this
        );

        this.switches = this.physics.add.group();
        if (levelData.switches) {
            levelData.switches.forEach((s) => {
                const newSwitch = new Switch(this, s.x, s.y, "switch", s.doorId);
                this.switches.add(newSwitch);
                newSwitch.body.setAllowGravity(false);
                newSwitch.body.setImmovable(true);
                newSwitch.setDepth(-1);
            });
        }

        if (levelData.drones) {
            levelData.drones.forEach(droneData => {
                const newDrone = new Drone(this, droneData.x, droneData.y, droneData);
                this.dronesGroup.add(newDrone);
            });
        }

        if (levelData.goal) {
            this.goalItem = this.physics.add
                .sprite(levelData.goal.x, levelData.goal.y, "goal")
                .setScale(levelData.goal.scale);
            this.physics.world.enable(this.goalItem);
            this.goalItem.body.setAllowGravity(false);
        }

        // --- CONFIGURAÇÃO DAS COLISÕES E OVERLAPS ---
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(
            this.player,
            this.movingPlatforms,
            (player, platform) => {
                if (platform.body.touching.up && player.body.touching.down) {
                    player.onMovingPlatform = true;
                    player.platformVelocity.x = platform.body.velocity.x;
                }
            },
            null,
            this
        );
        this.physics.add.collider(
            this.player,
            this.fallingPlatforms,
            this.triggerPlatformFall,
            null,
            this
        );

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(
            this.player,
            this.spikes,
            this.loseLife,
            null,
            this
        );
        this.physics.add.collider(
            this.player,
            this.saws,
            this.loseLife,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.doubleJumpItemsGroup,
            this.collectDoubleJumpItem,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.colorChangeItemsGroup,
            this.collectColorChangeItem,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.fireballItemsGroup,
            this.collectFireballItem,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.specialCoinsGroup,
            this.collectSpecialCoin,
            null,
            this
        );
        if (this.goalItem)
            this.physics.add.overlap(
                this.player,
                this.goalItem,
                this.goToNextLevel,
                null,
                this
            );
        this.physics.add.collider(this.fireballsGroup, this.platforms, (fireball) =>
            fireball.setActive(false).setVisible(false)
        );
        this.physics.add.collider(this.fireballsGroup, this.walls, (fireball) =>
            fireball.setActive(false).setVisible(false)
        );
        this.physics.add.overlap(
            this.player,
            this.doors,
            this.enterDoor,
            null,
            this
        );
        this.physics.add.collider(this.player, this.barrels);
        if (this.switches) {
            this.physics.add.collider(
                this.fireballsGroup,
                this.switches,
                this.hitSwitch,
                (fireball, switchInstance) => {
                    return !switchInstance.isHit;
                },
                this
            );
        }

        this.physics.add.overlap(this.player, this.dronesGroup, this.loseLife, null, this);
        this.physics.add.overlap(this.player, this.bombsGroup, this.handleBombImpact, null, this);
        
        // 2. QUANDO A EXPLOSÃO TOCA NO JOGADOR, VERIFICA O DANO DIRECIONAL
        this.physics.add.overlap(this.player, this.explosionsGroup, this.handlePlayerExplosionDamage, null, this);

        // Quando uma bomba colide com as plataformas, ela também explode
        this.physics.add.collider(this.bombsGroup, this.platforms, this.handleBombImpact, null, this);
        this.physics.add.collider(this.bombsGroup, this.movingPlatforms, this.handleBombImpact, null, this);
        this.physics.add.collider(this.bombsGroup, this.fallingPlatforms, this.handleBombImpact, null, this);

        // --- CONTROLES ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        this.showLevelTitle();
    }

    update() {
        if (!this.player || this.isGamePaused) return;

        // O update do player agora cuida de todo o movimento, incluindo pulos
        this.player.update(this.cursors);

        // --- LÓGICA DE PULO REMOVIDA DAQUI ---

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            if (this.ammo > 0) {
                this.player.shoot();
            }
        }

        // Morte por queda
        if (this.player.y > 617) this.loseLife();
    }

    showLevelTitle() {
        const levelText = this.add
            .text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                `Level ${this.currentLevel}`, { fontSize: "64px", fill: "#FFFFFF" }
            )
            .setOrigin(0.5)
            .setScrollFactor(0);
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: levelText,
                alpha: 0,
                duration: 500,
                onComplete: () => levelText.destroy(),
            });
            this.player.body.setAllowGravity(true);
            this.isGamePaused = false;
        });
    }

    updateUI() {
        // Se o jogador já foi criado, pega os pulos dele.
        // Senão, usa o valor inicial que a cena recebeu.
        const extraJumps = this.player ? this.player.extraJumps : this.initialExtraJumps;

        this.events.emit("updateUI", {
            lives: this.lives,
            extraJumps: extraJumps,
            ammo: this.ammo,
            specialCoins: this.specialCoins
        });
    }

    fireFireball() {
        const fireball = this.fireballsGroup.get();
        if (fireball) {
            const direction = this.player.flipX ? "left" : "right";
            const spawnX = this.player.flipX ?
                this.player.x - 20 :
                this.player.x + 20;
            fireball.fire(spawnX, this.player.y, direction);

            this.ammo--;
            this.updateUI();
        }
    }

    collectSpecialCoin(player, coin) {
        coin.disableBody(true, true); // Remove a moeda da tela
        this.specialCoins++;

        // Verifica se o jogador coletou 10 moedas
        if (this.specialCoins >= 10) {
            this.specialCoins = 0; // Reseta o contador
            this.lives++; // Ganha uma vida
            // Efeito visual opcional para o ganho de vida
            this.cameras.main.flash(200, 100, 255, 100);
        }

        this.updateUI(); // Atualiza a interface
    }

    addBomb(x, y, bombData) {
        const bomb = this.bombsGroup.get(x, y, 'bomb', bombData);
        if (bomb) {
            bomb.setActive(true);
            bomb.setVisible(true);
            bomb.body.setAllowGravity(true);
            bomb.explosionData = bombData.explosion;
        }
    }

    addExplosion(x, y, radius) {
        const explosion = this.explosionsGroup.get(x, y);
        if (explosion) {
            explosion.launch(x, y, radius);
            explosion.body.setAllowGravity(false)
            explosion.setActive(true).setVisible(true);
            explosion.body.setCircle(radius);
            explosion.play('explosion');
        }
    }

    handleBombImpact(object1, object2) {
    // Identifica qual dos objetos é a bomba
    const bombInstance = (object1 instanceof Bomb) ? object1 : object2;
    // Identifica o outro objeto na colisão
    const otherObject = (bombInstance === object1) ? object2 : object1;

    // Garante que a bomba existe e está ativa antes de fazer qualquer coisa
    if (bombInstance && bombInstance.active) {

        if (otherObject instanceof Player) {
            this.loseLife();
        }

        bombInstance.explode();
    }
}

    handlePlayerExplosionDamage(player, explosion) {
        if (player.body.center.y <= explosion.body.center.y) {
            this.loseLife();
        }
    }

    // --- FUNÇÕES DE CALLBACK ---
    loseLife() {
        if (this.isGamePaused || this.player.isDead) return;
        this.isGamePaused = true;
        this.player.die();
    }

    handlePlayerDeath() {
        this.lives--;
        this.updateUI();

        if (this.lives > 0) {
            this.cameras.main.fade(500, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1)
                    this.scene.restart({
                        level: this.currentLevel,
                        lives: this.lives,
                        extraJumps: 0,
                        ammo: 0,
                        specialCoins: this.specialCoin
                    });
            });
        } else {
            console.log("GAME OVER");
            this.scene.start("GameScene", { level: 1, lives: 3, specialCoins: 0 });
        }
    }

    collectDoubleJumpItem(player, item) {
        item.disableBody(true, true);
        player.addExtraJump(); // Chama o método do jogador
        // A UI será atualizada pelo evento 'playerDataChanged'
        this.cameras.main.flash(200, 255, 255, 0);
    }

    collectFireballItem(player, item) {
        item.disableBody(true, true);
        this.ammo++;
        this.updateUI();
        this.cameras.main.flash(200, 255, 69, 0);
    }

    collectColorChangeItem(player, item) {
        item.disableBody(true, true);
        this.player.changeColor();
        this.cameras.main.flash(200, 255, 0, 255);
    }

    hitSwitch(fireball, switchInstance) {
        fireball.setActive(false).setVisible(false);
        switchInstance.hit();
    }

    hitBarrel(fireball, barrel) {
        fireball.setActive(false).setVisible(false);
        barrel.hit();
    }

    spawnItem(x, y, type) {
        let item = null;
        if (type === "fireball") {
            item = this.fireballItemsGroup.create(x, y, "fireballItem");
        } else if (type === "doubleJump") {
            item = this.doubleJumpItemsGroup.create(x, y, "doubleJump");
        }

        if (item) {
            item.setScale(2);
        }
    }

    triggerPlatformFall(player, platform) {
        if (player.body.touching.down && platform.body.touching.up) {
            platform.startFall();
        }
    }

    enterDoor(player, door) {
        if (door.isOpen && !this.isGamePaused) {
            this.isGamePaused = true;

            player.setVelocity(0, 0);
            player.body.setAllowGravity(false);

            player.play("run", true);

            this.tweens.add({
                targets: player,
                x: door.x,
                duration: 500,
                ease: "Linear",
                onComplete: () => {
                    this.tweens.add({
                        targets: player,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            this.goToNextLevel();
                        },
                    });
                },
            });
        }
    }

    goToNextLevel() {
        const nextLevel = this.currentLevel + 1;
        const nextLevelDataKey = `level${nextLevel}Data`;
        if (this.cache.json.has(nextLevelDataKey)) {
            this.scene.start("GameScene", {
                level: nextLevel,
                lives: this.lives,
                extraJumps: 0, // Passa os pulos para o próximo nível
                ammo: 0,
                specialCoins: this.specialCoins
            });
        } else {
            console.log("VOCÊ VENCEU!");
            this.scene.start("GameScene", { level: 1, lives: 3, specialCoins: 0 });
        }
    }
}
