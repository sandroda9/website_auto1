import { loadCars } from '../data/cars.js';

// DOM Elements
const carsContainer = document.getElementById('carsContainer');
const searchInput = document.getElementById('searchInput');
const priceFilter = document.getElementById('priceFilter');
const resetBtn = document.getElementById('resetBtn');
const noResults = document.getElementById('noResults');

let cars = [];
let filteredCars = [];

// Initialisiere die Seite nach Datenladen
async function init() {
  cars = await loadCars();
  filteredCars = [...cars];
  renderCars(filteredCars);
  attachEventListeners();
}

// Event Listener
function attachEventListeners() {
  searchInput.addEventListener('input', applyFilters);
  priceFilter.addEventListener('change', applyFilters);
  resetBtn.addEventListener('click', resetFilters);
}

// Filter anwenden
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const maxPrice = priceFilter.value ? parseInt(priceFilter.value) : Infinity;

  filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm);
    const carPrice = parseInt((car.price || '').replace(/[^0-9]/g, '')) || 0;
    const matchesPrice = carPrice <= maxPrice;
    return matchesSearch && matchesPrice;
  });

  renderCars(filteredCars);
  updateNoResults();
}

// Filter zurücksetzen
function resetFilters() {
  searchInput.value = '';
  priceFilter.value = '';
  filteredCars = [...cars];
  renderCars(filteredCars);
  noResults.style.display = 'none';
}

// Autos rendern
function renderCars(carsToRender) {
  carsContainer.innerHTML = '';

  carsToRender.forEach((car, index) => {
    const carCard = createCarCard(car, index);
    carsContainer.appendChild(carCard);
  });
}

// Autokarte erstellen
function createCarCard(car, idx) {
  const div = document.createElement('div');
  div.className = 'col-md-6 col-lg-4';

  // Bilder-Karussell
  const carouselId = `carousel-${idx}-${(car.name || '').replace(/[^a-z0-9]/gi, '-')}`;
  let carouselHTML = '';

  const images = car.images || [];

  if (images.length === 1) {
    // Einzelnes Bild ohne Karussell
    carouselHTML = `<img src="${images[0]}" alt="${car.name}" class="card-img-top" onerror="this.src='https://via.placeholder.com/400x300?text=Kein+Bild'">`;
  } else if (images.length > 1) {
    // Karussell für mehrere Bilder
    const indicatorsHTML = images
      .map((_, index) => `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}" aria-current="${index === 0 ? 'true' : 'false'}"></button>`)
      .join('');

    const slidesHTML = images
      .map((image, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${image}" alt="${car.name}" class="d-block w-100" onerror="this.src='https://via.placeholder.com/400x300?text=Kein+Bild'">
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
    // Keine Bilder
    carouselHTML = `<img src="https://via.placeholder.com/400x300?text=Kein+Bild" alt="${car.name}" class="card-img-top">`;
  }

  div.innerHTML = `
        <div class="card car-card h-100">
            <div class="car-images">
                ${carouselHTML}
            </div>
            <div class="card-body">
                <h5 class="card-title">${car.name}</h5>
                <div class="car-meta mb-2">
                    <span class="badge bg-primary">${car.year || ''}</span>
                    <span class="badge bg-success">${car.price || ''}</span>
                </div>
                <p class="card-text">${car.description || ''}</p>
                <div class="car-images-count">
                    <small class="text-muted">${images.length} ${images.length === 1 ? 'Bild' : 'Bilder'}</small>
                </div>
            </div>
            <div class="card-footer bg-light">
                <button class="btn btn-primary w-100">Mehr erfahren</button>
            </div>
        </div>
    `;

  return div;
}

// Keine Ergebnisse anzeigen
function updateNoResults() {
  noResults.style.display = filteredCars.length === 0 ? 'block' : 'none';
}

// Starte die Anwendung
init();
