// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "webseiteauto1.firebaseapp.com",
  projectId: "webseiteauto1",
  storageBucket: "webseiteauto1.appspot.com",
  messagingSenderId: "DEIN_MESSAGING_ID",
  appId: "DEIN_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("addCarForm").style.display = "block";
    loadCars();
  } catch (err) {
    alert("Fehler: " + err.message);
  }
});

// Autos laden
async function loadCars() {
  const carList = document.getElementById("carList");
  carList.innerHTML = "";
  const snapshot = await db.collection("cars").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${data.name}</h3>
      <p>${data.description}</p>
      <p>Jahr: ${data.year} | Preis: ${data.price}</p>
      <div>${data.images ? data.images.map(url => `<img src="${url}" width="100">`).join(" ") : ""}</div>
      <button onclick="deleteCar('${doc.id}')">Löschen</button>
    `;
    carList.appendChild(div);
  });
}

// Auto löschen
async function deleteCar(id) {
  if (confirm("Willst du dieses Auto wirklich löschen?")) {
    await db.collection("cars").doc(id).delete();
    loadCars();
  }
}

// Auto hinzufügen
document.getElementById("addCarForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("carName").value;
  const description = document.getElementById("carDescription").value;
  const year = parseInt(document.getElementById("carYear").value);
  const price = document.getElementById("carPrice").value;

  const files = document.getElementById("carImages").files;
  const imageUrls = [];

  for (const file of files) {
    const storageRef = storage.ref('cars/' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    imageUrls.push(url);
  }

  await db.collection("cars").add({ name, description, year, price, images: imageUrls });
  document.getElementById("addCarForm").reset();
  loadCars();
});
