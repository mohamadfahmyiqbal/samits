export function encryptPath(path) {
  return btoa(path);
}

export function decryptPath(encrypted) {
  return atob(encrypted);
}
