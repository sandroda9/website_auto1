import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Firebase Config
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const loginSection = document.getElementById("loginSection");
const panelSection = document.getElementById("panelSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginMsg = document.getElementById("loginMsg");
const addCarBtn = document.getElementById("addCarBtn");
const carList = document.getElementById("carList");

// LOGIN
loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginSection.style.display = "none";
        panelSection.style.display = "block";
        loadCars();
    } catch (err) {
        loginMsg.textContent = err.message;
    }
});

// LOGOUT
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    panelSection.style.display = "none";
    loginSection.style.display = "block";
});

// AUTO HINZUFÜGEN (mit Bild-URLs)
addCarBtn.addEventListener("click", async () => {
    const name = document.getElementById("carName").value;
    const year = document.getElementById("carYear").value;
    const price = document.getElementById("carPrice").value;
    const description = document.getElementById("carDescription").value;
    const imageUrlsRaw = document.getElementById("carImageUrls").value;

    const imageUrls = imageUrlsRaw
        .split(",")
        .map(url => url.trim())
        .filter(url => url !== "");

    if (!name || !year || !price) {
        alert("Bitte Titel, Jahr und Preis eingeben");
        return;
    }

    await addDoc(collection(db, "cars"), {
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
    document.getElementById("carImageUrls").value = "";

    loadCars();
});

// LISTE LADEN
async function loadCars() {
    carList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "cars"));

    querySnapshot.forEach(docSnap => {
        const data = docSnap.data();

        const li = document.createElement("li");
        li.classList.add("list-group-item");

        li.innerHTML = `
            <strong>${data.name}</strong> (${data.year}) - ${data.price} €<br>
            ${data.description}<br>
            ${
                data.images && data.images.length > 0
                ? data.images.map(url => `<img src="${url}" width="100" class="me-2 mt-2">`).join("")
                : "<span class='text-muted'>Kein Bild</span>"
            }
            <button class="btn btn-sm btn-danger float-end mt-2">Löschen</button>
        `;

        li.querySelector("button").addEventListener("click", async () => {
            await deleteDoc(doc(db, "cars", docSnap.id));
            loadCars();
        });

        carList.appendChild(li);
    });
}
