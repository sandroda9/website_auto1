# Website Auto1 🚗

Eine moderne One-Page Website für Occasionsautos mit Bootstrap 5.

## Features

- ✨ **Responsive Design** - Funktioniert auf allen Geräten
- 🚗 **Occasionsautos Katalog** - Zeige bis zu 10 Autos mit mehreren Bildern pro Auto
- 🔍 **Suchfunktion** - Filtere Autos nach Modellname
- 💰 **Preisfilter** - Filtere nach Preiskategorien
- 🖼️ **Bilder-Karussell** - Automatisches Karussell für mehrere Bilder pro Auto
- 📱 **Mobile Optimiert** - Perfekt auf Smartphone, Tablet und Desktop

## Projektstruktur

```
website_auto1/
├── index.html                 # Startseite (One-Pager)
├── src/
│   ├── css/
│   │   ├── style.css         # Globale Styles
│   │   └── cars.css          # Auto-Seite Styles
│   ├── js/
│   │   ├── script.js         # Globale JavaScript
│   │   └── cars.js           # Auto-Seite JavaScript (ES6 Module)
│   ├── data/
│   │   └── cars.js           # Autodaten (10 Beispielautos)
│   ├── images/               # Bildordner
│   └── pages/
│       └── cars.html         # Occasionsautos Seite
└── README.md
```

## Verwendete Technologien

- **HTML5** - Semantisches Markup
- **CSS3** - Modern mit Animationen und Übergängen
- **JavaScript ES6** - Module für Datenverwaltung
- **Bootstrap 5** - Responsive Framework (CDN)

## Lokale Entwicklung

### Webserver starten

```bash
# Python 3
python3 -m http.server 8000

# Node.js (falls installiert)
npx http-server
```

Dann öffne: `http://localhost:8000`

## GitHub Pages Deployment

### Automatisches Deployment aktivieren

1. Gehe zu deinem Repository auf GitHub
2. Gehe zu **Settings** → **Pages**
3. Wähle unter "Source" → **Deploy from a branch**
4. Wähle Branch: **main** und Ordner: **/(root)**
5. Klicke **Save**

Die Website wird dann automatisch unter folgender URL verfügbar sein:
```
https://sandroda9.github.io/website_auto1
```

### Automatisches Deployment mit GitHub Actions

Dieses Repository enthält bereits eine GitHub Actions Workflow-Datei (`.github/workflows/deploy.yml`), die automatisch beim Push zu `main` deployed.

## Autodaten hinzufügen/ändern

Die Autodaten sind in `src/data/cars.js` gespeichert. Jedes Auto hat folgende Struktur:

```javascript
{
    id: 1,
    name: "Automodell",
    year: 2020,
    price: "€28.500",
    description: "Beschreibung des Autos",
    images: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
    ]
}
```

- **images**: Array mit beliebig vielen URLs
- Wenn 1 Bild: wird direkt angezeigt
- Wenn mehrere Bilder: automatisches Karaussell

## Anpassungen vornehmen

### Farben ändern
Bearbeite die CSS-Variablen in `src/css/style.css`:
```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --dark-color: #212529;
}
```

### Texte ändern
- **Startseite**: `index.html`
- **Auto-Seite**: `src/pages/cars.html`
- **Autodaten**: `src/data/cars.js`

## Browser Kompatibilität

- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- Mobile Browser

## Lizenz

MIT License - Frei verwendbar für private und kommerzielle Projekte.

## Kontakt

Für Fragen oder Probleme, erstelle bitte ein Issue auf GitHub.
