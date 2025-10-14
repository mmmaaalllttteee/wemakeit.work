import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Auth
  async register(data: {
    email: string;
    password: string;
    name: string;
    organizationName: string;
  }) {
    return this.client.post('/auth/register', data);
  }

  async login(data: { email: string; password: string }) {
    return this.client.post('/auth/login', data);
  }

  async getMe() {
    return this.client.get('/auth/me');
  }

  // Projects
  async getProjects() {
    return this.client.get('/projects');
  }

  async getProject(id: string) {
    return this.client.get(`/projects/${id}`);
  }

  async createProject(data: { name: string; description?: string; slug?: string }) {
    return this.client.post('/projects', data);
  }

  async updateProject(id: string, data: any) {
    return this.client.patch(`/projects/${id}`, data);
  }

  async deleteProject(id: string) {
    return this.client.delete(`/projects/${id}`);
  }

  // Boards
  async getProjectBoards(projectId: string) {
    return this.client.get(`/projects/${projectId}/boards`);
  }

  async getBoard(id: string) {
    return this.client.get(`/projects/boards/${id}`);
  }

  async createBoard(
    projectId: string,
    data: { name: string; description?: string; visibility?: string },
  ) {
    return this.client.post(`/projects/${projectId}/boards`, data);
  }

  async updateBoard(id: string, data: any) {
    return this.client.patch(`/projects/boards/${id}`, data);
  }

  async deleteBoard(id: string) {
    return this.client.delete(`/projects/boards/${id}`);
  }

  // Tasks
  async createTask(boardId: string, data: any) {
    return this.client.post(`/projects/boards/${boardId}/tasks`, data);
  }

  async getTask(id: string) {
    return this.client.get(`/projects/tasks/${id}`);
  }

  async updateTask(id: string, data: any) {
    return this.client.patch(`/projects/tasks/${id}`, data);
  }

  async moveTask(id: string, data: { columnId: string; position: number }) {
    return this.client.post(`/projects/tasks/${id}/move`, data);
  }

  async deleteTask(id: string) {
    return this.client.delete(`/projects/tasks/${id}`);
  }

  // Organization
  async getOrganization() {
    return this.client.get('/organization');
  }

  async updateOrganization(data: any) {
    return this.client.patch('/organization', data);
  }

  async getMembers() {
    return this.client.get('/organization/members');
  }
}

export const apiClient = new ApiClient();
