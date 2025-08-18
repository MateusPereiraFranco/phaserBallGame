export default class Switch extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, doorId) {
        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.doorId = doorId; // ID da porta que este interruptor controla
        this.isHit = false; 

        this.setScale(0.30);
    }

    // Método chamado quando a bola de fogo atinge o interruptor
    hit() {
        // Se já foi atingido, não faz nada
        if (this.isHit) return;

        this.isHit = true;
        this.play('switch-on'); // Toca a animação de "ligado"

        // Encontra a porta correspondente na cena e a abre
        const doorToOpen = this.scene.doors.getChildren().find(door => door.id === this.doorId);
        if (doorToOpen) {
            doorToOpen.open();
        }
    }
}
