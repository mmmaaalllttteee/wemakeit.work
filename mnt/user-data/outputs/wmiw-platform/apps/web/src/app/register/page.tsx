'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Music, Mail, Lock, User, Building, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Music className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            <span className="text-2xl font-bold text-glass">WMIW</span>
          </Link>
          <h1 className="text-3xl font-bold text-glass mb-2">Get Started</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Create your account and start managing your music business
          </p>
        </div>

        {/* Register Form */}
        <div className="glass-card glass-rainbow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="glass-panel bg-red-500/10 border-red-500/20 p-4 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full pl-11"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input w-full pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium mb-2">
                Organization Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="organizationName"
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="glass-input w-full pl-11"
                  placeholder="My Label"
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass-input w-full pl-11"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button glass-rainbow w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>

            <p className="text-xs text-slate-500 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
