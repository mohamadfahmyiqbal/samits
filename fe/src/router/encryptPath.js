export function encryptPath(path) {
  return btoa(path); // encode ke Base64
}

export function decryptPath(encrypted) {
  return atob(encrypted); // decode Base64
}
