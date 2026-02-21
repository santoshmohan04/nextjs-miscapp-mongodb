/**
 * Available SVG avatars for user profiles
 */
export const AVAILABLE_AVATARS = [
  {
    key: "avatar-1",
    label: "Purple Smiley",
  },
  {
    key: "avatar-2",
    label: "Pink Character",
  },
  {
    key: "avatar-3",
    label: "Blue Explorer",
  },
  {
    key: "avatar-4",
    label: "Yellow Cheerful",
  },
  {
    key: "avatar-5",
    label: "Pastel Geometric",
  },
  {
    key: "avatar-6",
    label: "Orange Adventurer",
  },
];

/**
 * Get avatar by key
 */
export function getAvatar(key: string) {
  return AVAILABLE_AVATARS.find((a) => a.key === key);
}

/**
 * Validate if avatar key exists
 */
export function isValidAvatarKey(key: string): boolean {
  return AVAILABLE_AVATARS.some((a) => a.key === key);
}
