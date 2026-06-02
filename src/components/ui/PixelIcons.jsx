import React from 'react';

/**
 * ============================================================================
 * COMPONENT: 8-Bit Pixel Art SVG Icons
 * ============================================================================
 * Menyediakan ikon pixel-art retro yang digambar menggunakan grid SVG pixel murni.
 * Penggunaan properti `shape-rendering="crispEdges"` menjamin ikon tetap tajam
 * pada resolusi layar apa pun, persis seperti grafis sistem operasi Windows 95.
 * ============================================================================
 */

// Wrapper dasar untuk memastikan ikon memiliki ukuran dan gaya seragam
const PixelIconWrapper = ({ children, className = '', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ shapeRendering: 'crispEdges' }}
    className={`select-none ${className}`}
  >
    {children}
  </svg>
);

/**
 * 1. Ikon Login / Register (Kunci Pixel Klasik Emas)
 */
export function AuthIcon({ className = '', size = 32 }) {
  return (
    <PixelIconWrapper className={className} size={size}>
      {/* Outline Hitam */}
      <path d="M5 1h6v1h2v2h1v4h-1v2h-2v1h-1v4h-2v-1h-1v-1h2v-1h-2v-1h2v-2H5V8H3V4h2V1z" fill="#000" />
      {/* Warna Dasar Emas / Kuning */}
      <path d="M6 2h4v1h2v2h1v2h-1v2H9v1H8v4H7v-4H6V8H4V5h2V2z" fill="#FFD700" />
      {/* Highlight Terang */}
      <path d="M6 2h3v1h1v1h1v2H9V5H8V4H6V2z" fill="#FFF" />
      {/* Shadow Gelap */}
      <path d="M11 6h1v1h-1V6zm-2 2h2v1H9V8zm-2 3v3h1v-3H7zm1 1h1v1H8v-1z" fill="#C59B27" />
      {/* Lubang Kunci (Hitam Tengah) */}
      <path d="M7 4h2v2H7V4z" fill="#000" />
    </PixelIconWrapper>
  );
}

/**
 * 2. Ikon Kalkulator Kesehatan (Pixel Calculator dengan Layar)
 */
export function CalculatorIcon({ className = '', size = 32 }) {
  return (
    <PixelIconWrapper className={className} size={size}>
      {/* Outline Hitam */}
      <path d="M2 1h12v14H2V1z" fill="#000" />
      {/* Body Abu-abu Komputer Klasik */}
      <path d="M3 2h10v12H3V2z" fill="#C0C0C0" />
      {/* Highlight Sisi Atas/Kiri */}
      <path d="M3 2h9v1H3v11H2V2z" fill="#FFF" />
      {/* Shadow Sisi Bawah/Kanan */}
      <path d="M12 3h1v10h-1V3zm-9 10h10v1H3v-1z" fill="#808080" />
      
      {/* Layar Hijau LCD Kuno */}
      <path d="M4 3h8v3H4V3z" fill="#808000" /> {/* Outline layar */}
      <path d="M5 4h6v1H5V4z" fill="#90EE90" /> {/* Konten layar LCD */}
      
      {/* Tombol-tombol Kalkulator */}
      <rect x="4" y="8" width="2" height="2" fill="#D3D3D3" />
      <rect x="7" y="8" width="2" height="2" fill="#D3D3D3" />
      <rect x="10" y="8" width="2" height="2" fill="#000080" /> {/* Tombol = */}
      
      <rect x="4" y="11" width="2" height="2" fill="#FF8C00" /> {/* Tombol Merah/Oranye */}
      <rect x="7" y="11" width="2" height="2" fill="#D3D3D3" />
      <rect x="10" y="11" width="2" height="2" fill="#D3D3D3" />
    </PixelIconWrapper>
  );
}

/**
 * 3. Ikon Calorie Tracker (Garis Grafik Neon Naik)
 */
export function TrackerIcon({ className = '', size = 32 }) {
  return (
    <PixelIconWrapper className={className} size={size}>
      {/* Papan/Grid Latar Belakang Abu-abu */}
      <path d="M1 1h14v14H1V1z" fill="#000" />
      <path d="M2 2h12v12H2V2z" fill="#FFF" />
      
      {/* Garis Grid Biru Muda */}
      <path d="M2 5h12v1H2V5zm0 4h12v1H2V9z" fill="#E0EEEE" />
      <path d="M5 2v12h1V2H5zm4 0v12h1V2H9z" fill="#E0EEEE" />
      
      {/* Sumbu Grafik (Hitam) */}
      <path d="M3 2v10h11v1H3V2z" fill="#808080" />

      {/* Garis Tren Naik (Pixel Hijau & Biru Tua) */}
      <path d="M4 11h1v-1H4v1zm1-1h1V9H5v1zm1-1h1V8H6v1zm1-1h1V7H7v1zm1-1h1V5H8v3zm1-1h1V4H9v2zm1-2h1V3h-1v1zm1-1h2v2h-2V3z" fill="#0000FF" />
      
      {/* Titik Target / Ujung Garis (Merah Terang) */}
      <path d="M12 2h3v3h-3V2z" fill="#FF0000" />
      <path d="M13 3h1v1h-1V3z" fill="#FFF" /> {/* Kilau di titik merah */}
    </PixelIconWrapper>
  );
}

