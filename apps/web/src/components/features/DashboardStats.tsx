'use client';

import { useState, useEffect } from 'react';
import KPITile from './KPITile';
import { Loader2 } from 'lucide-react';

interface DashboardStatsProps {
  orgId: string;
}

export default function DashboardStats({ orgId }: DashboardStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [orgId]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100  } ${  sizes[i]}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Active Projects */}
      <KPITile
        title="Active Projects"
        value={stats.projects.active}
        icon="projects"
        color="blue"
        changeLabel={`${stats.projects.total} total`}
      />

      {/* Tasks In Progress */}
      <KPITile
        title="Tasks In Progress"
        value={stats.tasks.inProgress}
        icon="tasks"
        color="purple"
        changeLabel={`${stats.tasks.todo} to do`}
      />

      {/* Overdue Tasks */}
      {stats.tasks.overdue > 0 && (
        <KPITile
          title="Overdue Tasks"
          value={stats.tasks.overdue}
          icon="tasks"
          color="orange"
          trend="down"
        />
      )}

      {/* Team Members */}
      <KPITile title="Team Members" value={stats.team.members} icon="users" color="green" />

      {/* Files */}
      <KPITile
        title="Files"
        value={stats.files.total}
        icon="files"
        color="pink"
        changeLabel={formatFileSize(stats.files.size)}
      />

      {/* Completed Tasks */}
      <KPITile
        title="Completed"
        value={stats.tasks.done}
        icon="tasks"
        color="green"
        changeLabel={`${Math.round((stats.tasks.done / (stats.tasks.total || 1)) * 100)}% done`}
      />
    </div>
  );
}
