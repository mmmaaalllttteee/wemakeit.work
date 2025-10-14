import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CmsService, StrapiResponse } from './cms.service';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ==================== Blog Posts ====================

  @Get('blog-posts')
  @ApiOperation({ summary: 'Get all blog posts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sort', required: false })
  async getBlogPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
  ): Promise<StrapiResponse<any[]>> {
    return this.cmsService.getBlogPosts({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      sort,
    });
  }

  @Get('blog-posts/featured')
  @ApiOperation({ summary: 'Get featured blog posts' })
  @ApiQuery({ name: 'limit', required: false })
  async getFeaturedBlogPosts(@Query('limit') limit?: string): Promise<any[]> {
    return this.cmsService.getFeaturedBlogPosts(limit ? parseInt(limit) : undefined);
  }

  @Get('blog-posts/search')
  @ApiOperation({ summary: 'Search blog posts' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async searchBlogPosts(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<StrapiResponse<any[]>> {
    return this.cmsService.searchBlogPosts(query, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get('blog-posts/:slug')
  @ApiOperation({ summary: 'Get blog post by slug' })
  async getBlogPost(@Param('slug') slug: string) {
    return this.cmsService.getBlogPost(slug);
  }

  // ==================== Pages ====================

  @Get('pages')
  @ApiOperation({ summary: 'Get all pages' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPages(@Query('page') page?: string, @Query('pageSize') pageSize?: string): Promise<StrapiResponse<any[]>> {
    return this.cmsService.getPages({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  async getPage(@Param('slug') slug: string) {
    return this.cmsService.getPage(slug);
  }

  // ==================== Categories ====================

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories() {
    return this.cmsService.getCategories();
  }

  @Get('categories/:slug/posts')
  @ApiOperation({ summary: 'Get posts by category' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPostsByCategory(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<StrapiResponse<any[]>> {
    return this.cmsService.getPostsByCategory(slug, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  // ==================== Tags ====================

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  async getTags() {
    return this.cmsService.getTags();
  }

  @Get('tags/:slug/posts')
  @ApiOperation({ summary: 'Get posts by tag' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPostsByTag(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<StrapiResponse<any[]>> {
    return this.cmsService.getPostsByTag(slug, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  // ==================== Authors ====================

  @Get('authors')
  @ApiOperation({ summary: 'Get all authors' })
  async getAuthors() {
    return this.cmsService.getAuthors();
  }

  @Get('authors/:slug/posts')
  @ApiOperation({ summary: 'Get posts by author' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPostsByAuthor(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<StrapiResponse<any[]>> {
    return this.cmsService.getPostsByAuthor(slug, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  // ==================== Global Settings ====================

  @Get('settings')
  @ApiOperation({ summary: 'Get global site settings' })
  async getGlobalSettings() {
    return this.cmsService.getGlobalSettings();
  }
}
