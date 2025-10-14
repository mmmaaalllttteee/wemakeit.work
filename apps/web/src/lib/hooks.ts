import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';

// Auth hooks
export const useMe = () => useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await apiClient.getMe();
      return response.data;
    },
  });

// Project hooks
export const useProjects = () => useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.getProjects();
      return response.data;
    },
  });

export const useProject = (id: string) => useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await apiClient.getProject(id);
      return response.data;
    },
    enabled: !!id,
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; slug?: string }) =>
      apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Board hooks
export const useBoards = (projectId: string) => useQuery({
    queryKey: ['projects', projectId, 'boards'],
    queryFn: async () => {
      const response = await apiClient.getProjectBoards(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });

export const useBoard = (id: string) => useQuery({
    queryKey: ['boards', id],
    queryFn: async () => {
      const response = await apiClient.getBoard(id);
      return response.data;
    },
    enabled: !!id,
  });

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      apiClient.createBoard(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'boards'] });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateBoard(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.id] });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// Task hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: any }) =>
      apiClient.createTask(boardId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.boardId] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { columnId: string; position: number } }) =>
      apiClient.moveTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// Organization hooks
export const useOrganization = () => useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const response = await apiClient.getOrganization();
      return response.data;
    },
  });

export const useMembers = () => useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await apiClient.getMembers();
      return response.data;
    },
  });
