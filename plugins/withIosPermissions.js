const { withInfoPlist } = require('@expo/config-plugins');

// Explicitly write required iOS permission strings.
// This runs during expo prebuild and guarantees the keys land in Info.plist
// regardless of EAS build cache state.
const withIosPermissions = (config) => {
  return withInfoPlist(config, (c) => {
    c.modResults['NSCameraUsageDescription'] =
      'Allow Nur Cafe to access your camera to scan payment cards.';
    c.modResults['NSMicrophoneUsageDescription'] =
      'Allow Nur Cafe to access your microphone for voice features.';
    c.modResults['NSPhotoLibraryUsageDescription'] =
      'Allow Nur Cafe to access your photo library.';
    c.modResults['ITSAppUsesNonExemptEncryption'] = false;
    return c;
  });
};

module.exports = withIosPermissions;
