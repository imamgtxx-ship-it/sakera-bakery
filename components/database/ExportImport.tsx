"use client";
import { useRef } from "react";
import { db } from "@/lib/storage";

export default function ExportImport({ onImported }: { onImported: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const data = {
      penjualan: db.penjualan.all(),
      belanja: db.belanja.all(),
      stok: db.stok.all(),
      produksi: db.produksi.all(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sakera-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(f: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!confirm("Import data ini? Data yang ada akan diganti.")) return;
        if (data.penjualan) db.penjualan.save(data.penjualan);
        if (data.belanja) db.belanja.save(data.belanja);
        if (data.stok) db.stok.save(data.stok);
        if (data.produksi) db.produksi.save(data.produksi);
        alert("Data berhasil di-import!");
        onImported();
      } catch {
        alert("File tidak valid.");
      }
    };
    reader.readAsText(f);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportData}
        className="text-sm px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
      >
        ⬇ Export JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="text-sm px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
      >
        ⬆ Import JSON
      </button>
    </div>
  );
}
