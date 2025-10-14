'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useProjects, useCreateProject, useDeleteProject } from '@/lib/hooks';
import { Plus, FolderKanban, Calendar, Users, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const handleCreateProject = async () => {
    try {
      await createProject.mutateAsync(newProject);
      setIsCreateModalOpen(false);
      setNewProject({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-glass mb-2">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Welcome back! Here&apos;s an overview of your projects.
            </p>
          </div>
          <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card rainbow>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Projects</p>
                  <p className="text-3xl font-bold text-glass mt-1">{projects?.length || 0}</p>
                </div>
                <FolderKanban className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Projects</p>
                  <p className="text-3xl font-bold text-glass mt-1">
                    {projects?.filter((p: any) => p.status === 'active').length || 0}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-accent-600 dark:text-accent-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Team Members</p>
                  <p className="text-3xl font-bold text-glass mt-1">1</p>
                </div>
                <Users className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Projects</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} hoverable={false}>
                  <div className="animate-pulse">
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : projects?.length === 0 ? (
            <Card rainbow>
              <CardContent className="text-center py-12">
                <FolderKanban className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Get started by creating your first project
                </p>
                <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects?.map((project: any) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <Card className="group relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {project.name}
                        </CardTitle>
                        <button
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity glass-panel p-1.5 hover:bg-red-500/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {project.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(project.createdAt), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center text-primary-600 dark:text-primary-400">
                          View <ExternalLink className="w-3 h-3 ml-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              loading={createProject.isPending}
              disabled={!newProject.name}
            >
              Create Project
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name *</label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="glass-input w-full"
              placeholder="Album Release 2025"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="glass-input w-full min-h-[100px]"
              placeholder="Describe your project..."
            />
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
