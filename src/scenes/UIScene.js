export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        const gameScene = this.scene.get('GameScene');

        // Cria os textos da UI
        this.livesText = this.add.text(16, 16, '', { fontSize: '24px', fill: '#FFFFFF' });
        this.extraJumpsText = this.add.text(16, 48, '', { fontSize: '24px', fill: '#FFD700' });

        this.livesText.setText(`Vidas: ${gameScene.lives}`);
        this.extraJumpsText.setText(`Pulos Extras: ${gameScene.extraJumps}`);

        gameScene.events.on('updateUI', (data) => {
            this.livesText.setText(`Vidas: ${data.lives}`);
            this.extraJumpsText.setText(`Pulos Extras: ${data.extraJumps}`);
        });
    }
}
