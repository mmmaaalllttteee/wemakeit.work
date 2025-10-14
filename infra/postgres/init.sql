-- Create main application database
CREATE DATABASE wmiw_dev;

-- Create Strapi CMS database
CREATE DATABASE strapi_cms;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wmiw_dev TO wmiw_user;
GRANT ALL PRIVILEGES ON DATABASE strapi_cms TO wmiw_user;

-- Connect to wmiw_dev and enable extensions
\c wmiw_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Connect to strapi_cms and enable extensions
\c strapi_cms;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
