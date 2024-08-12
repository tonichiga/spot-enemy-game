"use client";
import { GameScene } from "@/features";
import { AUTO, Game } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 768,
  scene: [GameScene],
  parent: "game-container",
  backgroundColor: "#006c72",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 }, // Отключаем гравитацию
    },
  },
};

new Game(config);

const GameView = () => {
  return <div id="game-container"></div>;
};

export default GameView;
