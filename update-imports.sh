#!/bin/bash

BASE_DIR="/Users/brendantoole/handreceipt_working/frontend"

echo "Updating import paths in all TypeScript and React files..."

# Function to process each file
update_imports() {
    local file="$1"
    echo "Processing $file..."
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Update relative imports to absolute imports using sed
    sed -E '
        # Update shared components imports
        s|from "\.\./\.\./\.\./shared/components|from "@shared/components|g
        s|from "\.\./\.\./shared/components|from "@shared/components|g
        s|from "\.\./shared/components|from "@shared/components|g
        
        # Update feature imports
        s|from "\.\./\.\./\.\./features|from "@features|g
        s|from "\.\./\.\./features|from "@features|g
        s|from "\.\./features|from "@features|g
        
        # Update common imports
        s|from "\.\./\.\./\.\./components/common|from "@shared/components|g
        s|from "\.\./\.\./components/common|from "@shared/components|g
        s|from "\.\./components/common|from "@shared/components|g
        
        # Update hooks imports
        s|from "\.\./\.\./\.\./hooks|from "@shared/hooks|g
        s|from "\.\./\.\./hooks|from "@shared/hooks|g
        s|from "\.\./hooks|from "@shared/hooks|g
        
        # Update utils imports
        s|from "\.\./\.\./\.\./utils|from "@shared/utils|g
        s|from "\.\./\.\./utils|from "@shared/utils|g
        s|from "\.\./utils|from "@shared/utils|g
        
        # Update services imports
        s|from "\.\./\.\./\.\./services|from "@services|g
        s|from "\.\./\.\./services|from "@services|g
        s|from "\.\./services|from "@services|g
        
        # Update store imports
        s|from "\.\./\.\./\.\./store|from "@store|g
        s|from "\.\./\.\./store|from "@store|g
        s|from "\.\./store|from "@store|g

        # Update styles imports
        s|from "\.\./\.\./\.\./styles|from "@styles|g
        s|from "\.\./\.\./styles|from "@styles|g
        s|from "\.\./styles|from "@styles|g
        
        # Update feature-specific imports
        s|from "\.\./\.\./\.\./features/officer|from "@features/officer|g
        s|from "\.\./\.\./\.\./features/nco|from "@features/nco|g
        s|from "\.\./\.\./\.\./features/soldier|from "@features/soldier|g
        s|from "\.\./\.\./\.\./features/common|from "@features/common|g
        
        # Update auth imports
        s|from "\.\./\.\./\.\./auth|from "@auth|g
        s|from "\.\./\.\./auth|from "@auth|g
        s|from "\.\./auth|from "@auth|g
    ' "$file" > "$temp_file"
    
    # Replace original file with updated content
    mv "$temp_file" "$file"
}

export -f update_imports
export BASE_DIR

# Find all TypeScript and React files and update imports
find "$BASE_DIR/src" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec bash -c 'update_imports "$0"' {} \;

# Update vite.config.ts to include the new path aliases
echo "Updating vite.config.ts..."
cat > "$BASE_DIR/vite.config.ts" << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@auth': path.resolve(__dirname, './src/auth'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@styles': path.resolve(__dirname, './styles')
    }
  }
})
EOL

# Create/update path aliases in tsconfig.json
echo "Updating tsconfig.json..."
jq '.compilerOptions.paths = {
  "@/*": ["src/*"],
  "@app/*": ["src/app/*"],
  "@auth/*": ["src/auth/*"],
  "@features/*": ["src/features/*"],
  "@shared/*": ["src/shared/*"],
  "@services/*": ["src/services/*"],
  "@store/*": ["src/store/*"],
  "@styles/*": ["styles/*"]
}' "$BASE_DIR/tsconfig.json" > "$BASE_DIR/tsconfig.tmp.json" && mv "$BASE_DIR/tsconfig.tmp.json" "$BASE_DIR/tsconfig.json"

# Update any Jest config if it exists
if [ -f "$BASE_DIR/jest.config.js" ]; then
    echo "Updating jest.config.js..."
    cat > "$BASE_DIR/jest.config.js" << 'EOL'
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@styles/(.*)$': '<rootDir>/styles/$1'
  }
}
EOL
fi

echo "Import paths update completed!"
echo "Please review the changes and test your application."
echo "You may need to:"
echo "1. Run 'npm install' or 'yarn' to update dependencies"
echo "2. Clear your build cache"
echo "3. Restart your development server"