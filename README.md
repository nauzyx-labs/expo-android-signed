# expo-android-signed

An Expo Config Plugin to persist Android release signing configurations in `build.gradle` across `expo prebuild` runs.

## Installation

```bash
pnpm add expo-android-signed
```

## Usage

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      "expo-android-signed"
    ]
  }
}
```

### Configuration

The plugin looks for the following environment variables (usually in a `.env` file in your project root) during the build process:

- `RELEASE_STORE_FILE`: Name of your keystore file (e.g., `my-release-key.keystore`). The file should be in your project root.
- `RELEASE_KEY_ALIAS`: Your key alias.
- `RELEASE_STORE_PASSWORD`: Your keystore password.
- `RELEASE_KEY_PASSWORD`: Your key password.

#### Customizing Options

You can also pass options directly in `app.json` (though environment variables are recommended for passwords):

```json
"plugins": [
  [
    "expo-android-signed",
    {
      "storeFile": "custom-key.keystore",
      "keyAlias": "custom-alias"
    }
  ]
]
```

## How it works

When you run `npx expo prebuild`, this plugin automatically patches `android/app/build.gradle` to:
1. Add a `release` signing config.
2. Link the `release` build type to the `release` signing config.
3. Ensure the `debug` build type remains on the `debug` signing config.

## License

MIT
