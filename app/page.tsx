"use client";
import { useEffect, useState } from "react";
import { db, Produk, Penjualan, Belanja, Stok } from "@/lib/storage";

export default function Dashboard() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);
  const [belanja, setBelanja] = useState<Belanja[]>([]);
  const [stok, setStok] = useState<Stok[]>([]);

  useEffect(() => {
    setProduk(db.produk.all());
    setPenjualan(db.penjualan.all());
    setBelanja(db.belanja.all());
    setStok(db.stok.all());
  }, []);

  const totalPenjualan = penjualan.reduce((s, d) => s + d.total, 0);
  const totalBelanja = belanja.reduce((s, d) => s + d.total, 0);
  const today = new Date().toISOString().slice(0, 10);
  const penjualanHariIni = penjualan
    .filter((p) => p.tanggal === today)
    .reduce((s, p) => s + p.total, 0);

  // Penjualan 7 hari terakhir
  const last7Days: { day: string; value: number }[] = [];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const value = penjualan
      .filter((p) => p.tanggal === iso)
      .reduce((s, p) => s + p.total, 0);
    last7Days.push({ day: dayNames[d.getDay()], value });
  }
  const maxSales = last7Days.length > 0 ? Math.max(...last7Days.map((d) => d.value), 1) : 1;
  const adaPenjualan = last7Days.some((d) => d.value > 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Ringkasan operasional Sakera Bakery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Penjualan" value={"Rp " + totalPenjualan.toLocaleString("id-ID")} icon="💰" color="bg-emerald-500" />
        <StatCard title="Total Belanja" value={"Rp " + totalBelanja.toLocaleString("id-ID")} icon="🧾" color="bg-amber-500" />
        <StatCard title="Penjualan Hari Ini" value={"Rp " + penjualanHariIni.toLocaleString("id-ID")} icon="🛒" color="bg-blue-500" />
        <StatCard title="Varian Produk" value={produk.length + " item"} icon="🍞" color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Penjualan 7 Hari Terakhir</h2>
          {!adaPenjualan ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="text-5xl mb-3">📊</div>
              <div className="text-sm">Belum ada data penjualan</div>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-64">
              {last7Days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-slate-500 font-medium">
                    {d.value > 0 ? (d.value / 1000).toFixed(0) + "k" : ""}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg"
                    style={{ height: Math.max((d.value / maxSales) * 200, d.value > 0 ? 8 : 0) + "px" }}
                  />
                  <div className="text-sm text-slate-600 font-medium">{d.day}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Stok Tersedia</h2>
          {stok.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">Belum ada data stok</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {stok.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="font-medium text-sm text-slate-800">{s.nama}</div>
                  <div className="text-sm text-slate-600 font-medium">{s.qty} {s.satuan}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={"w-10 h-10 " + color + " rounded-lg flex items-center justify-center text-white text-lg mb-3"}>{icon}</div>
      <div className="text-sm text-slate-500 mb-1">{title}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
