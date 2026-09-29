"use client";
import { Penjualan } from "@/lib/storage";

export default function TabPenjualan({
  data,
  onHapus,
  modeEdit,
}: {
  data: Penjualan[];
  onHapus: (id: number) => void;
  modeEdit: boolean;
}) {
  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="text-5xl mb-3">🛒</div>
        <div className="text-sm">Belum ada transaksi penjualan</div>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <th className="text-left px-6 py-3 font-semibold text-slate-600">Tanggal</th>
          <th className="text-left px-6 py-3 font-semibold text-slate-600">Produk</th>
          <th className="text-right px-6 py-3 font-semibold text-slate-600">Qty</th>
          <th className="text-right px-6 py-3 font-semibold text-slate-600">Harga</th>
          <th className="text-right px-6 py-3 font-semibold text-slate-600">Total</th>
          {modeEdit && <th className="text-center px-6 py-3 font-semibold text-slate-600">Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
            <td className="px-6 py-3 text-slate-600">{d.tanggal}</td>
            <td className="px-6 py-3 text-slate-800 font-medium">{d.produk}</td>
            <td className="px-6 py-3 text-right text-slate-600">{d.qty}</td>
            <td className="px-6 py-3 text-right text-slate-600">Rp {d.harga.toLocaleString("id-ID")}</td>
            <td className="px-6 py-3 text-right font-medium text-slate-800">Rp {d.total.toLocaleString("id-ID")}</td>
            {modeEdit && (
              <td className="px-6 py-3 text-center">
                <button onClick={() => onHapus(d.id)} className="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">Hapus</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
