import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key belum diset" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Ekstrak data dari struk belanja ini. Kembalikan HANYA JSON valid tanpa markdown code block, dengan format:
{
  "toko": "nama toko",
  "tanggal": "YYYY-MM-DD",
  "items": [
    { "nama": "nama barang generik tanpa brand dan tanpa qty", "brand": "nama merek/brand kalau ada, kalau tidak ada isi kosong string", "qty": angka, "satuan": "kg/g/pcs/ml/liter", "harga": angka }
  ],
  "total": angka
}

Aturan:
- Pisahkan qty dan satuan dari nama barang. Contoh: "Tepung Terigu Cakra Kembar 10kg" menjadi nama="Tepung Terigu", brand="Cakra Kembar", qty=10, satuan="kg".
- Kalau tidak ada brand, isi brand dengan string kosong "".
- Kalau satuan tidak jelas, pakai "pcs".
- Kalau harga per item tidak ada, isi 0.
- Total adalah total akhir struk.
- Jangan tambahkan penjelasan apapun di luar JSON.`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: [
        { type: "text", text: prompt },
        { type: "image", data: base64, mime_type: file.type },
      ],
    });

    const text = interaction.output_text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal scan" }, { status: 500 });
  }
}
