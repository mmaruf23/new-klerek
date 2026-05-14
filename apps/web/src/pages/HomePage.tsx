import { useRef, useState, type DragEvent } from "react";
import { Upload, ChevronRight, ShieldCheck, Sparkles, FileArchive } from "lucide-react";
import { useUpload, getRecentUploads } from "@/hooks/useUpload";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 2) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hours = Math.floor(min / 60);
  if (hours < 6) return `${hours} jam lalu`;
  if (new Date(iso).toDateString() === new Date().toDateString()) return "tadi";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (new Date(iso).toDateString() === yesterday.toDateString()) return "kemarin";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "short" }).format(new Date(iso));
}

const CARA_KERJA = [
  { title: "Upload file .zip", sub: "Hasil ekspor dari kasir" },
  { title: "Klerek validasi & baca", sub: "Toko diidentifikasi otomatis" },
  { title: "Lihat rekap lengkap", sub: "Total, member, top item, dst" },
];

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { upload, loading, error } = useUpload();
  const recentUploads = getRecentUploads();

  const handleFile = (f: File) => setFile(f);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const pickFile = () => inputRef.current?.click();

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept=".zip"
      className="hidden"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
      }}
    />
  );

  return (
    <>
      {/* ── Mobile content ── */}
      <div className="md:hidden px-5 pt-4 pb-12">
        <p className="text-[10px] font-bold tracking-[0.15em] text-indigo-600 uppercase mb-4">
          Rekap dalam hitungan detik
        </p>

        <h1 className="text-[2.1rem] font-extrabold text-slate-900 leading-tight tracking-tight mb-3">
          Upload satu file,
          <br />
          lihat semuanya.
        </h1>

        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Drop file laporan harian (.zip) — Klerek baca, rapikan, dan tampilkan rekap toko-mu.
        </p>

        {/* Mobile upload card */}
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center bg-slate-50/60">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
            <Upload className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>

          {file ? (
            <>
              <p className="text-sm font-semibold text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB · siap diproses</p>
              <button
                onClick={() => upload(file)}
                disabled={loading}
                className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full text-sm transition-colors disabled:opacity-60 shadow-lg shadow-indigo-100"
              >
                {loading ? "Memproses..." : "Proses sekarang"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-800">Tap untuk pilih file</p>
              <p className="text-xs text-slate-400 mt-1">.zip berisi laporan transaksi</p>
              <button
                onClick={pickFile}
                className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full text-sm transition-colors shadow-lg shadow-indigo-100"
              >
                Pilih File
              </button>
            </>
          )}
        </div>

        {fileInput}
        {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}

        {/* Promo card */}
        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-700">Toko baru? Dapat 2 minggu gratis</p>
            <p className="text-xs text-slate-500 mt-0.5">Otomatis aktif setelah upload pertama</p>
          </div>
        </div>

        {/* Cara kerja */}
        <div className="mt-8">
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Cara Kerja</p>
          <div className="space-y-4">
            {CARA_KERJA.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop content ── */}
      <main className="hidden md:flex flex-1 max-w-6xl w-full mx-auto px-8 py-16 items-center gap-20">
        {/* Hero */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium mb-7 bg-indigo-100 rounded-lg px-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Pay-as-you-go · 2 minggu trial untuk toko baru
          </div>

          <h1 className="text-[3.25rem] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-5">
            Satu file,
            <br />
            rekap toko
            <br />
            <span className="text-indigo-600">siap dibaca.</span>
          </h1>

          <p className="text-slate-500 text-base leading-relaxed max-w-xs mb-10">
            Upload .zip laporan harian dari POS. Klerek menyusun rekap penjualan, member, dan detail per-transaksi —
            tanpa setup, langsung gaskan.
          </p>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-slate-900">Rp 1.000</p>
              <p className="text-sm text-slate-400 mt-0.5">harga termurah</p>
            </div>
            <div className="w-px h-9 bg-slate-200" />
            <div>
              <p className="text-2xl font-bold text-slate-900">&lt; 5 detik</p>
              <p className="text-sm text-slate-400 mt-0.5">rata-rata proses</p>
            </div>
            <div className="w-px h-9 bg-slate-200" />
            <div>
              {/* todo : get total toko ke server lalu kasih animasi counting */}
              <p className="text-2xl font-bold text-slate-900">147 toko</p>
              <p className="text-sm text-slate-400 mt-0.5">sudah pakai</p>
            </div>
          </div>
        </div>

        {/* Desktop upload card */}
        <div className="w-95 shrink-0 space-y-3">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden pb-2">
            <div className="p-4">
              <div
                onClick={pickFile}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                className={`border border-dashed border-indigo-400 bg-indigo-50 rounded-xl py-9 px-6 cursor-pointer flex flex-col items-center text-center`}
              >
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-400">
                  <Upload className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>

                {file ? (
                  <>
                    <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(file.size / 1024 / 1024).toFixed(1)} MB · siap diproses
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-800">Drop file di sini</p>
                    <p className="text-sm text-slate-400 mt-0.5">
                      atau <span className="font-semibold text-indigo-500">klik untuk pilih file</span>
                    </p>
                  </>
                )}

                <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                  {/* <span className="bg-slate-100 rounded px-1.5 py-0.5">.zip</span> */}
                  <span>·</span>
                  <span>MAX 5 MB</span>
                  <span>·</span>
                  {/* <span>SQLite di dalam</span> */}
                </div>
              </div>

              {fileInput}
              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

              {file && (
                <button
                  onClick={() => upload(file)}
                  disabled={loading}
                  className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 shadow-lg shadow-indigo-100"
                >
                  {loading ? "Memproses..." : "Proses file"}
                </button>
              )}
            </div>

            {recentUploads.length > 0 && (
              <>
                <div className="px-4 py-1 border-slate-100 mb-2">
                  <p className="text-[10px] font-bold text-slate-400 tracking-[0.12em] uppercase">
                    Upload terakhir di browser ini
                  </p>
                </div>
                {recentUploads.slice(0, 3).map((r, i) => (
                  <div key={i} className="px-5 hover:bg-slate-50 cursor-pointer transition-colors">
                    {i !== 0 && <div className="border" />}
                    <div className="flex items-center gap-3 my-2">
                      <FileArchive size={28} className="text-slate-700 shrink-0 bg-slate-200 rounded p-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{r.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {r.storeName} · {relativeTime(r.timestamp)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>File diproses lokal di browser. Tidak disimpan di server.</span>
          </div>
        </div>
      </main>
    </>
  );
}
