// Loader for Decap CMS JSON files
export async function loadCars() {
  try {
    const manifestResp = await fetch('./cars/index.json');
    if (!manifestResp.ok) return [];
    const files = await manifestResp.json();

    const promises = files.map(filename => fetch(`./cars/${filename}`).then(r => r.json()));
    const data = await Promise.all(promises);

    return data;
  } catch (e) {
    console.error('Failed to load cars:', e);
    return [];
  }
}
