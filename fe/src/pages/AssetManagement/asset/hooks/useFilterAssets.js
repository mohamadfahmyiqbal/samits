// src/comp/asset/hooks/useFilterAssets.js

export function filterAssets(
  data,
  mainTab,
  subTab,
  search,
  searchYear,
  subTabConfig = {}
) {
  // Pastikan data adalah array agar aman dari crash
  const sourceData = Array.isArray(data) ? data : [];

  return sourceData.filter((item) => {
    // 🔑 PENGAMANAN: Pastikan item.type didefinisikan sebagai string
    const assetType = item.type || "";
    const lowerAssetType = assetType.toLowerCase();

    // 1. Main tab match (Custom Grouping Logic)
    let matchMain = mainTab === "All";
    if (!matchMain) {
      const validTypes = subTabConfig[mainTab] || [];

      // Ambil hanya tipe aset yang sebenarnya (filter keluar label "All")
      const typesToFilter = validTypes.filter((t) => t !== "All");

      // Cek apakah type aset yang sedang di-filter ada di dalam daftar tipe grup ini
      matchMain = typesToFilter.includes(assetType);
    }

    // 2. Sub tab (Dropdown) match
    // Jika subTab bukan "All", aset harus memiliki type yang sama persis
    const matchSub = subTab === "All" ? true : assetType === subTab;

    // 3. Search match
    const s = search ? search.toLowerCase() : "";
    const matchSearch =
      !s ||
      (item.noAsset && item.noAsset.toLowerCase().includes(s)) ||
      lowerAssetType.includes(s) ||
      (item.nama && item.nama.toLowerCase().includes(s)) ||
      (item.hostname && item.hostname.toLowerCase().includes(s));

    // 4. Year match
    const matchYear = !searchYear || String(item.tahunBeli || "") === String(searchYear);

    // Aset harus lolos semua kriteria
    return matchMain && matchSub && matchSearch && matchYear;
  });
}
