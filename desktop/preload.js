/**
 * Preload — kept intentionally minimal.
 *
 * The desktop shell is a thin wrapper around the live web app, so it does
 * not need to expose Node APIs to the renderer. Sandbox + contextIsolation
 * are on; this file is a no-op placeholder for future bridges (file system
 * access, native notifications, system tray clicks…) without changing the
 * security posture today.
 */
"use strict";
