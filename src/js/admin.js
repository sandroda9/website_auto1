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
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDuu5uniSbFQ5JErWWoQrsyHAoI1XlkaWA",
  authDomain: "webseiteauto1.firebaseapp.com",
  projectId: "webseiteauto1",
  storageBucket: "webseiteauto1.firebasestorage.app", // ✅ richtiger Bucket
  messagingSenderId: "156599830482",
  appId: "1:156599830482:web:9bc6a34adfa174c58b6a0b"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM-Elemente
const loginSection = document.getElementById("loginSection");
const panelSection = document.getElementById("panelSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginMsg = document.getElementById("loginMsg");
const addCarBtn = document.getElementById("addCarBtn");
const carList = document.getElementById("carList");
const imageInput = document.getElementById("carImages");

// Auth-Zustand beobachten (Seite neu laden etc.)
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    panelSection.style.display = "block";
    loadCars();
  } else {
    panelSection.style.display = "none";
    loginSection.style.display = "block";
  }
});

// LOGIN
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  loginMsg.textContent = "";

  if (!email || !password) {
    loginMsg.textContent = "Bitte E-Mail und Passwort eingeben.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged kümmert sich um UI
  } catch (err) {
    console.error(err);
    loginMsg.textContent = err.message;
  }
});

// LOGOUT
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// AUTO HINZUFÜGEN (mit Upload zu Firebase Storage)
addCarBtn.addEventListener("click", async () => {
  const name = document.getElementById("carName").value.trim();
  const year = document.getElementById("carYear").value.trim();
  const price = document.getElementById("carPrice").value.trim();
  const description = document.getElementById("carDescription").value.trim();
  const files = imageInput.files;

  if (!name || !year || !price) {
    alert("Bitte Titel, Jahr und Preis eingeben.");
    return;
  }

  if (!files || files.length === 0) {
    alert("Bitte mindestens ein Bild auswählen.");
    return;
  }

  if (files.length > 6) {
    alert("Maximal 6 Bilder erlaubt.");
    return;
  }

  try {
    // Dokument-Referenz vorab erzeugen
    const carDocRef = doc(collection(db, "cars"));

    // Bilder hochladen
    const imageUrls = [];

    for (const file of files) {
      const safeFileName = file.name.replace(/\s+/g, "-");
      const filePath = `cars/${carDocRef.id}/${Date.now()}-${safeFileName}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    }

    // Dokument in Firestore speichern
    await setDoc(carDocRef, {
      name,
      year,
      price,
      description,
      images: imageUrls
    });

    // Felder leeren
    document.getElementById("carName").value = "";
    document.getElementById("carYear").value = "";
    document.getElementById("carPrice").value = "";
    document.getElementById("carDescription").value = "";
    imageInput.value = "";

    await loadCars();
  } catch (err) {
    console.error(err);
    alert("Fehler beim Speichern: " + err.message);
  }
});

// LISTE LADEN
async function loadCars() {
  carList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "cars"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const li = document.createElement("li");
    li.classList.add("list-group-item");

    const imagesHtml =
      data.images && data.images.length > 0
        ? data.images
            .map(
              (url) =>
                `<img src="${url}" width="100" class="me-2 mt-2" onerror="this.src='https://placehold.co/150x100?text=Bild+fehlt'">`
            )
            .join("")
        : "<span class='text-muted'>Kein Bild</span>";

    li.innerHTML = `
      <div class="d-flex flex-column">
        <div>
          <strong>${data.name || ""}</strong> 
          ${data.year ? `(${data.year})` : ""} 
          - ${data.price || ""}<br>
          ${data.description || ""}
        </div>
        <div class="mt-2">
          ${imagesHtml}
        </div>
        <div class="mt-2">
          <button class="btn btn-sm btn-danger">Löschen</button>
        </div>
      </div>
    `;

    li.querySelector("button").addEventListener("click", async () => {
      if (confirm("Dieses Auto wirklich löschen? (Bilder im Storage bleiben vorerst bestehen)")) {
        await deleteDoc(doc(db, "cars", docSnap.id));
        await loadCars();
      }
    });

    carList.appendChild(li);
  });
}
