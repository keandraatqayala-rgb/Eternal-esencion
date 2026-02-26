import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sword, 
  Shield, 
  Zap, 
  Target, 
  Coins, 
  TrendingUp, 
  Map as MapIcon, 
  User, 
  ChevronRight, 
  History,
  Sparkles,
  Heart,
  Droplets,
  Backpack,
  Settings,
  X
} from 'lucide-react';
import { ClassType, Player, GameState, World, Monster, Skill, Item } from './types';
import { WORLDS, INITIAL_PLAYER, SKILLS } from './constants';

export default function App() {
  // Game State
  const [player, setPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem('eternal_ascension_save_v2');
    return saved ? JSON.parse(saved).player : INITIAL_PLAYER;
  });

  const [activeTab, setActiveTab] = useState<'map' | 'battle' | 'stats' | 'inventory' | 'customize'>('map');
  const [currentEnemy, setCurrentEnemy] = useState<Monster | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isZooming, setIsZooming] = useState(false);

  // Persistence
  useEffect(() => {
    const gameState: GameState = {
      player,
      lastUpdate: Date.now(),
    };
    localStorage.setItem('eternal_ascension_save_v2', JSON.stringify(gameState));
  }, [player]);

  const addLog = (msg: string) => {
    setBattleLogs(prev => [msg, ...prev].slice(0, 10));
  };

  // Battle Logic
  const startBattle = (world: World) => {
    const monster = world.monsters[Math.floor(Math.random() * world.monsters.length)];
    setCurrentEnemy({ ...monster });
    setBattleLogs([`A wild ${monster.name} appeared!`]);
    setIsPlayerTurn(true);
    setIsZooming(true);
    setTimeout(() => {
      setIsZooming(false);
      setActiveTab('battle');
    }, 800);
  };

  const playerAttack = () => {
    if (!currentEnemy || !isPlayerTurn) return;
    
    const damage = Math.max(1, player.stats.atk - currentEnemy.def);
    const isCrit = Math.random() * 100 < player.stats.crit;
    const finalDamage = isCrit ? damage * 2 : damage;

    setCurrentEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - finalDamage) } : null);
    addLog(`You attacked ${currentEnemy.name} for ${finalDamage} damage! ${isCrit ? '(CRITICAL!)' : ''}`);
    
    setIsPlayerTurn(false);
  };

  const useSkill = (skill: Skill) => {
    if (!currentEnemy || !isPlayerTurn || player.mana < skill.manaCost) return;

    const damage = Math.floor(player.stats.atk * skill.damageMultiplier);
    setCurrentEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - damage) } : null);
    setPlayer(prev => ({ ...prev, mana: prev.mana - skill.manaCost }));
    addLog(`Used ${skill.name}! Dealt ${damage} damage.`);
    
    setIsPlayerTurn(false);
  };

  const usePotion = (item: Item) => {
    if (item.count <= 0) return;
    
    if (item.type === 'potion') {
      setPlayer(prev => ({
        ...prev,
        stats: { ...prev.stats, hp: Math.min(prev.stats.maxHp, prev.stats.hp + item.value) },
        inventory: prev.inventory.map(i => i.id === item.id ? { ...i, count: i.count - 1 } : i)
      }));
      addLog(`Used ${item.name}. Healed ${item.value} HP.`);
    }
  };

  // Enemy Turn
  useEffect(() => {
    if (!isPlayerTurn && currentEnemy && currentEnemy.hp > 0) {
      const timer = setTimeout(() => {
        const damage = Math.max(1, currentEnemy.atk - player.stats.def);
        setPlayer(prev => ({
          ...prev,
          stats: { ...prev.stats, hp: Math.max(0, prev.stats.hp - damage) }
        }));
        addLog(`${currentEnemy.name} attacked you for ${damage} damage!`);
        setIsPlayerTurn(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, currentEnemy, player.stats.def]);

  // Win/Loss Check
  useEffect(() => {
    if (currentEnemy && currentEnemy.hp <= 0) {
      addLog(`Victory! Gained ${currentEnemy.expReward} EXP and ${currentEnemy.goldReward} Gold.`);
      const exp = currentEnemy.expReward;
      const gold = currentEnemy.goldReward;
      
      setPlayer(prev => {
        let newExp = prev.exp + exp;
        let newLevel = prev.level;
        let newMaxExp = prev.maxExp;
        
        if (newExp >= newMaxExp) {
          newLevel++;
          newExp -= newMaxExp;
          newMaxExp = Math.floor(newMaxExp * 1.5);
          addLog("Level Up!");
        }

        return {
          ...prev,
          level: newLevel,
          exp: newExp,
          maxExp: newMaxExp,
          gold: prev.gold + gold,
          stats: { ...prev.stats, hp: prev.stats.maxHp } // Heal on win
        };
      });

      setTimeout(() => {
        setCurrentEnemy(null);
        setActiveTab('map');
      }, 2000);
    }

    if (player.stats.hp <= 0) {
      addLog("You were defeated...");
      setTimeout(() => {
        setPlayer(prev => ({ ...prev, stats: { ...prev.stats, hp: prev.stats.maxHp }, gold: Math.floor(prev.gold * 0.8) }));
        setCurrentEnemy(null);
        setActiveTab('map');
      }, 2000);
    }
  }, [currentEnemy?.hp, player.stats.hp]);

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-line bg-card flex items-center px-6 justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="mono-label">Hero</span>
            <span className="font-serif italic text-xl text-accent">{player.name}</span>
          </div>
          <div className="h-8 w-px bg-line mx-2" />
          <div className="flex flex-col">
            <span className="mono-label">Level</span>
            <span className="stat-value text-lg">{player.level}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="mono-label">Gold</span>
            <div className="flex items-center gap-2">
              <Coins size={14} className="text-yellow-500" />
              <span className="stat-value text-yellow-500">{player.gold}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="mono-label">HP</span>
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-red-500" />
              <span className="stat-value text-red-500">{player.stats.hp}/{player.stats.maxHp}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Zoom Overlay */}
        <AnimatePresence>
          {isZooming && (
            <motion.div 
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 2, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-accent/20 z-50 pointer-events-none flex items-center justify-center"
            >
              <Sparkles size={100} className="text-accent animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <nav className="w-20 border-r border-line bg-card flex flex-col items-center py-6 gap-6 shrink-0 z-10">
          <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={20} />} label="Map" />
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<User size={20} />} label="Stats" />
          <NavButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Backpack size={20} />} label="Items" />
          <NavButton active={activeTab === 'customize'} onClick={() => setActiveTab('customize')} icon={<Settings size={20} />} label="Hero" />
        </nav>

        {/* Viewport */}
        <div className="flex-1 overflow-hidden relative p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {WORLDS.map(world => (
                  <button
                    key={world.id}
                    onClick={() => startBattle(world)}
                    className="group relative h-48 rounded-2xl overflow-hidden border border-line bg-card hover:border-accent transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                      {world.emoji}
                    </div>
                    <div className="absolute bottom-4 left-4 z-20 text-left">
                      <h3 className="text-xl font-serif italic text-white">{world.name}</h3>
                      <p className="text-xs text-text-secondary font-mono">Min Level: {world.minLevel}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {activeTab === 'battle' && currentEnemy && (
              <motion.div 
                key="battle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col gap-6"
              >
                {/* Battle Arena */}
                <div className="flex-1 bg-card rounded-3xl border border-line relative overflow-hidden flex items-center justify-around p-12">
                  {/* Background Decoration */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_70%)]" />
                  </div>

                  {/* Player Character */}
                  <div className="flex flex-col items-center gap-4 z-10">
                    <CharacterSprite appearance={player.appearance} isAttacking={!isPlayerTurn} />
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span>HP</span>
                        <span>{player.stats.hp}</span>
                      </div>
                      <div className="h-1.5 bg-line rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-red-500"
                          animate={{ width: `${(player.stats.hp / player.stats.maxHp) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono mt-2 mb-1">
                        <span>MP</span>
                        <span>{player.mana}</span>
                      </div>
                      <div className="h-1.5 bg-line rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          animate={{ width: `${(player.mana / player.maxMana) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-4xl font-serif italic text-accent animate-pulse">VS</div>

                  {/* Enemy */}
                  <div className="flex flex-col items-center gap-4 z-10">
                    <motion.div 
                      animate={currentEnemy.hp > 0 ? { y: [0, -10, 0] } : { opacity: 0, scale: 0 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-8xl"
                    >
                      {currentEnemy.sprite}
                    </motion.div>
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span>{currentEnemy.name}</span>
                        <span>{currentEnemy.hp}</span>
                      </div>
                      <div className="h-1.5 bg-line rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-red-500"
                          animate={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Battle Controls */}
                <div className="h-48 flex gap-6">
                  <div className="flex-1 bg-card border border-line rounded-2xl p-4 flex flex-col">
                    <span className="mono-label mb-3">Actions</span>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <ActionButton 
                        icon={<Sword size={16} />} 
                        label="Basic Attack" 
                        onClick={playerAttack} 
                        disabled={!isPlayerTurn || currentEnemy.hp <= 0} 
                      />
                      {player.skills.map(skill => (
                        <ActionButton 
                          key={skill.id}
                          icon={<Zap size={16} />} 
                          label={skill.name} 
                          onClick={() => useSkill(skill)} 
                          disabled={!isPlayerTurn || player.mana < skill.manaCost || currentEnemy.hp <= 0}
                          subLabel={`${skill.manaCost} MP`}
                        />
                      ))}
                      <ActionButton 
                        icon={<Backpack size={16} />} 
                        label="Potions" 
                        onClick={() => setActiveTab('inventory')} 
                        disabled={!isPlayerTurn || currentEnemy.hp <= 0} 
                      />
                    </div>
                  </div>

                  <div className="w-80 bg-card border border-line rounded-2xl p-4 flex flex-col">
                    <span className="mono-label mb-3">Battle Log</span>
                    <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 custom-scrollbar">
                      {battleLogs.map((log, i) => (
                        <div key={i} className={i === 0 ? 'text-accent' : 'text-text-secondary'}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div key="inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="font-serif italic text-2xl">Inventory</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {player.inventory.map(item => (
                    <div key={item.id} className="p-4 bg-card border border-line rounded-xl flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-xs text-text-secondary">{item.description}</p>
                        <span className="text-xs font-mono text-accent">Owned: {item.count}</span>
                      </div>
                      <button 
                        onClick={() => usePotion(item)}
                        disabled={item.count <= 0}
                        className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all disabled:opacity-30"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'customize' && (
              <motion.div key="cust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-12 items-start">
                <div className="w-64 h-96 bg-card border border-line rounded-3xl flex items-center justify-center">
                  <CharacterSprite appearance={player.appearance} scale={2} />
                </div>
                <div className="flex-1 space-y-8">
                  <h2 className="font-serif italic text-2xl">Customize Hero</h2>
                  
                  <div className="space-y-4">
                    <span className="mono-label">Hair Color</span>
                    <div className="flex gap-3">
                      {['#4A5568', '#F56565', '#4299E1', '#48BB78', '#ECC94B'].map(color => (
                        <button 
                          key={color}
                          onClick={() => setPlayer(prev => ({ ...prev, appearance: { ...prev.appearance, hairColor: color } }))}
                          className={`w-10 h-10 rounded-full border-2 ${player.appearance.hairColor === color ? 'border-accent' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="mono-label">Weapon Type</span>
                    <div className="flex gap-3">
                      {['sword', 'staff', 'dagger', 'shield'].map(type => (
                        <button 
                          key={type}
                          onClick={() => setPlayer(prev => ({ ...prev, appearance: { ...prev.appearance, weaponType: type as any } }))}
                          className={`px-4 py-2 rounded-lg border font-mono text-xs uppercase tracking-widest transition-all ${
                            player.appearance.weaponType === type ? 'border-accent bg-accent/10 text-accent' : 'border-line hover:border-accent/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative group flex flex-col items-center gap-1 transition-all ${active ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
    >
      <div className={`p-3 rounded-xl transition-all ${active ? 'bg-accent/10 shadow-[0_0_15px_rgba(242,125,38,0.2)]' : 'group-hover:bg-white/5'}`}>
        {icon}
      </div>
      <span className="text-[9px] font-mono uppercase tracking-tighter">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -right-[21px] w-1 h-8 bg-accent rounded-l-full"
        />
      )}
    </button>
  );
}

interface ActionButtonProps {
  key?: string | number;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  subLabel?: string;
}

function ActionButton({ icon, label, onClick, disabled, subLabel }: ActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
        disabled 
        ? 'border-line bg-line/5 opacity-30 cursor-not-allowed' 
        : 'border-accent/30 bg-accent/5 hover:bg-accent hover:text-white hover:border-accent'
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      {subLabel && <span className="text-[8px] font-mono mt-0.5 opacity-70">{subLabel}</span>}
    </button>
  );
}

function CharacterSprite({ appearance, isAttacking, scale = 1 }: { appearance: any; isAttacking?: boolean; scale?: number }) {
  return (
    <motion.div 
      animate={isAttacking ? { x: [0, 20, 0] } : {}}
      style={{ scale }}
      className="relative w-24 h-32 flex items-center justify-center"
    >
      {/* Body */}
      <div 
        className="w-12 h-20 rounded-2xl absolute" 
        style={{ backgroundColor: appearance.skinColor }}
      />
      {/* Hair */}
      <div 
        className="w-14 h-8 rounded-t-full absolute top-4" 
        style={{ backgroundColor: appearance.hairColor }}
      />
      {/* Eyes */}
      <div className="flex gap-3 absolute top-10">
        <div className="w-1.5 h-1.5 bg-black rounded-full" />
        <div className="w-1.5 h-1.5 bg-black rounded-full" />
      </div>
      {/* Weapon */}
      <motion.div 
        animate={{ rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="absolute -right-4 bottom-8 text-3xl"
      >
        {appearance.weaponType === 'sword' && '⚔️'}
        {appearance.weaponType === 'staff' && '🪄'}
        {appearance.weaponType === 'dagger' && '🗡️'}
        {appearance.weaponType === 'shield' && '🛡️'}
      </motion.div>
    </motion.div>
  );
}
