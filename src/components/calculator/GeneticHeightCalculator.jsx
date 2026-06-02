import { useState } from "react";
import { GeneticHeightCalculatorModel } from "../../calculators/calculators";
import RetroButton from "../ui/RetroButton";
import RetroInput from "../ui/RetroInput";
import RetroSelect from "../ui/RetroSelect";
import CalcHistoryPanel from "./CalcHistoryPanel";
import { useCalcHistory } from "../../hooks/useCalcHistory";
import { useAuth } from "../../hooks/useAuth";

export default function GeneticHeightCalculator() {
  const { user } = useAuth();

  // Hook riwayat khusus Tinggi Genetik
  const { history, loading, error, fetchHistory, saveHistory, deleteHistory } =
    useCalcHistory("genetic");

  const [formData, setFormData] = useState({
    fatherHeight: "",
    motherHeight: "",
    gender: "male",
  });
  const [result, setResult] = useState(null);

  const genderOptions = [
    { value: "male", label: "Laki-laki" },
    { value: "female", label: "Perempuan" },
  ];

  const updateField = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const calculate = async (e) => {
    e.preventDefault();

    // Kalkulasi menggunakan rumus Mid-Parental Height (MPH)
    const model = new GeneticHeightCalculatorModel(
      formData.fatherHeight,
      formData.motherHeight,
      formData.gender,
    );
    const summary = model.getSummary();

    const computed = {
      predictedHeight: summary.mainValue,
      range: model.range, // rentang ±8.5 cm
    };
    setResult(computed);

    if (user) {
      await saveHistory(
        {
          fatherHeight: formData.fatherHeight,
          motherHeight: formData.motherHeight,
          gender: formData.gender,
        },
        { predictedHeight: computed.predictedHeight, range: computed.range },
      );
    }
  };

  const handleReset = () => {
    setFormData({ fatherHeight: "", motherHeight: "", gender: "male" });
    setResult(null);
  };

  const historyColumns = [
    "Waktu",
    "Ayah",
    "Ibu",
    "L/P",
    "Prediksi",
    "Rentang",
  ];

  const renderHistoryRow = (entry) => {
    const i = entry.inputData || {};
    const r = entry.resultData || {};
    const formattedDate = entry.createdAt ? entry.createdAt.replace(", 2026", " 26") : "-";
    return (
      <>
        <td className="px-2 py-1 whitespace-nowrap">{formattedDate}</td>
        <td className="px-2 py-1">
          {i.fatherHeight ?? "-"}
        </td>
        <td className="px-2 py-1">
          {i.motherHeight ?? "-"}
        </td>
        <td className="px-2 py-1">
          {i.gender === "male" ? "♂" : i.gender === "female" ? "♀" : "-"}
        </td>
        <td className="px-2 py-1 font-bold text-[#000080]">
          {r.predictedHeight ?? "-"}
        </td>
        <td className="px-2 py-1 text-[9px]">{r.range ?? "-"}</td>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Form Input ─── */}
      <div className="retro-groupbox">
        <span className="retro-groupbox-label">👨‍👩‍👧 Data Orang Tua</span>
        <form onSubmit={calculate} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <RetroInput
              label="Tinggi Ayah (cm):"
              id="gh-father"
              type="number"
              value={formData.fatherHeight}
              onChange={updateField("fatherHeight")}
              placeholder="cth. 170"
              required
              min="100"
              max="250"
              step="0.1"
            />
            <RetroInput
              label="Tinggi Ibu (cm):"
              id="gh-mother"
              type="number"
              value={formData.motherHeight}
              onChange={updateField("motherHeight")}
              placeholder="cth. 157"
              required
              min="100"
              max="250"
              step="0.1"
            />
            <RetroSelect
              label="Jenis Kelamin Anak:"
              id="gh-gender"
              value={formData.gender}
              onChange={updateField("gender")}
              options={genderOptions}
            />
          </div>
          <div className="flex gap-2">
            <RetroButton type="submit" primary>
              Hitung Potensi Tinggi
            </RetroButton>
            <RetroButton onClick={handleReset}>Reset</RetroButton>
          </div>
        </form>
      </div>

      {/* ─── Hasil ─── */}
      {result && (
        <div className="retro-groupbox">
          <span className="retro-groupbox-label">📊 Hasil Estimasi</span>
          <div
            className="flex flex-col items-center py-3 mb-3"
            style={{
              background: "#000080",
              color: "#fff",
              border: "2px inset #808080",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8 }}>
              Potensi Tinggi Genetik
            </div>
            <div style={{ fontSize: 32, fontWeight: "bold", lineHeight: 1.2 }}>
              {result.predictedHeight} cm
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              Rentang: {result.range}
            </div>
          </div>
          <table className="retro-table">
            <tbody>
              <tr>
                <td className="font-bold">Prediksi Tinggi</td>
                <td className="font-bold text-[#000080]">
                  {result.predictedHeight} cm
                </td>
              </tr>
              {/* ±8.5 cm adalah standar variasi dari rumus Mid-Parental Height */}
              <tr>
                <td className="font-bold">Rentang (±8.5 cm)</td>
                <td>{result.range}</td>
              </tr>
            </tbody>
          </table>
          {/* Disclaimer: hasil adalah estimasi, bukan jaminan */}
          <div className="retro-sunken p-2 mt-2 text-[10px] text-gray-600">
            ⚠️ Hasil ini adalah estimasi berdasarkan faktor genetik
            (Mid-Parental Height Formula). Nutrisi dan lingkungan juga
            berpengaruh.
          </div>
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
          emptyLabel="Belum ada riwayat perhitungan Tinggi Genetik."
        />
      )}
    </div>
  );
}
