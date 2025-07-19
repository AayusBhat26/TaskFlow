/**
 * Utility functions for displaying user information consistently across the application
 */

export interface UserDisplayInfo {
  id?: string;
  name?: string | null;
  surname?: string | null;
  username?: string;
  email?: string | null;
  image?: string | null;
}

/**
 * Get the display name for a user with proper fallback handling
 */
export const getUserDisplayName = (user: UserDisplayInfo): string => {
  if (user.name && user.surname) {
    return `${user.name} ${user.surname}`;
  }
  if (user.name) {
    return user.name;
  }
  if (user.username) {
    return user.username;
  }
  if (user.email) {
    return user.email.split('@')[0];
  }
  return 'User';
};

/**
 * Get the first name of a user for informal greetings
 */
export const getUserFirstName = (user: UserDisplayInfo): string => {
  if (user.name) {
    return user.name;
  }
  if (user.username) {
    return user.username;
  }
  if (user.email) {
    return user.email.split('@')[0];
  }
  return 'User';
};

/**
 * Get user initials for avatars and display
 */
export const getUserInitials = (user: UserDisplayInfo): string => {
  const displayName = getUserDisplayName(user);
  
  return displayName
    .split(' ')
    .map((n, idx) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Limit to 2 characters
};

/**
 * Get a short display name (first name + last initial)
 */
export const getUserShortName = (user: UserDisplayInfo): string => {
  if (user.name && user.surname) {
    return `${user.name} ${user.surname[0]}.`;
  }
  return getUserDisplayName(user);
};

/**
 * Check if user has completed their profile information
 */
export const hasCompleteProfile = (user: UserDisplayInfo): boolean => {
  return !!(user.name && user.surname);
};

/**
 * Get user avatar fallback text
 */
export const getUserAvatarFallback = (user: UserDisplayInfo): string => {
  return getUserInitials(user);
};
