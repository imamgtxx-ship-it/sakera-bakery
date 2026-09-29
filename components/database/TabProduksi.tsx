"use client";
import { useState } from "react";
import { Stok, Produksi } from "@/lib/storage";

export default function TabProduksi({
  stok,
  produksi,
  onPakai,
  onHapus,
  modeEdit,
}: {
  stok: Stok[];
  produksi: Produksi[];
  onPakai: (bahan: string, qty: number, satuan: string) => void;
  onHapus: (id: number) => void;
  modeEdit: boolean;
}) {
  const [bahan, setBahan] = useState("");
  const [qty, setQty] = useState("");

  function submit() {
    if (!bahan || !qty) return;
    const s = stok.find((x) => x.nama === bahan);
    if (!s) return;
    const q = Number(qty);
    if (isNaN(q) || q <= 0) return;
    onPakai(bahan, q, s.satuan);
    setBahan("");
    setQty("");
  }

  return (
    <div>
      <div className="p-5 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Pakai Bahan Hari Ini</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={bahan}
            onChange={(e) => setBahan(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">-- Pilih bahan dari stok --</option>
            {stok.map((s) => (
              <option key={s.id} value={s.nama}>
                {s.nama} ({s.qty} {s.satuan} tersedia)
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full md:w-32 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={submit}
            disabled={!bahan || !qty}
            className="bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Pakai
          </button>
        </div>
      </div>

      <div>
        {produksi.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="text-5xl mb-3">🥣</div>
            <div className="text-sm">Belum ada riwayat produksi</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Tanggal</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Bahan</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-600">Qty</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Satuan</th>
                {modeEdit && <th className="text-center px-6 py-3 font-semibold text-slate-600">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {[...produksi].reverse().map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-600">{p.tanggal}</td>
                  <td className="px-6 py-3 text-slate-800 font-medium">{p.bahan}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{p.qty}</td>
                  <td className="px-6 py-3 text-slate-600">{p.satuan}</td>
                  {modeEdit && (
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => onHapus(p.id)}
                        className="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Batalkan
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
