// Configuration for different environments
export const isElectron = () => {
  return typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron');
};

export const getApiBaseUrl = () => {
  if (isElectron()) {
    // In Electron, always use localhost with the backend port
    return 'http://localhost:3001';
  }
  
  // In browser development/production, use relative URLs
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // Production web deployment
  return '';
};

export const API_BASE_URL = getApiBaseUrl(); 