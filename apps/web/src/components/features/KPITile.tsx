'use client';

import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Users,
  FolderKanban,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface KPITileProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: 'users' | 'projects' | 'tasks' | 'files';
  trend?: 'up' | 'down' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

const icons = {
  users: Users,
  projects: FolderKanban,
  tasks: CheckCircle,
  files: AlertCircle,
};

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  green: 'from-green-500/20 to-green-600/10 border-green-500/30',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
};

const iconColorClasses = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  pink: 'text-pink-400',
};

export default function KPITile({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  size = 'medium',
  color = 'blue',
}: KPITileProps) {
  const Icon = icon ? icons[icon] : TrendingUp;
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  return (
    <div
      className={`
        glass-panel rounded-xl border
        bg-gradient-to-br ${colorClasses[color]}
        hover:scale-[1.02] transition-all duration-300
        ${sizeClasses[size]}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 glass-panel rounded-xl ${iconColorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-2 text-sm">
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 ${
                trend === 'up'
                  ? 'text-green-400'
                  : trend === 'down'
                    ? 'text-red-400'
                    : 'text-white/60'
              }`}
            >
              {trend === 'up' && <ArrowUp className="w-4 h-4" />}
              {trend === 'down' && <ArrowDown className="w-4 h-4" />}
              <span className="font-medium">
                {change > 0 ? '+' : ''}
                {change}%
              </span>
            </div>
          )}
          {changeLabel && <span className="text-white/60">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
