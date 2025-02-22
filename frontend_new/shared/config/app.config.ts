interface AppConfig {
  civilian: {
    baseUrl: string;
    landingPage: string;
  };
  defense: {
    baseUrl: string;
    landingPage: string;
  };
}

// Development configuration
const devConfig: AppConfig = {
  civilian: {
    baseUrl: '/',
    landingPage: '/civilian/dashboard',
  },
  defense: {
    baseUrl: '/',
    landingPage: '/defense/dashboard',
  },
};

// Production configuration (can be modified later)
const prodConfig: AppConfig = {
  civilian: {
    baseUrl: '/',
    landingPage: '/civilian/dashboard',
  },
  defense: {
    baseUrl: '/',
    landingPage: '/defense/dashboard',
  },
};

export const appConfig = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
