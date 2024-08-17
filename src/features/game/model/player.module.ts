import SmallEnemy from "./enemies/small-enemy";

class Player extends Phaser.Physics.Arcade.Sprite {
  health: number;
  speed: number = 400;
  damage: number;
  keys: { [key: string]: Phaser.Input.Keyboard.Key };
  playerCurrentAngle: number = 0;
  angleDirection: number = 0;
  moveDirection:
    | "right"
    | "left"
    | "top"
    | "bottom"
    | "left-top"
    | "right-top"
    | "left-bottom"
    | "right-bottom" = "right";
  isAttack: boolean = false;
  lockedEnemy: Phaser.Physics.Arcade.Sprite;
  aimEnemy: Phaser.Physics.Arcade.Sprite;
  destination: Phaser.Math.Vector2;

  constructor(scene, x, y, texture, keys) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = 100;
    this.damage = 10;
    this.initiate(keys);
  }

  initiate(keys) {
    this.keys = keys;
    this.setScale(0.8);
    this.setCollideWorldBounds(true);
    this.setContols();
  }

  // Можно добавить методы для врага
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
  }

  setPlayerControls() {
    const getDirection = () => {
      if (this.keys.up.isDown && this.keys.right.isDown) {
        return "right-top";
      } else if (this.keys.up.isDown && this.keys.left.isDown) {
        return "left-top";
      } else if (this.keys.down.isDown && this.keys.right.isDown) {
        return "right-bottom";
      } else if (this.keys.down.isDown && this.keys.left.isDown) {
        return "left-bottom";
      } else if (this.keys.up.isDown) {
        return "top";
      } else if (this.keys.down.isDown) {
        return "bottom";
      } else if (this.keys.left.isDown) {
        return "left";
      } else if (this.keys.right.isDown) {
        return "right";
      } else {
        return this.moveDirection;
      }
    };

    const direction = getDirection();

    if (direction) {
      const targetAngle = this.detectAngleByDirection(direction);
      this.playerCurrentAngle = Phaser.Math.Angle.RotateTo(
        this.playerCurrentAngle,
        targetAngle,
        0.2
      );
    } else {
      this.setVelocity(0, 0);
    }

    this.moveDirection = direction;
    this.angleDirection = this.detectAngleByDirection(direction);

    // Управление движением игрока
    if (this.keys.left.isDown) {
      this.setVelocityX(-300);
    } else if (this.keys.right.isDown) {
      this.setVelocityX(300);
    } else {
      this.setVelocityX(0);
    }

    if (this.keys.up.isDown) {
      this.setVelocityY(-300);
    } else if (this.keys.down.isDown) {
      this.setVelocityY(300);
    } else {
      this.setVelocityY(0);
    }
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

  updatePlayerPosition() {
    if (this.isAttack) return;
    this.setRotation(this.playerCurrentAngle + Math.PI / 2);
  }

  setPlayerAngleIfLockEnabled() {
    if (this.isAttack && this.lockedEnemy) {
      const angle = this.calculateAngleBetweenObjectAndPlayer(
        this,
        this.lockedEnemy
      );
      this.playerCurrentAngle = angle + -Math.PI / 2;
      this.setRotation(this.playerCurrentAngle);
    }
  }

  calculateAngleBetweenObjectAndPlayer<
    T1 extends Phaser.Physics.Arcade.Sprite | Phaser.Input.InputPlugin,
    T2 extends Phaser.Physics.Arcade.Sprite | Phaser.Input.InputPlugin
  >(object: T1, enemy: T2): number {
    return Phaser.Math.Angle.Between(enemy.x, enemy.y, object.x, object.y);
  }

  setContols() {
    this.keys.ctrl.on("down", () => {
      console.log("Space key pressed");
      if (this.lockedEnemy) {
        this.isAttack = !this.isAttack;
        if (this.isAttack) console.log("Enemy locked");
      }
    });
  }

  setEnemyToLockOn(enemy: SmallEnemy) {
    enemy.setInteractive();
    enemy.on("pointerdown", () => {
      if (this.lockedEnemy !== enemy && this.aimEnemy !== enemy) {
        this.aimEnemy?.clearTint();
        this.aimEnemy = enemy;
        this.aimEnemy.setTint(0x0000ff);
        return;
      }

      if (this.aimEnemy === enemy) {
        this.aimEnemy.clearTint();
        this.aimEnemy = null;

        this.lockedEnemy?.clearTint();
        this.lockedEnemy = enemy;
        this.lockedEnemy.setTint(0xff0000);
        return;
      }
    });
  }

  updatePlayerRotationAndMovement(
    sceneInstance: Phaser.Scene,
    enemies: Phaser.Physics.Arcade.Group[]
  ) {
    const pointer = sceneInstance.input.activePointer;
    const worldX = pointer.x;
    const worldY = pointer.y;

    this.destination = new Phaser.Math.Vector2();
    this.destination.set(worldX, worldY);

    if (this.isEnemyAtPosition(this.destination.x, this.destination.y, enemies))
      return;

    const camera = sceneInstance.cameras.main;

    const screenPointerCoords = sceneInstance.cameras.main.getWorldPoint(
      worldX,
      worldY
    );

    // Вычисляем угол между кораблем и текущей позицией курсора
    const targetAngle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      screenPointerCoords.x,
      screenPointerCoords.y
    );
    console.log(targetAngle);

    // Корректируем угол поворота (если нужно)
    const correctedTargetAngle = targetAngle + Math.PI / 2;

    // Устанавливаем новый угол поворота
    if (!this.isAttack) {
      this.setRotation(correctedTargetAngle);
    }

    // Устанавливаем скорость игрока в направлении курсора
    this.setVelocityX(Math.cos(targetAngle) * this.speed);
    this.setVelocityY(Math.sin(targetAngle) * this.speed);
  }

  isEnemyAtPosition(
    x: number,
    y: number,
    enemies: Phaser.Physics.Arcade.Group[]
  ): boolean {
    let isAtEnemy = false;

    enemies.forEach((group) => {
      group.children.iterate((enemy) => {
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
        const distance = Phaser.Math.Distance.Between(
          x,
          y,
          enemySprite.x,
          enemySprite.y
        );
        if (distance < enemySprite.width / 2) {
          isAtEnemy = true;
        }
        return true;
      });
    });

    return isAtEnemy;
  }
}

export default Player;
