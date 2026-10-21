// Expo config plugin: native LocationService (foreground + background GPS tracking)
// prebuild / EAS build pe android folder me khud inject hota hai.
const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  withAppBuildGradle,
  withMainApplication,
  withDangerousMod,
  AndroidConfig,
} = require('expo/config-plugins');

const SERVICE = '.location.LocationForegroundService';
const PERMS = [
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_LOCATION',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.WAKE_LOCK',
  'android.permission.INTERNET',
];

const withSources = (config) =>
  withDangerousMod(config, [
    'android',
    async (cfg) => {
      const pkg = cfg.android.package;
      const dest = path.join(
        cfg.modRequest.platformProjectRoot,
        'app/src/main/java',
        ...pkg.split('.'),
        'location'
      );
      fs.mkdirSync(dest, { recursive: true });
      const src = path.join(__dirname, 'location-service', 'android');
      for (const f of fs.readdirSync(src)) {
        if (!f.endsWith('.kt')) continue;
        const code = fs.readFileSync(path.join(src, f), 'utf8').replace(/__PKG__/g, pkg);
        fs.writeFileSync(path.join(dest, f), code);
      }
      return cfg;
    },
  ]);

const withManifest = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    manifest.manifest['uses-permission'] = manifest.manifest['uses-permission'] || [];
    for (const p of PERMS) {
      if (!manifest.manifest['uses-permission'].some((x) => x.$['android:name'] === p)) {
        manifest.manifest['uses-permission'].push({ $: { 'android:name': p } });
      }
    }
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.service = (app.service || []).filter((s) => s.$['android:name'] !== SERVICE);
    app.service.push({
      $: {
        'android:name': SERVICE,
        'android:enabled': 'true',
        'android:exported': 'false',
        'android:stopWithTask': 'false',
        'android:foregroundServiceType': 'location',
      },
    });
    return cfg;
  });

const withGradle = (config) =>
  withAppBuildGradle(config, (cfg) => {
    const dep = `implementation("com.google.android.gms:play-services-location:21.3.0")`;
    if (!cfg.modResults.contents.includes('play-services-location')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    ${dep}`
      );
    }
    return cfg;
  });

const withPackage = (config) =>
  withMainApplication(config, (cfg) => {
    const pkg = cfg.android.package;
    let src = cfg.modResults.contents;
    const imp = `import ${pkg}.location.LocationServicePackage`;
    if (!src.includes(imp)) {
      src = src.replace(/(package [^\n]+\n)/, `$1\n${imp}\n`);
    }
    if (!src.includes('add(LocationServicePackage())')) {
      if (/PackageList\(this\)\.packages\.apply\s*\{/.test(src)) {
        src = src.replace(
          /PackageList\(this\)\.packages\.apply\s*\{/,
          (m) => `${m}\n              add(LocationServicePackage())`
        );
      } else {
        throw new Error('[withLocationService] MainApplication me PackageList block nahi mila');
      }
    }
    cfg.modResults.contents = src;
    return cfg;
  });

module.exports = (config) => withPackage(withGradle(withManifest(withSources(config))));
