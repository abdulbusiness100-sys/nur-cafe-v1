// Push notifications disabled for v1.0 — expo-notifications incompatible with current RN version.
// Re-enable after upgrading to a unified Expo SDK version.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  return null;
}
