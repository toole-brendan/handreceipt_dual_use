module.exports = {
  dependencies: {
    'react-native-camera': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    'react-native-sqlite-storage': {
      platforms: {
        android: null, // let the Android platform handle the linking
        ios: null // let the iOS platform handle the linking
      }
    }
  },
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
}; 