"use client";
import { useState } from "react";
import { Stok } from "@/lib/storage";

export default function TabStok({
  data,
  onTambah,
  onEdit,
  onHapus,
  modeEdit,
}: {
  data: Stok[];
  onTambah: (s: Omit<Stok, "id">) => void;
  onEdit: (id: number, patch: Partial<Stok>) => void;
  onHapus: (id: number) => void;
  modeEdit: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nama: "", qty: "", satuan: "kg" });
  const [editForm, setEditForm] = useState({ nama: "", qty: "", satuan: "" });

  function submitTambah() {
    if (!form.nama || !form.qty) return;
    onTambah({
      nama: form.nama,
      qty: Number(form.qty),
      satuan: form.satuan,
      min: 0,
      status: "Tersedia",
    });
    setForm({ nama: "", qty: "", satuan: "kg" });
    setShowForm(false);
  }

  function mulaiEdit(s: Stok) {
    setEditId(s.id);
    setEditForm({ nama: s.nama, qty: String(s.qty), satuan: s.satuan });
  }

  function simpanEdit(id: number) {
    if (!editForm.nama || !editForm.qty) return;
    onEdit(id, {
      nama: editForm.nama,
      qty: Number(editForm.qty),
      satuan: editForm.satuan,
    });
    setEditId(null);
  }

  return (
    <div>
      {modeEdit && (
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm">Kelola Bahan Baku</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-medium"
          >
            {showForm ? "Batal" : "+ Tambah Bahan"}
          </button>
        </div>
      )}

      {modeEdit && showForm && (
        <div className="p-5 border-b border-slate-200 bg-amber-50">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Nama bahan"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="number"
              placeholder="Qty"
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: e.target.value })}
              className="w-full md:w-32 px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={form.satuan}
              onChange={(e) => setForm({ ...form, satuan: e.target.value })}
              className="w-full md:w-32 px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="liter">liter</option>
              <option value="ml">ml</option>
              <option value="pcs">pcs</option>
            </select>
            <button
              onClick={submitTambah}
              className="bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-emerald-600 whitespace-nowrap"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <div className="text-5xl mb-3">📦</div>
          <div className="text-sm">Belum ada data stok</div>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-slate-600">Nama Bahan</th>
              <th className="text-right px-6 py-3 font-semibold text-slate-600">Qty</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-600">Satuan</th>
              {modeEdit && <th className="text-center px-6 py-3 font-semibold text-slate-600">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                {editId === s.id ? (
                  <>
                    <td className="px-6 py-2">
                      <input
                        value={editForm.nama}
                        onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                        className="w-full px-3 py-1.5 rounded border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-6 py-2 text-right">
                      <input
                        type="number"
                        value={editForm.qty}
                        onChange={(e) => setEditForm({ ...editForm, qty: e.target.value })}
                        className="w-24 px-3 py-1.5 rounded border border-amber-400 text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                      <button onClick={() => simpanEdit(s.id)} className="text-xs px-3 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mr-1">Simpan</button>
                      <button onClick={() => setEditId(null)} className="text-xs px-3 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200">Batal</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-3 text-slate-800 font-medium">{s.nama}</td>
                    <td className="px-6 py-3 text-right text-slate-600">{s.qty}</td>
                    <td className="px-6 py-3 text-slate-600">{s.satuan}</td>
                    {modeEdit && (
                      <td className="px-6 py-3 text-center">
                        <button onClick={() => mulaiEdit(s)} className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 mr-1">Edit</button>
                        <button onClick={() => onHapus(s.id)} className="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">Hapus</button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
