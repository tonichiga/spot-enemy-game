import Phaser, { Scene } from "phaser";

class Enemy extends Phaser.Physics.Arcade.Sprite {
  health: number;
  speed: number;
  damage: number;
  damageText: Phaser.GameObjects.Text;

  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = 100;
    this.speed = Phaser.Math.Between(100, 200);
    this.damage = 10;
  }

  getSpawnPoint(sceneInstance: Scene): {
    x: number;
    y: number;
  } {
    const direction = Phaser.Math.Between(0, 3);
    const screenWidth = sceneInstance.game.config.width as number;
    const screenHeight = sceneInstance.game.config.height as number;

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

    return spawnPoints[direction]();
  }

  // Можно добавить методы для врага
  takeDamage(amount, callback) {
    this.health -= amount;
    if (this.health <= 0) {
      callback();
      this.die();
    }
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
    this.damageText.destroy();
  }

  handleDamageBar(sceneInstance: Scene) {
    return {
      create: (
        health: number,
        positions: {
          x: number;
          y: number;
        },
      ) => {
        this.damageText = sceneInstance.add.text(
          positions.x - 50,
          positions.y - 80,
          `Health : ${health}`,
          {
            fontSize: "16px",
            color: "#fff",
          },
        );
      },

      update: (
        health: number,
        positions: {
          x: number;
          y: number;
        },
      ) => {
        this.damageText.setText(`Health: ${health}`);
        this.damageText.setPosition(positions.x - 50, positions.y - 80);
      },
    };
  }
}

export default Enemy;
