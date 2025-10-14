'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Music,
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Bell,
} from 'lucide-react';
import { useMe } from '@/lib/hooks';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { data: user } = useMe();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Team', href: '/dashboard/team', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`glass-panel fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
            <Music className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            {sidebarOpen && <span className="text-xl font-bold text-glass">WMIW</span>}
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors group"
              >
                <item.icon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="glass-panel p-3 rounded-lg mt-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full mt-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="glass-panel sticky top-0 z-30 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="glass-panel p-2 hover:bg-white/20 dark:hover:bg-white/10 transition-colors rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-4">
              <button className="glass-panel p-2 hover:bg-white/20 dark:hover:bg-white/10 transition-colors rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