/**
 * 4. Ikon Food Explorer (Kaca Pembesar & Piring Sup Hijau/Kuning)
 */
export function ExplorerIcon({ className = '', size = 32 }) {
  return (
    <PixelIconWrapper className={className} size={size}>
      {/* Latar Belakang Mangkuk Sop */}
      <path d="M2 8h8v2H2V8z" fill="#808080" />
      <path d="M3 7h6v1H3V7zm1-2h4v2H4V5z" fill="#FFA500" /> {/* Sup Oranye/Kuning */}
      <path d="M3 9h6v1H3V9zm1 1h4v1H4v-1z" fill="#C0C0C0" /> {/* Piring Tatakan Mangkuk */}
      <circle cx="5" cy="6" r="1" fill="#008000" /> {/* Sayuran Hijau 1 */}
      <circle cx="7" cy="6" r="1" fill="#FF0000" /> {/* Wortel Merah 1 */}

      {/* Kaca Pembesar di Depan Mangkuk */}
      {/* Outline Hitam Pegangan & Ring */}
      <path d="M9 1h5v5h-1v1h-1v1h-1v2h-2v1h-1v3h-2v-1h-1v-2h3v-1h1V9h1V7h1V6H9V1z" fill="#000" />
      
      {/* Kaca Pembesar Ring Perak */}
      <path d="M10 2h3v1h1v2h-1v1h-3V5H9V3h1V2z" fill="#D3D3D3" />
      
      {/* Kaca Biru Transparan (Kaca Lensa) */}
      <path d="M10 3h2v2h-2V3z" fill="#00FFFF" />
      <path d="M10 3h1v1h-1V3z" fill="#FFF" /> {/* Kilau Lensa */}
      
      {/* Pegangan Kayu (Cokelat) */}
      <path d="M6 13h1v1H6v-1zm-1-1h1v1H5v-1zm-1-1h1v1H4v-1z" fill="#8B4513" />
    </PixelIconWrapper>
  );
}

/**
 * 5. Ikon Forum Diskusi (Bola Dunia Jaringan Biru Klasik)
 */
export function ForumIcon({ className = '', size = 32 }) {
  return (
    <PixelIconWrapper className={className} size={size}>
      {/* Outline Bola Dunia (Hitam Bulat) */}
      <path d="M5 1h6v1h2v2h1v1h1v6h-1v1h-1v2h-2v1H5v-1H3v-2H2v-6h1V4h1V2h1V1z" fill="#000" />
      
      {/* Latar Belakang Lautan Biru Klasik */}
      <path d="M6 2h4v1h2v1h1v2h1v4h-1v2h-1v1H10v1H6v-1H4v-1H3V8H2V6h1V4h1V3h2V2z" fill="#0000FF" />
      
      {/* Benua/Daratan (Hijau Pixel) */}
      <path d="M7 3h2v1H7V3zm4 2h1v3h-1V5zm-2 5h2v1H9v-1zM4 6h2v3H4V6zm1-2h1v1H5V4zm3 3h2v2H8V7z" fill="#00FF00" />
      
      {/* Garis Jaringan / Grid Meridian (Garis Putih/Abu-abu tipis) */}
      <path d="M3 7h10v1H3V7zm3-4v10h1V3H6z" fill="#FFF" opacity="0.6" />
    </PixelIconWrapper>
  );
}

/**
 * 6. Ikon Display Settings / Control Panel (Komputer Tabung CRT Properti Layar)
 */
export function DisplaySettingsIcon({ className = '', size = 32 }) {
  return (
    <PixelIconWrapper className={className} size={size}>
      {/* Monitor Outer Shell (Outline Hitam) */}
      <path d="M1 1h14v10H1V1z" fill="#000" />
      <path d="M2 2h12v8H2V2z" fill="#C0C0C0" />
      <path d="M2 2h11v1H2v7H1V2z" fill="#FFF" />
      <path d="M13 3h1v6h-1V3zm-11 6h12v1H2V9z" fill="#808080" />

      {/* Monitor Screen (Layar Teal Khas Windows 95) */}
      <path d="M3 3h10v6H3V3z" fill="#000" />
      <path d="M4 4h8v4H4V4z" fill="#008080" />
      
      {/* Miniatur jendela Windows di dalam layar */}
      <rect x="5" y="5" width="4" height="2" fill="#000080" />
      <rect x="9" y="5" width="2" height="2" fill="#C0C0C0" />

      {/* Monitor Stand/Kaki (Hitam & Abu-abu di bawah) */}
      <path d="M6 11h4v2H6v-2z" fill="#000" />
      <path d="M7 11h2v1H7v-1z" fill="#808080" />
      <path d="M3 13h10v2H3v-2z" fill="#000" />
      <path d="M4 14h8v1H4v-1z" fill="#C0C0C0" />
      <path d="M12 14h1v1h-1v-1z" fill="#808080" />
    </PixelIconWrapper>
  );
}
