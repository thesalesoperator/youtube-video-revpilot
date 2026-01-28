import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { supabase } from '../../lib/supabase';
import { audio } from '../../lib/audio';
import type { LeaderboardEntry } from '../../types';

export default function Leaderboard() {
  const { setGameStatus } = useGameStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(50);

      if (data) {
        setEntries(data as LeaderboardEntry[]);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-arcade gradient-text mb-2">LEADERBOARD</h2>
        <div className="w-24 h-1 gradient-bg mx-auto rounded-full" />
      </div>

      {loading ? (
        <div className="text-center">
          <p className="text-xs font-arcade text-gray-400 animate-pulse">LOADING SCORES...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center">
          <p className="text-xs font-arcade text-gray-400 mb-4">NO SCORES YET</p>
          <p className="text-xs font-arcade text-gray-500">BE THE FIRST TO PLAY!</p>
        </div>
      ) : (
        <div className="gradient-border rounded-lg bg-revpilot-navy-dark overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-revpilot-navy border-b border-gray-700">
            <span className="text-xs font-arcade text-revpilot-gold">RANK</span>
            <span className="text-xs font-arcade text-revpilot-gold">PILOT</span>
            <span className="text-xs font-arcade text-revpilot-gold text-right">SCORE</span>
            <span className="text-xs font-arcade text-revpilot-gold text-right">LEVEL</span>
          </div>

          {/* Entries */}
          <div className="max-h-80 overflow-y-auto">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className={`grid grid-cols-4 gap-2 px-4 py-3 border-b border-gray-800 transition-colors hover:bg-revpilot-navy/50
                  ${i < 3 ? 'bg-revpilot-navy/30' : ''}`}
              >
                <span className="text-xs font-arcade text-white">
                  {getMedal(i + 1)}
                </span>
                <span className={`text-xs font-arcade truncate ${i < 3 ? 'text-revpilot-gold' : 'text-white'}`}>
                  {entry.username}
                </span>
                <span className="text-xs font-arcade text-revpilot-pink text-right">
                  {entry.total_score.toLocaleString()}
                </span>
                <span className="text-xs font-arcade text-gray-400 text-right">
                  {entry.highest_level}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-8">
        <button
          onClick={() => { audio.playMenuSelect(); setGameStatus('menu'); }}
          className="btn-secondary rounded-lg"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
