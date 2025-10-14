#!/bin/bash

echo "🎵 WMIW Platform - Startup Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Please install pnpm first:${NC}"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pnpm install
    echo ""
fi

# Start Docker services
echo -e "${YELLOW}🐳 Starting Docker services...${NC}"
docker compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"

if docker compose ps | grep -q "postgres.*Up"; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
fi

if docker compose ps | grep -q "redis.*Up"; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis is not running${NC}"
fi

if docker compose ps | grep -q "minio.*Up"; then
    echo -e "${GREEN}✓ MinIO is running${NC}"
else
    echo -e "${RED}✗ MinIO is not running${NC}"
fi

if docker compose ps | grep -q "mailhog.*Up"; then
    echo -e "${GREEN}✓ Mailhog is running${NC}"
else
    echo -e "${RED}✗ Mailhog is not running${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Infrastructure is ready!${NC}"
echo ""
echo "To start the development servers, run in separate terminals:"
echo ""
echo -e "${YELLOW}  Terminal 1 (API):${NC}"
echo "    cd $(pwd)"
echo "    pnpm dev:api"
echo ""
echo -e "${YELLOW}  Terminal 2 (Web):${NC}"
echo "    cd $(pwd)"
echo "    pnpm dev:web"
echo ""
echo "Access Points:"
echo "  • Frontend:     http://localhost:3000"
echo "  • API:          http://localhost:3001"
echo "  • API Docs:     http://localhost:3001/api/docs"
echo "  • MinIO:        http://localhost:9001 (wmiw_minio / wmiw_minio_pass)"
echo "  • Mailhog:      http://localhost:8025"
echo ""
echo "To stop infrastructure:"
echo "  pnpm docker:down"
echo ""
