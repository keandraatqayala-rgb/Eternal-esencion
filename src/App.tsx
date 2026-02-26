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
  ArrowUpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { ClassType, Player, GameState, World } from './types';
import { WORLDS, INITIAL_PLAYER, CLASS_EVOLUTIONS } from './constants';

export default function App() {
  // Game State
  const [player, setPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem('eternal_ascension_save');
    return saved ? JSON.parse(saved).player : INITIAL_PLAYER;
  });

  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem('eternal_ascension_save');
    return saved ? JSON.parse(saved).upgrades : {
      autoAttackSpeed: 1,
      autoExpGain: 1,
      autoGoldGain: 1,
    };
  });

  const [logs, setLogs] = useState<{ id: string; text: string; type: 'battle' | 'system' | 'gain' }[]>([]);
  const [activeTab, setActiveTab] = useState<'battle' | 'stats' | 'upgrades' | 'world' | 'prestige'>('battle');
  
  const logEndRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const gameState: GameState = {
      player,
      upgrades,
      lastUpdate: Date.now(),
    };
    localStorage.setItem('eternal_ascension_save', JSON.stringify(gameState));
  }, [player, upgrades]);

  // Helper: Add Log
  const addLog = useCallback((text: string, type: 'battle' | 'system' | 'gain' = 'system') => {
    setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), text, type }, ...prev].slice(0, 50));
  }, []);

  // Level Up Logic
  const checkLevelUp = useCallback((currentExp: number, currentLevel: number, maxExp: number) => {
    if (currentExp >= maxExp) {
      const newLevel = currentLevel + 1;
      const newMaxExp = Math.floor(maxExp * 1.2) + 50;
      
      setPlayer(prev => ({
        ...prev,
        level: newLevel,
        exp: currentExp - maxExp,
        maxExp: newMaxExp,
        power: prev.power + 5,
        stats: {
          ...prev.stats,
          maxHp: prev.stats.maxHp + 20,
          hp: prev.stats.maxHp + 20,
          atk: prev.stats.atk + 2,
          def: prev.stats.def + 1,
        }
      }));
      addLog(`LEVEL UP! You are now Level ${newLevel}!`, 'system');
      return true;
    }
    return false;
  }, [addLog]);

  // Battle Logic
  const performBattle = useCallback(() => {
    const world = WORLDS[player.currentWorld];
    const monster = world.monsters[Math.floor(Math.random() * world.monsters.length)];
    
    // Calculate gains with upgrades and rebirth bonuses
    const expGain = Math.floor(world.baseExp * upgrades.autoExpGain * (1 + player.rebirths * 0.1));
    const goldGain = Math.floor(world.baseGold * upgrades.autoGoldGain * (1 + player.rebirths * 0.1));

    addLog(`Defeated ${monster} in ${world.name}`, 'battle');
    addLog(`+${expGain} EXP, +${goldGain} Gold`, 'gain');

    setPlayer(prev => {
      const nextExp = prev.exp + expGain;
      const nextGold = prev.gold + goldGain;
      
      // Check for world unlocks
      let nextUnlockedWorlds = [...prev.unlockedWorlds];
      const nextWorld = WORLDS[prev.currentWorld + 1];
      if (nextWorld && prev.level >= nextWorld.minLevel && !nextUnlockedWorlds.includes(nextWorld.id)) {
        nextUnlockedWorlds.push(nextWorld.id);
        addLog(`New World Unlocked: ${nextWorld.name}!`, 'system');
      }

      return {
        ...prev,
        exp: nextExp,
        gold: nextGold,
        unlockedWorlds: nextUnlockedWorlds,
      };
    });

    // Handle level up after state update
    setPlayer(prev => {
      if (prev.exp >= prev.maxExp) {
        const newLevel = prev.level + 1;
        const newMaxExp = Math.floor(prev.maxExp * 1.2) + 50;
        addLog(`LEVEL UP! You are now Level ${newLevel}!`, 'system');
        return {
          ...prev,
          level: newLevel,
          exp: prev.exp - prev.maxExp,
          maxExp: newMaxExp,
          power: prev.power + 5,
          stats: {
            ...prev.stats,
            maxHp: prev.stats.maxHp + 20,
            hp: prev.stats.maxHp + 20,
            atk: prev.stats.atk + 2,
            def: prev.stats.def + 1,
          }
        };
      }
      return prev;
    });

  }, [player.currentWorld, player.rebirths, upgrades.autoExpGain, upgrades.autoGoldGain, addLog]);

  // Game Loop
  useEffect(() => {
    const intervalTime = Math.max(500, 3000 / upgrades.autoAttackSpeed);
    const interval = setInterval(() => {
      performBattle();
    }, intervalTime);
    return () => clearInterval(interval);
  }, [performBattle, upgrades.autoAttackSpeed]);

  // Upgrade Handlers
  const buyUpgrade = (type: keyof typeof upgrades) => {
    const cost = Math.floor(10 * Math.pow(1.5, upgrades[type]));
    if (player.gold >= cost) {
      setPlayer(prev => ({ ...prev, gold: prev.gold - cost }));
      setUpgrades(prev => ({ ...prev, [type]: prev[type] + 1 }));
      addLog(`Upgraded ${String(type)} to Level ${upgrades[type] + 1}`, 'system');
    } else {
      addLog(`Not enough gold! Need ${cost}`, 'system');
    }
  };

  // Evolution Handler
  const evolveClass = (newClass: ClassType) => {
    setPlayer(prev => ({
      ...prev,
      class: newClass,
      power: prev.power + 100,
      stats: {
        ...prev.stats,
        atk: prev.stats.atk + 20,
        maxHp: prev.stats.maxHp + 200,
        hp: prev.stats.maxHp + 200,
      }
    }));
    addLog(`EVOLUTION! You are now a ${newClass}!`, 'system');
  };

  // Prestige Handler
  const performRebirth = () => {
    if (player.level >= 50) {
      setPlayer(prev => ({
        ...INITIAL_PLAYER,
        name: prev.name,
        rebirths: prev.rebirths + 1,
        unlockedWorlds: prev.unlockedWorlds,
        stats: {
          ...INITIAL_PLAYER.stats,
          atk: INITIAL_PLAYER.stats.atk + (prev.rebirths + 1) * 5,
          maxHp: INITIAL_PLAYER.stats.maxHp + (prev.rebirths + 1) * 50,
          hp: INITIAL_PLAYER.stats.maxHp + (prev.rebirths + 1) * 50,
        }
      }));
      addLog(`REBIRTH SUCCESSFUL! Rebirth count: ${player.rebirths + 1}`, 'system');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-hidden">
      {/* Header / Top Bar */}
      <header className="h-16 border-b border-line bg-card flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="mono-label">Player</span>
            <span className="font-serif italic text-xl text-accent">{player.name}</span>
          </div>
          <div className="h-8 w-px bg-line mx-2" />
          <div className="flex flex-col">
            <span className="mono-label">Level</span>
            <span className="stat-value text-lg">{player.level}</span>
          </div>
          <div className="h-8 w-px bg-line mx-2" />
          <div className="flex flex-col">
            <span className="mono-label">Class</span>
            <span className="stat-value text-accent">{player.class}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="mono-label">Gold</span>
            <div className="flex items-center gap-2">
              <Coins size={14} className="text-yellow-500" />
              <span className="stat-value text-yellow-500">{player.gold.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="mono-label">Power</span>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-red-500" />
              <span className="stat-value text-red-500">{player.power.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-20 border-r border-line bg-card flex flex-col items-center py-6 gap-6 shrink-0">
          <NavButton active={activeTab === 'battle'} onClick={() => setActiveTab('battle')} icon={<Sword size={20} />} label="Battle" />
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<User size={20} />} label="Stats" />
          <NavButton active={activeTab === 'upgrades'} onClick={() => setActiveTab('upgrades')} icon={<ArrowUpCircle size={20} />} label="Upgrades" />
          <NavButton active={activeTab === 'world'} onClick={() => setActiveTab('world')} icon={<MapIcon size={20} />} label="World" />
          <NavButton active={activeTab === 'prestige'} onClick={() => setActiveTab('prestige')} icon={<Sparkles size={20} />} label="Prestige" />
        </nav>

        {/* Content View */}
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
          {/* Progress Bar */}
          <div className="bg-card border border-line p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="mono-label">Experience Progress</span>
              <span className="mono-label">{player.exp} / {player.maxExp} EXP</span>
            </div>
            <div className="h-2 bg-line rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${(player.exp / player.maxExp) * 100}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Left Panel: Active View */}
            <div className="flex-1 bg-card border border-line rounded-lg flex flex-col overflow-hidden">
              <div className="p-4 border-b border-line flex justify-between items-center">
                <h2 className="font-serif italic text-lg capitalize">{activeTab}</h2>
                <div className="flex items-center gap-2 text-text-secondary text-xs font-mono">
                  <History size={12} />
                  <span>Real-time Update</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeTab === 'battle' && (
                    <motion.div 
                      key="battle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      {logs.map((log) => (
                        <div key={log.id} className={`p-2 border-l-2 font-mono text-sm ${
                          log.type === 'battle' ? 'border-red-500 bg-red-500/5' : 
                          log.type === 'gain' ? 'border-green-500 bg-green-500/5' : 
                          'border-accent bg-accent/5'
                        }`}>
                          <span className="text-text-secondary mr-2">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                          <span className={log.type === 'gain' ? 'text-green-400' : ''}>{log.text}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'stats' && (
                    <motion.div 
                      key="stats"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <StatCard icon={<Sword size={16} />} label="Attack" value={player.stats.atk} />
                      <StatCard icon={<Shield size={16} />} label="Defense" value={player.stats.def} />
                      <StatCard icon={<Zap size={16} />} label="Speed" value={player.stats.speed} />
                      <StatCard icon={<Target size={16} />} label="Crit Chance" value={`${player.stats.crit}%`} />
                      <StatCard icon={<Layers size={16} />} label="Rebirths" value={player.rebirths} />
                      <StatCard icon={<Sparkles size={16} />} label="Ascensions" value={player.ascensions} />
                    </motion.div>
                  )}

                  {activeTab === 'upgrades' && (
                    <motion.div 
                      key="upgrades"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <UpgradeRow 
                        name="Auto Attack Speed" 
                        level={upgrades.autoAttackSpeed} 
                        cost={Math.floor(10 * Math.pow(1.5, upgrades.autoAttackSpeed))}
                        onBuy={() => buyUpgrade('autoAttackSpeed')}
                        canAfford={player.gold >= Math.floor(10 * Math.pow(1.5, upgrades.autoAttackSpeed))}
                      />
                      <UpgradeRow 
                        name="Auto EXP Gain" 
                        level={upgrades.autoExpGain} 
                        cost={Math.floor(10 * Math.pow(1.5, upgrades.autoExpGain))}
                        onBuy={() => buyUpgrade('autoExpGain')}
                        canAfford={player.gold >= Math.floor(10 * Math.pow(1.5, upgrades.autoExpGain))}
                      />
                      <UpgradeRow 
                        name="Auto Gold Gain" 
                        level={upgrades.autoGoldGain} 
                        cost={Math.floor(10 * Math.pow(1.5, upgrades.autoGoldGain))}
                        onBuy={() => buyUpgrade('autoGoldGain')}
                        canAfford={player.gold >= Math.floor(10 * Math.pow(1.5, upgrades.autoGoldGain))}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'world' && (
                    <motion.div 
                      key="world"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 gap-3"
                    >
                      {WORLDS.map((world) => {
                        const isUnlocked = player.unlockedWorlds.includes(world.id);
                        const isCurrent = player.currentWorld === world.id;
                        return (
                          <button
                            key={world.id}
                            disabled={!isUnlocked}
                            onClick={() => setPlayer(prev => ({ ...prev, currentWorld: world.id }))}
                            className={`p-4 border rounded-lg flex items-center justify-between transition-all ${
                              isCurrent ? 'border-accent bg-accent/10' : 
                              isUnlocked ? 'border-line hover:border-accent/50 bg-white/5' : 
                              'border-line/30 opacity-50 grayscale cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{world.emoji}</span>
                              <div className="text-left">
                                <h3 className="font-medium">{world.name}</h3>
                                <p className="text-xs text-text-secondary font-mono">Min Level: {world.minLevel}</p>
                              </div>
                            </div>
                            {isCurrent ? (
                              <span className="text-accent text-xs font-mono uppercase tracking-widest">Grinding</span>
                            ) : isUnlocked ? (
                              <ChevronRight size={16} className="text-text-secondary" />
                            ) : (
                              <Shield size={16} className="text-text-secondary" />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {activeTab === 'prestige' && (
                    <motion.div 
                      key="prestige"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="p-6 border border-accent/30 bg-accent/5 rounded-lg text-center">
                        <Sparkles className="mx-auto mb-4 text-accent" size={48} />
                        <h3 className="text-xl font-serif italic mb-2">Rebirth</h3>
                        <p className="text-sm text-text-secondary mb-6">
                          Reset your level, gold, and stats to gain a permanent <span className="text-accent">+10% bonus</span> to all gains and base stats.
                          <br />
                          <span className="text-xs mt-2 block font-mono">Requires Level 50</span>
                        </p>
                        <button
                          onClick={performRebirth}
                          disabled={player.level < 50}
                          className={`px-8 py-3 rounded-full font-bold transition-all ${
                            player.level >= 50 
                            ? 'bg-accent text-white hover:scale-105 active:scale-95' 
                            : 'bg-line text-text-secondary cursor-not-allowed'
                          }`}
                        >
                          Perform Rebirth
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Panel: Quick Stats / Character Card */}
            <div className="w-80 flex flex-col gap-6 shrink-0">
              <div className="bg-card border border-line rounded-lg p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mb-4 relative">
                  <User size={48} className="text-accent" />
                  <div className="absolute -bottom-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {player.class}
                  </div>
                </div>
                <h3 className="font-serif italic text-xl mb-1">{player.name}</h3>
                <p className="text-xs text-text-secondary font-mono mb-4 uppercase tracking-widest">
                  World {player.currentWorld + 1}: {WORLDS[player.currentWorld].name}
                </p>
                
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="mono-label">Health</span>
                    <span className="stat-value text-green-400">{player.stats.hp} / {player.stats.maxHp}</span>
                  </div>
                  <div className="h-1.5 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${(player.stats.hp / player.stats.maxHp) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-line rounded-lg p-4 flex-1">
                <h4 className="mono-label mb-4">Class Evolution</h4>
                <div className="space-y-3">
                  {CLASS_EVOLUTIONS[player.class].length > 0 ? (
                    CLASS_EVOLUTIONS[player.class].map((evo) => (
                      <div 
                        key={evo} 
                        onClick={() => evolveClass(evo)}
                        className="p-3 border border-line rounded bg-white/5 flex items-center justify-between group cursor-pointer hover:border-accent/50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-text-secondary font-mono">Evolution Available</span>
                          <span className="text-sm font-medium">{evo}</span>
                        </div>
                        <ChevronRight size={14} className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-secondary italic text-center py-4">Max class level reached for current path.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-line bg-card flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">System Online</span>
          </div>
          <span className="text-[10px] font-mono text-line">|</span>
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Auto-Grind Active</span>
        </div>
        <div className="text-[10px] font-mono text-text-secondary">
          v1.0.4-BETA // ETERNAL_ASCENSION_PROTOCOL
        </div>
      </footer>
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="p-4 border border-line rounded-lg bg-white/5 flex items-center gap-4">
      <div className="text-accent opacity-70">{icon}</div>
      <div className="flex flex-col">
        <span className="mono-label">{label}</span>
        <span className="stat-value text-lg">{value}</span>
      </div>
    </div>
  );
}

function UpgradeRow({ name, level, cost, onBuy, canAfford }: { name: string; level: number; cost: number; onBuy: () => void; canAfford: boolean }) {
  return (
    <div className="p-4 border border-line rounded-lg bg-white/5 flex items-center justify-between">
      <div className="flex flex-col">
        <h3 className="font-medium text-sm">{name}</h3>
        <span className="text-xs text-text-secondary font-mono">Level {level}</span>
      </div>
      <button 
        onClick={onBuy}
        disabled={!canAfford}
        className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${
          canAfford 
          ? 'bg-accent/10 border border-accent/50 text-accent hover:bg-accent hover:text-white' 
          : 'bg-line/20 border border-line text-text-secondary cursor-not-allowed opacity-50'
        }`}
      >
        <Coins size={14} />
        <span className="font-mono text-xs">{cost.toLocaleString()}</span>
      </button>
    </div>
  );
}
