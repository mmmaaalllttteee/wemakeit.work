import { Injectable, HttpException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

@Injectable()
export class CmsService {
  private strapiClient: AxiosInstance;

  constructor() {
    this.strapiClient = axios.create({
      baseURL: process.env.STRAPI_URL || 'http://localhost:1337/api',
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    });
  }

  // ==================== Blog Posts ====================

  /**
   * Get all blog posts with pagination
   */
  async getBlogPosts(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: any;
    populate?: string;
  }): Promise<StrapiResponse<any[]>> {
    try {
      const response = await this.strapiClient.get('/blog-posts', {
        params: {
          'pagination[page]': params?.page || 1,
          'pagination[pageSize]': params?.pageSize || 10,
          sort: params?.sort || 'publishedAt:desc',
          populate: params?.populate || '*',
          ...params?.filters,
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get a single blog post by slug
   */
  async getBlogPost(slug: string): Promise<any> {
    try {
      const response = await this.strapiClient.get('/blog-posts', {
        params: {
          'filters[slug][$eq]': slug,
          populate: '*',
        },
      });

      if (response.data.data.length === 0) {
        throw new HttpException('Blog post not found', 404);
      }

      return response.data.data[0];
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get blog post by ID
   */
  async getBlogPostById(id: string): Promise<any> {
    try {
      const response = await this.strapiClient.get(`/blog-posts/${id}`, {
        params: { populate: '*' },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get featured blog posts
   */
  async getFeaturedBlogPosts(limit = 3): Promise<any[]> {
    try {
      const response = await this.strapiClient.get('/blog-posts', {
        params: {
          'filters[featured][$eq]': true,
          'pagination[pageSize]': limit,
          sort: 'publishedAt:desc',
          populate: '*',
        },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Pages ====================

  /**
   * Get all pages
   */
  async getPages(params?: {
    page?: number;
    pageSize?: number;
    populate?: string;
  }): Promise<StrapiResponse<any[]>> {
    try {
      const response = await this.strapiClient.get('/pages', {
        params: {
          'pagination[page]': params?.page || 1,
          'pagination[pageSize]': params?.pageSize || 25,
          populate: params?.populate || '*',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get a single page by slug
   */
  async getPage(slug: string): Promise<any> {
    try {
      const response = await this.strapiClient.get('/pages', {
        params: {
          'filters[slug][$eq]': slug,
          populate: 'deep',
        },
      });

      if (response.data.data.length === 0) {
        throw new HttpException('Page not found', 404);
      }

      return response.data.data[0];
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Categories ====================

  /**
   * Get all blog categories
   */
  async getCategories(): Promise<any[]> {
    try {
      const response = await this.strapiClient.get('/categories', {
        params: {
          populate: '*',
          sort: 'name:asc',
        },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(
    categorySlug: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<StrapiResponse<any[]>> {
    try {
      const response = await this.strapiClient.get('/blog-posts', {
        params: {
          'filters[category][slug][$eq]': categorySlug,
          'pagination[page]': params?.page || 1,
          'pagination[pageSize]': params?.pageSize || 10,
          sort: 'publishedAt:desc',
          populate: '*',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Tags ====================

  /**
   * Get all tags
   */
  async getTags(): Promise<any[]> {
    try {
      const response = await this.strapiClient.get('/tags', {
        params: {
          sort: 'name:asc',
        },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(
    tagSlug: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<StrapiResponse<any[]>> {
    try {
      const response = await this.strapiClient.get('/blog-posts', {
        params: {
          'filters[tags][slug][$eq]': tagSlug,
          'pagination[page]': params?.page || 1,
          'pagination[pageSize]': params?.pageSize || 10,
          sort: 'publishedAt:desc',
          populate: '*',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Authors ====================

  /**
   * Get all authors
   */
  async getAuthors(): Promise<any[]> {
    try {
      const response = await this.strapiClient.get('/authors', {
        params: {
          populate: '*',
          sort: 'name:asc',
        },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get posts by author
   */
  async getPostsByAuthor(
    authorSlug: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<StrapiResponse<any[]>> {
    try {
      const response = await this.strapiClient.get('/blog-posts', {
        params: {
          'filters[author][slug][$eq]': authorSlug,
          'pagination[page]': params?.page || 1,
          'pagination[pageSize]': params?.pageSize || 10,
          sort: 'publishedAt:desc',
          populate: '*',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Search ====================

  /**
   * Search blog posts
   */
  async searchBlogPosts(
    query: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<StrapiResponse<any[]>> {
    try {
      const response = await this.strapiClient.get('/blog-posts', {
        params: {
          'filters[$or][0][title][$containsi]': query,
          'filters[$or][1][content][$containsi]': query,
          'filters[$or][2][excerpt][$containsi]': query,
          'pagination[page]': params?.page || 1,
          'pagination[pageSize]': params?.pageSize || 10,
          sort: 'publishedAt:desc',
          populate: '*',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Media ====================

  /**
   * Get media file URL from Strapi
   */
  getMediaUrl(media: any): string {
    if (!media) {return '';}

    const baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';

    if (media.url) {
      // If URL is relative, prepend base URL
      if (media.url.startsWith('/')) {
        return `${baseUrl}${media.url}`;
      }
      return media.url;
    }

    return '';
  }

  /**
   * Get image formats (thumbnail, small, medium, large)
   */
  getImageFormats(media: any): Record<string, string> {
    if (!media || !media.formats) {
      return {
        thumbnail: this.getMediaUrl(media),
        small: this.getMediaUrl(media),
        medium: this.getMediaUrl(media),
        large: this.getMediaUrl(media),
      };
    }

    const baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';

    return {
      thumbnail: media.formats.thumbnail?.url
        ? `${baseUrl}${media.formats.thumbnail.url}`
        : this.getMediaUrl(media),
      small: media.formats.small?.url
        ? `${baseUrl}${media.formats.small.url}`
        : this.getMediaUrl(media),
      medium: media.formats.medium?.url
        ? `${baseUrl}${media.formats.medium.url}`
        : this.getMediaUrl(media),
      large: media.formats.large?.url
        ? `${baseUrl}${media.formats.large.url}`
        : this.getMediaUrl(media),
    };
  }

  // ==================== Global Settings ====================

  /**
   * Get global site settings
   */
  async getGlobalSettings(): Promise<any> {
    try {
      const response = await this.strapiClient.get('/global', {
        params: { populate: 'deep' },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== Error Handling ====================

  private handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message;
      throw new HttpException(message, status);
    }
    throw new HttpException('Internal server error', 500);
  }
}
