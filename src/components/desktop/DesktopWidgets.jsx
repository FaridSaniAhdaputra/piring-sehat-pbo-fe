import React, { useState, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * COMPONENT: DesktopWidgets (Analog Clock, System Monitor, Sticky Note)
 * ============================================================================
 * Panel widget retro di bagian kanan desktop. Menampilkan utilitas visual
 * yang hidup dan interaktif guna mendongkrak visualisasi aplikasi.
 * ============================================================================
 */
export default function DesktopWidgets() {
  // Sticky Note State
  const [stickyNote, setStickyNote] = useState(() => {
    return localStorage.getItem('retro_sticky_note') || 
      '📝 To-Do List:\n1. Cek Kalori Hari Ini\n2. Cari Makanan Sehat\n3. Diskusi di Forum';
  });

  const handleStickyChange = (e) => {
    setStickyNote(e.target.value);
    localStorage.setItem('retro_sticky_note', e.target.value);
  };

  return (
    <div className="absolute right-4 top-4 bottom-14 w-[160px] hidden md:flex flex-col gap-4 z-[10] pointer-events-none">
      {/* 1. Jam Analog Retro */}
      <div className="retro-raised p-2 w-full flex flex-col items-center pointer-events-auto">
        <span className="text-[10px] font-bold text-gray-700 mb-1 font-mono uppercase tracking-wide">
          🕒 Analog Time
        </span>
        <AnalogClock />
      </div>

      {/* 2. Monitor Performa CPU & RAM (Neon Green) */}
      <div className="retro-raised p-2 w-full flex flex-col pointer-events-auto">
        <span className="text-[10px] font-bold text-gray-700 mb-1 font-mono uppercase tracking-wide text-center">
          📊 System Load
        </span>
        <SystemMonitor />
      </div>

      {/* 3. Sticky Notes Kuning Klasik */}
      <div className="w-full flex-1 flex flex-col pointer-events-auto shadow-md" style={{ background: '#ffff88', border: '1px solid #e6db55' }}>
        <div className="bg-[#f4e869] px-2 py-1 flex items-center border-b border-[#e6db55] text-[10px] font-bold text-[#857a1d] select-none">
          <span>📌 STICKY NOTE</span>
        </div>
        <textarea
          value={stickyNote}
          onChange={handleStickyChange}
          className="flex-1 w-full bg-transparent p-2 resize-none text-[11px] font-sans border-none outline-none text-[#5c5310] leading-normal"
          style={{ fontFamily: 'Georgia, serif' }}
          placeholder="Ketik catatan di sini..."
        />
      </div>
    </div>
  );
}

/**
 * 🕒 Sub-Komponen: AnalogClock
 * Jam analog bergaya klasik 8-bit yang digambar pada canvas HTML5.
 */
function AnalogClock() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const drawClock = () => {
      ctx.clearRect(0, 0, 100, 100);
      
      // Lingkaran Jam
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(50, 50, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Titik Pusat
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(50, 50, 3, 0, Math.PI * 2);
      ctx.fill();

      // Jam Lokal
      const now = new Date();
      const hr = now.getHours();
      const min = now.getMinutes();
      const sec = now.getSeconds();

      // Jarum Jam
      const hrAngle = ((hr % 12) * Math.PI) / 6 + (min * Math.PI) / 360;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(50 + Math.sin(hrAngle) * 22, 50 - Math.cos(hrAngle) * 22);
      ctx.stroke();

      // Jarum Menit
      const minAngle = (min * Math.PI) / 30 + (sec * Math.PI) / 1800;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(50 + Math.sin(minAngle) * 32, 50 - Math.cos(minAngle) * 32);
      ctx.stroke();

      // Jarum Detik (Merah Neon)
      const secAngle = (sec * Math.PI) / 30;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(50 + Math.sin(secAngle) * 36, 50 - Math.cos(secAngle) * 36);
      ctx.stroke();

      // Lingkaran Mini Tengah Jam
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(50, 50, 1.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(drawClock);
    };

    drawClock();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width="100" height="100" className="w-[85px] h-[85px]" />;
}

/**
 * 📊 Sub-Komponen: SystemMonitor
 * Grafik denyut neon penunjuk CPU & RAM dengan data mock yang ter-update konstan.
 */
function SystemMonitor() {
  const [cpuVal, setCpuVal] = useState(15);
  const [ramVal, setRamVal] = useState(48);
  const canvasRef = useRef(null);
  const historyRef = useRef(new Array(30).fill(15)); // Riwayat CPU load

  useEffect(() => {
    // interval mock data update
    const interval = setInterval(() => {
      const nextCpu = Math.max(5, Math.min(95, Math.floor(cpuVal + (Math.random() - 0.5) * 25)));
      const nextRam = Math.max(40, Math.min(85, Math.floor(ramVal + (Math.random() - 0.5) * 4)));
      setCpuVal(nextCpu);
      setRamVal(nextRam);

      // Pindahkan riwayat CPU
      const hist = [...historyRef.current];
      hist.shift();
      hist.push(nextCpu);
      historyRef.current = hist;
    }, 1500);

    return () => clearInterval(interval);
  }, [cpuVal, ramVal]);

  // Menggambar grafik diagram denyut
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Background Hitam Pekat
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Garis Grid Hijau Gelap
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Menggambar Garis Riwayat CPU (Neon Hijau)
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    const points = historyRef.current;
    const step = w / (points.length - 1);
    points.forEach((val, index) => {
      // Nilai tinggi dari bawah ke atas
      const x = index * step;
      const y = h - (val / 100) * (h - 6) - 3;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Efek Kilau Glow bawah garis
    ctx.fillStyle = 'rgba(0, 255, 0, 0.08)';
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

  }, [cpuVal]);

  return (
    <div className="flex flex-col gap-1 w-full font-mono text-[9px] text-[#00ff00] bg-black p-1.5 rounded-sm border border-[#808080]">
      {/* Visual Canvas Line Chart */}
      <canvas ref={canvasRef} width="140" height="50" className="w-full h-[40px] rounded-sm mb-1" />
      
      {/* Angka Status */}
      <div className="flex justify-between font-bold">
        <span>CPU LOAD:</span>
        <span className="text-[#33ff33]">{cpuVal}%</span>
      </div>
      <div className="retro-progress h-2 w-full mt-0.5" style={{ background: '#222' }}>
        <div className="bg-[#00ff00] h-full" style={{ width: `${cpuVal}%`, transition: 'width 0.8s ease' }} />
      </div>

      <div className="flex justify-between font-bold mt-1.5">
        <span>RAM USAGE:</span>
        <span className="text-[#33ff33]">{ramVal}%</span>
      </div>
      <div className="retro-progress h-2 w-full mt-0.5" style={{ background: '#222' }}>
        <div className="bg-[#00ff00] h-full" style={{ width: `${ramVal}%`, transition: 'width 1.5s ease' }} />
      </div>
    </div>
  );
}
