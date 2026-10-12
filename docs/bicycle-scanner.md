# Bicycle scanner and Public Order hierarchy

The Home form now has a dark Public Order heading, section icons and a neon scan button beside Bicycle ID. Selected actions retain both a checkmark and colour; colour is not the only indicator.

The scanner opens in a full-screen modal. It requests camera permission after an explicit button press, offers settings when permission cannot be requested again, and always offers manual entry. Closing it preserves the draft. A successful scan fills Bicycle ID and closes the modal; it does not submit the action.

Supported printed barcode formats: Code128, Code39, Code93, EAN13, EAN8, UPC-A, UPC-E, ITF14 and Codabar. Operational MOBY QR links are supported by extracting a validated bn parameter. Advertising QR codes are rejected. The accepted ID families and URL rules are documented in bicycle-id-validation.md; no fleet lookup is performed. Confirm the returned value against the printed ID on a real MOBY bicycle before operational use. Leading zeros and letters are preserved.

The camera is unmounted while the app is in the background and when the modal closes. Returning to the foreground refreshes camera permission. Duplicate scan events are ignored after the first accepted result. Barcode values are not logged.

## Android verification

Use a development build that contains expo-camera and the camera plugin configuration. If the installed APK predates those native changes, rebuild the development profile once and install it. Subsequent JavaScript/style changes use Metro.

Check on the physical device:

- Header, labels and scan button fit with normal and larger system text.
- Allow camera, read a real printed bicycle barcode, and compare the field with the printed identifier.
- Close without scanning: ID, notes and selected actions remain unchanged.
- Deny permission: manual entry remains available; settings is offered if needed.
- Background and reopen while scanning; camera resumes. Toggle the light.
- Return to Home, Tasks and Profile: draft and navigation behave as before.

Automated tests mock the native camera. They verify UI integration, permission handling, duplicate suppression, QR parsing and rejection of unrelated codes, manual fallback, camera failure, foreground/background lifecycle and torch state. They do not prove optical recognition on hardware.
