import { Scene } from "phaser";
import Enemy from "./enemy.entity";

class SmallEnemy extends Enemy {
  health: number = 100;
  damage: number = 10;
  speed: number = 50;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    this.speed = Phaser.Math.Between(100, 200);
  }

  setAttributes(sceneInstance: Scene) {
    if (!sceneInstance) return;

    const { x, y } = this.getSpawnPoint(sceneInstance);

    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setTexture("enemy_small");
    this.setScale(0.4);
    this.body.setSize(300, 300);

    this.handleDamageBar(sceneInstance).create(this.health, {
      x: this.x,
      y: this.y,
    });

    this.setVelocity(
      Phaser.Math.Between(-100, 100),
      Phaser.Math.Between(-100, 100),
    );
  }
}

export default SmallEnemy;
