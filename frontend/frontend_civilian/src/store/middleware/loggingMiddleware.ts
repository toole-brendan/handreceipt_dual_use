import { Middleware } from '@reduxjs/toolkit';

export const loggingMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    const actionType = action && typeof action === 'object' && 'type' in action ? action.type : 'Unknown Action';
    console.group(`Action: ${actionType}`);
    console.log('Previous State:', store.getState());
    console.log('Action:', action);
    const result = next(action);
    console.log('Next State:', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};
