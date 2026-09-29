"use client";
import { useState, useRef, useMemo } from "react";
import { Belanja, Stok, MASTER_STOK, ScanItem } from "@/lib/storage";

type ScanResult = { toko: string; tanggal: string; items: ScanItem[]; total: number };

export default function TabBelanja({
  data,
  stok,
  onTambah,
  onEdit,
  onHapusStruk,
  onMasukStok,
  modeEdit,
}: {
  data: Belanja[];
  stok: Stok[];
  onTambah: (itemsBaru: Belanja[]) => void;
  onEdit: (id: number, patch: Partial<Belanja>) => void;
  onHapusStruk: (toko: string, tanggal: string) => void;
  onMasukStok: (belanja: Belanja) => void;
  modeEdit: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ item: "", brand: "", qty: "", satuan: "" });
  const [filterToko, setFilterToko] = useState("");
  const [search, setSearch] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    toko: "",
    item: "",
    brand: "",
    qty: "",
    satuan: "kg",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  function pilihFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function scan() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/scan", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal scan");

      const r: ScanResult = json.data;
      const existing = data;
      const baseId = existing.length > 0 ? Math.max(...existing.map((d) => d.id)) + 1 : 1;
      const tanggal = r.tanggal || new Date().toISOString().slice(0, 10);

      const itemsBelanja: Belanja[] = r.items.map((it, i) => ({
        id: baseId + i,
        tanggal,
        toko: r.toko,
        item: it.nama,
        brand: it.brand || "",
        qty: it.qty,
        satuan: it.satuan,
        total: it.harga,
        sudahMasukStok: false,
      }));

      onTambah(itemsBelanja);

      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      setToast(`${r.items.length} item berhasil discan.`);
      setTimeout(() => setToast(null), 5000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function submitManual() {
    if (!manualForm.toko || !manualForm.item || !manualForm.qty) return;
    const baseId = data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;
    const item: Belanja = {
      id: baseId,
      tanggal: manualForm.tanggal,
      toko: manualForm.toko,
      item: manualForm.item,
      brand: manualForm.brand,
      qty: Number(manualForm.qty),
      satuan: manualForm.satuan,
      total: 0,
      sudahMasukStok: false,
    };
    onTambah([item]);
    setManualForm({
      tanggal: new Date().toISOString().slice(0, 10),
      toko: "",
      item: "",
      brand: "",
      qty: "",
      satuan: "kg",
    });
    setShowManual(false);
    setToast("Item manual berhasil ditambahkan.");
    setTimeout(() => setToast(null), 3000);
  }

  function mulaiEdit(b: Belanja) {
    setEditId(b.id);
    setEditForm({ item: b.item, brand: b.brand, qty: String(b.qty), satuan: b.satuan });
  }

  function simpanEdit(id: number) {
    if (!editForm.item || !editForm.qty) return;
    onEdit(id, {
      item: editForm.item,
      brand: editForm.brand,
      qty: Number(editForm.qty),
      satuan: editForm.satuan,
    });
    setEditId(null);
  }

  const daftarToko = useMemo(() => {
    const set = new Set(data.map((b) => b.toko));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((b) => {
      if (filterToko && b.toko !== filterToko) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.item.toLowerCase().includes(q) && !b.brand.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, filterToko, search]);

  const strukMap = new Map<string, Belanja[]>();
  for (const b of filtered) {
    const key = `${b.toko}||${b.tanggal}`;
    if (!strukMap.has(key)) strukMap.set(key, []);
    strukMap.get(key)!.push(b);
  }

  return (
    <div>
      <div className="p-5 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Input Belanja</h3>

        {toast && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium">
            ✓ {toast}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3 items-stretch mb-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && pilihFile(e.target.files[0])}
          />
          <div
            onClick={() => inputRef.current?.click()}
            className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-amber-500 transition cursor-pointer bg-white flex items-center justify-center gap-3"
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-16 rounded" />
            ) : (
              <>
                <span className="text-2xl">📷</span>
                <span className="text-sm text-slate-600">Klik untuk pilih foto struk</span>
              </>
            )}
          </div>
          <button
            onClick={scan}
            disabled={!file || loading}
            className="bg-amber-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Scanning..." : "Scan Sekarang"}
          </button>
          <button
            onClick={() => setShowManual(!showManual)}
            className="bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-800 whitespace-nowrap"
          >
            {showManual ? "Tutup" : "+ Input Manual"}
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {showManual && (
          <div className="mt-3 p-4 rounded-lg border border-slate-300 bg-white">
            <h4 className="font-semibold text-slate-700 mb-3 text-sm">Input Manual</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <input
                type="date"
                value={manualForm.tanggal}
                onChange={(e) => setManualForm({ ...manualForm, tanggal: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                placeholder="Toko"
                value={manualForm.toko}
                onChange={(e) => setManualForm({ ...manualForm, toko: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                placeholder="Item"
                value={manualForm.item}
                onChange={(e) => setManualForm({ ...manualForm, item: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                placeholder="Brand (opsional)"
                value={manualForm.brand}
                onChange={(e) => setManualForm({ ...manualForm, brand: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                placeholder="Qty"
                value={manualForm.qty}
                onChange={(e) => setManualForm({ ...manualForm, qty: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <select
                value={manualForm.satuan}
                onChange={(e) => setManualForm({ ...manualForm, satuan: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="liter">liter</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowManual(false)}
                className="px-4 py-2 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={submitManual}
                disabled={!manualForm.toko || !manualForm.item || !manualForm.qty}
                className="px-4 py-2 rounded bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Cari item atau brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={filterToko}
            onChange={(e) => setFilterToko(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Semua Toko</option>
            {daftarToko.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {(search || filterToko) && (
            <button
              onClick={() => { setSearch(""); setFilterToko(""); }}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>
      )}

      <div>
        {data.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="text-5xl mb-3">🧾</div>
            <div className="text-sm">Belum ada data belanja.</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="text-5xl mb-3">🔍</div>
            <div className="text-sm">Tidak ada hasil yang cocok</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Tanggal</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Toko</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Item</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Brand</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-600">Qty</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Satuan</th>
                <th className="text-center px-6 py-3 font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(strukMap.entries()).map(([key, items]) => {
                const [toko, tanggal] = key.split("||");
                return items.map((b, idx) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                    {idx === 0 && (
                      <>
                        <td rowSpan={items.length} className="px-6 py-3 text-slate-600 align-top">{tanggal}</td>
                        <td rowSpan={items.length} className="px-6 py-3 text-slate-800 font-medium align-top">{toko}</td>
                      </>
                    )}
                    {editId === b.id ? (
                      <>
                        <td className="px-6 py-2">
                          <input
                            value={editForm.item}
                            onChange={(e) => setEditForm({ ...editForm, item: e.target.value })}
                            className="w-full px-3 py-1.5 rounded border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-6 py-2">
                          <input
                            value={editForm.brand}
                            onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                            placeholder="—"
                            className="w-full px-3 py-1.5 rounded border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-6 py-2 text-right">
                          <input
                            type="number"
                            value={editForm.qty}
                            onChange={(e) => setEditForm({ ...editForm, qty: e.target.value })}
                            className="w-20 px-3 py-1.5 rounded border border-amber-400 text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-6 py-2">
                          <select
                            value={editForm.satuan}
                            onChange={(e) => setEditForm({ ...editForm, satuan: e.target.value })}
                            className="px-3 py-1.5 rounded border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="liter">liter</option>
                            <option value="ml">ml</option>
                            <option value="pcs">pcs</option>
                          </select>
                        </td>
                        <td className="px-6 py-2 text-center">
                          <button onClick={() => simpanEdit(b.id)} className="text-xs px-3 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mr-1">Simpan</button>
                          <button onClick={() => setEditId(null)} className="text-xs px-3 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200">Batal</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-3 text-slate-600">{b.item}</td>
                        <td className="px-6 py-3 text-slate-500">{b.brand || "—"}</td>
                        <td className="px-6 py-3 text-right text-slate-600">{b.qty}</td>
                        <td className="px-6 py-3 text-slate-600">{b.satuan}</td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {b.sudahMasukStok ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">✓ Sudah di Stok</span>
                            ) : (
                              <button
                                onClick={() => onMasukStok(b)}
                                className="text-xs px-3 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 font-medium"
                              >
                                Masukin ke Stok
                              </button>
                            )}
                            {modeEdit && (
                              <>
                                <button onClick={() => mulaiEdit(b)} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                                {idx === 0 && (
                                  <button
                                    onClick={() => onHapusStruk(toko, tanggal)}
                                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                  >
                                    Hapus Struk
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
