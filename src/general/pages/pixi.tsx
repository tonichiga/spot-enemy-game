// import * as PIXI from "pixi.js";
// import { useEffect, useRef } from "react";

// const PixiGameTutorial = () => {
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     let type = "WebGL";
//     if (!PIXI.utils.isWebGLSupported()) {
//       type = "canvas";
//     }

//     const pixiApp = new PIXI.Application({
//       width: 800,
//       height: 600,
//       backgroundColor: 0x1099bb,
//     });

//     pixiApp.resizeTo = window;

//     const bunny = PIXI.Sprite.from("https://pixijs.com/assets/bunny.png");
//     bunny.anchor.set(0.5);
//     bunny.x = pixiApp.screen.width / 2;
//     bunny.y = pixiApp.screen.height / 2;
//     pixiApp.stage.addChild(bunny);

//     pixiApp.ticker.add((delta) => {
//       // just for fun, let's rotate mr rabbit a little
//       // delta is 1 if running at 100% performance
//       // creates frame-independent transformation
//       bunny.rotation += 0.1 * delta;
//     });

//     function setup(params) {}

//     containerRef.current.appendChild(pixiApp.view as any);
//   }, []);

//   return <div ref={containerRef} />;
// };

// export default PixiGameTutorial;
export {};
