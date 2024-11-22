#!/bin/bash

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
BACKEND_DIR="$PROJECT_ROOT/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== MATS Diagnostic Tool ==="
echo "Script location: $SCRIPT_DIR"
echo "Project root: $PROJECT_ROOT"
echo "Backend directory: $BACKEND_DIR"

# Check if we're in the correct directory structure
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Error: Cannot find backend directory${NC}"
    exit 1
fi

# Function to run cargo check with detailed output
check_compilation() {
    echo -e "\n${YELLOW}Running cargo check with expanded errors...${NC}"
    cd "$BACKEND_DIR" && RUST_BACKTRACE=1 cargo check -v 2>&1 | tee /tmp/cargo-errors.log

    if [ $? -ne 0 ]; then
        echo -e "\n${RED}Compilation failed. Analyzing errors...${NC}"
        
        # Look for specific error patterns
        echo -e "\n${YELLOW}Most common errors:${NC}"
        grep -A 2 "error\[" /tmp/cargo-errors.log | sort | uniq -c | sort -nr

        echo -e "\n${YELLOW}Trait bounds issues:${NC}"
        grep -A 2 "the trait bound" /tmp/cargo-errors.log

        echo -e "\n${YELLOW}Missing traits:${NC}"
        grep -A 2 "the trait.*is not implemented" /tmp/cargo-errors.log

        echo -e "\n${YELLOW}Type mismatches:${NC}"
        grep -A 2 "expected.*found" /tmp/cargo-errors.log
    else
        echo -e "${GREEN}Compilation successful!${NC}"
    fi
}

# Function to check dependencies
check_dependencies() {
    echo -e "\n${YELLOW}Checking dependencies...${NC}"
    cd "$BACKEND_DIR" && cargo tree --duplicate
}

# Run the checks
check_compilation
check_dependencies

echo -e "\n${GREEN}Diagnostic complete!${NC}"