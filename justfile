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

# Check formatting
format-check:
    npm run format:check

# ======================================
# Capacitor Mobile Development Commands
# ======================================

# Build and sync to native platforms
sync: build-local
    npx cap sync

# Build and sync, then open Android Studio
android: sync
    npx cap open android

# Build and sync, then open Xcode
ios: sync
    npx cap open ios

# Run on Android device/emulator
run-android: sync
    npx cap run android

# Run on iOS device/simulator  
run-ios: sync
    npx cap run ios

# List available devices
devices:
    @echo "Android devices:"
    npx cap run android --list
    @echo "\niOS devices:"
    npx cap run ios --list

# Show Capacitor info and doctor
cap-info:
    npx cap doctor

# Update Capacitor dependencies
update-cap:
    npm update @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Clean mobile build artifacts
clean-mobile:
    rm -rf android/app/src/main/assets/public
    rm -rf ios/App/App/public