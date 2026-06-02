import React, { useEffect, useRef } from 'react';

/**
 * ============================================================================
 * COMPONENT: InteractiveScreensaver (Starfield Flying Space Simulator)
 * ============================================================================
 * Menampilkan screensaver legendaris "Starfield Simulation" khas Windows 95/98.
 * Menutup secara otomatis saat mendeteksi adanya aktivitas pengguna.
 * ============================================================================
 */
export default function InteractiveScreensaver({ onExit }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // ─── Event Listener Untuk Keluar Screensaver ───
    const handleActivity = () => {
      if (onExit) onExit();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // ─── Inisialisasi Canvas Animasi ───
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Resize full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ─── Konstruksi Objek Bintang ───
    const numStars = 400;
    const stars = [];
    const maxDepth = 1000;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * maxDepth,
        prevZ: 0
      });
    }

    let animId;
    const speed = 15; // Kecepatan meluncur melintasi bintang

    const draw = () => {
      // Background Hitam Antariksa
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      stars.forEach((star) => {
        // Ingat posisi Z sebelumnya untuk menggambar trail (garis ekor)
        star.prevZ = star.z;
        star.z -= speed;

        // Reset bintang jika sudah melewai mata penonton
        if (star.z <= 0) {
          star.z = maxDepth;
          star.x = (Math.random() - 0.5) * canvas.width * 2;
          star.y = (Math.random() - 0.5) * canvas.height * 2;
          star.prevZ = star.z;
        }

        // Proyeksi 3D ke Layar 2D
        const px = (star.x / star.z) * cx + cx;
        const py = (star.y / star.z) * cy + cy;

        // Proyeksi 3D Sebelumnya untuk garis ekor
        const oldPx = (star.x / star.prevZ) * cx + cx;
        const oldPy = (star.y / star.prevZ) * cy + cy;

        // Gambar bintang jika berada di dalam area kanvas
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          // Ukuran bintang berdasarkan jarak (semakin dekat, semakin besar)
          const size = (1 - star.z / maxDepth) * 3;
          
          // Gambar garis kilat/trail bintang meluncur
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - star.z / maxDepth})`;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(oldPx, oldPy);
          ctx.lineTo(px, py);
          ctx.stroke();

          // Gambar kepala bintang bulat
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Teks instruksi melayang tipis
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.textAlign = 'center';
      ctx.fillText('Gerakkan mouse atau tekan tombol apa saja untuk kembali', cx, canvas.height - 30);

      animId = requestAnimationFrame(draw);
    };

    draw();

    // ─── Cleanup Listener ───
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [onExit]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen z-[999999] cursor-none"
      style={{ background: '#000' }}
    />
  );
}
