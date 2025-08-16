export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        const gameScene = this.scene.get('GameScene');

        // Cria os textos da UI
        this.livesText = this.add.text(16, 16, '', { fontSize: '24px', fill: '#FFFFFF' });
        this.extraJumpsText = this.add.text(16, 48, '', { fontSize: '24px', fill: '#FFD700' });
        this.ammoText = this.add.text(16, 80, '', { fontSize: '24px', fill: '#ff4500' });

        this.livesText.setText(`Vidas: ${gameScene.lives}`);
        this.extraJumpsText.setText(`Pulos Extras: ${gameScene.extraJumps}`);
        this.ammoText.setText(`Munição: ${gameScene.ammo}`);

        gameScene.events.on('updateUI', (data) => {
            this.livesText.setText(`Vidas: ${data.lives}`);
            this.extraJumpsText.setText(`Pulos Extras: ${data.extraJumps}`);
            this.ammoText.setText(`Munição: ${data.ammo}`);
        });
    }
}
