'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Music, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Music className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            <span className="text-2xl font-bold text-glass">WMIW</span>
          </Link>
          <h1 className="text-3xl font-bold text-glass mb-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-300">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="glass-card glass-rainbow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="glass-panel bg-red-500/10 border-red-500/20 p-4 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-slate-600 dark:text-slate-300">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button glass-rainbow w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-300">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
