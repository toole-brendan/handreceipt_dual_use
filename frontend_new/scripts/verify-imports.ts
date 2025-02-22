import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const IMPORT_REGEX = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
const ALIAS_MAP = {
  '@shared': path.resolve(__dirname, '../shared'),
  '@civilian': path.resolve(__dirname, '../apps/civilian/src'),
  '@defense': path.resolve(__dirname, '../apps/defense/src'),
  '@config': path.resolve(__dirname, '../config')
};

function scanForInvalidImports() {
  const tsFiles = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
    cwd: path.resolve(__dirname, '..')
  });
  
  let hasErrors = false;
  
  tsFiles.forEach(file => {
    const filePath = path.resolve(__dirname, '..', file);
    const content = fs.readFileSync(filePath, 'utf8');
    let match;

    while ((match = IMPORT_REGEX.exec(content)) !== null) {
      const importPath = match[1];
      
      // Check for cross-app relative imports
      if (importPath.startsWith('.') && 
          ((file.includes('/apps/civilian/') && importPath.includes('../defense')) ||
           (file.includes('/apps/defense/') && importPath.includes('../civilian')))) {
        console.error(`❌ Cross-app relative import in ${file}: ${importPath}`);
        console.error('   Use @civilian or @defense alias instead');
        hasErrors = true;
      }
      
      // Check for imports that should use aliases
      if (importPath.includes('../shared/')) {
        console.warn(`⚠️ Consider using @shared alias in ${file}: ${importPath}`);
      }
      
      // Check for deep imports from other app
      if ((file.includes('/apps/civilian/') && importPath.startsWith('@defense')) ||
          (file.includes('/apps/defense/') && importPath.startsWith('@civilian'))) {
        console.error(`❌ Direct import from other app in ${file}: ${importPath}`);
        console.error('   Use shared code in @shared instead');
        hasErrors = true;
      }
    }
  });
  
  if (hasErrors) {
    console.error('\n❌ Import verification failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ Import verification passed!');
    process.exit(0);
  }
}

// Run the verification
scanForInvalidImports();
