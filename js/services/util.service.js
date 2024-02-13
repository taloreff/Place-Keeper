export const syncStorageService = {
  saveUserPreferences,
  loadUserPreferences,
};

function saveUserPreferences(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function loadUserPreferences(key) {
  var val = localStorage.getItem(key);
  return JSON.parse(val);
}
