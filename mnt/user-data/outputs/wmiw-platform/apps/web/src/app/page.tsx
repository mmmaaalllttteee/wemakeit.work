import Link from 'next/link';
import { ArrowRight, Music, TrendingUp, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-panel fixed top-4 left-4 right-4 z-50 glass-rainbow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-glass">WMIW</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm font-medium hover:text-primary-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium hover:text-primary-600 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-sm font-medium hover:text-primary-600 transition-colors"
              >
                About
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link href="/register" className="glass-button text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block glass-panel px-4 py-2 rounded-full mb-6 glass-rainbow">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              ✨ Welcome to the Future of Music Management
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="text-glass">We Make IT Work</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            The all-in-one platform for music industry professionals. Collaborate, analyze, and grow
            your music business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="glass-button glass-rainbow text-lg px-8 py-4 inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="glass-panel px-8 py-4 text-lg font-medium hover:shadow-glass-lg transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-glass">
            Everything You Need
          </h2>

          <div className="bento-grid">
            <div className="glass-card bento-item-large glass-rainbow">
              <Zap className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Project Management</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Organize releases, campaigns, and tours with powerful Kanban boards and task
                management.
              </p>
            </div>

            <div className="glass-card">
              <TrendingUp className="w-12 h-12 text-accent-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Smart Analytics</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Connect all your platforms and get unified insights in one place.
              </p>
            </div>

            <div className="glass-card bento-item-tall">
              <Users className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Team Collaboration</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Work seamlessly with your team in real-time. Share projects, assign tasks, and stay
                aligned.
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>• Real-time updates</li>
                <li>• Role-based permissions</li>
                <li>• External sharing</li>
                <li>• Activity tracking</li>
              </ul>
            </div>

            <div className="glass-card glass-rainbow">
              <Music className="w-12 h-12 text-accent-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">AI Music Analysis</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Get detailed insights on your tracks with AI-powered analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card glass-rainbow text-center p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glass">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Join thousands of music professionals who trust WMIW.
            </p>
            <Link
              href="/register"
              className="glass-button glass-rainbow text-lg px-10 py-5 inline-flex items-center"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-panel mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 We Make IT Work. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
