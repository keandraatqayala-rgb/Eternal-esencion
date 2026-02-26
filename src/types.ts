export enum ClassType {
  NOVICE = "Novice",
  SWORDSMAN = "Swordsman",
  MAGE = "Mage",
  ASSASSIN = "Assassin",
  PALADIN = "Paladin",
}

export interface Stats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
  crit: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  damageMultiplier: number;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'potion' | 'buff';
  value: number;
  count: number;
}

export interface CharacterAppearance {
  hairColor: string;
  skinColor: string;
  weaponType: 'sword' | 'staff' | 'dagger' | 'shield';
}

export interface Player {
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  power: number;
  class: ClassType;
  stats: Stats;
  mana: number;
  maxMana: number;
  rebirths: number;
  currentWorld: number;
  unlockedWorlds: number[];
  inventory: Item[];
  skills: Skill[];
  appearance: CharacterAppearance;
}

export interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  expReward: number;
  goldReward: number;
  sprite: string;
}

export interface World {
  id: number;
  name: string;
  emoji: string;
  minLevel: number;
  monsters: Monster[];
}

export interface GameState {
  player: Player;
  lastUpdate: number;
}
