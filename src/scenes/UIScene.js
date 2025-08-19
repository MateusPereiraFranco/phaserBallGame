export default class UIScene extends Phaser.Scene {
    constructor() {
        super("UIScene");
    }

    init(data) {

        this.initialLives = data.lives;
        this.initialJumps = data.extraJumps;
        this.initialAmmo = data.ammo;
        this.initialSpecialCoins = data.specialCoins;
    }

    create() {
        // Criamos os textos na tela USANDO os valores iniciais que recebemos no 'init'
        this.livesText = this.add.text(10, 10, `Vidas: ${this.initialLives}`, {
            fontSize: '18px',
            fill: '#fff'
        });
        this.jumpsText = this.add.text(10, 30, `Pulos Extras: ${this.initialJumps}`, {
            fontSize: '18px',
            fill: '#fff'
        });
        this.ammoText = this.add.text(10, 50, `Munição: ${this.initialAmmo}`, {
            fontSize: '18px',
            fill: '#fff'
        });
        this.specialCoinsText = this.add.text(10, 70, `Moedas: ${this.initialSpecialCoins}`, {
            fontSize: '18px',
            fill: '#fff'
        });


        const gameScene = this.scene.get('GameScene');

        gameScene.events.on('updateUI', (data) => {
            this.livesText.setText(`Vidas: ${data.lives}`);
            this.jumpsText.setText(`Pulos Extras: ${data.extraJumps}`);
            this.ammoText.setText(`Munição: ${data.ammo}`);

            if (data.specialCoins !== undefined) {
                this.specialCoinsText.setText(`Moedas: ${data.specialCoins}`);
            }
        });
    }
}