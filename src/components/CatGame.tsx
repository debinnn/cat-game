"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Types for cat state
export type CatStats = {
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  lastInteraction: number; // timestamp
  lastPet: number; // timestamp
  lastFed: number; // timestamp
  lastPlay: number; // timestamp
  lastSleep: number; // timestamp
  totalCareDays: number;
  dailyStreak: number;
  moodHistory: Array<{ time: number; mood: string }>;
  lastToy: "ball" | "mouse" | null;
};

const defaultStats: CatStats = {
  hunger: 40,
  happiness: 60,
  energy: 70,
  lastInteraction: Date.now(),
  lastPet: 0,
  lastFed: 0,
  lastPlay: 0,
  lastSleep: 0,
  totalCareDays: 1,
  dailyStreak: 1,
  moodHistory: [],
  lastToy: null,
};

// Utility: clamp value
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

// Utility: get mood sprite
function getCatSprite(stats: CatStats, eating: boolean, sleeping: boolean, playing: boolean, petting: boolean): string {
  if (eating) return "/assets/cat_eating.png";
  if (sleeping) return "/assets/cat_sitting_comfortable_purring.png";
  if (playing) return "/assets/cat_very_happy.png"; // Use very happy when playing
  if (petting) return "/assets/cat_sitting_happy.png"; // Use sitting happy when being petted
  if (stats.energy < 20) return "/assets/cat_mild_happy.png"; 
  if (stats.happiness < 30 || stats.hunger > 80) return "/assets/cat_sad.png";
  if (stats.happiness > 90 && stats.energy > 70) return "/assets/cat_very_happy.png";
  if (stats.happiness > 80 && stats.hunger < 50) return "/assets/cat_sitting_happy.png";
  if (stats.happiness >= 60 && stats.happiness <= 80 && Date.now() - stats.lastPet < 5 * 60 * 1000)
    return "/assets/cat_sitting_comfortable_purring.png";
  if (stats.happiness >= 30 && stats.happiness < 60 && stats.hunger < 70 && stats.energy > 30)
    return "/assets/cat_mild_happy.png";
  return "/assets/cat_mild_happy.png";
}

// Utility: get heart icon
function getHeartIcon(happiness: number): string {
  if (happiness <= 33) return "/assets/one_heart.png";
  if (happiness <= 66) return "/assets/two_hearts.png";
  return "/assets/two_hearts.png"; // Will animate for high happiness
}

// Utility: get localStorage key
const STORAGE_KEY = "cat_game_stats_v1";

