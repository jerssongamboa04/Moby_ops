# Branding and scan feedback — 2026-09-23

- Source assets are copied unchanged from the supplied MOBY PNG and SVG into assets/brand.
- expo.icon and android.icon use the supplied 1024px PNG. The previous Expo adaptiveIcon configuration is removed so it cannot override the MOBY icon. This iteration uses the standard Android icon; it does not manufacture foreground/monochrome layers from the supplied flattened PNG. Verify launcher masking on the next APK.
- TeamHeader displays the original SVG through the existing expo-image dependency, with a separate OPS label. No SVG transformer or new native package is added.
- Accepted scans trigger Android's Confirm haptic or the success notification on other platforms. The existing duplicate-event guard prevents repeated feedback. Invalid scans do not vibrate. Failure of haptics does not prevent accepting the ID. Haptics availability depends on hardware/system settings; iOS may suppress it while the camera is active.
- The manual ID placeholder is shorter (Enter ID / Introduce ID). Input font is 15 with less horizontal padding. System font scaling remains enabled.
- The field error uses an icon, border and short message within the ID card, and is hidden while that field is focused. The format rule is no longer described in the error. This is a presentation decision, not a security boundary: client validation and the database CHECK still apply.

Automated verification: scanner, form and operations navigation tests, typecheck, lint and Expo config resolution. Still requires Android checks for vibration, visual layout, SVG rendering and the launcher icon after the next build. The installed camera-enabled development APK can receive JS/UI changes through Metro; the launcher icon changes only after installing a newly built APK.
