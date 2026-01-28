import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { audio } from '../../lib/audio';

interface SignupFormProps {
  onSwitch: () => void;
}

export default function SignupForm({ onSwitch }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, loading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters');
      return;
    }

    const success = await signup(email, password, username);
    if (success) {
      audio.playLevelComplete();
    }
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <h2 className="text-xl font-arcade gradient-text text-center mb-8">
        SIGN UP
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-arcade text-revpilot-gold mb-2">
            USERNAME
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearError(); setLocalError(''); }}
            className="w-full px-4 py-3 bg-revpilot-navy-dark border-2 border-revpilot-navy-light text-white font-arcade text-xs rounded focus:border-revpilot-gold focus:outline-none transition-colors"
            placeholder="TopPilot99"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-arcade text-revpilot-gold mb-2">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError(''); }}
            className="w-full px-4 py-3 bg-revpilot-navy-dark border-2 border-revpilot-navy-light text-white font-arcade text-xs rounded focus:border-revpilot-gold focus:outline-none transition-colors"
            placeholder="pilot@revpilot.co"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-arcade text-revpilot-gold mb-2">
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError(''); }}
            className="w-full px-4 py-3 bg-revpilot-navy-dark border-2 border-revpilot-navy-light text-white font-arcade text-xs rounded focus:border-revpilot-gold focus:outline-none transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-arcade text-revpilot-gold mb-2">
            CONFIRM PASSWORD
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
            className="w-full px-4 py-3 bg-revpilot-navy-dark border-2 border-revpilot-navy-light text-white font-arcade text-xs rounded focus:border-revpilot-gold focus:outline-none transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        {displayError && (
          <p className="text-revpilot-pink text-xs font-arcade text-center">
            {displayError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded disabled:opacity-50"
        >
          {loading ? 'CREATING...' : 'CREATE PILOT'}
        </button>
      </form>

      <p className="text-center mt-6 text-xs font-arcade text-gray-400">
        ALREADY A PILOT?{' '}
        <button
          onClick={() => { onSwitch(); audio.playMenuSelect(); }}
          className="text-revpilot-gold hover:text-revpilot-pink transition-colors underline"
        >
          LOG IN
        </button>
      </p>
    </div>
  );
}
