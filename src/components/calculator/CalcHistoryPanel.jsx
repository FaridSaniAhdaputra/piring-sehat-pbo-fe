import { useEffect, useState } from "react";
import RetroButton from "../ui/RetroButton";

export default function CalcHistoryPanel({
  history, // array riwayat dari useCalcHistory
  loading, // boolean loading state
  error, // string pesan error atau null
  onFetch, // fungsi untuk memuat ulang riwayat
  onDelete, // fungsi (id) => void untuk menghapus entri
  renderRow, // fungsi (entry) => JSX baris tabel — disesuaikan tiap kalkulator
  columns = [], // array string header kolom tabel
  emptyLabel = "Belum ada riwayat perhitungan.", // teks ketika riwayat kosong
}) {
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  // Auto-fetch saat panel pertama kali dibuka, hanya jika history masih kosong
  useEffect(() => {
    if (open && history.length === 0) onFetch();
  }, [open]);

  return (
    <div className="retro-groupbox mt-2">
      {/* ─── Header Toggle ─── */}
      <span className="retro-groupbox-label">🕘 Riwayat Perhitungan</span>

      {/* ─── Baris header: info jumlah entri + tombol aksi ─── */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-gray-600">
          {open
            ? `${history.length} entri tersimpan`
            : "Klik untuk melihat riwayat"}
        </span>
        <div className="flex gap-1">
          {/* Tombol muat ulang hanya muncul saat panel terbuka */}
          {open && (
            <RetroButton onClick={onFetch} disabled={loading}>
              {loading ? "⏳" : "🔄 Muat Ulang"}
            </RetroButton>
          )}
          <RetroButton onClick={() => setOpen((v) => !v)}>
            {open ? "▲ Tutup" : "▼ Tampilkan"}
          </RetroButton>
        </div>
      </div>

      {/* ─── Konten panel (hanya render jika panel terbuka) ─── */}
      {open && (
        <>
          {error && (
            <div className="retro-sunken p-2 text-[11px] text-red-600 mb-2">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="retro-sunken p-3 text-center text-[11px] text-gray-500">
              ⏳ Memuat riwayat...
            </div>
          ) : history.length === 0 ? (
            <div className="retro-sunken p-3 text-center text-[11px] text-gray-500">
              📭 {emptyLabel}
            </div>
          ) : (
            <div className="overflow-auto max-h-[150px] retro-sunken">
              <table className="retro-table w-full text-[10px]">
                <thead>
                  <tr style={{ background: "#000080", color: "#fff" }}>
                    {/* Header kolom dinamis dari prop columns */}
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-2 py-1 text-left font-bold whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="px-2 py-1 text-left font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-[#c0c0c0] hover:bg-[#e0e0ff]"
                    >
                      {/* renderRow berbeda tiap kalkulator — disesuaikan lewat prop */}
                      {renderRow(entry)}

                      {/* ─── Kolom Aksi: konfirmasi dua langkah sebelum hapus ─── */}
                      <td className="px-1 py-1 whitespace-nowrap">
                        {confirmId === entry.id ? (
                          // Mode konfirmasi: tampilkan Yakin (merah) dan Batal
                          <div className="flex gap-1">
                            <RetroButton
                              onClick={() => {
                                onDelete(entry.id);
                                setConfirmId(null);
                              }}
                              style={{
                                fontSize: 9,
                                padding: "1px 5px",
                                background: "#ff4444",
                                color: "#fff",
                              }}
                            >
                              ✓ Yakin
                            </RetroButton>
                            {/* Klik Batal → reset confirmId, tidak ada yang dihapus */}
                            <RetroButton
                              onClick={() => setConfirmId(null)}
                              style={{ fontSize: 9, padding: "1px 5px" }}
                            >
                              ✕ Batal
                            </RetroButton>
                          </div>
                        ) : (
                          // Klik pertama hanya set confirmId, belum menghapus
                          <RetroButton
                            onClick={() => setConfirmId(entry.id)}
                            style={{ fontSize: 9, padding: "1px 5px" }}
                          >
                            🗑
                          </RetroButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
