#!/bin/bash

# Set base directory
BASE_DIR="/Users/brendantoole/handreceipt_working/frontend"

# Create backup
echo "Creating backup..."
cp -r "$BASE_DIR/src" "$BASE_DIR/src_backup"
cp -r "$BASE_DIR/styles" "$BASE_DIR/styles_backup" 2>/dev/null || :

# Create new directory structure
echo "Creating new directory structure..."

# App core
mkdir -p "$BASE_DIR/src/app"
mkdir -p "$BASE_DIR/src/auth/"{components,hooks,services}

# Features
mkdir -p "$BASE_DIR/src/features/common/"{PropertyBook,Profile,Maintenance}/"{components,hooks}"
mkdir -p "$BASE_DIR/src/features/officer/"{CommandDashboard,PropertyManagement,Analytics}/"{components,hooks}"
mkdir -p "$BASE_DIR/src/features/nco/"{SquadDashboard,TeamManagement}/"{components,hooks}"
mkdir -p "$BASE_DIR/src/features/soldier/"{QuickTransfer,EquipmentStatus}/"{components,hooks}"

# Shared
mkdir -p "$BASE_DIR/src/shared/components/"{layout,feedback,"data-display"}
mkdir -p "$BASE_DIR/src/shared/hooks"
mkdir -p "$BASE_DIR/src/shared/utils"

# Services and Store
mkdir -p "$BASE_DIR/src/services/"{api,blockchain}
mkdir -p "$BASE_DIR/src/store/"{property,transfer,user}
mkdir -p "$BASE_DIR/styles/"{base,components,theme}

echo "Moving files..."

# Core app files
mv "$BASE_DIR/src/App.tsx" "$BASE_DIR/src/app/" 2>/dev/null || :
mv "$BASE_DIR/src/main.tsx" "$BASE_DIR/src/app/" 2>/dev/null || :
mv "$BASE_DIR/src/routes/index.tsx" "$BASE_DIR/src/app/routes.tsx" 2>/dev/null || :
mv "$BASE_DIR/src/contexts/"* "$BASE_DIR/src/app/contexts/" 2>/dev/null || :

# Auth files
mv "$BASE_DIR/src/features/auth/components/"* "$BASE_DIR/src/auth/components/" 2>/dev/null || :
mv "$BASE_DIR/src/pages/auth/"* "$BASE_DIR/src/auth/pages/" 2>/dev/null || :

# Common features
mv "$BASE_DIR/src/features/property/components/PropertyList.tsx" "$BASE_DIR/src/features/common/PropertyBook/components/" 2>/dev/null || :
mv "$BASE_DIR/src/features/property/components/PropertyCard.tsx" "$BASE_DIR/src/features/common/PropertyBook/components/" 2>/dev/null || :
mv "$BASE_DIR/src/features/profile/components/"* "$BASE_DIR/src/features/common/Profile/components/" 2>/dev/null || :

# Officer features
mv "$BASE_DIR/src/features/dashboard/components/CommanderDashboard.tsx" "$BASE_DIR/src/features/officer/CommandDashboard/components/" 2>/dev/null || :
mv "$BASE_DIR/src/features/reports/components/"* "$BASE_DIR/src/features/officer/Analytics/components/" 2>/dev/null || :
mv "$BASE_DIR/src/pages/admin/"* "$BASE_DIR/src/features/officer/PropertyManagement/" 2>/dev/null || :

# NCO features
mv "$BASE_DIR/src/pages/nco/"* "$BASE_DIR/src/features/nco/SquadDashboard/components/" 2>/dev/null || :
mv "$BASE_DIR/src/features/property/components/UnitPropertyOverview.tsx" "$BASE_DIR/src/features/nco/TeamManagement/components/" 2>/dev/null || :

# Soldier features
mv "$BASE_DIR/src/pages/soldier/"* "$BASE_DIR/src/features/soldier/EquipmentStatus/" 2>/dev/null || :
mv "$BASE_DIR/src/features/mobile/components/scanner.tsx" "$BASE_DIR/src/features/soldier/QuickTransfer/components/" 2>/dev/null || :

# Shared resources
mv "$BASE_DIR/src/shared/components/"* "$BASE_DIR/src/shared/components/" 2>/dev/null || :
mv "$BASE_DIR/src/components/common/"* "$BASE_DIR/src/shared/components/" 2>/dev/null || :
mv "$BASE_DIR/src/hooks/"* "$BASE_DIR/src/shared/hooks/" 2>/dev/null || :
mv "$BASE_DIR/src/utils/"* "$BASE_DIR/src/shared/utils/" 2>/dev/null || :

# Services
mv "$BASE_DIR/src/services/api/"* "$BASE_DIR/src/services/api/" 2>/dev/null || :
mv "$BASE_DIR/src/services/blockchain/"* "$BASE_DIR/src/services/blockchain/" 2>/dev/null || :
mv "$BASE_DIR/src/middleware/"* "$BASE_DIR/src/services/middleware/" 2>/dev/null || :

# Store
mv "$BASE_DIR/src/store/slices/"* "$BASE_DIR/src/store/" 2>/dev/null || :

# Styles
mv "$BASE_DIR/src/styles/base/"* "$BASE_DIR/styles/base/" 2>/dev/null || :
mv "$BASE_DIR/src/styles/components/"* "$BASE_DIR/styles/components/" 2>/dev/null || :
mv "$BASE_DIR/src/styles/theme/"* "$BASE_DIR/styles/theme/" 2>/dev/null || :
mv "$BASE_DIR/src/ui/styles/property/"* "$BASE_DIR/styles/components/property/" 2>/dev/null || :

echo "Creating index files..."
find "$BASE_DIR/src" -type d -not -path "*/node_modules/*" -exec touch {}/index.ts \;

echo "Cleaning up empty directories..."
find "$BASE_DIR/src" -type d -empty -delete

# Update tsconfig.json paths
echo '{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@app/*": ["src/app/*"],
      "@auth/*": ["src/auth/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@services/*": ["src/services/*"],
      "@store/*": ["src/store/*"],
      "@styles/*": ["styles/*"]
    }
  }
}' > "$BASE_DIR/tsconfig.paths.json"

echo "Migration completed!"
echo "Please review the changes and update import paths in your components."
echo "Original files backed up in src_backup and styles_backup"