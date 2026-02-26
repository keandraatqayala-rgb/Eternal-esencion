import { ClassType, World, Player, Skill } from "./types";

export const SKILLS: Record<ClassType, Skill[]> = {
  [ClassType.NOVICE]: [
    { id: 'strike', name: 'Strike', description: 'A simple strike.', damageMultiplier: 1.2, manaCost: 0, cooldown: 0, currentCooldown: 0 },
  ],
  [ClassType.SWORDSMAN]: [
    { id: 'slash', name: 'Heavy Slash', description: 'A powerful horizontal cut.', damageMultiplier: 2.0, manaCost: 10, cooldown: 2, currentCooldown: 0 },
    { id: 'thrust', name: 'Piercing Thrust', description: 'Ignores some defense.', damageMultiplier: 1.5, manaCost: 5, cooldown: 1, currentCooldown: 0 },
  ],
  [ClassType.MAGE]: [
    { id: 'fireball', name: 'Fireball', description: 'Explosive fire damage.', damageMultiplier: 2.5, manaCost: 20, cooldown: 3, currentCooldown: 0 },
    { id: 'magic_missile', name: 'Magic Missile', description: 'Guaranteed hit.', damageMultiplier: 1.2, manaCost: 5, cooldown: 0, currentCooldown: 0 },
  ],
  [ClassType.ASSASSIN]: [
    { id: 'backstab', name: 'Backstab', description: 'High critical chance.', damageMultiplier: 3.0, manaCost: 15, cooldown: 4, currentCooldown: 0 },
  ],
  [ClassType.PALADIN]: [
    { id: 'holy_strike', name: 'Holy Strike', description: 'Deals damage and heals slightly.', damageMultiplier: 1.5, manaCost: 15, cooldown: 2, currentCooldown: 0 },
  ],
};

export const WORLDS: World[] = [
  {
    id: 0,
    name: "Slime Forest",
    emoji: "🌱",
    minLevel: 1,
    monsters: [
      { name: "Green Slime", hp: 30, maxHp: 30, atk: 5, def: 2, expReward: 10, goldReward: 5, sprite: "💧" },
      { name: "King Slime", hp: 100, maxHp: 100, atk: 12, def: 5, expReward: 50, goldReward: 25, sprite: "👑" },
    ],
  },
  {
    id: 1,
    name: "Goblin Village",
    emoji: "👺",
    minLevel: 5,
    monsters: [
      { name: "Goblin Scout", hp: 60, maxHp: 60, atk: 10, def: 4, expReward: 30, goldReward: 15, sprite: "👺" },
      { name: "Goblin Chief", hp: 250, maxHp: 250, atk: 25, def: 10, expReward: 150, goldReward: 100, sprite: "👹" },
    ],
  },
];

export const INITIAL_PLAYER: Player = {
  name: "Kean",
  level: 1,
  exp: 0,
  maxExp: 100,
  gold: 50,
  power: 10,
  class: ClassType.NOVICE,
  mana: 50,
  maxMana: 50,
  stats: {
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 5,
    speed: 5,
    crit: 5,
  },
  rebirths: 0,
  currentWorld: 0,
  unlockedWorlds: [0],
  inventory: [
    { id: 'hp_pot', name: 'Health Potion', description: 'Heals 50 HP', type: 'potion', value: 50, count: 3 }
  ],
  skills: SKILLS[ClassType.NOVICE],
  appearance: {
    hairColor: '#4A5568',
    skinColor: '#FBD38D',
    weaponType: 'sword'
  }
};
