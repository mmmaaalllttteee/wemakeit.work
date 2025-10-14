# Strapi CMS Setup Guide

This guide will help you set up Strapi CMS for the WMIW platform.

## Starting Strapi

1. **Start all services with Docker Compose:**

   ```bash
   docker-compose up -d
   ```

2. **Access Strapi Admin Panel:**
   - URL: http://localhost:1337/admin
   - Create your first admin user on first visit

## Content Types to Create

Once Strapi is running, create the following content types in the admin panel:

### 1. Blog Post (Collection Type)

**API ID:** `blog-post`

**Fields:**

- `title` (Text, Required) - Blog post title
- `slug` (UID, Required, attached to title) - URL-friendly slug
- `excerpt` (Text, Long text) - Short description/preview
- `content` (Rich text, Required) - Main content
- `publishedAt` (DateTime) - Publication date
- `featured` (Boolean, Default: false) - Featured post flag
- `readTime` (Number, Integer) - Estimated reading time in minutes
- `featuredImage` (Media, Single) - Main image
- `author` (Relation, Many-to-One with Author)
- `category` (Relation, Many-to-One with Category)
- `tags` (Relation, Many-to-Many with Tag)

### 2. Page (Collection Type)

**API ID:** `page`

**Fields:**

- `title` (Text, Required) - Page title
- `slug` (UID, Required, attached to title) - URL-friendly slug
- `content` (Rich text, Required) - Page content
- `metaTitle` (Text) - SEO title
- `metaDescription` (Text, Long text) - SEO description
- `publishedAt` (DateTime) - Publication date

### 3. Category (Collection Type)

**API ID:** `category`

**Fields:**

- `name` (Text, Required) - Category name
- `slug` (UID, Required, attached to name) - URL-friendly slug
- `description` (Text, Long text) - Category description
- `blog_posts` (Relation, One-to-Many with Blog Post)

### 4. Tag (Collection Type)

**API ID:** `tag`

**Fields:**

- `name` (Text, Required) - Tag name
- `slug` (UID, Required, attached to name) - URL-friendly slug
- `blog_posts` (Relation, Many-to-Many with Blog Post)

### 5. Author (Collection Type)

**API ID:** `author`

**Fields:**

- `name` (Text, Required) - Author name
- `slug` (UID, Required, attached to name) - URL-friendly slug
- `bio` (Text, Long text) - Author biography
- `avatar` (Media, Single) - Author profile picture
- `email` (Email) - Contact email
- `social` (JSON) - Social media links (Twitter, LinkedIn, etc.)
- `blog_posts` (Relation, One-to-Many with Blog Post)

### 6. Global (Single Type)

**API ID:** `global`

**Fields:**

- `siteName` (Text) - Site name
- `siteDescription` (Text, Long text) - Site description
- `defaultSEO` (Component) - Default SEO settings
  - `metaTitle` (Text)
  - `metaDescription` (Text, Long text)
  - `shareImage` (Media, Single)

## API Token Configuration

1. **Go to Settings > API Tokens**
2. **Create a new API Token:**
   - Name: `WMIW Platform`
   - Token type: `Read-only` (for public content)
   - Token duration: `Unlimited`
3. **Copy the generated token**
4. **Add to your `.env` file:**
   ```
   STRAPI_URL=http://localhost:1337
   STRAPI_API_TOKEN=your_token_here
   ```

## Permissions Setup

1. **Go to Settings > Roles > Public**
2. **Enable the following permissions:**
   - **Blog-post:** `find`, `findOne`
   - **Page:** `find`, `findOne`
   - **Category:** `find`, `findOne`
   - **Tag:** `find`, `findOne`
   - **Author:** `find`, `findOne`
   - **Global:** `find`

## Sample Data

Create some sample content:

### Sample Blog Post

- **Title:** "Welcome to WMIW Platform"
- **Slug:** `welcome-to-wmiw-platform`
- **Excerpt:** "Discover how our platform revolutionizes music industry workflows."
- **Content:** Add detailed content about the platform
- **Featured:** `true`
- **Read Time:** `5`
- **Publish:** Set current date/time

### Sample Category

- **Name:** "Platform Updates"
- **Slug:** `platform-updates`
- **Description:** "Latest news and updates about the WMIW platform"

### Sample Author

- **Name:** "WMIW Team"
- **Slug:** `wmiw-team`
- **Bio:** "The team behind We Make IT Work platform"

## API Endpoints

Once configured, your API endpoints will be available:

### Blog Posts

- `GET /api/v1/cms/blog-posts` - List all posts
- `GET /api/v1/cms/blog-posts/featured` - Get featured posts
- `GET /api/v1/cms/blog-posts/:slug` - Get post by slug
- `GET /api/v1/cms/blog-posts/search?q=query` - Search posts

### Pages

- `GET /api/v1/cms/pages` - List all pages
- `GET /api/v1/cms/pages/:slug` - Get page by slug

### Categories

- `GET /api/v1/cms/categories` - List all categories
- `GET /api/v1/cms/categories/:slug/posts` - Get posts by category

### Tags

- `GET /api/v1/cms/tags` - List all tags
- `GET /api/v1/cms/tags/:slug/posts` - Get posts by tag

### Authors

- `GET /api/v1/cms/authors` - List all authors
- `GET /api/v1/cms/authors/:slug/posts` - Get posts by author

### Settings

- `GET /api/v1/cms/settings` - Get global site settings

## Troubleshooting

### Strapi won't start

- Check if PostgreSQL is running: `docker-compose ps`
- Check Strapi logs: `docker-compose logs strapi`
- Ensure database connection is correct in docker-compose.yml

### API returns 403 Forbidden

- Check that permissions are set correctly for the Public role
- Verify API token is valid and added to request headers

### Media files not loading

- Ensure STRAPI_URL is set correctly in your .env
- Media URLs will be `http://localhost:1337/uploads/...`

## Production Considerations

For production deployment:

1. **Change all secrets in docker-compose.yml**
2. **Use a proper S3/CDN for media files**
3. **Enable SSL/HTTPS**
4. **Set up proper backup strategy for PostgreSQL**
5. **Configure rate limiting**
6. **Set NODE_ENV=production**
7. **Use Read-only API tokens for public content**

## Resources

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi REST API Reference](https://docs.strapi.io/dev-docs/api/rest)
- [Content Type Builder Guide](https://docs.strapi.io/user-docs/content-type-builder)
