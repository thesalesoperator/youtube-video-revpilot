import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { audio } from '../../lib/audio';

interface LoginFormProps {
  onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      audio.playMenuSelect();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <h2 className="text-xl font-arcade gradient-text text-center mb-8">
        LOGIN
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-arcade text-revpilot-gold mb-2">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); }}
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
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            className="w-full px-4 py-3 bg-revpilot-navy-dark border-2 border-revpilot-navy-light text-white font-arcade text-xs rounded focus:border-revpilot-gold focus:outline-none transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-revpilot-pink text-xs font-arcade text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded disabled:opacity-50"
        >
          {loading ? 'LOGGING IN...' : 'START GAME'}
        </button>
      </form>

      <p className="text-center mt-6 text-xs font-arcade text-gray-400">
        NEW PILOT?{' '}
        <button
          onClick={() => { onSwitch(); audio.playMenuSelect(); }}
          className="text-revpilot-gold hover:text-revpilot-pink transition-colors underline"
        >
          SIGN UP
        </button>
      </p>
    </div>
  );
}
