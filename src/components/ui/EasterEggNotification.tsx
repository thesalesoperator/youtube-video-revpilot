import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface Notification {
  id: string;
  name: string;
  message: string;
}

const EGG_MESSAGES: Record<string, string> = {
  konami: 'RETRO MODE ACTIVATED! ↑↑↓↓←→←→BA',
  disco: 'DISCO MODE! SCORE 7 - LUCKY NUMBER!',
  matrix: 'THE MATRIX HAS YOU... 10 CLICKS!',
  tiny: 'SMOL MODE! EVERYTHING IS TINY!',
  neon: 'NIGHT OWL! NEON GLOW ACTIVATED!',
  perfect: 'PERFECT GAME! FLAWLESS VICTORY!',
  speedrunner: 'SPEED RUNNER! UNDER 30 SECONDS!',
  secret_menu: 'SECRET MENU UNLOCKED! 5 LOGO CLICKS!',
  persistence: 'NEVER GIVE UP! PERSISTENCE BADGE!',
};

export default function EasterEggNotification() {
  const { activeEasterEggs } = useGameStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [seenEggs, setSeenEggs] = useState<Set<string>>(new Set());

  useEffect(() => {
    activeEasterEggs.forEach((egg) => {
      if (egg.active && !seenEggs.has(egg.name)) {
        const notif: Notification = {
          id: `${egg.name}-${Date.now()}`,
          name: egg.name,
          message: EGG_MESSAGES[egg.name] || `EASTER EGG: ${egg.name.toUpperCase()}`,
        };
        setNotifications((prev) => [...prev, notif]);
        setSeenEggs((prev) => new Set([...prev, egg.name]));

        // Auto-remove after 4 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
        }, 4000);
      }
    });
  }, [activeEasterEggs, seenEggs]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="gradient-border rounded-lg p-3 bg-revpilot-navy-dark animate-float"
          style={{ animation: 'float 0.5s ease-out, fadeIn 0.3s ease-out' }}
        >
          <p className="text-xs font-arcade gradient-text">EASTER EGG FOUND!</p>
          <p className="text-xs font-arcade text-white mt-1">{notif.message}</p>
          <p className="text-xs font-arcade text-revpilot-gold mt-1">+BONUS POINTS</p>
        </div>
      ))}
    </div>
  );
}
