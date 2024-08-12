"use client";
import { useEffect } from "react";
import Example from "@/scene/example";

const PhaserContainer = () => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      scene: Example,

      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 200 },
        },
      },
    };

    const game = new Phaser.Game(config);
  }, []);

  return <div id="phaser-container"></div>;
};

export default PhaserContainer;
