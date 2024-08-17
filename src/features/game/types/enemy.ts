export type Enemy = Phaser.Physics.Arcade.Sprite & {
  health: number;
  damage: number;
  speed: number;
  isAim: boolean; // pre lock
  isLock: boolean; // lock
  isAttack: boolean;
  isUnderAttack: boolean;
};
