import { useState } from 'react'
import RetroButton from '../ui/RetroButton'
import RetroInput from '../ui/RetroInput'
import { supabase } from '../../supabaseClient'

export default function FoodSearchExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [statusMessage, setStatusMessage] = useState('Ready')
  const [loading, setLoading] = useState(false)

  // ─── Search Handler ───
  const handleSearch = async (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    
    if (!q) {
      setResults([])
      setStatusMessage('Ready')
      return
    }

    setLoading(true)
    setStatusMessage(`Searching for "${q}"...`)

    try {
      // PERHATIKAN: URL disesuaikan dengan port Spring Boot Anda (biasanya 8080)
      const response = await fetch(`http://localhost:8080/api/nutrition/search?q=${q}`);
      
      if (!response.ok) {
        throw new Error(`Gagal mengambil data dari server (Status: ${response.status})`);
      }

      const json = await response.json();
      
      // Mengambil array data dari struktur JSON yang kita buat di Spring Boot
      const mapped = (json.data || []).map((item) => ({
        id: item.id,
        name: item.name || '',
        servingSize: '1 Porsi', 
        calories: item.calories || 0,
        protein: item.proteins || 0,       
        carbs: item.carbohydrate || 0,     
        fat: item.fat || 0,
        image: item.image || ''            
      }))

      setResults(mapped)
      
      if (mapped.length === 0) {
        setStatusMessage(`Tidak ada hasil untuk "${q}"`)
      } else {
        setStatusMessage(`Found ${mapped.length} results for "${q}"`)
      }
      
    } catch (err) {
      console.error('[FoodSearch] Fetch error:', err)
      setStatusMessage(`Error: ${err.message}`)
      setResults([])
    } finally {
      setLoading(false) // Ini memastikan loading berhenti apapun yang terjadi
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search Bar */}
      <div className="retro-groupbox shadow-sm">
        <span className="retro-groupbox-label font-bold text-[#000080]">🔍 Search Database</span>
        <form onSubmit={handleSearch} className="flex gap-3 items-end mt-1">
          <div className="flex-1">
            <RetroInput
              id="food-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Abon, Agar-agar, Tempe..."
              className="w-full focus:ring-2 focus:ring-[#000080] transition-all"
            />
          </div>
          <RetroButton type="submit" primary disabled={loading} className="min-w-[100px]">
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              'Search ↵'
            )}
          </RetroButton>
        </form>
      </div>

      {/* Results Grid */}
      <div className="retro-groupbox flex-1 flex flex-col shadow-sm">
        <span className="retro-groupbox-label font-bold text-[#000080]">📑 Results</span>
        <div className="retro-scroll-area flex-1 min-h-[250px] p-2 bg-[#f8f9fa]">
          {results.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center animate-fade-in">
                <span className="text-[48px] mb-3 opacity-80">🍽️</span>
                <p className="font-semibold text-[14px] text-[#000080]">Database Makanan Kosong</p>
                <p className="text-[11px] mt-1">Ketik nama makanan di atas untuk melihat nutrisinya.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {results.map((food) => (
                <div 
                  key={food.id} 
                  className="retro-raised p-3 flex justify-between items-center bg-white group hover:bg-[#000080] hover:text-white transition-all duration-200 cursor-pointer rounded-sm"
                >
                  <div className="flex items-center gap-3">
                    {food.image ? (
                      <img 
                        src={food.image} 
                        alt={food.name} 
                        className="w-12 h-12 object-cover rounded border-2 border-gray-200 group-hover:border-white transition-colors" 
                        onError={(e) => { e.target.style.display = 'none' }} // Sembunyikan jika gambar gagal dimuat
                      />
                    ) : (
                      // Placeholder jika tidak ada gambar
                      <div className="w-12 h-12 bg-gray-200 border-2 border-gray-300 rounded flex items-center justify-center text-[20px] group-hover:border-white">
                        🍲
                      </div>
                    )}
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-[14px] leading-tight">{food.name}</h4>
                      <p className="text-[11px] text-gray-500 group-hover:text-gray-300 mt-0.5">{food.servingSize}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-extrabold text-[#000080] group-hover:text-[#FFD700] text-[15px]">
                      {food.calories} <span className="text-[10px] font-normal">kcal</span>
                    </p>
                    
                    {/* BAGIAN YANG DIPERBARUI: Teks makronutrisi tidak lagi disingkat */}
                    <div className="flex gap-1.5 text-[9px] font-mono mt-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded group-hover:bg-white group-hover:text-[#000080]">
                        Protein: {food.protein}g
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded group-hover:bg-white group-hover:text-[#000080]">
                        Karbohidrat: {food.carbs}g
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded group-hover:bg-white group-hover:text-[#000080]">
                        Lemak: {food.fat}g
                      </span>
                    </div>
                    {/* AKHIR BAGIAN YANG DIPERBARUI */}

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="retro-statusbar mt-auto font-mono text-[11px]">
        <div className="retro-statusbar-section flex-1 truncate">
          {loading ? '⏳ ' : '✓ '}{statusMessage}
        </div>
        <div className="retro-statusbar-section" style={{ flex: 'none', width: 120 }}>
          Count: {results.length}
        </div>
      </div>
    </div>
  )
}