// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

// Firebase Config — korrekt für dein Projekt
const firebaseConfig = {
  apiKey: "AIzaSyDuu5uniSbFQ5JErWWoQrsyHAoI1XlkaWA",
  authDomain: "webseiteauto1.firebaseapp.com",
  projectId: "webseiteauto1",
  storageBucket: "webseiteauto1.firebasestorage.app", // <-- ABSOLUT RICHTIG
  messagingSenderId: "156599830482",
  appId: "1:156599830482:web:9bc6a34adfa174c58b6a0b"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM
const loginSection = document.getElementById("loginSection");
const panelSection = document.getElementById("panelSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginMsg = document.getElementById("loginMsg");
const addCarBtn = document.getElementById("addCarBtn");
const carList = document.getElementById("carList");
const imageInput = document.getElementById("carImages");

// === AUTH UI SWITCH ===
onAuthStateChanged(auth, (user) => {
  console.log("[AuthStateChanged] user:", user ? user.email : "N/A");

  if (user) {
    loginSection.style.display = "none";
    panelSection.style.display = "block";
    loadCars();
  } else {
    panelSection.style.display = "none";
    loginSection.style.display = "block";
  }
});

// === LOGIN ===
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  loginMsg.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("[LoginError]", err);
    loginMsg.textContent = err.message;
  }
});

// === LOGOUT ===
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// === AUTO HINZUFÜGEN ===
addCarBtn.addEventListener("click", async () => {
  const name = document.getElementById("carName").value.trim();
  const year = document.getElementById("carYear").value.trim();
  const price = document.getElementById("carPrice").value.trim();
  const description = document.getElementById("carDescription").value.trim();
  const files = imageInput.files;

  if (!name || !year || !price) return alert("Bitte Titel, Jahr und Preis eingeben.");
  if (!files || files.length === 0) return alert("Bitte mindestens ein Bild auswählen.");
  if (files.length > 6) return alert("Maximal 6 Bilder erlaubt.");

  try {
    const carDocRef = doc(collection(db, "cars"));
    console.log("[addCar] Neue Doc-ID:", carDocRef.id);

    const imageUrls = [];

    for (const file of files) {
      const safeFileName = file.name.replace(/\s+/g, "-");
      const filePath = `cars/${carDocRef.id}/${Date.now()}-${safeFileName}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    }

    await setDoc(carDocRef, {
      name,
      year,
      price,
      description,
      images: imageUrls,
      createdAt: new Date().toISOString()
    });

    document.getElementById("carName").value = "";
    document.getElementById("carYear").value = "";
    document.getElementById("carPrice").value = "";
    document.getElementById("carDescription").value = "";
    imageInput.value = "";

    await loadCars();
  } catch (err) {
    console.error("[addCar ERROR]", err);
    alert("Fehler beim Speichern: " + err.message);
  }
});

// === AUTOS LADEN ===
async function loadCars() {
  carList.innerHTML = "<li class='list-group-item text-muted'>Lade Autos...</li>";

  try {
    const querySnapshot = await getDocs(collection(db, "cars"));
    carList.innerHTML = "";

    if (querySnapshot.empty) {
      carList.innerHTML = "<li class='list-group-item text-muted'>Noch keine Autos erfasst.</li>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const images = Array.isArray(data.images)
        ? data.images.filter((u) => typeof u === "string")
        : [];

      const imagesHtml =
        images.length > 0
          ? images
              .map(
                (url) =>
                  `<img src="${url}" width="100" class="me-2 mt-2" onerror="this.src='https://placehold.co/150x100?text=fehlt'">`
              )
              .join("")
          : "<span class='text-muted'>Kein Bild</span>";

      const li = document.createElement("li");
      li.classList.add("list-group-item");

      li.innerHTML = `
        <div class="d-flex flex-column">
          <strong>${data.name}</strong> (${data.year}) - ${data.price}<br>
          ${data.description}<br>
          <div class="mt-2">${imagesHtml}</div>
          <button class="btn btn-danger btn-sm mt-3">Löschen</button>
        </div>
      `;

      // === AUTO + STORAGE-BILDER LÖSCHEN ===
      li.querySelector("button").addEventListener("click", async () => {
        if (!confirm("Dieses Auto wirklich löschen? (Alle Bilder im Storage werden gelöscht)")) return;

        const imgs = Array.isArray(data.images) ? data.images : [];

        console.log("[Delete] Start...");

        // 🔥 100% zuverlässige Pfad-Extraktion
        for (const imageUrl of imgs) {
          try {
            const encodedPath = imageUrl.split("/o/")[1].split("?")[0];
            const filePath = decodeURIComponent(encodedPath);

            console.log("[Delete] Lösche:", filePath);

            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);

            console.log("[Delete] OK:", filePath);
          } catch (err) {
            console.warn("[Delete] Fehler bei Bild:", imageUrl, err);
          }
        }

        // jetzt Firestore-Eintrag löschen
        await deleteDoc(doc(db, "cars", docSnap.id));

        await loadCars();
      });

      carList.appendChild(li);
    });
  } catch (err) {
    console.error("[loadCars ERROR]", err);
    carList.innerHTML = `<li class="list-group-item text-danger">Fehler: ${err.message}</li>`;
  }
}
