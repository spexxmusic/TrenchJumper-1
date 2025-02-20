// Define scenes first
class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        this.load.image('background', 'assets/bg.jpg');
        this.load.image('player', 'assets/sol.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#f0f0f0');
        this.add.image(200, 300, 'background').setDisplaySize(400, 600);

        const title = this.add.text(200, 200, 'Trench Jumper', {
            fontSize: '60px',
            color: '#0000FF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        title.setShadow(2, 2, '#000000', 4);

        const inputStyle = {
            fontSize: '24px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            border: '2px solid #808080',
            padding: '5px'
        };
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter your name';
        input.style = Object.entries(inputStyle).map(([key, value]) => `${key}:${value}`).join(';');
        input.style.position = 'absolute';
        input.style.left = '150px';
        input.style.top = '280px';
        input.style.width = '100px';
        document.body.appendChild(input);

        const startButton = this.add.text(200, 350, 'Start', {
            fontSize: '32px',
            color: '#FFFFFF',
            backgroundColor: '#808080'
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            playerName = input.value.trim() || 'Player';
            document.body.removeChild(input);
            this.scene.start('GameScene');
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (input.value.trim()) {
                playerName = input.value.trim();
                document.body.removeChild(input);
                this.scene.start('GameScene');
            }
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('background', 'assets/bg.jpg');
        this.load.image('player', 'assets/sol.png');
    }

    create() {
        this.background = this.add.image(200, 300, 'background').setDisplaySize(400, 600);
        this.physics.world.setBounds(0, 0, 400, 600);

        this.floor = this.physics.add.staticGroup();
        this.floor.create(200, 550, null).setSize(400, 50).setVisible(false);

        this.player = this.physics.add.sprite(200, 510, 'player').setScale(0.5);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.floor);

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(200, 450, null).setSize(80, 20).setVisible(false);
        this.physics.add.collider(this.player, this.platforms);

        this.score = 0;
        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '36px',
            color: '#FFFFFF'
        });

        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-300);
        }

        if (this.player.y < 300 && this.player.body.velocity.y < 0) {
            this.player.y += -this.player.body.velocity.y * 0.1;
            this.floor.getChildren().forEach(child => child.y += -this.player.body.velocity.y * 0.1);
            this.platforms.getChildren().forEach(child => child.y += -this.player.body.velocity.y * 0.1);
            this.score += Math.abs(this.player.body.velocity.y * 0.01);
            this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
        }

        if (this.player.y > 600) {
            this.scene.start('LeaderboardScene', { score: Math.floor(this.score), name: playerName });
        }

        if (this.platforms.getChildren().length < 5) {
            const lastPlatform = this.platforms.getChildren().slice(-1)[0];
            if (lastPlatform.y < 100) {
                this.platforms.create(
                    Phaser.Math.Between(50, 350),
                    lastPlatform.y - Phaser.Math.Between(80, 120),
                    null
                ).setSize(80, 20).setVisible(false);
            }
        }
    }
}

class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super('LeaderboardScene');
    }

    init(data) {
        this.score = data.score;
        this.name
