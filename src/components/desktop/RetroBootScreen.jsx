import React, { useState, useEffect } from 'react';
import { playStartupSound } from '../../utils/audioSynth';

/**
 * ============================================================================
 * COMPONENT: RetroBootScreen (Windows 95 Style Splash Screen)
 * ============================================================================
 * Menampilkan layar pemuat (splash screen) khas Windows 95 yang elegan dan sederhana.
 * Menghilangkan semua tombol klik perantara—sistem berjalan dari 0% ke 100%
 * secara otomatis dan langsung beralih ke tampilan desktop utama.
 * ============================================================================
 */
export default function RetroBootScreen({ onBootComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Jalankan pemuatan progress bar dari 0% ke 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 5; // bertambah 5% setiap detak
        } else {
          clearInterval(interval);

          // Selesai memuat, langsung coba mainkan suara startup (jika diizinkan browser) 
          // dan langsung masuk ke desktop utama tanpa klik tombol perantara
          setTimeout(() => {
            playStartupSound();
            onBootComplete();
          }, 300);

          return 100;
        }
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#008080] z-[999999] flex flex-col items-center justify-between p-12 font-sans select-none overflow-hidden">
      {/* Spacer Atas */}
      <div />

      {/* Jendela Splash Screen Windows 95 Khas */}
      <div className="flex flex-col items-center justify-center p-6 w-[340px] retro-raised bg-[#c0c0c0] relative shadow-2xl">
        {/* Ikon Salad Makanan */}
        <div className="text-[40px] mb-2 drop-shadow-md select-none animate-bounce">🥗</div>

        {/* Judul Besar PiringSehat Retro */}
        <h1 className="text-xl font-bold tracking-widest text-[#000080] uppercase font-sans mb-1" style={{ letterSpacing: '3px' }}>
          PiringSehat
        </h1>
        <span className="text-[10px] font-mono tracking-widest text-gray-600 font-extrabold uppercase mb-6">
          Operating System
        </span>

        {/* Progress Bar Sunken */}
        <div className="w-full text-left flex flex-col gap-1.5 mt-2">
          <div className="flex justify-between font-mono text-[9px] font-bold text-gray-700">
            <span>MEMUAT BERKAS SISTEM...</span>
            <span>{progress}%</span>
          </div>

          <div className="w-full retro-progress h-5 bg-[#808080] p-[2px]">
            <div
              className="bg-[#000080] h-full transition-all duration-75 flex items-center justify-end pr-1 text-[8px] text-white font-bold"
              style={{ width: `${progress}%` }}
            >
              {progress > 15 && 'LOADING'}
            </div>
          </div>
        </div>
      </div>

      {/* Lisensi Hak Cipta di Bagian Bawah */}
      <div className="flex flex-col items-center font-mono text-[10px] text-white tracking-wider opacity-85">
        <span>DOA MAMAH 2.0</span>
      </div>
    </div>
  );
}
