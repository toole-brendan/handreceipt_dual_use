/* frontend/src/ui/components/common/LoadingFallback.tsx */

import React from 'react';
import '@/styles/components/loading-fallback.css';

const LoadingFallback: React.FC = () => {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingFallback; 