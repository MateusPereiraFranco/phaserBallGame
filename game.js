// --- VARIÁVEIS DE CONTROLE DO JOGADOR ---
let player;
let cursors;
let platforms;
let spikes;
let doubleJumpItem;

// Variáveis para controlar a lógica do pulo
let jumps = 0;
let canDoubleJump = false;


// --- FUNÇÕES DE LÓGICA DO JOGO ---

// Função chamada quando o jogador coleta o item de pulo duplo
function collectDoubleJumpItem(player, item) {
    item.disableBody(true, true); // Remove o item da tela
    canDoubleJump = true; // Habilita a possibilidade de pular duas vezes
    
    // Opcional: Adiciona um feedback visual/sonoro aqui
    this.cameras.main.flash(200, 255, 255, 0); // Pisca a tela de branco
}

// Função chamada quando o jogador encosta nos espinhos
function hitSpike(player, spike) {
    // Reinicia a cena para recomeçar o jogo
    this.scene.restart();
}


// --- CONFIGURAÇÃO DA CENA PRINCIPAL DO PHASER ---

const mainScene = {
    key: 'mainScene',

    // Pré-carregamento de assets
    preload: function() {
        // Como não temos imagens, vamos criar texturas simples com cores
        // Isso evita a necessidade de ter arquivos de imagem na pasta
        this.textures.generate('ball', { data: ['2'], pixelWidth: 24, palette: { 0: '#0000', 1: '#0000', 2: '#87ceeb' } });
        this.textures.generate('platform', { data: ['1'], pixelWidth: 1, palette: { 0: '#0000', 1: '#4d4d4d' } });
        this.textures.generate('spike', { data: ['010', '111'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ff4d4d' } });
        this.textures.generate('doubleJump', { data: ['010', '111', '010'], pixelWidth: 3, palette: { 0: '#0000', 1: '#ffd700' } });
    },

    // Criação dos elementos do jogo
    create: function() {
        // --- CRIAÇÃO DO MUNDO E PLATAFORMAS ---
        platforms = this.physics.add.staticGroup();

        // Chão principal
        platforms.create(300, 568, 'platform').setScale(500, 2).refreshBody();

        // Plataformas suspensas com buracos
        // Plataforma 1
        platforms.create(150, 450, 'platform').setScale(25, 2).refreshBody();
        platforms.create(650, 400, 'platform').setScale(25, 2).refreshBody();
        platforms.create(400, 400, 'platform').setScale(20, 2).refreshBody();

        // --- ADICIONANDO UMA PAREDE ---
        // Para criar uma parede, basta usar uma escala vertical grande e horizontal pequena.
        platforms.create(790, 400, 'platform').setScale(2, 20).refreshBody();


        // --- CRIAÇÃO DOS ESPINHOS ---
        spikes = this.physics.add.staticGroup();
        // Adiciona um grupo de espinhos na plataforma da direita
        for (let i = 0; i < 10; i++) {
            spikes.create(580 + i * 16, 375, 'spike').setScale(2).refreshBody();
        }

        // --- CRIAÇÃO DO JOGADOR (A BOLA) ---
        // Ajustada a posição Y inicial do jogador para 400, para que ele comece sobre a primeira plataforma.
        player = this.physics.add.sprite(100, 400, 'ball');
        player.setBounce(0.1); // Leve quicada ao cair
        player.setCollideWorldBounds(true); // Não deixa sair pelas laterais/topo

        // --- CRIAÇÃO DO ITEM DE PULO DUPLO ---
        doubleJumpItem = this.physics.add.sprite(400, 240, 'doubleJump').setScale(2);
        doubleJumpItem.setCollideWorldBounds(true);

        // --- CONFIGURAÇÃO DAS COLISÕES ---
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(doubleJumpItem, platforms);
        
        // Se o jogador encostar no espinho, chama a função hitSpike
        this.physics.add.collider(player, spikes, hitSpike, null, this);
        
        // Se o jogador passar por cima do item, chama a função collectDoubleJumpItem
        this.physics.add.overlap(player, doubleJumpItem, collectDoubleJumpItem, null, this);

        // --- CONFIGURAÇÃO DOS CONTROLES ---
        cursors = this.input.keyboard.createCursorKeys();
        
        // Reseta as variáveis de pulo no início
        jumps = 0;
        canDoubleJump = false;
    },

    // Loop principal do jogo, executado a cada quadro
    update: function() {
        // --- LÓGICA DE MOVIMENTO LATERAL ---
        if (cursors.left.isDown) {
            player.setVelocityX(-200);
        } else if (cursors.right.isDown) {
            player.setVelocityX(200);
        } else {
            player.setVelocityX(0);
        }

        // --- LÓGICA DE MORTE POR QUEDA ---
        // Se a bola cair para fora da tela por baixo
        if (player.y > 600) {
            this.scene.restart();
        }

        // --- LÓGICA DO PULO E PULO DUPLO ---
        const isTouchingDown = player.body.touching.down;
        const upJustPressed = Phaser.Input.Keyboard.JustDown(cursors.up);

        // Se o jogador está no chão, reseta os pulos
        if (isTouchingDown) {
            jumps = 0;
        }

        // Se a tecla pra cima for pressionada...
        if (upJustPressed) {
            // PULO 1: Se estiver no chão, pula normalmente
            if (isTouchingDown) {
                player.setVelocityY(-330);
                jumps = 1;
            }
            // PULO 2: Se não estiver no chão, mas tiver a habilidade E ainda não tiver dado o segundo pulo
            else if (canDoubleJump && jumps < 2) {
                player.setVelocityY(-300); // Pulo duplo um pouco mais fraco
                jumps = 2; // Marca que o segundo pulo foi usado
                canDoubleJump = false; // Desabilita o pulo duplo (só pode usar uma vez)
            }
        }
    }
};


// --- CONFIGURAÇÃO GERAL DO JOGO ---

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 }, // Força da gravidade
            debug: false // Mude para true para ver as caixas de colisão
        }
    },
    scene: mainScene
};

// Inicia o jogo
const game = new Phaser.Game(config);
