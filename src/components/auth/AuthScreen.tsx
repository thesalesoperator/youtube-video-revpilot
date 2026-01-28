import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-revpilot-navy-dark p-4">
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-arcade gradient-text mb-4 animate-glow-pulse p-2">
          REVPILOT
        </h1>
        <h2 className="text-xl md:text-2xl font-arcade text-white mb-2">
          P O N G
        </h2>
        <div className="w-32 h-1 gradient-bg mx-auto rounded-full mt-4" />
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md gradient-border rounded-lg bg-revpilot-navy">
        {isLogin ? (
          <LoginForm onSwitch={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitch={() => setIsLogin(true)} />
        )}
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-xs font-arcade mt-8">
        WHERE SALES MEETS PLAY
      </p>
    </div>
  );
}
