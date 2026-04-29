const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to inject signing configuration into Android build.gradle
 * 
 * Options:
 * - storeFile: (Optional) Name of the keystore file in project root. Default: process.env.RELEASE_STORE_FILE
 * - keyAlias: (Optional) Alias for the key. Default: process.env.RELEASE_KEY_ALIAS
 */
const withAndroidSigning = (config, options = {}) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = setSigningConfig(config.modResults.contents, options);
    }
    return config;
  });
};

function setSigningConfig(buildGradle, options) {
  const storeFile = options.storeFile || 'System.getenv("RELEASE_STORE_FILE")';
  const keyAlias = options.keyAlias || 'System.getenv("RELEASE_KEY_ALIAS")';
  const storePassword = 'System.getenv("RELEASE_STORE_PASSWORD")';
  const keyPassword = 'System.getenv("RELEASE_KEY_PASSWORD")';

  // 1. Remove existing signingConfigs
  buildGradle = buildGradle.replace(/signingConfigs\s*\{[\s\S]*?\n\s{4}\}/s, '');

  const signingConfigBlock = `
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            // Check for presence of env variables or options
            if (System.getenv("RELEASE_STORE_FILE") || "${options.storeFile || ''}") {
                def sFile = ${options.storeFile ? '"' + options.storeFile + '"' : 'System.getenv("RELEASE_STORE_FILE")'}
                storeFile file("../../" + sFile)
                storePassword ${storePassword}
                keyAlias ${options.keyAlias ? '"' + options.keyAlias + '"' : keyAlias}
                keyPassword ${keyPassword}
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }
    }
`;

  // 2. Inject before defaultConfig
  if (!buildGradle.includes('signingConfigs {')) {
    buildGradle = buildGradle.replace('defaultConfig {', signingConfigBlock + '\n    defaultConfig {');
  }

  // 3. Ensure release buildType uses release signingConfig
  buildGradle = buildGradle.replace(/(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.)\w+/, '$1release');
  
  // 4. Ensure debug buildType uses debug signingConfig
  buildGradle = buildGradle.replace(/(debug\s*\{[\s\S]*?signingConfig\s+signingConfigs\.)\w+/, '$1debug');

  return buildGradle;
}

module.exports = withAndroidSigning;
