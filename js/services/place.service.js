export const placeService = {
  getPlaces,
  removePlace,
  addPlace,
  getPlaceById,
};
var dummyData = [
  { id: _makeId(), lat: 32.1416, lng: 34.831213, name: "Sydney" },
  { id: _makeId(), lat: 38.1122, lng: 54.123343, name: "Florentin" },
];

var gPlaces = loadFromStorage("places") || _createPlaces();

function getPlaces() {
  return gPlaces;
}

function removePlace(placeId) {
  gPlaces = gPlaces.filter((place) => place.id !== placeId);
  saveToStorage("places", gPlaces);
}

function addPlace(name, lat, lng, zoom) {
  const isDummyData = JSON.stringify(gPlaces) === JSON.stringify(dummyData);

  if (isDummyData) {
    gPlaces = [];
  }

  const place = _createPlace(name, lat, lng, zoom);
  gPlaces.push(place);

  saveToStorage("places", gPlaces);
}

function getPlaceById(placeId) {
  return gPlaces.find((place) => place.id === placeId);
}

function _createPlace(name, lat, lng, zoom) {
  const id = _makeId();
  return { id, name, lat, lng, zoom };
}

function _createPlaces() {
  saveToStorage("places", dummyData);
  return dummyData;
}

function _makeId(length = 10) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return txt;
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key) {
  const value = localStorage.getItem(key);
  return JSON.parse(value);
}
