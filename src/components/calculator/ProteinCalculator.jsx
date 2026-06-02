import { useState } from "react";
import { ProteinCalculatorModel } from "../../calculators/calculators";
import RetroButton from "../ui/RetroButton";
import RetroInput from "../ui/RetroInput";
import RetroSelect from "../ui/RetroSelect";
import CalcHistoryPanel from "./CalcHistoryPanel";
import { useCalcHistory } from "../../hooks/useCalcHistory";
import { useAuth } from "../../hooks/useAuth";

// Pilihan tingkat aktivitas dengan faktor protein per kg berat badan (g/kg)
const activityOptions = [
  { value: "0.8", label: "Sedenter — jarang olahraga (0.8 g/kg)" },
  { value: "1.0", label: "Ringan — 1-3x/minggu (1.0 g/kg)" },
  { value: "1.2", label: "Sedang — 3-5x/minggu (1.2 g/kg)" },
  { value: "1.5", label: "Aktif — 6-7x/minggu (1.5 g/kg)" },
  { value: "1.8", label: "Sangat Aktif — atlet/kerja berat (1.8 g/kg)" },
];

export default function ProteinCalculator() {
  const { user } = useAuth();

  // Hook riwayat khusus Protein
  const { history, loading, error, fetchHistory, saveHistory, deleteHistory } =
    useCalcHistory("protein");

  const [formData, setFormData] = useState({
    weight: "",
    activityLevel: "1.2", // default sedang — paling umum dipakai
  });
  const [result, setResult] = useState(null);

  const updateField = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const calculate = async (e) => {
    e.preventDefault();

    const model = new ProteinCalculatorModel(
      formData.weight,
      formData.activityLevel,
    );
    const summary = model.getSummary();

    const computed = {
      dailyProtein: model.dailyProtein,
      weight: model.weight,
      perKg: parseFloat(formData.activityLevel),
      activityLabel: summary.description,
    };
    setResult(computed);

    if (user) {
      await saveHistory(
        { weight: formData.weight, activityLevel: formData.activityLevel },
        {
          dailyProtein: computed.dailyProtein,
          activityLabel: computed.activityLabel,
          caloriesFromProtein: computed.dailyProtein * 4, // 1g protein = 4 kkal
        },
      );
    }
  };

  const handleReset = () => {
    setFormData({ weight: "", activityLevel: "1.2" });
    setResult(null);
  };

  const historyColumns = [
    "Waktu",
    "BB",
    "Aktivitas",
    "Protein",
    "Kalori",
  ];

  const renderHistoryRow = (entry) => {
    const i = entry.inputData || {};
    const r = entry.resultData || {};
    const formattedDate = entry.createdAt ? entry.createdAt.replace(", 2026", " 26") : "-";
    return (
      <>
        <td className="px-2 py-1 whitespace-nowrap">{formattedDate}</td>
        <td className="px-2 py-1">{i.weight ?? "-"}</td>
        <td className="px-2 py-1">
          {i.activityLevel ? `×${i.activityLevel} g/kg` : "-"}
        </td>
        <td className="px-2 py-1 font-bold" style={{ color: "#e67e22" }}>
          {r.dailyProtein ? `${r.dailyProtein} g` : "-"}
        </td>
        <td className="px-2 py-1">
          {r.caloriesFromProtein ? `${r.caloriesFromProtein} kcal` : "-"}
        </td>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Form Input ─── */}
      <div className="retro-groupbox">
        <span className="retro-groupbox-label">⚙️ Data Kalkulasi</span>
        <form onSubmit={calculate} className="flex flex-col gap-3">
          <RetroInput
            label="Berat Badan (kg):"
            id="prot-weight"
            type="number"
            value={formData.weight}
            onChange={updateField("weight")}
            placeholder="cth. 70"
            required
            min="1"
            step="0.1"
          />
          <RetroSelect
            label="Tingkat Aktivitas:"
            id="prot-activity"
            value={formData.activityLevel}
            onChange={updateField("activityLevel")}
            options={activityOptions}
          />
          <div className="flex gap-2">
            <RetroButton type="submit" primary>
              Hitung Kebutuhan Protein
            </RetroButton>
            <RetroButton onClick={handleReset}>Reset</RetroButton>
          </div>
        </form>
      </div>

      {/* ─── Hasil ─── */}
      {result && (
        <div className="retro-groupbox">
          <span className="retro-groupbox-label">📊 Hasil</span>
          <div
            className="flex flex-col items-center py-3 mb-3"
            style={{
              background: "#000080",
              color: "#fff",
              border: "2px inset #808080",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8 }}>
              Kebutuhan Protein Harian
            </div>
            <div style={{ fontSize: 32, fontWeight: "bold", lineHeight: 1.2 }}>
              {result.dailyProtein} g
            </div>
            {/* Tampilkan rumus agar user tahu dari mana angkanya */}
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {result.perKg} g × {result.weight} kg berat badan
            </div>
          </div>
          <table className="retro-table">
            <tbody>
              <tr>
                <td className="font-bold">Total Protein</td>
                <td className="font-bold text-[#000080]">
                  {result.dailyProtein} g/hari
                </td>
              </tr>
              <tr>
                <td className="font-bold">Berat Badan</td>
                <td>{result.weight} kg</td>
              </tr>
              <tr>
                <td className="font-bold">Faktor Aktivitas</td>
                <td>{result.perKg} g/kg</td>
              </tr>
              {/* 1g protein = 4 kkal — konversi standar nutrisi */}
              <tr>
                <td className="font-bold">Kalori dari Protein</td>
                <td>{result.dailyProtein * 4} kcal</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Panel riwayat hanya muncul jika user sudah login */}
      {user && (
        <CalcHistoryPanel
          history={history}
          loading={loading}
          error={error}
          onFetch={fetchHistory}
          onDelete={deleteHistory}
          columns={historyColumns}
          renderRow={renderHistoryRow}
          emptyLabel="Belum ada riwayat perhitungan Protein."
        />
      )}
    </div>
  );
}
