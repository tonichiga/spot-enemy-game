import Enemy, { TInemyProps } from "./enemy";

class EnemyBounty extends Enemy {
  x: number;
  y: number;
  constructor(...args: TInemyProps) {
    super(...args);
    this.velocity = { x: 0, y: 0 };
  }

  generateRandomVelocity() {
    const angle = Math.atan2(
      Math.random() * 100 - 100 / 2,
      Math.random() * 100 - 100 / 2
    );

    // ...Здесь будет генерироваться случайный угол для врага

    console.log(angle, "angle");

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  generateRandomColor() {
    this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
  }

  update() {
    this.generateRandomColor();
    this.generateRandomVelocity();
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

export default EnemyBounty;
