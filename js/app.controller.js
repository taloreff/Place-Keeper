import { syncStorageService } from "./services/util.service.js";
import { placeService } from "./services/place.service.js";

window.onInit = onInit;
window.onRemovePlace = onRemovePlace;
window.renderUserPref = renderUserPref;
window.renderHome = renderHome;
window.renderMap = renderMap;
window.saveUserPreferencesHandler = saveUserPreferencesHandler;
window.applyUserColors = applyUserColors;
window.onDisplay = onDisplay;
window.onPanToPlace = onPanToPlace;
window.initMap = initMap;
window.onPanToUser = onPanToUser;
window.renderMarkers = renderMarkers;
window.downloadCSV = downloadCSV;

var gMarkers = [];
var gMap;

function renderHome() {
  const elHomeContainer = document.querySelector(".home-container");
  const strHtmls = `
            <h1>Welcome to Place Keeper</h1>
            <h5>Explore the map, Find your way back to your best places, and enjoy!</h5>
          `;
  elHomeContainer.innerHTML = strHtmls;

  applyUserColors();
}

function onDisplay(sectionClass) {
  const elSections = document.querySelectorAll("section");
  elSections.forEach((elSection) => {
    if (elSection.classList.contains(sectionClass)) {
      elSection.style.display = "block";
    } else {
      elSection.style.display = "none";
    }
  });
  if (sectionClass === "home") {
    renderHome();
  } else if (sectionClass === "user-pref") {
    renderUserPref();
  } else {
    renderMap();
    onInit();
  }
}

async function renderUserPref() {
  const elFormContainer = document.querySelector(".form-container");
  const strHtmls = `
                <form class="form" onsubmit="saveUserPreferencesHandler(event)">
                <section class="form-section"><label>E-Mail</label> <input type="email" id="email" placeholder="Insert your email here"></section>
                <section class="form-section"><div class="age-input-container"><label>Age</label><input type="range" min="18" max="120" value="18" id="age"><span class="range-value">18</span></div></section>
                <h2>Colors-</h2>
                <section class="form-section"><label>Set Background Color</label> <input type="color" id="bgColor"></section>
                <section class="form-section"><label>Set Text Color</label> <input type="color" id="txtColor"></section>
                <section class="form-section"><label>Birth Date</label> <input type="date" id="birthDate"></section>
                <section class="form-section"><label>Birth Time</label> <input type="time" id="birthTime"></section>
                <section>
                  <label for="gender-input">Gender</label>
                  <input list="gender" id="gender-input" name="gender-input" />
                  <datalist id="gender">
                    <option value="Male"></option>
                    <option value="Female"></option>
                    <option value="Other"></option>
                  </datalist>
                </section>
                <button type="submit" class="form-btn">Set</button>
            </form> 
          `;

  elFormContainer.innerHTML = strHtmls;

  const rangeInput = document.querySelector("input[type='range']");
  const rangeValue = document.querySelector(".range-value");
  rangeInput.addEventListener("input", function () {
    rangeValue.textContent = this.value;
  });
}

function renderMap() {
  const ElMapContent = document.querySelector(".map-content");

  const strHtmls = `
              <section class="google-map"></section>  
              <section class="places-list"></section>  
          `;

  ElMapContent.innerHTML = strHtmls;

  initMap();
}

function saveUserPreferencesHandler(event) {
  event.preventDefault();

  const user = {
    email: document.getElementById("email").value,
    txtColor: document.getElementById("txtColor").value,
    bgColor: document.getElementById("bgColor").value,
    age: document.getElementById("age").value,
    birthDate: document.getElementById("birthDate").value,
    birthTime: document.getElementById("birthTime").value,
    gender: document.getElementById("gender-input").value,
  };

  syncStorageService.saveUserPreferences("user", user);

  applyUserColors();
}

function applyUserColors() {
  const user = syncStorageService.loadUserPreferences("user");
  if (user) {
    document.body.style.color = user.txtColor;
    document.body.style.backgroundColor = user.bgColor;
  }
}

function onInit() {
  renderPlaces();
}

function renderPlaces() {
  const placesList = document.querySelector(".places-list");
  placesList.innerHTML = "";

  const places = placeService.getPlaces();
  places.forEach((place) => {
    const elPlace = document.createElement("div");
    elPlace.innerHTML = `
      <p>${place.name}</p>
      <button onclick="onRemovePlace('${place.id}')">X</button>
      <button onclick="onPanToPlace('${place.id}')">Go</button>
    `;
    placesList.append(elPlace);
  });
  placesList.innerHTML += `<button class="bottom-places-btn" onclick="downloadCSV()">Download as CSV</button>`;
  placesList.innerHTML += `<button class="bottom-places-btn" onclick="onPanToUser()">Your location</button>`;
  renderMarkers();
}

function onRemovePlace(placeId) {
  placeService.removePlace(placeId);
  renderPlaces();
}

function initMap() {
  const mapContainer = document.querySelector(".google-map");
  if (mapContainer) {
    gMap = new google.maps.Map(document.querySelector(".google-map"), {
      center: { lat: 29.55036, lng: 34.952278 },
      zoom: 13,
      apiKey: "AIzaSyDZHE0jtrWArab41ZbQN5YPTJqYeJC-jrU",
    });

    gMap.addListener("click", async (ev) => {
      const name = prompt("Place name?", "Enter a place name");
      if (!name) {
        return;
      }
      const lat = ev.latLng.lat();
      const lng = ev.latLng.lng();
      await placeService.addPlace(name, lat, lng, gMap.getZoom());
      renderPlaces();
    });
  }
}

async function onPanToPlace(placeId) {
  const place = await placeService.getPlaceById(placeId);
  gMap.setCenter({ lat: place.lat, lng: place.lng });
  gMap.setZoom(place.zoom);
}

async function onPanToUser() {
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    gMap.setCenter({ lat, lng });
  });
}

async function renderMarkers() {
  const places = await placeService.getPlaces();
  // remove previous markers
  gMarkers.forEach((marker) => marker.setMap(null));
  // every place is creating a marker
  gMarkers = places.map((place) => {
    return new google.maps.Marker({
      position: place,
      map: gMap,
      title: place.name,
    });
  });
}

async function downloadCSV() {
  const places = await placeService.getPlaces();
  let csvContent = "data:text/csv;charset=utf-8," + "Name,Latitude,Longitude\n";

  places.forEach((place) => {
    const row = `${place.name},${place.lat},${place.lng}\n`;
    csvContent += row;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "places_list.csv");
  document.body.appendChild(link);
  link.click();
}
