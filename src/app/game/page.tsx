import dynamic from "next/dynamic";

const Game = dynamic(() => import("@/views/game/game"), {
  ssr: false,
});

const GamePage = () => {
  return <Game />;
};

export default GamePage;
