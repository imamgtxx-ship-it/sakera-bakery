export type Penjualan = { id: number; tanggal: string; produk: string; qty: number; harga: number; total: number };
export type Belanja = {
  id: number;
  tanggal: string;
  toko: string;
  item: string;
  brand: string;
  qty: number;
  satuan: string;
  total: number;
  sudahMasukStok: boolean;
};
export type Stok = { id: number; nama: string; qty: number; satuan: string; min: number; status: string };
export type ScanItem = { nama: string; brand: string; qty: number; satuan: string; harga: number };
export type Scan = { id: number; tanggal: string; toko: string; items: ScanItem[]; total: number; status: string };
export type Produksi = { id: number; tanggal: string; bahan: string; qty: number; satuan: string };
export type Produk = { id: number; name: string; category: string; price: number };

export const MASTER_STOK = [
  "Tepung Terigu",
  "Tepung Maizena",
  "Gula Pasir",
  "Gula Halus",
  "Mentega",
  "Margarin",
  "Telur Ayam",
  "Susu Bubuk",
  "Susu Cair",
  "Ragi",
  "Baking Powder",
  "Baking Soda",
  "Coklat Bubuk",
  "Coklat Compound",
  "Keju Cheddar",
  "Krimer",
  "Vanili",
  "Garam",
];

export const SEED_PRODUK: Produk[] = [
  { id: 1, name: "Roti Tawar", category: "Roti & Bread", price: 6500 },
  { id: 2, name: "Roti Coklat", category: "Roti & Bread", price: 7500 },
  { id: 3, name: "Roti Keju", category: "Roti & Bread", price: 7500 },
  { id: 4, name: "Roti Sosis", category: "Roti & Bread", price: 7500 },
  { id: 5, name: "Roti Abon", category: "Roti & Bread", price: 7500 },
  { id: 6, name: "Roti Isi Ayam", category: "Roti & Bread", price: 7500 },
  { id: 7, name: "Roti Isi Sapi", category: "Roti & Bread", price: 7500 },
  { id: 8, name: "Roti Manis", category: "Roti & Bread", price: 5500 },
  { id: 9, name: "Salt Bread Original", category: "Salt Bread", price: 7500 },
  { id: 10, name: "Salt Bread Coklat", category: "Salt Bread", price: 8500 },
  { id: 11, name: "Salt Bread Keju", category: "Salt Bread", price: 8500 },
  { id: 12, name: "Salt Bread Matcha", category: "Salt Bread", price: 8500 },
  { id: 13, name: "Choco Chips", category: "Cookies", price: 8500 },
  { id: 14, name: "Double Choco", category: "Cookies", price: 8500 },
  { id: 15, name: "Red Velvet", category: "Cookies", price: 8500 },
  { id: 16, name: "Oatmeal Raisin", category: "Cookies", price: 8500 },
  { id: 17, name: "Almond", category: "Cookies", price: 8500 },
  { id: 18, name: "Mix Cookies", category: "Cookies", price: 8500 },
  { id: 19, name: "Croissant Mini", category: "Croissant", price: 7500 },
  { id: 20, name: "Croissant Jumbo", category: "Croissant", price: 13500 },
  { id: 21, name: "Roti O", category: "Roti O", price: 8500 },
  { id: 22, name: "Dunkin", category: "Dunkin", price: 9500 },
  { id: 23, name: "Can Pao", category: "Can Pao", price: 9500 },
  { id: 24, name: "Dennis Coklat", category: "Dennis", price: 8500 },
  { id: 25, name: "Cinnamon Roll", category: "Cinnamon Roll", price: 9500 },
  { id: 26, name: "Crofel Mini", category: "Crofel", price: 7500 },
  { id: 27, name: "Crofel Jumbo", category: "Crofel", price: 12500 },
  { id: 28, name: "Sakera Volcano", category: "Menu Spesial", price: 12500 },
  { id: 29, name: "Sakera Crunch", category: "Menu Spesial", price: 12500 },
  { id: 30, name: "Sakera Choco Pull", category: "Menu Spesial", price: 12500 },
  { id: 31, name: "Sakera Cheese Pull", category: "Menu Spesial", price: 12500 },
  { id: 32, name: "Sakera Brulee", category: "Menu Spesial", price: 12500 },
];

const KEYS = {
  penjualan: "sakera_penjualan",
  belanja: "sakera_belanja",
  stok: "sakera_stok",
  scan: "sakera_scan",
  produksi: "sakera_produksi",
  produk: "sakera_produk",
  produkInitialized: "sakera_produk_initialized",
};

function get<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function getProduk(): Produk[] {
  if (typeof window === "undefined") return [];
  const initialized = localStorage.getItem(KEYS.produkInitialized);
  if (!initialized) {
    localStorage.setItem(KEYS.produk, JSON.stringify(SEED_PRODUK));
    localStorage.setItem(KEYS.produkInitialized, "1");
    return SEED_PRODUK;
  }
  return get<Produk>(KEYS.produk);
}

export const db = {
  penjualan: {
    all: () => get<Penjualan>(KEYS.penjualan),
    save: (d: Penjualan[]) => set(KEYS.penjualan, d),
  },
  belanja: {
    all: () => get<Belanja>(KEYS.belanja),
    save: (d: Belanja[]) => set(KEYS.belanja, d),
  },
  stok: {
    all: () => get<Stok>(KEYS.stok),
    save: (d: Stok[]) => set(KEYS.stok, d),
  },
  scan: {
    all: () => get<Scan>(KEYS.scan),
    save: (d: Scan[]) => set(KEYS.scan, d),
  },
  produksi: {
    all: () => get<Produksi>(KEYS.produksi),
    save: (d: Produksi[]) => set(KEYS.produksi, d),
  },
  produk: {
    all: getProduk,
    save: (d: Produk[]) => set(KEYS.produk, d),
    resetDefault: () => {
      set(KEYS.produk, SEED_PRODUK);
      localStorage.setItem(KEYS.produk_initialized, "1");
    },
  },
};
