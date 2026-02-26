export enum ClassType {
  NOVICE = "Novice",
  SWORDSMAN = "Swordsman",
  BLADE_MASTER = "Blade Master",
  SWORD_GOD = "Sword God",
  MAGE = "Mage",
  ARCHMAGE = "Archmage",
  REALITY_CASTER = "Reality Caster",
  ASSASSIN = "Assassin",
  SHADOW_REAPER = "Shadow Reaper",
  DEATH_GOD = "Death God",
  PALADIN = "Paladin",
  HOLY_KNIGHT = "Holy Knight",
  DIVINE_GUARDIAN = "Divine Guardian",
  NECROMANCER = "Necromancer",
  LICH_KING = "Lich King",
  GOD_OF_DEATH = "God of Death",
}

export interface Stats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
  crit: number;
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
  rebirths: number;
  ascensions: number;
  currentWorld: number;
  unlockedWorlds: number[];
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
}

export interface World {
  id: number;
  name: string;
  emoji: string;
  minLevel: number;
  baseExp: number;
  baseGold: number;
  monsters: string[];
}

export interface GameState {
  player: Player;
  upgrades: {
    autoAttackSpeed: number;
    autoExpGain: number;
    autoGoldGain: number;
  };
  lastUpdate: number;
}
