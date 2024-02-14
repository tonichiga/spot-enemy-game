"use client";
import Enemy from "@/app/entity/enemy";
import Player from "@/app/entity/player";
import Projectile from "@/app/entity/projectile";
import { MouseEventHandler, useEffect, useLayoutEffect, useRef } from "react";

const Main = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const projectilesRef = useRef<Projectile[]>([]);

  useLayoutEffect(() => {
    const enemies = [];

    const height = window.innerHeight;
    const width = window.innerWidth;

    canvas.current!.width = width;
    canvas.current!.height = height;
    const canvasWidth = canvas.current.width;
    const canvasHeight = canvas.current.height;

    const c = canvas.current?.getContext("2d") as CanvasRenderingContext2D;
    const radius = 15;
    const positionX = canvas.current!.width / 2;
    const positionY = canvas.current!.height / 2;

    const player = new Player(positionX, positionY, radius, "green", c);

    c.beginPath();
    c.moveTo(width / 2, 0);
    c.lineTo(width / 2, height);
    c.strokeStyle = "blue";
    c.stroke();

    c.beginPath();
    c.moveTo(0, height / 2);
    c.lineTo(width, height / 2);
    c.strokeStyle = "blue";
    c.stroke();

    // setInterval(() => {
    const enemyRadius = Math.random() * (30 - 4) + 4;

    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - enemyRadius : width + enemyRadius;
      y = Math.random() * height;
    } else {
      x = Math.random() * width;
      y = Math.random() < 0.5 ? 0 - enemyRadius : height + enemyRadius;
    }

    const color = "red";
    const angle = Math.atan2(height / 2 - y, width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity, c));
    // }, 1000);

    function animate() {
      let animationFrameId = requestAnimationFrame(animate);
      c.clearRect(0, 0, canvasWidth, canvasHeight);
      player.draw();

      projectilesRef.current.forEach((projectile: Projectile, index) => {
        projectile.update();
      });

      enemies.forEach((enemy: Enemy, index) => {
        enemy.update();

        projectilesRef.current.forEach(
          (projectile: Projectile, projectileIndex) => {
            const distance = Math.hypot(
              projectile.x - enemy.x,
              projectile.y - enemy.y
            );

            if (distance - enemy.radius - projectile.radius < 1) {
              enemies.splice(index, 1);
              projectilesRef.current.splice(projectileIndex, 1);
            }
          }
        );

        const distanceToPlayer = Math.hypot(
          player.x - enemy.x,
          player.y - enemy.y
        );

        if (distanceToPlayer - enemy.radius - player.radius < 1) {
          console.log("end game");
          cancelAnimationFrame(animationFrameId);
        }
      });
    }

    animate();
  }, []);

  const handleClick = (e) => {
    const c = canvas.current?.getContext("2d") as CanvasRenderingContext2D;
    const width = canvas.current.width;
    const height = canvas.current.height;
    const angle = Math.atan2(e.clientY - height / 2, e.clientX - width / 2);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    projectilesRef.current.push(
      new Projectile(width / 2, height / 2, 3, "teal", velocity, c)
    );
    // projectile.draw();
    // projectile.update();
  };

  return (
    <div>
      <canvas onClick={handleClick} ref={canvas} id="canvas"></canvas>
    </div>
  );
};

export default Main;
