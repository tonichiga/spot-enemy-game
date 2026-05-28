import { Scene } from "phaser";
import SmallEnemy from "./enemies/small-enemy";
import Player from "./player.module";
import Enemy from "./enemies/enemy.entity";
import Phaser from "phaser";

export class GameScene extends Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Player;
  smallEnemiesGroup: Phaser.Physics.Arcade.Group;
  bullets: Phaser.Physics.Arcade.Group;
  map: Phaser.GameObjects.TileSprite;
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;
  startButton: Phaser.GameObjects.Text;
  restartButton: Phaser.GameObjects.Text;
  startScreen: Phaser.GameObjects.Container;
  startText: Phaser.GameObjects.Text;
  isGameStarted: boolean = false;
  worldWidth: number = 3000;
  worldHeight: number = 2000;
  coordinateText: Phaser.GameObjects.Text;
  damageText: Phaser.GameObjects.Text[];
  keys: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor() {
    super({ key: "GameScene" });
    this.detectCollisions = this.detectCollisions.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.shoot = this.shoot.bind(this);
  }

  preload() {
    this.load.image("player", "/assets/goliath.png");
    this.load.image("enemy_small", "/assets/small.png");
    this.load.image("enemy_medium", "/assets/medium.png");
    this.load.image("bullet", "/assets/star.png");
    this.load.image("map", "/assets/map.png");
  }

  create() {
    // this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.physics.world.createDebugGraphic().setAlpha(0.75); // For debug
    this.setupPhysics();
    this.createGameObjects();

    this.detectCollisions();
    this.setControls();
    this.prepareGame();

    // Ограничиваем движение игрока внутри мира
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);

    // Проверка состояния игры
    if (!this.isGameStarted) {
      this.hideGameObjects();
      this.showStartScreen();
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  }

  update() {
    this.handleMap().update();
    this.handlePlayer().update();
    this.handlesmallEnemiesGroup().update();
    this.handleBullets().update();
    this.handleCoordinates().update();

    if (this.input.activePointer.isDown) {
      this.player.updatePlayerRotationAndMovement(this, [
        this.smallEnemiesGroup,
      ]);
    }

    if (this.isEnemyLessThan(6)) this.respawnEnemy();
  }

  detectAngleByDirection(direction: string) {
    const angleMap = {
      right: 0,
      left: Math.PI,
      top: -Math.PI / 2,
      bottom: Math.PI / 2,
      "left-top": Math.PI + Math.PI / 4,
      "right-top": -Math.PI / 4,
      "left-bottom": Math.PI + -Math.PI / 4,
      "right-bottom": Math.PI / 4,
    };

    return angleMap[direction];
  }

  isEnemyCloseToPlayer(enemy: SmallEnemy) {
    const distanceToPlayer = Phaser.Math.Distance.Between(
      enemy.x,
      enemy.y,
      this.player.x,
      this.player.y,
    );

    const playerRadius =
      Math.max(this.player.displayWidth, this.player.displayHeight) / 2;
    const enemyRadius = Math.max(enemy.displayWidth, enemy.displayHeight) / 2;
    const stopDistance = playerRadius + enemyRadius + 4;

    return distanceToPlayer <= stopDistance;
  }

  moveEnemyToPlayer(enemy: SmallEnemy, speed: number = 100) {
    if (this.isEnemyCloseToPlayer(enemy)) {
      enemy.setVelocity(0, 0);
      return;
    }

    this.physics.moveToObject(enemy, this.player, speed);
  }

  detectCollisions() {
    const handleEnemyCollision = (_, enemy) => {
      enemy.setVisible(false);
      enemy.setActive(false);

      this.gameOver();
      this.renderRestartButton();
    };

    const handleBulletCollision = (bullet, enemy: Enemy) => {
      bullet.destroy();

      enemy.takeDamage(this.player.damage, () => {
        if (!this.player.lockedEnemy) return;
        this.player.lockedEnemy.clearTint();
        this.player.lockedEnemy = null;
        this.player.isAttack = false;
        this.score += 10;
        this.handleScore().update();
      });

      // enemy.setVisible(false);
      // enemy.setActive(false);
      // this.handleScore().update();
    };

    const collisions = {
      enemy: handleEnemyCollision,
      bullet: handleBulletCollision,
    };

    // Проверка на столкновение NPC с игроком
    // this.physics.add.overlap(
    //   this.player,
    //   this.smallEnemiesGroup,
    //   collisions.enemy,
    //   undefined,
    //   this
    // );

    // Проверка на столкновение пуль с врагами
    this.physics.add.overlap(
      this.bullets,
      this.smallEnemiesGroup,
      collisions.bullet,
      undefined,
      this,
    );
  }

  shoot(pointer: Phaser.Input.Pointer) {
    if (this.physics.world.isPaused) {
      return;
    }

    console.log("Shoot");

    if (!this.player.isAttack) {
      return;
    }

    const bullet = this.bullets.get() as Phaser.Physics.Arcade.Sprite;

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setTexture("bullet");
      bullet.setPosition(this.player.x, this.player.y);
      bullet.setVelocity(1000, 1000);

      // Устанавливаем скорость пули в направлении курсора
      this.physics.velocityFromRotation(
        this.player.playerCurrentAngle - Math.PI / 2,
        1000,
        bullet.body.velocity,
      );
    }
  }

  respawnEnemy() {
    const enemy = this.smallEnemiesGroup.get() as SmallEnemy;

    if (enemy) {
      enemy.setAttributes(this);
    } else {
      console.warn("No available enemy sprite to respawn");
    }
  }

  isEnemyLessThan(count: number) {
    return this.smallEnemiesGroup.countActive() < count;
  }

  renderRestartButton() {
    this.add
      .text(
        this.scale.width / 2.2 - 100,
        this.scale.height / 2.2 - 100,
        "Game Over",
        {
          fontSize: "64px",
          color: "#fff",
        },
      )
      .setScrollFactor(0);

    this.restartButton = this.add
      .text(this.scale.width / 2.2 - 100, this.scale.height / 2.2, "Restart", {
        fontSize: "32px",
        color: "#fff",
      })
      .setScrollFactor(0);

    // Эффект наведения
    this.restartButton.on("pointerover", () => {
      this.restartButton.setStyle({ fill: "#f39c12" });
      this.input.setDefaultCursor("pointer");
    });

    // Убираем эффект наведения
    this.restartButton.on("pointerout", () => {
      this.restartButton.setStyle({ fill: "#fff" });
      this.input.setDefaultCursor("default");
    });
  }

  gameOver() {
    this.physics.pause(); // Останавливаем всю физику
    this.player.setTint(0xff0000); // Эффект поражения (например, красный оттенок)
    this.renderRestartButton();
    this.restartGame();
  }

  restartGame() {
    this.score = 0;
    this.restartButton.setInteractive(); // Делаем кнопку интерактивной
    this.restartButton.on("pointerdown", () => {
      this.scene.restart(); // Перезапуск сцены
      this.input.setDefaultCursor("default");
    });
  }

  startGame() {
    this.physics.resume(); // Запускаем физику
    this.input.setDefaultCursor("default");
    this.showGameObjects();
    this.isGameStarted = true;
    this.startScreen.destroy();
    console.log("Game started");
  }

  showStartScreen() {
    this.startText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      "Start Game",
      { fontSize: "32px", color: "#fff" },
    );
    this.startText.setOrigin(0.5);

    this.startButton = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "Click to Start",
      { fontSize: "24px", color: "#f39c12" },
    );
    this.startButton.setOrigin(0.5);
    this.startButton.setInteractive();

    this.startButton.on("pointerover", () => {
      this.startButton.setStyle({ fill: "#fff" });
      this.input.setDefaultCursor("pointer");
    });

    this.startButton.on("pointerout", () => {
      this.startButton.setStyle({ fill: "#f39c12" });
      this.input.setDefaultCursor("default");
    });

    this.startButton.on("pointerdown", () => {
      this.startGame();
    });

    this.startScreen = this.add.container(0, 0, [
      this.startText,
      this.startButton,
    ]);
  }

  hideGameObjects() {
    this.scoreText.setVisible(false);
    this.player.setVisible(false);
    this.smallEnemiesGroup?.children.forEach((enemy) => {
      const npc = enemy as Phaser.Physics.Arcade.Sprite;
      npc.setVisible(false);
    });
  }

  showGameObjects() {
    this.scoreText.setVisible(true);
    this.player.setVisible(true);
    this.smallEnemiesGroup?.children.forEach((enemy) => {
      const npc = enemy as Phaser.Physics.Arcade.Sprite;
      npc.setVisible(true);
    });
  }

  createGameObjects() {
    this.createKeyBind();
    this.handleMap().create();
    this.handlePlayer().create();
    this.handlesmallEnemiesGroup().create();
    this.handleBullets().create();
    this.handleScore().create();
    this.handleCoordinates().create();
  }

  handlePlayer() {
    return {
      create: () => {
        // Добавляем игрока в центр экрана
        this.player = new Player(
          this,
          this.scale.width / 2,
          this.scale.height / 2,
          "player",
          this.keys,
        );
        this.player.setScale(0.8);
        this.player.setCollideWorldBounds(true);
      },

      update: () => {
        this.player.setPlayerControls();
        this.player.setPlayerAngleIfLockEnabled();
      },
    };
  }

  handleMap() {
    return {
      create: () => {
        this.map = this.add
          .tileSprite(0, 0, this.scale.width, this.scale.height, "map")
          .setOrigin(0, 0)
          .setScrollFactor(0); // Фиксируем фон, чтобы он не двигался напрямую с камерой
      },

      update: () => {
        this.map.tilePositionX = this.cameras.main.scrollX * 0.2; // Двигаем фон по оси X
        this.map.tilePositionY = this.cameras.main.scrollY * 0.2; // Двигаем фон по оси Y
      },
    };
  }

  handlesmallEnemiesGroup() {
    return {
      create: () => {
        this.smallEnemiesGroup = this.physics.add.group({
          key: "enemy_small",
          classType: SmallEnemy, // Указываем, что в группе будут объекты класса Enemy
          runChildUpdate: true,
          repeat: 5,
          active: false,
          setScale: { x: 0.4, y: 0.4 },
        });

        this.smallEnemiesGroup?.children.forEach((enemy) => {
          const npc = enemy as SmallEnemy;

          npc.setAttributes(this);
          this.player.setEnemyToLockOn(npc);
        });
      },

      update: () => {
        this.smallEnemiesGroup?.children.forEach((enemy) => {
          const npc = enemy as SmallEnemy;
          if (npc.active) {
            // Расчет угла между врагом и игроком

            const enemyAngle = this.player.calculateAngleBetweenObjectAndPlayer(
              this.player,
              npc,
            );

            // Установка угла спрайта врага с учетом коррекции
            npc.setRotation(enemyAngle + Math.PI / 2);
            npc.handleDamageBar(this).update(npc.health, {
              x: npc.x,
              y: npc.y,
            });
            // Двигаем врагов к игроку и останавливаем вблизи модели игрока
            this.moveEnemyToPlayer(npc, 100);
          }
        });
      },
    };
  }

  handleBullets() {
    return {
      create: () => {
        this.bullets = this.physics.add.group({
          defaultKey: "bullet",
          setScale: { x: 1, y: 1 },
          maxSize: 100,
        });

        this.bullets.children.forEach((bullet) => {
          const b = bullet as Phaser.Physics.Arcade.Sprite;
          const worldBounds = this.physics.world.bounds;
          const padding = 32;

          if (
            b.y < worldBounds.top - padding ||
            b.x < worldBounds.left - padding ||
            b.x > worldBounds.right + padding ||
            b.y > worldBounds.bottom + padding
          ) {
            b.setActive(false);
            b.setVisible(false);
          }
        });
      },

      update: () => {
        this.bullets.children.forEach((bullet) => {
          const b = bullet as Phaser.Physics.Arcade.Sprite;
          const worldBounds = this.physics.world.bounds;
          const padding = 32;

          if (
            b.y < worldBounds.top - padding ||
            b.x < worldBounds.left - padding ||
            b.x > worldBounds.right + padding ||
            b.y > worldBounds.bottom + padding
          ) {
            b.setActive(false);
            b.setVisible(false);
          }
        });
      },
    };
  }

  handleScore() {
    return {
      create: () => {
        this.score = 0;
        this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
          fontSize: "32px",
          color: "#fff",
        });
        this.scoreText.setScrollFactor(0);
      },

      update: () => {
        this.scoreText.setText(`Score: ${this.score}`);
      },
    };
  }

  handleCoordinates() {
    return {
      create: () => {
        this.coordinateText = this.add.text(16, 16, "Coordinates", {
          fontSize: "32px",
          color: "#fff",
        });
        this.coordinateText.setScrollFactor(0);
      },

      update: () => {
        const { x, y } = this.player;
        this.coordinateText.setText(`X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`);
      },
    };
  }

  prepareGame() {
    this.cursors = this.input.keyboard.createCursorKeys(); // Создание клавиш для управления
  }

  setupPhysics() {
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
  }

  setControls() {
    this.keys.space.on("down", this.shoot);
  }

  createKeyBind() {
    this.keys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ctrl: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL),
    };
  }
}
