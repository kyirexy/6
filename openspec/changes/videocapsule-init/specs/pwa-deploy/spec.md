## ADDED Requirements

### Requirement: PWA manifest and service worker
The application SHALL include a valid `manifest.json` and a service worker for offline support and installability.

#### Scenario: PWA installable
- **WHEN** user visits the site on a supported browser
- **THEN** browser shows an "Install App" prompt or equivalent UI

#### Scenario: Offline fallback
- **WHEN** user is offline and opens the PWA
- **THEN** app shows a cached shell with an offline indicator, and previously viewed notes remain accessible

### Requirement: iOS "Add to Home Screen" guidance
When accessed via Safari on iPhone, the application SHALL display a non-intrusive prompt guiding users to add the app to their home screen.

#### Scenario: Safari iOS detection
- **WHEN** user opens the site in Safari on iOS
- **THEN** a banner or toast appears with instructions: "点击分享按钮 → 添加到主屏幕"

#### Scenario: Already installed
- **WHEN** user has already added the app to home screen
- **THEN** the installation prompt is suppressed

### Requirement: Android APK packaging
The system SHALL provide a build script that packages the web application into an Android APK using Capacitor or Uni-app WebView shell.

#### Scenario: Generate APK
- **WHEN** developer runs the APK build script
- **THEN** a downloadable `.apk` file is generated at `dist/videocapsule.apk`

#### Scenario: APK download on web
- **WHEN** Android user visits the website
- **THEN** a prominent "下载 Android 版" button appears, linking to the APK file

### Requirement: Responsive design
The application SHALL be fully responsive, providing an optimal experience on mobile (320px+), tablet (768px+), and desktop (1024px+).

#### Scenario: Mobile layout
- **WHEN** viewport width is below 768px
- **THEN** cards render in single-column layout with full-width input field

#### Scenario: Desktop layout
- **WHEN** viewport width is above 1024px
- **THEN** cards render in a centered container with max-width constraint and comfortable padding
