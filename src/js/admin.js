// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "webseiteauto1.firebaseapp.com",
  projectId: "webseiteauto1",
  storageBucket: "webseiteauto1.appspot.com",
  messagingSenderId: "DEINE_ID",
  appId: "DEIN_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// --- Login ---
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('loginDiv').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
      loadCars();
    })
    .catch(err => alert(err.message));
});

// --- Auto hinzufügen ---
document.getElementById('addCarBtn').addEventListener('click', async () => {
  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  const year = document.getElementById('year').value;
  const files = document.getElementById('images').files;

  const imageUrls = [];

  for (let file of files) {
    const storageRef = storage.ref('cars/' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    imageUrls.push(url);
  }

  db.collection('cars').add({
    name,
    description,
    price,
    year,
    images: imageUrls
  })
  .then(() => {
    alert('Auto hinzugefügt!');
    loadCars();
  })
  .catch(err => alert(err.message));
});

// --- Autos anzeigen ---
function loadCars() {
  const carsList = document.getElementById('carsList');
  carsList.innerHTML = '';

  db.collection('cars').onSnapshot(snapshot => {
    carsList.innerHTML = '';
    snapshot.forEach(doc => {
      const car = doc.data();
      const div = document.createElement('div');
      div.innerHTML = `
        <h3>${car.name}</h3>
        <p>${car.description}</p>
        <p>${car.price} € - ${car.year}</p>
        <button onclick="deleteCar('${doc.id}')">Löschen</button>
      `;
      carsList.appendChild(div);
    });
  });
}

// --- Auto löschen ---
function deleteCar(id) {
  db.collection('cars').doc(id).delete();
}
