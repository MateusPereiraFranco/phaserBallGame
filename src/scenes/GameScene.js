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
import Spiderbot from "../prefabs/Spiderbot.js";

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
        this.lives = data.lives !== undefined ? data.lives : 3;
        this.initialExtraJumps = data.extraJumps || 0;
        this.ammo = data.ammo || 0;
        this.specialCoins = data.specialCoins || 0;
    }

    create() {

        const levelDataKey = `level${this.currentLevel}Data`;
        const levelData = this.cache.json.get(levelDataKey);

        this.isGamePaused = true;

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
                const newPlatform = new MovingPlatform(this, p.x, p.y, "movingPlatform", p);
                this.movingPlatforms.add(newPlatform);
            } else if (p.type === "falling") {
                const newPlatform = new FallingPlatform(this, p.x, p.y, "fallingPlatform", p);
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
        this.explosionsGroup = this.physics.add.group({
            classType: Explosion,
            runChildUpdate: true
        });

        // --- CRIAÇÃO DO JOGADOR ---
        this.player = new Player(
            this,
            levelData.playerStart.x,
            levelData.playerStart.y,
            this.initialExtraJumps
        );
        this.player.on("deathComplete", this.handlePlayerDeath, this);
        this.player.on("fire", this.fireFireball, this);
        this.player.on("playerDataChanged", this.updateUI, this);

        // ... (criação de itens continua igual) ...
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
        this.colorChangeItemsGroup = this.physics.add.group({ allowGravity: false });
        if (levelData.colorChangeItems) {
            levelData.colorChangeItems.forEach((itemData) =>
                this.colorChangeItemsGroup
                    .create(itemData.x, itemData.y, "colorChange")
                    .setScale(itemData.scale)
            );
        }


        // --- WORLD ---

        if (levelData.background) {
            const map = this.make.tilemap({ key: levelData.background.tilemapKey });

            const tileset = map.addTilesetImage(
                levelData.background.tilesetNameInTiled,
                levelData.background.tilesetImageKey
            );

            // 1. Cria a camada de fundo (APENAS VISUAL)
            const backgroundLayer = map.createLayer('BackgroundLayer', tileset, 0, 0);
            if (backgroundLayer) {
                backgroundLayer.setDepth(-10);
            }

            // 2. Cria a camada de plataformas (COM COLISÃO)
            const platformsLayer = map.createLayer('PlatformsLayer', tileset, 0, 0);

            // 3. Ativa a colisão APENAS na camada de plataformas
            if (platformsLayer) {
                // O Phaser vai procurar a propriedade "collides: true" que você definiu no Tiled
                platformsLayer.setCollisionByProperty({ collides: true });

                // Adiciona o collider entre o jogador e ESTA camada específica
                this.physics.add.collider(this.player, platformsLayer, (player) => {
                    if (player.body.blocked.down) {
                        if (player.platformStuckOn) {
                            player.platformStuckOn = null;
                        }
                    }
                });
            }
        }

        this.doors = this.physics.add.group();
        if (levelData.doors) {
            levelData.doors.forEach((d) => {
                const newDoor = new Door(this, d.x, d.y, "door_closed", d.id);
                this.doors.add(newDoor);
                newDoor.body.setAllowGravity(false);
                newDoor.setDepth(-1);
            });
        }

        this.physics.add.collider(this.fireballsGroup, this.barrels, this.hitBarrel, null, this);

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
        this.physics.add.collider(this.player, this.platforms, (player) => {
            if (player.body.blocked.down) {
                if (player.platformStuckOn) {
                    player.platformStuckOn = null;
                }
            }
        });

        // <-- ALTERADO: Lógica do collider de plataformas móveis foi simplificada
        this.physics.add.collider(
            this.player,
            [this.movingPlatforms, this.fallingPlatforms],
            (player, platform) => {
                // Este callback agora roda para ambos os tipos de plataforma.
                if (platform.body.touching.up && player.body.touching.down) {
                    // "Gruda" o jogador na plataforma, não importa o tipo.
                    player.platformStuckOn = platform;

                    // --- Lógica Específica por Tipo ---
                    // Se for uma MovingPlatform vertical, ativa o movimento.
                    if (platform instanceof MovingPlatform && platform.movementData.type === 'vertical') {
                        platform.moveUp();
                    }
                    // Se for uma FallingPlatform, ativa a sequência de queda.
                    else if (platform instanceof FallingPlatform) {
                        platform.startFall();
                    }
                }
            },
            null,
            this
        );

        // --- BOSSGROUP ---
        this.bossesGroup = this.physics.add.group({
            allowGravity: false,
            runChildUpdate: true, // ESSENCIAL para a IA do boss funcionar
            immovable: true
        });
        // 1. DANO AO JOGADOR: O jogador perde uma vida ao tocar no boss
        this.physics.add.collider(this.player, this.bossesGroup, this.loseLife, null, this);
        // 2. DANO AO BOSS: O boss leva dano da fireball
        this.physics.add.collider(this.fireballsGroup, this.bossesGroup, this.hitSpiderbot, null, this);
        if (levelData.spiderbot) {
            const botData = levelData.spiderbot;
            const spiderbot = new Spiderbot(this, botData.x, botData.y, botData);
            this.bossesGroup.add(spiderbot);
        }

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.spikes, this.loseLife, null, this);
        this.physics.add.collider(this.player, this.saws, this.loseLife, null, this);
        this.physics.add.overlap(this.player, this.doubleJumpItemsGroup, this.collectDoubleJumpItem, null, this);
        this.physics.add.overlap(this.player, this.colorChangeItemsGroup, this.collectColorChangeItem, null, this);
        this.physics.add.overlap(this.player, this.fireballItemsGroup, this.collectFireballItem, null, this);
        this.physics.add.overlap(this.player, this.specialCoinsGroup, this.collectSpecialCoin, null, this);
        if (this.goalItem)
            this.physics.add.overlap(this.player, this.goalItem, this.goToNextLevel, null, this);
        this.physics.add.collider(this.fireballsGroup, this.platforms, (fireball) =>
            fireball.setActive(false).setVisible(false)
        );
        this.physics.add.collider(this.fireballsGroup, this.walls, (fireball) =>
            fireball.setActive(false).setVisible(false)
        );
        this.physics.add.overlap(this.player, this.doors, this.enterDoor, null, this);
        this.physics.add.collider(this.player, this.barrels, (player) => {
            if (player.body.blocked.down) {
                if (player.platformStuckOn) {
                    player.platformStuckOn = null;
                }
            }
        });
        if (this.switches) {
            this.physics.add.collider(
                this.fireballsGroup,
                this.switches,
                this.hitSwitch,
                (fireball, switchInstance) => !switchInstance.isHit,
                this
            );
        }
        this.physics.add.overlap(this.player, this.dronesGroup, this.loseLife, null, this);
        this.physics.add.collider(this.fireballsGroup, this.dronesGroup, this.hitDrone, null, this);
        this.physics.add.overlap(this.player, this.bombsGroup, this.handleBombImpact, null, this);
        this.physics.add.overlap(this.player, this.explosionsGroup, this.handlePlayerExplosionDamage, null, this);
        this.physics.add.collider(this.bombsGroup, this.platforms, this.handleBombImpact, null, this);
        this.physics.add.collider(this.bombsGroup, this.movingPlatforms, this.handleBombImpact, null, this);
        this.physics.add.collider(this.bombsGroup, this.fallingPlatforms, this.handleBombImpact, null, this);

        // --- CONTROLES ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.showLevelTitle();
    }

    update() {
        if (!this.player || this.isGamePaused || !this.player.body) return;

        // <-- NOVO: Lógica principal para manter o jogador na plataforma
        if (this.player.platformStuckOn) {
            const playerBounds = this.player.getBounds();
            const platformBounds = this.player.platformStuckOn.getBounds();

            // Adiciona um pequeno offset para baixo para garantir que a intersecção seja detectada
            // mesmo que os corpos estejam perfeitamente alinhados.
            playerBounds.y += 1;

            if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, platformBounds)) {
                // <-- ALTERADO: Corrigido para usar a altura do CORPO do jogador, não do sprite.
                this.player.body.y = this.player.platformStuckOn.body.top - this.player.body.height;
                this.player.body.velocity.x = this.player.platformStuckOn.body.velocity.x;
                this.player.body.velocity.y = this.player.platformStuckOn.body.velocity.y;
            } else {
                // Se não há mais intersecção (jogador pulou ou caiu), quebra a conexão
                this.player.platformStuckOn = null;
            }
        }

        // O update do player agora cuida do movimento controlado pelo usuário
        this.player.update(this.cursors);

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            if (this.ammo > 0) {
                this.player.shoot();
            }
        }

        // Morte por queda
        if (this.player.y > 617) this.loseLife();
    }

    // ... (O resto do seu código da GameScene continua igual) ...
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
            const spawnX = this.player.flipX ? this.player.x - 20 : this.player.x + 20;
            fireball.fire(spawnX, this.player.y, direction);
            this.ammo--;
            this.updateUI();
        }
    }

    collectSpecialCoin(player, coin) {
        coin.disableBody(true, true);
        this.specialCoins++;
        if (this.specialCoins >= 10) {
            this.specialCoins = 0;
            this.lives++;
            this.cameras.main.flash(200, 100, 255, 100);
        }
        this.updateUI();
    }

    addBomb(x, y, bombData) {
        const bomb = this.bombsGroup.get(x, y, 'bomb', bombData);
        if (bomb) {
            bomb.setActive(true).setVisible(true);
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
        const bombInstance = (object1 instanceof Bomb) ? object1 : object2;
        const otherObject = (bombInstance === object1) ? object2 : object1;
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
                        specialCoins: this.specialCoins
                    });
            });
        } else {
            console.log("GAME OVER");
            this.scene.start("GameScene", { level: 1, lives: 3, specialCoins: 0 });
        }
    }

    hitDrone(fireball, drone) {
        // Desativa a bola de fogo para que ela possa ser reutilizada
        fireball.setActive(false).setVisible(false);
        fireball.body.stop();

        // Chama o método que criamos no drone
        drone.takeHit();
    }

    hitSpiderbot(fireball, spiderbot) {
        // Este comando desativa o sprite E a sua hitbox, resolvendo o bug.
        fireball.disableBody(true, true);

        spiderbot.takeHit();
    }

    collectDoubleJumpItem(player, item) {
        item.disableBody(true, true);
        player.addExtraJump();
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
        fireball.disableBody(true, true);
        switchInstance.hit();
    }

    hitBarrel(fireball, barrel) {
        fireball.disableBody(true, true);
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
                extraJumps: 0,
                ammo: 0,
                specialCoins: this.specialCoins
            });
        } else {
            console.log("VOCÊ VENCEU!");
            this.scene.start("GameScene", { level: 1, lives: 3, specialCoins: 0 });
        }
    }
}


