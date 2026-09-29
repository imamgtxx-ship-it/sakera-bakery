"use client";
import { useEffect, useState } from "react";
import { db, Penjualan, Belanja, Stok, Produksi, MASTER_STOK } from "@/lib/storage";
import ExportImport from "@/components/database/ExportImport";
import TabPenjualan from "@/components/database/TabPenjualan";
import TabProduksi from "@/components/database/TabProduksi";
import TabStok from "@/components/database/TabStok";
import TabBelanja from "@/components/database/TabBelanja";

type Tab = "penjualan" | "produksi" | "stok" | "belanja";

function normalisasiNama(item: string, brand: string): string {
  const lower = item.toLowerCase();
  for (const m of MASTER_STOK) {
    if (lower.includes(m.toLowerCase())) return m;
  }
  return item;
}

export default function DatabasePage() {
  const [tab, setTab] = useState<Tab>("penjualan");
  const [modeEdit, setModeEdit] = useState(false);
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);
  const [belanja, setBelanja] = useState<Belanja[]>([]);
  const [stok, setStok] = useState<Stok[]>([]);
  const [produksi, setProduksi] = useState<Produksi[]>([]);

  function reload() {
    setPenjualan(db.penjualan.all());
    setBelanja(db.belanja.all());
    setStok(db.stok.all());
    setProduksi(db.produksi.all());
  }

  useEffect(() => {
    reload();
  }, []);

  function nextId<T extends { id: number }>(arr: T[]): number {
    return arr.length > 0 ? Math.max(...arr.map((d) => d.id)) + 1 : 1;
  }

  // ===== PENJUALAN =====
  function hapusPenjualan(id: number) {
    if (!confirm("Hapus transaksi ini?")) return;
    const next = penjualan.filter((d) => d.id !== id);
    setPenjualan(next);
    db.penjualan.save(next);
  }

  // ===== STOK =====
  function tambahStok(s: Omit<Stok, "id">) {
    const next = [...stok, { ...s, id: nextId(stok) }];
    setStok(next);
    db.stok.save(next);
  }
  function editStok(id: number, patch: Partial<Stok>) {
    const next = stok.map((d) => (d.id === id ? { ...d, ...patch } : d));
    setStok(next);
    db.stok.save(next);
  }
  function hapusStok(id: number) {
    if (!confirm("Hapus bahan ini?")) return;
    const next = stok.filter((d) => d.id !== id);
    setStok(next);
    db.stok.save(next);
  }

  // ===== BELANJA =====
  function tambahBelanja(itemsBaru: Belanja[]) {
    const nextB = [...belanja, ...itemsBaru];
    setBelanja(nextB);
    db.belanja.save(nextB);
  }

  function editBelanja(id: number, patch: Partial<Belanja>) {
    const next = belanja.map((d) => (d.id === id ? { ...d, ...patch } : d));
    setBelanja(next);
    db.belanja.save(next);
  }

  function hapusBelanjaStruk(toko: string, tanggal: string) {
    if (!confirm("Hapus semua item dari struk ini?")) return;
    const next = belanja.filter((d) => !(d.toko === toko && d.tanggal === tanggal));
    setBelanja(next);
    db.belanja.save(next);
  }

  function masukStok(b: Belanja) {
    if (b.sudahMasukStok) return;

    const namaMaster = normalisasiNama(b.item, b.brand);

    // Update stok: kalau sudah ada tinggal tambah qty, kalau belum bikin baru
    const stokCopy = [...stok];
    const idx = stokCopy.findIndex(
      (s) => s.nama.toLowerCase() === namaMaster.toLowerCase() && s.satuan === b.satuan
    );

    if (idx >= 0) {
      stokCopy[idx] = { ...stokCopy[idx], qty: stokCopy[idx].qty + b.qty };
    } else {
      stokCopy.push({
        id: nextId(stokCopy),
        nama: namaMaster,
        qty: b.qty,
        satuan: b.satuan,
        min: 0,
        status: "Tersedia",
      });
    }
    setStok(stokCopy);
    db.stok.save(stokCopy);

    // Tandai belanja ini sudah masuk stok
    const nextB = belanja.map((d) =>
      d.id === b.id ? { ...d, sudahMasukStok: true } : d
    );
    setBelanja(nextB);
    db.belanja.save(nextB);
  }

  // ===== PRODUKSI =====
  function pakaiBahan(bahan: string, qty: number, satuan: string) {
    const stokCopy = [...stok];
    const idx = stokCopy.findIndex((s) => s.nama === bahan);
    if (idx < 0) {
      alert("Bahan tidak ditemukan di stok.");
      return;
    }
    if (stokCopy[idx].qty < qty) {
      alert("Stok tidak cukup. Tersedia: " + stokCopy[idx].qty + " " + stokCopy[idx].satuan);
      return;
    }
    stokCopy[idx] = { ...stokCopy[idx], qty: stokCopy[idx].qty - qty };
    setStok(stokCopy);
    db.stok.save(stokCopy);

    const tanggal = new Date().toISOString().slice(0, 10);
    const nextP = [...produksi, { id: nextId(produksi), tanggal, bahan, qty, satuan }];
    setProduksi(nextP);
    db.produksi.save(nextP);
  }
  function hapusProduksi(id: number) {
    if (!confirm("Batalkan riwayat ini? Stok akan dikembalikan.")) return;
    const item = produksi.find((p) => p.id === id);
    if (!item) return;

    const nextP = produksi.filter((p) => p.id !== id);
    setProduksi(nextP);
    db.produksi.save(nextP);

    const stokCopy = [...stok];
    const idx = stokCopy.findIndex((s) => s.nama === item.bahan && s.satuan === item.satuan);
    if (idx >= 0) {
      stokCopy[idx] = { ...stokCopy[idx], qty: stokCopy[idx].qty + item.qty };
      setStok(stokCopy);
      db.stok.save(stokCopy);
    }
  }

  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: "penjualan", label: "Penjualan", icon: "🛒", count: penjualan.length },
    { key: "produksi", label: "Produksi", icon: "🥣", count: produksi.length },
    { key: "stok", label: "Stok", icon: "📦", count: stok.length },
    { key: "belanja", label: "Belanja", icon: "🧾", count: belanja.length },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Database</h1>
          <p className="text-slate-500 mt-1">Pusat data transaksi dan stok</p>
        </div>
        <div className="flex gap-2">
          <ExportImport onImported={reload} />
          <button
            onClick={() => setModeEdit(!modeEdit)}
            className={
              "text-sm px-4 py-2 rounded-lg font-medium transition " +
              (modeEdit
                ? "bg-slate-800 text-white hover:bg-slate-900"
                : "bg-amber-500 text-white hover:bg-amber-600")
            }
          >
            {modeEdit ? "✓ Selesai Edit" : "⚙ Mode Edit"}
          </button>
        </div>
      </div>

      {modeEdit && (
        <div className="mb-5 p-3 rounded-lg border border-amber-300 bg-amber-50 text-sm text-amber-900">
          <b>Mode Edit aktif.</b> Kamu bisa mengubah, menambah, atau menghapus data di semua tab.
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "px-4 py-2 text-sm font-medium rounded-t-lg transition " +
              (tab === t.key
                ? "bg-white border border-b-0 border-slate-200 text-amber-600"
                : "text-slate-500 hover:text-slate-800")
            }
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {tab === "penjualan" && (
          <TabPenjualan data={penjualan} onHapus={hapusPenjualan} modeEdit={modeEdit} />
        )}
        {tab === "produksi" && (
          <TabProduksi stok={stok} produksi={produksi} onPakai={pakaiBahan} onHapus={hapusProduksi} modeEdit={modeEdit} />
        )}
        {tab === "stok" && (
          <TabStok data={stok} onTambah={tambahStok} onEdit={editStok} onHapus={hapusStok} modeEdit={modeEdit} />
        )}
        {tab === "belanja" && (
          <TabBelanja
            data={belanja}
            stok={stok}
            onTambah={tambahBelanja}
            onEdit={editBelanja}
            onHapusStruk={hapusBelanjaStruk}
            onMasukStok={masukStok}
            modeEdit={modeEdit}
          />
        )}
      </div>
    </div>
  );
}
