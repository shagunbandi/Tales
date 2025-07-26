# Justfile for Tales application

# Build the Docker image
build:
    docker build -t tales-app .

# Run the application in production mode
prod-up:
    just build
    docker-compose up -d

# Stop the production application
prod-down:
    docker-compose down

# View production logs
prod-logs:
    docker-compose logs -f

# Rebuild and restart production
prod-restart:
    docker-compose down
    docker build -t tales-app .
    docker-compose up -d

# Clean up Docker resources
clean:
    docker-compose down --volumes --remove-orphans
    docker system prune -f

# Development mode (if needed)
dev:
    npm run dev

# Install dependencies
install:
    npm install

# Build locally (without Docker)
build-local:
    npm run build

# Lint the code
lint:
    npm run lint

# Format the code
format:
    npm run format 