// Main CatGame component
const CatGame: React.FC = () => {
  const [stats, setStats] = useState<CatStats>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultStats, ...JSON.parse(saved) };
    }
    return defaultStats;
  });
  const [eating, setEating] = useState(false);
  const [showToys, setShowToys] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [petHearts, setPetHearts] = useState<Array<{id: number, x: number, y: number, type: 'asset' | 'emoji', delay: number}>>([]);
  const [showSleep, setShowSleep] = useState(false);
  const [showToyNearCat, setShowToyNearCat] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [bgClouds] = useState([
    { id: 1, left: "15%", top: "15%", speed: 25 },
    { id: 2, left: "75%", top: "25%", speed: 35 },
    { id: 3, left: "5%", top: "35%", speed: 30 },
    { id: 4, left: "85%", top: "45%", speed: 20 },
    { id: 5, left: "45%", top: "10%", speed: 28 },
  ]);
  const [bgFlowers] = useState([
    { id: 1, left: "25%", top: "75%", type: "pink" },
    { id: 2, left: "80%", top: "65%", type: "yellow" },
  ]);
  const [bgHearts] = useState([
    { id: 1, left: "10%", top: "20%", speed: 15, size: "small" },
    { id: 2, left: "90%", top: "30%", speed: 22, size: "medium" },
    { id: 3, left: "30%", top: "50%", speed: 18, size: "small" },
    { id: 4, left: "70%", top: "40%", speed: 25, size: "medium" },
  ]);
  const eatingTimeout = useRef<NodeJS.Timeout | null>(null);
  const sparkleTimeout = useRef<NodeJS.Timeout | null>(null);
  const heartTimeout = useRef<NodeJS.Timeout | null>(null);
  const sleepTimeout = useRef<NodeJS.Timeout | null>(null);
  const playTimeout = useRef<NodeJS.Timeout | null>(null);
  const petTimeout = useRef<NodeJS.Timeout | null>(null);

  // Save stats to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  // Hide mobile browser address bar
  useEffect(() => {
    const hideAddressBar = () => {
      if (typeof window !== "undefined" && window.scrollTo) {
        // Small delay to ensure page is loaded
        setTimeout(() => {
          window.scrollTo(0, 1);
        }, 100);
      }
    };

    // Hide on initial load
    hideAddressBar();

    // Hide when user interacts with the page
    const handleInteraction = () => {
      hideAddressBar();
    };

    // Add event listeners for various interactions
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, []);

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [stats]);

  // Stat decay logic - hunger and energy go down 2 levels every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        return {
          ...prev,
          hunger: clamp(prev.hunger + 2), // Increase hunger by 2 every 15 seconds
          energy: clamp(prev.energy - 2), // Decrease energy by 2 every 15 seconds
          happiness: clamp(prev.happiness - 1), // Slight happiness decay
          lastInteraction: Date.now(),
        };
      });
    }, 15 * 1000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Mood history for smooth transitions
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      moodHistory: [
        ...prev.moodHistory.slice(-20),
        { time: Date.now(), mood: getCatSprite(prev, eating, showSleep, isPlaying, isPetting) },
      ],
    }));
    // eslint-disable-next-line
  }, [stats.hunger, stats.happiness, stats.energy, eating]);

  // Random events
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        if (Math.random() < 0.2) {
          // 20% chance every 2-4 hours
          const happyBoost = Math.random() < 0.5 ? 10 : -10;
          return {
            ...prev,
            happiness: clamp(prev.happiness + happyBoost),
          };
        }
        return prev;
      });
    }, (2 + Math.random() * 2) * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Combo system: multiple quick interactions
  const handleCombo = () => {
    setStats((prev) => {
      const now = Date.now();
      const last = prev.lastInteraction;
      if (now - last < 10000) {
        // 10s window
        return {
          ...prev,
          happiness: clamp(prev.happiness + 10),
        };
      }
      return prev;
    });
  };

  // Feed
  const handleFeed = () => {
    if (eating) return;
    setEating(true);
    setStats((prev) => ({
      ...prev,
      hunger: clamp(prev.hunger - 35),
      happiness: clamp(prev.happiness + 5),
      lastFed: Date.now(),
      lastInteraction: Date.now(),
    }));
    eatingTimeout.current = setTimeout(() => {
      setEating(false);
    }, 4000 + Math.random() * 2000); // 4-6s
    handleCombo();
  };

  // Play - now also reduces hunger
  const handlePlay = (toy: "ball" | "mouse") => {
    setShowToys(false);
    setShowSparkle(true);
    setIsPlaying(true);
    setShowToyNearCat(toy === "ball" ? "/assets/cat_toy_ball.png" : "/assets/cat_toy_mouse.png");
    
    setStats((prev) => {
      const happiness = toy === "ball" ? 25 : 30;
      const energyCost = toy === "ball" ? 12 : 8;
      const hungerIncrease = toy === "ball" ? 8 : 6; // Playing makes cat hungry
      return {
        ...prev,
        happiness: clamp(prev.happiness + happiness),
        energy: clamp(prev.energy - energyCost),
        hunger: clamp(prev.hunger + hungerIncrease), // Playing increases hunger
        lastPlay: Date.now(),
        lastInteraction: Date.now(),
        lastToy: toy,
      };
    });
    
    // Show playing state for 5 seconds
    playTimeout.current = setTimeout(() => {
      setIsPlaying(false);
      setShowToyNearCat(null);
    }, 5000);
    
    sparkleTimeout.current = setTimeout(() => setShowSparkle(false), toy === "ball" ? 1200 : 1800);
    handleCombo();
  };

  // Pet - creates multiple hearts around the cat
  const handlePet = () => {
    setShowHearts(true);
    setIsPetting(true);
    
    // Create multiple hearts around the cat (both assets and emojis)
    const newHearts = [];
    for (let i = 0; i < 6; i++) {
      newHearts.push({
        id: Date.now() + i,
        x: Math.random() * 200 - 100, // Random position around cat (-100 to +100)
        y: Math.random() * 200 - 100,
        type: (Math.random() > 0.5 ? 'asset' : 'emoji') as 'asset' | 'emoji',
        delay: i * 200, // Stagger the appearance
      });
    }
    setPetHearts(newHearts);
    
    setStats((prev) => ({
      ...prev,
      happiness: clamp(prev.happiness + 15),
      lastPet: Date.now(),
      lastInteraction: Date.now(),
    }));
    
    // Show happy petting state for 5 seconds
    petTimeout.current = setTimeout(() => setIsPetting(false), 5000);
    heartTimeout.current = setTimeout(() => {
      setShowHearts(false);
      setPetHearts([]);
    }, 3000); // Show hearts for 3 seconds
    handleCombo();
  };

  // Sleep
  const handleSleep = () => {
    setShowSleep(true);
    setStats((prev) => ({
      ...prev,
      energy: clamp(prev.energy + 55),
      lastSleep: Date.now(),
      lastInteraction: Date.now(),
    }));
    // Sleep for 10-15 seconds (random duration)
    const sleepDuration = 10000 + Math.random() * 5000; // 10-15 seconds
    sleepTimeout.current = setTimeout(() => setShowSleep(false), sleepDuration);
    handleCombo();
  };

  // Daily streak logic
  useEffect(() => {
    if (typeof window === "undefined") return;
    const today = new Date().toDateString();
    const last = localStorage.getItem("cat_game_last_day");
    if (last !== today) {
      setStats((prev) => ({
        ...prev,
        totalCareDays: prev.totalCareDays + 1,
        dailyStreak: prev.dailyStreak + 1,
      }));
      localStorage.setItem("cat_game_last_day", today);
    }
  }, []);

  // Touch gestures: tap to pet, long-press for extra affection
  const touchStart = useRef<number | null>(null);
  const handleTouchStart = () => {
    touchStart.current = Date.now();
  };
  const handleTouchEnd = () => {
    if (touchStart.current && Date.now() - touchStart.current > 600) {
      // Long press - create multiple hearts
      const newHearts = [];
      for (let i = 0; i < 8; i++) {
        newHearts.push({
          id: Date.now() + i,
          x: Math.random() * 240 - 120,
          y: Math.random() * 240 - 120,
          type: (Math.random() > 0.4 ? 'asset' : 'emoji') as 'asset' | 'emoji',
          delay: i * 150,
        });
      }
      setPetHearts(newHearts);
      
      setStats((prev) => ({
        ...prev,
        happiness: clamp(prev.happiness + 25),
        lastPet: Date.now(),
        lastInteraction: Date.now(),
      }));
      setShowHearts(true);
      setTimeout(() => {
        setShowHearts(false);
        setPetHearts([]);
      }, 3500);
      handleCombo();
    } else {
      handlePet();
    }
    touchStart.current = null;
  };

  // UI rendering
  const catSprite = getCatSprite(stats, eating, showSleep, isPlaying, isPetting);
  const heartIcon = getHeartIcon(stats.happiness);
  const foodIcon = "/assets/food_in_bowl.png";
  const energyIcon = "/assets/thunder_bolt.png";

  return (
    <div
      className="relative w-full h-screen flex flex-col bg-gradient-to-br from-light-pink via-soft-pink to-pink font-ui overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Background clouds - multiple floating */}
      {bgClouds.map((cloud) => (
        <Image
          key={cloud.id}
          src="/assets/cloud.png"
          alt="cloud"
          width={60}
          height={30}
          className={`absolute opacity-40 ${cloud.speed > 30 ? 'animate-drift' : 'animate-drift-slow'}`}
          style={{ 
            left: cloud.left, 
            top: cloud.top, 
            zIndex: 1, 
            animationDuration: `${cloud.speed}s`,
            animationDelay: `${cloud.id * 2}s`
          }}
        />
      ))}
      
      {/* Floating heart emojis */}
      {bgHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-heart-drift opacity-60 pointer-events-none"
          style={{ 
            left: heart.left, 
            top: heart.top, 
            zIndex: 2, 
            animationDuration: `${heart.speed}s`,
            animationDelay: `${heart.id * 3}s`
          }}
        >
          <span 
            className="text-pink-400 animate-pulse"
            style={{ 
              fontSize: heart.size === "small" ? "16px" : "24px",
              animationDuration: "2s"
            }}
          >
            💖
          </span>
        </div>
      ))}
      
      {/* Scattered flower decorations - only 1-2 each */}
      {bgFlowers.map((flower) => (
        <Image
          key={flower.id}
          src={flower.type === "pink" ? "/assets/pink_flower.png" : "/assets/yellow_flower.png"}
          alt="flower"
          width={24}
          height={24}
          className="absolute animate-float opacity-70"
          style={{ left: flower.left, top: flower.top, zIndex: 2 }}
        />
      ))}

      {/* Main Cat Display Area - Top 75% */}
      <div className="relative flex flex-col items-center justify-center w-full px-4 flex-1">
        {/* Sparkle effect */}
        {showSparkle && (
          <Image
            src="/assets/sparkles.png"
            alt="sparkle"
            width={80}
            height={80}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-sparkle pointer-events-none"
            style={{ zIndex: 10 }}
          />
        )}
        
        {/* Hearts effect - single heart in center */}
        {showHearts && (
          <Image
            src={heartIcon}
            alt="hearts"
            width={60}
            height={60}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-heart-float pointer-events-none"
            style={{ zIndex: 10 }}
          />
        )}
        
        {/* Multiple hearts around cat when petting */}
        {petHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              transform: `translate(calc(-50% + ${heart.x}px), calc(-50% + ${heart.y}px))`,
              zIndex: 11,
              animationDelay: `${heart.delay}ms`
            }}
          >
            {heart.type === 'asset' ? (
              <Image
                src={getHeartIcon(stats.happiness)}
                alt="heart"
                width={32}
                height={32}
                className="animate-heart-float"
              />
            ) : (
              <span 
                className="text-2xl animate-heart-float"
                style={{ 
                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                }}
              >
                💖
              </span>
            )}
          </div>
        ))}
        
        {/* Sleeping symbol */}
        {(showSleep || stats.energy < 20) && (
          <div className="absolute left-1/2 top-8 -translate-x-1/2 pointer-events-none z-10">
            <Image
              src="/assets/sleeping_symbol.png"
              alt="sleep"
              width={48}
              height={48}
              className="animate-float opacity-90"
            />
            {showSleep && (
              <div className="flex space-x-1 justify-center mt-2">
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            )}
          </div>
        )}

        {/* Toy near cat when playing */}
        {showToyNearCat && (
          <Image
            src={showToyNearCat}
            alt="toy"
            width={60}
            height={60}
            className="absolute left-3/4 top-1/2 -translate-y-1/2 animate-bounce pointer-events-none"
            style={{ zIndex: 8 }}
          />
        )}
        
        {/* Main Cat Sprite */}
        <div
          className="relative z-10 cursor-pointer select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handlePet}
        >
          <Image
            src={catSprite}
            alt="cat"
            width={260}
            height={260}
            className={`w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 max-w-[80vw] max-h-[40vh] object-contain rounded-kawaii-lg shadow-kawaii transition-all duration-500 hover:scale-105 ${
              showSleep ? 'opacity-80 grayscale-[0.3]' : ''
            }`}
            priority
          />
        </div>
      </div>

      {/* Bottom Panel with Stats and Controls */}
      <div className="w-full bg-white/40 backdrop-blur-sm border-t border-pink-200">
        {/* Stats Display Area */}
        <div className="flex flex-col items-center w-full px-2 sm:px-4 py-1.5 sm:py-2">
          <h2 className="font-pixel text-pink-800 text-[10px] sm:text-xs mb-1 sm:mb-2">Cat Stats</h2>
          
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 w-full">
            {/* Happiness */}
            <div className="flex flex-col items-center flex-1">
              <Image src={heartIcon} alt="happiness" width={14} height={14} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[8px] sm:text-xs font-pixel text-pink-700 mt-0.5 sm:mt-1">Happy</span>
              <div className="w-full h-1.5 sm:h-2 bg-pink-100 rounded-kawaii mt-0.5 sm:mt-1 border border-pink-200">
                <div
                  className="bg-gradient-to-r from-pink-400 to-pink-500 h-1.5 sm:h-2 rounded-kawaii transition-all duration-500"
                  style={{ width: `${stats.happiness}%` }}
                ></div>
              </div>
              <span className="text-[8px] sm:text-xs text-pink-600 mt-0.5 sm:mt-1">{Math.round(stats.happiness)}</span>
            </div>
            
            {/* Energy */}
            <div className="flex flex-col items-center flex-1">
              <Image src={energyIcon} alt="energy" width={14} height={14} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[8px] sm:text-xs font-pixel text-pink-700 mt-0.5 sm:mt-1">Energy</span>
              <div className="w-full h-1.5 sm:h-2 bg-pink-100 rounded-kawaii mt-0.5 sm:mt-1 border border-pink-200">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1.5 sm:h-2 rounded-kawaii transition-all duration-500"
                  style={{ width: `${stats.energy}%` }}
                ></div>
              </div>
              <span className="text-[8px] sm:text-xs text-pink-600 mt-0.5 sm:mt-1">{Math.round(stats.energy)}</span>
            </div>
            
            {/* Hunger (inverted - shows fullness) */}
            <div className="flex flex-col items-center flex-1">
              <Image src={foodIcon} alt="hunger" width={14} height={14} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[8px] sm:text-xs font-pixel text-pink-700 mt-0.5 sm:mt-1">Food</span>
              <div className="w-full h-1.5 sm:h-2 bg-pink-100 rounded-kawaii mt-0.5 sm:mt-1 border border-pink-200">
                <div
                  className="bg-gradient-to-r from-blush to-pink-300 h-1.5 sm:h-2 rounded-kawaii transition-all duration-500"
                  style={{ width: `${100 - stats.hunger}%` }}
                ></div>
              </div>
              <span className="text-[8px] sm:text-xs text-pink-600 mt-0.5 sm:mt-1">{100 - Math.round(stats.hunger)}</span>
            </div>
          </div>
          
          {/* Streaks & Achievement Info */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
            <span className="text-[8px] sm:text-xs text-pink-700 font-pixel">Day: {stats.dailyStreak}</span>
            <span className="text-[8px] sm:text-xs text-pink-700 font-pixel">Total: {stats.totalCareDays}</span>
          </div>
        </div>

        {/* Action Buttons Area */}
        <div className="flex flex-col items-center w-full px-2 sm:px-4 py-2 border-t border-pink-200/50">
          <div className="grid grid-cols-4 gap-1 sm:gap-2 w-full max-w-md">{/* Feed Button */}
            <button
              className="bg-gradient-to-b from-pink-400 to-pink-500 text-white font-pixel rounded-kawaii shadow-kawaii h-10 sm:h-12 text-[8px] sm:text-xs active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50"
              onClick={handleFeed}
              disabled={eating}
            >
              <Image src="/assets/food_in_bowl.png" alt="feed" width={12} height={12} className="sm:w-4 sm:h-4" />
              <span className="mt-0.5 sm:mt-1">Feed</span>
            </button>
            
            {/* Play Button */}
            <button
              className="bg-gradient-to-b from-rose-gold to-dusty-rose text-white font-pixel rounded-kawaii shadow-kawaii h-10 sm:h-12 text-[8px] sm:text-xs active:scale-95 transition-all flex flex-col items-center justify-center"
              onClick={() => setShowToys(true)}
            >
              <Image src="/assets/cat_toy_ball.png" alt="play" width={12} height={12} className="sm:w-4 sm:h-4" />
              <span className="mt-0.5 sm:mt-1">Play</span>
            </button>
            
            {/* Pet Button */}
            <button
              className="bg-gradient-to-b from-blush to-pink-300 text-white font-pixel rounded-kawaii shadow-kawaii h-10 sm:h-12 text-[8px] sm:text-xs active:scale-95 transition-all flex flex-col items-center justify-center"
              onClick={handlePet}
            >
              <Image src="/assets/one_heart.png" alt="pet" width={12} height={12} className="sm:w-4 sm:h-4" />
              <span className="mt-0.5 sm:mt-1">Pet</span>
            </button>
            
            {/* Sleep Button */}
            <button
              className="bg-gradient-to-b from-pink-300 to-pink-400 text-white font-pixel rounded-kawaii shadow-kawaii h-10 sm:h-12 text-[8px] sm:text-xs active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50"
              onClick={handleSleep}
              disabled={stats.energy > 40}
            >
              <Image src="/assets/sleeping_symbol.png" alt="sleep" width={12} height={12} className="sm:w-4 sm:h-4" />
              <span className="mt-0.5 sm:mt-1">Sleep</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Toy selection modal */}
      {showToys && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-kawaii-lg p-4 sm:p-6 flex flex-col gap-4 items-center shadow-kawaii w-full max-w-xs sm:max-w-sm">
            <span className="font-pixel text-pink-700 text-sm sm:text-lg mb-2">Choose a toy!</span>
            <div className="flex flex-row gap-4 sm:gap-6">
              <button
                className="flex flex-col items-center gap-1 active:scale-95"
                onClick={() => handlePlay("ball")}
              >
                <Image src="/assets/cat_toy_ball.png" alt="ball" width={40} height={40} className="sm:w-12 sm:h-12" />
                <span className="font-pixel text-[10px] sm:text-xs text-pink-700">Ball</span>
              </button>
              <button
                className="flex flex-col items-center gap-1 active:scale-95"
                onClick={() => handlePlay("mouse")}
              >
                <Image src="/assets/cat_toy_mouse.png" alt="mouse" width={40} height={40} className="sm:w-12 sm:h-12" />
                <span className="font-pixel text-[10px] sm:text-xs text-pink-700">Mouse</span>
              </button>
            </div>
            <button
              className="mt-2 sm:mt-4 bg-pink-200 text-pink-700 font-pixel rounded-kawaii px-3 sm:px-4 py-1.5 sm:py-2 shadow-soft text-xs sm:text-sm active:scale-95"
              onClick={() => setShowToys(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatGame;
