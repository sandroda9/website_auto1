import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Firebase Config (dieselbe wie im Admin)
const firebaseConfig = {
  apiKey: "AIzaSyDuu5uniSbFQ5JErWWoQrsyHAoI1XlkaWA",
  authDomain: "webseiteauto1.firebaseapp.com",
  projectId: "webseiteauto1",
  storageBucket: "webseiteauto1.appspot.com",
  messagingSenderId: "156599830482",
  appId: "1:156599830482:web:9bc6a34adfa174c58b6a0b"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const carsContainer = document.getElementById('carsContainer');
const searchInput = document.getElementById('searchInput');
const priceFilter = document.getElementById('priceFilter');
const resetBtn = document.getElementById('resetBtn');
const noResults = document.getElementById('noResults');

let cars = [];
let filteredCars = [];

// Daten aus Firestore laden
async function loadCarsFromFirestore() {
  const result = [];
  const querySnapshot = await getDocs(collection(db, "cars"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    result.push({
      id: docSnap.id,
      name: data.name || "",
      year: data.year || "",
      price: data.price || "",
      description: data.description || "",
      images: Array.isArray(data.images) ? data.images : []
    });
  });

  return result;
}

// Initialisierung
async function init() {
  try {
    cars = await loadCarsFromFirestore();
    filteredCars = [...cars];
    renderCars(filteredCars);
    attachEventListeners();
    updateNoResults();
  } catch (err) {
    console.error(err);
    noResults.style.display = 'block';
    noResults.textContent = "Fehler beim Laden der Autos.";
  }
}

// Event Listener
function attachEventListeners() {
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (priceFilter) {
    priceFilter.addEventListener('change', applyFilters);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
  }
}

// Filter anwenden
function applyFilters() {
  const searchTerm = (searchInput.value || "").toLowerCase();
  const maxPrice = priceFilter.value ? parseInt(priceFilter.value) : Infinity;

  filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm);
    const carPriceNumber = parseInt((car.price || '').replace(/[^0-9]/g, '')) || 0;
    const matchesPrice = carPriceNumber <= maxPrice;
    return matchesSearch && matchesPrice;
  });

  renderCars(filteredCars);
  updateNoResults();
}

// Filter zurücksetzen
function resetFilters() {
  if (searchInput) searchInput.value = '';
  if (priceFilter) priceFilter.value = '';
  filteredCars = [...cars];
  renderCars(filteredCars);
  updateNoResults();
}

// Autos rendern
function renderCars(carsToRender) {
  carsContainer.innerHTML = '';

  if (!carsToRender || carsToRender.length === 0) {
    return;
  }

  carsToRender.forEach((car, index) => {
    const carCard = createCarCard(car, index);
    carsContainer.appendChild(carCard);
  });
}

// Autokarte erstellen
function createCarCard(car, idx) {
  const div = document.createElement('div');
  div.className = 'col-md-6 col-lg-4 mb-4';

  const carouselId = `carousel-${idx}-${(car.name || '').replace(/[^a-z0-9]/gi, '-')}`;
  const images = Array.isArray(car.images) ? car.images : [];
  let carouselHTML = '';

  if (images.length === 1) {
    carouselHTML = `
      <img 
        src="${images[0]}" 
        alt="${car.name}" 
        class="card-img-top" 
        onerror="this.src='https://via.placeholder.com/400x300?text=Kein+Bild'">
    `;
  } else if (images.length > 1) {
    const indicatorsHTML = images
      .map((_, index) => `
        <button type="button" 
                data-bs-target="#${carouselId}" 
                data-bs-slide-to="${index}" 
                class="${index === 0 ? 'active' : ''}" 
                aria-current="${index === 0 ? 'true' : 'false'}"></button>
      `)
      .join('');

    const slidesHTML = images
      .map((image, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
          <img 
            src="${image}" 
            alt="${car.name}" 
            class="d-block w-100" 
            onerror="this.src='https://via.placeholder.com/400x300?text=Kein+Bild'">
        </div>
      `)
      .join('');

    carouselHTML = `
      <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          ${indicatorsHTML}
        </div>
        <div class="carousel-inner">
          ${slidesHTML}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
    `;
  } else {
    carouselHTML = `
      <img 
        src="https://via.placeholder.com/400x300?text=Kein+Bild" 
        alt="${car.name}" 
        class="card-img-top">
    `;
  }

  div.innerHTML = `
    <div class="card car-card h-100">
      <div class="car-images">
        ${carouselHTML}
      </div>
      <div class="card-body">
        <h5 class="card-title">${car.name}</h5>
        <div class="car-meta mb-2">
          ${car.year ? `<span class="badge bg-primary">${car.year}</span>` : ''}
          ${car.price ? `<span class="badge bg-success">${car.price}</span>` : ''}
        </div>
        <p class="card-text">${car.description || ''}</p>
        <div class="car-images-count">
          <small class="text-muted">
            ${images.length} ${images.length === 1 ? 'Bild' : 'Bilder'}
          </small>
        </div>
      </div>
      <div class="card-footer bg-light">
        <button class="btn btn-primary w-100" disabled>Mehr erfahren</button>
      </div>
    </div>
  `;

  return div;
}

// Keine Ergebnisse anzeigen
function updateNoResults() {
  if (!noResults) return;
  noResults.style.display = filteredCars.length === 0 ? 'block' : 'none';
}

// Start
init();
