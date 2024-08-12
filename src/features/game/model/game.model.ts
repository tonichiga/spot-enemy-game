import { Scene } from "phaser";

export class GameScene extends Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Physics.Arcade.Sprite;
  enemies: Phaser.Physics.Arcade.Group;
  bullets: Phaser.Physics.Arcade.Group;
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;
  keys: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor() {
    super({ key: "GameScene" });
    this.detectColisions = this.detectColisions.bind(this);
  }

  preload() {
    this.load.image("player", "/assets/goliath.png");
    this.load.image("enemy", "/assets/enemy.png");
    this.load.image("bullet", "/assets/star.png");
  }

  create() {
    // Включаем физику для сцены
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    this.createPlayer();
    this.createBullets();
    this.createEnemies();

    this.createScoreText();

    this.detectColisions();

    this.input.on("pointerdown", this.shoot, this);
    this.cursors = this.input.keyboard.createCursorKeys(); // Создание клавиш для управления
    this.input.keyboard.on("keydown-R", () => {
      this.scene.restart();
    });

    this.physics.world.createDebugGraphic().setAlpha(0.75);
  }

  update() {
    this.setPlayerControls();
    this.updateEnemyPosition();
    this.updateBulletPostion();
    this.updatePlayerPosition();

    if (this.isEnemyLessThan(6)) this.respawnEnemy();
  }

  detectCursorPosition() {
    // Получаем позицию курсора
    const cursorX = this.input.x;
    const cursorY = this.input.y;

    return {
      cursorX,
      cursorY,
    };
  }

  setPlayerControls() {
    this.keys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    if (this.cursors.space.isDown) {
      this.shoot(this.input.activePointer);
    }

    // Управление движением игрока
    if (this.keys.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.keys.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.keys.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.keys.down.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }
  }

  createPlayer() {
    // Добавляем игрока в центр экрана
    this.player = this.physics.add.sprite(
      this.scale.width / 2,
      this.scale.height / 2,
      "player"
    );

    this.player.setCollideWorldBounds(true); // Игрок не выйдет за пределы экрана
  }

  createBullets() {
    // Создание группы пуль
    this.bullets = this.physics.add.group({
      defaultKey: "bullet",
      maxSize: 10, // Максимальное количество пуль на экране
    });

    // Удаление пуль за пределами экрана
    this.bullets.children.iterate((bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (
        b.y < 0 ||
        b.x < 0 ||
        b.x > this.scale.width ||
        b.y > this.scale.height
      ) {
        b.setActive(false);
        b.setVisible(false);
      }

      return true;
    });

    this.bullets = this.physics.add.group({
      defaultKey: "bullet",
      maxSize: 10, // Максимальное количество пуль на экране
    });
  }

  createEnemies() {
    // Создание группы NPC
    this.enemies = this.physics.add.group({
      key: "enemy",
      setScale: { x: 0.2, y: 0.2 }, // Масштабирование врагов
      repeat: 5, // Количество врагов
      setXY: { x: 50, y: 50, stepX: 150 }, // Позиционирование врагов
      classType: Phaser.Physics.Arcade.Sprite,
    });

    // Настройка движения NPC к игроку
    this.enemies.children.iterate((enemy) => {
      const npc = enemy as Phaser.Physics.Arcade.Sprite;
      npc.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      ); // Случайное движение

      return true;
    });
  }

  updatePlayerPosition() {
    const { cursorX, cursorY } = this.detectCursorPosition();

    // Расчет угла между игроком и курсором
    const playerAngle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      cursorX,
      cursorY
    );

    // Установка угла спрайта игрока
    this.player.setRotation(playerAngle + Math.PI / 2);
  }

  updateEnemyPosition() {
    // Обработка движения врагов к игроку
    this.enemies.children.iterate((enemy) => {
      const npc = enemy as Phaser.Physics.Arcade.Sprite;
      if (npc.active) {
        // Расчет угла между врагом и игроком

        const enemyAngle = this.calculateAngleBetweenObjectAndPlayer(
          this.player,
          npc
        );

        // Установка угла спрайта врага с учетом коррекции
        npc.setRotation(enemyAngle + Math.PI / 2);

        // Двигаем врагов к игроку
        this.physics.moveToObject(npc, this.player, 100); // Скорость врагов
      }

      return true;
    });
  }

  updateBulletPostion() {
    // Удаление пуль за пределами экрана
    this.bullets.children.iterate((bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (
        b.y < 0 ||
        b.x < 0 ||
        b.x > this.scale.width ||
        b.y > this.scale.height
      ) {
        b.setActive(false);
        b.setVisible(false);
      }
      return true;
    });
  }

  detectColisions() {
    const handleEnemyCollision = (_, enemy) => {
      enemy.setVisible(false);
      enemy.setActive(false);
      // enemy.setPosition(-100, -100);
    };

    const handleBulletCollision = (bullet, enemy) => {
      // bullet.setVisible(false);
      // bullet.setActive(false);

      bullet.destroy();
      // enemy.destroy();

      enemy.setVisible(false);
      enemy.setActive(false);

      // Обновление счета
      this.updateScore();
      this.updateScoreText();

      console.log("SHOT");
    };

    const collisions = {
      enemy: handleEnemyCollision,
      bullet: handleBulletCollision,
    };

    // Проверка на столкновение NPC с игроком
    this.physics.add.overlap(
      this.player,
      this.enemies,
      collisions.enemy,
      undefined,
      this
    );

    // Проверка на столкновение пуль с врагами
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      collisions.bullet,
      undefined,
      this
    );
  }

  createScoreText() {
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      color: "#fff",
    });
  }

  updateScoreText() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updateScore() {
    this.score += 10;
  }

  shoot(pointer: Phaser.Input.Pointer) {
    const bullet = this.bullets.get() as Phaser.Physics.Arcade.Sprite;

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(this.player.x, this.player.y);

      const angle = this.calculateAngleBetweenObjectAndPlayer(
        this.input,
        this.player
      );

      // Устанавливаем скорость пули в направлении курсора
      this.physics.velocityFromRotation(angle, 500, bullet.body.velocity);
    }
  }

  calculateAngleBetweenObjectAndPlayer(
    object: Phaser.Physics.Arcade.Sprite | Phaser.Input.InputPlugin,
    enemy: Phaser.Physics.Arcade.Sprite
  ) {
    return Phaser.Math.Angle.Between(enemy.x, enemy.y, object.x, object.y);
  }

  respawnEnemy() {
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    const direction = Phaser.Math.Between(0, 3);

    const spawnPoints = {
      0: () => ({
        x: Phaser.Math.Between(0, screenWidth),
        y: -50, // Вне экрана сверху
      }),
      1: () => ({
        x: screenWidth + 50, // Вне экрана справа
        y: Phaser.Math.Between(0, screenHeight),
      }),
      2: () => ({
        x: Phaser.Math.Between(0, screenWidth),
        y: screenHeight + 50, // Вне экрана снизу
      }),
      3: () => ({
        x: -50, // Вне экрана слева
        y: Phaser.Math.Between(0, screenHeight),
      }),
    };

    const { x, y } = spawnPoints[direction]();

    const enemy = this.enemies.get() as Phaser.Physics.Arcade.Sprite;

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setPosition(x, y);
      enemy.setTexture("enemy");
      enemy.setScale(0.2);
      enemy.body.setSize(300, 300);

      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
    } else {
      console.warn("No available enemy sprite to respawn");
    }
  }

  isEnemyLessThan(count: number) {
    return this.enemies.countActive() < count;
  }
}
