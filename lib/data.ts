export const products = [
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

export const salesData: { day: string; value: number }[] = [];

export const belanjaData: { id: number; tanggal: string; supplier: string; item: string; qty: number; satuan: string; harga: number; status: string }[] = [];

export const stokData: { id: number; nama: string; qty: number; satuan: string; min: number; status: string }[] = [];

export const belanjaScanData: { id: number; tanggal: string; toko: string; items: string[]; total: number; status: string }[] = [];
