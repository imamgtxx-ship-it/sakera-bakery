"use client";
import { useState, useEffect } from "react";
import { db, Produk, Penjualan } from "@/lib/storage";

export default function PenjualanPage() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [hargaCustom, setHargaCustom] = useState<{ [key: number]: number }>({});
  const [editHargaId, setEditHargaId] = useState<number | null>(null);
  const [editHargaVal, setEditHargaVal] = useState("");

  const [modeEdit, setModeEdit] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProdukId, setEditProdukId] = useState<number | null>(null);
  const [formProduk, setFormProduk] = useState({ name: "", category: "", price: "" });

  useEffect(() => {
    setProduk(db.produk.all());
  }, []);

  function reloadProduk() {
    setProduk(db.produk.all());
  }

  const filtered = produk.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function hargaAktif(p: Produk): number {
    return hargaCustom[p.id] !== undefined ? hargaCustom[p.id] : p.price;
  }

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = produk.find((x) => x.id === Number(id));
    if (!p) return sum;
    return sum + hargaAktif(p) * qty;
  }, 0);

  const totalItem = Object.values(cart).reduce((s, q) => s + q, 0);

  function tambah(id: number) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  function kurang(id: number) {
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  }

  function mulaiEditHarga(p: Produk) {
    setEditHargaId(p.id);
    setEditHargaVal(String(hargaAktif(p)));
  }

  function simpanHarga(id: number) {
    const val = Number(editHargaVal);
    if (isNaN(val) || val < 0) return;
    setHargaCustom((h) => ({ ...h, [id]: val }));
    setEditHargaId(null);
  }

  function resetHarga(id: number) {
    setHargaCustom((h) => {
      const next = { ...h };
      delete next[id];
      return next;
    });
  }

  function bukaTambah() {
    setEditProdukId(null);
    setFormProduk({ name: "", category: "", price: "" });
    setShowForm(true);
  }

  function bukaEdit(p: Produk) {
    setEditProdukId(p.id);
    setFormProduk({ name: p.name, category: p.category, price: String(p.price) });
    setShowForm(true);
  }

  function simpanProduk() {
    if (!formProduk.name || !formProduk.price) return;
    const price = Number(formProduk.price);
    if (isNaN(price) || price < 0) return;

    if (editProdukId !== null) {
      const next = produk.map((p) =>
        p.id === editProdukId ? { ...p, name: formProduk.name, category: formProduk.category || "Lainnya", price } : p
      );
      setProduk(next);
      db.produk.save(next);
      setToast("Produk berhasil diperbarui.");
    } else {
      const nextId = produk.length > 0 ? Math.max(...produk.map((p) => p.id)) + 1 : 1;
      const next = [...produk, { id: nextId, name: formProduk.name, category: formProduk.category || "Lainnya", price }];
      setProduk(next);
      db.produk.save(next);
      setToast("Produk baru berhasil ditambahkan.");
    }
    setShowForm(false);
    setFormProduk({ name: "", category: "", price: "" });
    setEditProdukId(null);
    setTimeout(() => setToast(null), 3000);
  }

  function hapusProduk(id: number) {
    if (!confirm("Hapus produk ini? Transaksi lama tetap tersimpan.")) return;
    const next = produk.filter((p) => p.id !== id);
    setProduk(next);
    db.produk.save(next);
    setCart((c) => {
      const cp = { ...c };
      delete cp[id];
      return cp;
    });
  }

  function resetProdukDefault() {
    if (!confirm("Reset semua produk ke daftar awal? Perubahan akan hilang.")) return;
    db.produk.resetDefault();
    reloadProduk();
    setToast("Produk berhasil direset ke default.");
    setTimeout(() => setToast(null), 3000);
  }

  function simpanTransaksi() {
    if (totalItem === 0) return;
    const existing = db.penjualan.all();
    const tanggal = new Date().toISOString().slice(0, 10);
    const nextIdVal = existing.length > 0 ? Math.max(...existing.map((d) => d.id)) + 1 : 1;

    const itemsBaru: Penjualan[] = Object.entries(cart).map(([id, qty], i) => {
      const p = produk.find((x) => x.id === Number(id))!;
      const harga = hargaAktif(p);
      return {
        id: nextIdVal + i,
        tanggal,
        produk: p.name,
        qty,
        harga,
        total: harga * qty,
      };
    });

    db.penjualan.save([...existing, ...itemsBaru]);
    setCart({});
    setHargaCustom({});
    setToast("Transaksi berhasil disimpan ke Database!");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Penjualan</h1>
          <p className="text-slate-500 mt-1">Pilih produk untuk dicatat</p>
        </div>
        <button
          onClick={() => {
            setModeEdit(!modeEdit);
            setShowForm(false);
            setEditHargaId(null);
          }}
          className={
            "text-sm px-4 py-2 rounded-lg font-medium transition " +
            (modeEdit
              ? "bg-slate-800 text-white hover:bg-slate-900"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50")
          }
        >
          {modeEdit ? "✓ Selesai Edit" : "⚙ Mode Edit"}
        </button>
      </div>

      {toast && (
        <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
          ✓ {toast}
        </div>
      )}

      {modeEdit && (
        <div className="mb-5 p-4 rounded-xl border border-slate-300 bg-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-700">
            <b>Mode Edit aktif.</b> Kamu bisa ubah, tambah, atau hapus produk.
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetProdukDefault}
              className="text-sm px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium"
            >
              Reset Produk
            </button>
            <button
              onClick={bukaTambah}
              className="text-sm px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-medium"
            >
              + Tambah Produk
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-5 p-5 rounded-xl border border-amber-200 bg-amber-50">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">
            {editProdukId !== null ? "Edit Produk" : "Tambah Produk Baru"}
          </h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Nama produk"
              value={formProduk.name}
              onChange={(e) => setFormProduk({ ...formProduk, name: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Kategori"
              value={formProduk.category}
              onChange={(e) => setFormProduk({ ...formProduk, category: e.target.value })}
              className="w-full md:w-48 px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="number"
              placeholder="Harga"
              value={formProduk.price}
              onChange={(e) => setFormProduk({ ...formProduk, price: e.target.value })}
              className="w-full md:w-40 px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={simpanProduk}
              className="bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-emerald-600 whitespace-nowrap"
            >
              Simpan
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-300 whitespace-nowrap"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <div className="text-5xl mb-3">🍞</div>
              <div className="text-sm">Belum ada produk</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((p) => {
                const harga = hargaAktif(p);
                const isCustom = hargaCustom[p.id] !== undefined;
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.category}</div>
                      </div>
                      <button
                        onClick={() => tambah(p.id)}
                        className="w-9 h-9 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600"
                      >
                        +1
                      </button>
                    </div>

                    {editHargaId === p.id ? (
                      <div className="flex gap-2 items-center mt-2">
                        <span className="text-xs text-slate-500">Rp</span>
                        <input
                          type="number"
                          value={editHargaVal}
                          onChange={(e) => setEditHargaVal(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm rounded border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          autoFocus
                        />
                        <button onClick={() => simpanHarga(p.id)} className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200">✓</button>
                        <button onClick={() => setEditHargaId(null)} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className={"text-sm font-semibold " + (isCustom ? "text-emerald-600" : "text-amber-600")}>
                          Rp {harga.toLocaleString("id-ID")}
                          {isCustom && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">custom</span>}
                        </div>
                        {modeEdit && (
                          <>
                            <button
                              onClick={() => mulaiEditHarga(p)}
                              className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              Harga
                            </button>
                            {isCustom && (
                              <button
                                onClick={() => resetHarga(p.id)}
                                className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                              >
                                Reset
                              </button>
                            )}
                            <button
                              onClick={() => bukaEdit(p)}
                              className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => hapusProduk(p.id)}
                              className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit sticky top-8">
          <h2 className="font-semibold text-slate-800 mb-4">Keranjang ({totalItem})</h2>
          {totalItem === 0 ? (
            <p className="text-sm text-slate-400">Belum ada item</p>
          ) : (
            <div className="space-y-3 mb-4">
              {Object.entries(cart).map(([id, qty]) => {
                const p = produk.find((x) => x.id === Number(id));
                if (!p) return null;
                const harga = hargaAktif(p);
                return (
                  <div key={id} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        {qty} x Rp {harga.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => kurang(p.id)} className="w-6 h-6 rounded bg-slate-100 text-slate-600 font-bold">-</button>
                      <span className="w-6 text-center">{qty}</span>
                      <button onClick={() => tambah(p.id)} className="w-6 h-6 rounded bg-amber-500 text-white font-bold">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Total</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
            <button
              onClick={simpanTransaksi}
              disabled={totalItem === 0}
              className="w-full mt-4 bg-amber-500 text-white font-semibold py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simpan Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
