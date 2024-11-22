#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Set middleware-specific logging
export RUST_LOG=military_asset_tracking::middleware=trace
export RUST_BACKTRACE=1
export RUST_LOG_STYLE=always
export RUST_LOG_SPAN_EVENTS=full

echo -e "${BLUE}=== MATS Middleware Debug Tool ===${NC}"
echo -e "${YELLOW}Starting middleware debug mode...${NC}"

# Function to send test requests
send_test_requests() {
    echo -e "\n${BLUE}Sending test requests...${NC}"
    # Wait for server to start
    sleep 2

    # Test endpoints
    endpoints=(
        "GET http://localhost:8080/api/v1/assets"
        "POST http://localhost:8080/api/v1/assets"
        "GET http://localhost:8080/api/v1/assets/123"
    )

    for endpoint in "${endpoints[@]}"; do
        read -r method url <<< "$endpoint"
        echo -e "${YELLOW}Testing $method $url${NC}"
        if [ "$method" = "GET" ]; then
            curl -s -X GET "$url" -H "Content-Type: application/json" || true
        else
            curl -s -X POST "$url" -H "Content-Type: application/json" -d '{"test": "data"}' || true
        fi
        echo
        sleep 1
    done
}

# Function to monitor middleware performance with enhanced output
monitor_middleware() {
    echo -e "\n${BLUE}Monitoring middleware performance...${NC}"
    
    # Start the server in the background
    cargo run &
    SERVER_PID=$!
    
    # Send test requests in the background
    send_test_requests &
    
    # Monitor server output
    while true; do
        if read -r line; then
            if [[ $line == *"middleware"* ]]; then
                # Extract timing information if present
                if [[ $line =~ ([0-9]+\.[0-9]+ms) ]]; then
                    timing="${BASH_REMATCH[1]}"
                    if (( $(echo "$timing" | cut -d'.' -f1) > 100 )); then
                        echo -e "${RED}[SLOW] $line${NC}"
                    else
                        echo -e "${GREEN}[OK] $line${NC}"
                    fi
                elif [[ $line == *"ERROR"* ]]; then
                    echo -e "${RED}$line${NC}"
                elif [[ $line == *"WARN"* ]]; then
                    echo -e "${YELLOW}$line${NC}"
                else
                    echo -e "${GREEN}$line${NC}"
                fi
            fi
        fi
    done
}

# Function to check middleware configuration
check_middleware_config() {
    echo -e "\n${BLUE}Checking middleware configuration...${NC}"
    local files=(
        "src/middleware/error_handler.rs"
        "src/middleware/rate_limit.rs"
        "src/middleware/validation.rs"
        "src/middleware/versioning.rs"
    )

    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}✓ Found $file${NC}"
            # Check for common patterns
            if grep -q "ResponseExt" "$file"; then
                echo -e "${YELLOW}  - Contains ResponseExt trait${NC}"
            fi
            if grep -q "map_into_boxed" "$file"; then
                echo -e "${YELLOW}  - Contains map_into_boxed calls${NC}"
            fi
        else
            echo -e "${RED}✗ Missing $file${NC}"
        fi
    done
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Main debugging loop
main() {
    echo "Starting middleware debug session..."
    
    # Check configuration
    check_middleware_config
    
    # Monitor performance
    echo -e "\n${YELLOW}Starting middleware monitoring...${NC}"
    echo "Press Ctrl+C to stop"
    
    monitor_middleware
}

# Run the debug session
main