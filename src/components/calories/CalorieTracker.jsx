import { useState, useEffect, useCallback } from 'react'
import RetroButton from '../ui/RetroButton'
import RetroInput from '../ui/RetroInput'
import RetroSelect from '../ui/RetroSelect'
import RetroCalendar from '../ui/RetroCalendar'
import { useAuth } from '../../hooks/useAuth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export default function CalorieTracker() {
  const dailyGoal = 2000

  // ─── Kalender State ───
  const [selectedDate, setSelectedDate] = useState(new Date())

  // ─── New Entry State (DTO-Ready) ───
  const [newEntry, setNewEntry] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'breakfast',
  })

  // ─── Local entries (sekarang berasal dari backend) ───
  const [entries, setEntries] = useState([])
  const [statusMessage, setStatusMessage] = useState('Ready')
  const [loading, setLoading] = useState(false)

  // ─── Active Dates (Indikator Kalender) ───
  const [activeDates, setActiveDates] = useState([])
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(null)

  // ─── Auth ───
  const { session } = useAuth()

  // ─── Fetch Data dari Backend ───
  const fetchEntries = async () => {
    if (!session?.access_token) {
      setStatusMessage('Login terlebih dahulu untuk melihat data')
      setEntries([])
      return
    }
    
    setLoading(true)
    setStatusMessage('Loading data...')
    
    // Format date ke YYYY-MM-DD
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/calories?date=${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        setEntries(result.data || [])
        setStatusMessage(`Loaded ${result.data?.length || 0} items`)
      } else {
        throw new Error(result.message || 'Gagal memuat data')
      }
    } catch (err) {
      console.error('[CalorieTracker] Fetch error:', err)
      if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        setStatusMessage('⚠️ Backend tidak tersedia (pastikan Spring Boot berjalan)')
      } else {
        setStatusMessage(`Error: ${err.message}`)
      }
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveDates = useCallback(async (year, month) => {
    if (!session?.access_token) return
    setCurrentCalendarMonth({ year, month })

    try {
      const response = await fetch(`${API_BASE_URL}/api/calories/active-dates?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setActiveDates(result.data || [])
        }
      }
    } catch (err) {
      console.error('[CalorieTracker] Error fetching active dates:', err)
    }
  }, [session])

  useEffect(() => {
    fetchEntries()
  }, [selectedDate, session])

  const mealOptions = [
    { value: 'breakfast', label: '🌅 Breakfast' },
    { value: 'lunch', label: '☀️ Lunch' },
    { value: 'dinner', label: '🌙 Dinner' },
    { value: 'snack', label: '🍿 Snack' },
  ]

  const updateField = (field) => (e) =>
    setNewEntry({ ...newEntry, [field]: e.target.value })

  // ─── Add Entry Handler ───
  const handleAddEntry = async (e) => {
    e.preventDefault()
    if (!session?.access_token) {
      setStatusMessage('⚠️ Login terlebih dahulu')
      return
    }

    setLoading(true)
    setStatusMessage('Menyimpan data...')

    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const payload = {
      name: newEntry.name,
      calories: parseFloat(newEntry.calories) || 0,
      protein: parseFloat(newEntry.protein) || 0,
      carbs: parseFloat(newEntry.carbs) || 0,
      fat: parseFloat(newEntry.fat) || 0,
      mealType: newEntry.mealType,
      entryDate: dateStr
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/calories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setStatusMessage(`Added: ${payload.name} (${payload.calories} kcal)`)
        setNewEntry({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          mealType: newEntry.mealType,
        })
        fetchEntries() // Refresh data
        if (currentCalendarMonth) fetchActiveDates(currentCalendarMonth.year, currentCalendarMonth.month)
      } else {
        throw new Error(result.message || 'Gagal menyimpan data')
      }
    } catch (err) {
      console.error('[CalorieTracker] Add error:', err)
      if (err.message?.includes('Failed to fetch')) {
        setStatusMessage('⚠️ Backend tidak tersedia')
      } else {
        setStatusMessage(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntry = async (id) => {
    if (!session?.access_token) return

    setLoading(true)
    setStatusMessage('Menghapus data...')

    try {
      const response = await fetch(`${API_BASE_URL}/api/calories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setStatusMessage('Entry deleted')
        fetchEntries() // Refresh data
        if (currentCalendarMonth) fetchActiveDates(currentCalendarMonth.year, currentCalendarMonth.month)
      } else {
        throw new Error(result.message || 'Gagal menghapus data')
      }
    } catch (err) {
      console.error('[CalorieTracker] Delete error:', err)
      if (err.message?.includes('Failed to fetch')) {
        setStatusMessage('⚠️ Backend tidak tersedia')
      } else {
        setStatusMessage(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Data entries sudah di-filter per hari dari backend ───
  const activeEntries = entries

  // ─── Totals (Hanya untuk activeEntries) ───
  const totals = activeEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const caloriePercent = Math.min(100, (totals.calories / dailyGoal) * 100)

  return (
    <div className="flex flex-col gap-3">
      
      {/* Calendar & Progress */}
      <div className="flex flex-col md:flex-row gap-3 items-start">
        <div className="flex-none w-full md:w-auto flex justify-center">
          <RetroCalendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
            activeDates={activeDates}
            onMonthChange={fetchActiveDates}
          />
        </div>
        
        {/* Daily Progress */}
        <div className="retro-groupbox flex-1 w-full flex flex-col justify-center">
        <span className="retro-groupbox-label">📊 Daily Progress</span>
        <div className="flex justify-between text-[11px] mb-1">
          <span>Calories: {totals.calories.toFixed(0)} / {dailyGoal} kcal</span>
          <span>{caloriePercent.toFixed(0)}%</span>
        </div>
        <div className="retro-progress">
          <div
            className="retro-progress-fill"
            style={{
              width: `${caloriePercent}%`,
              backgroundColor: caloriePercent > 100 ? '#e74c3c' : '#000080',
            }}
          />
        </div>
        <div className="flex justify-around mt-2 text-[11px]">
          <span>🥩 Protein: {totals.protein.toFixed(1)}g</span>
          <span>🍞 Carbs: {totals.carbs.toFixed(1)}g</span>
          <span>🧈 Fat: {totals.fat.toFixed(1)}g</span>
        </div>
      </div>
      </div>

      {/* Add Entry Form */}
      <div className="retro-groupbox">
        <span className="retro-groupbox-label">➕ Add Food Entry</span>
        <form onSubmit={handleAddEntry} className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <RetroInput
              label="Food Name:"
              id="cal-name"
              value={newEntry.name}
              onChange={updateField('name')}
              placeholder="e.g. Nasi Goreng"
              required
            />
            <RetroInput
              label="Calories (kcal):"
              id="cal-calories"
              type="number"
              value={newEntry.calories}
              onChange={updateField('calories')}
              placeholder="e.g. 350"
              required
              min="0"
            />
            <RetroInput
              label="Protein (g):"
              id="cal-protein"
              type="number"
              value={newEntry.protein}
              onChange={updateField('protein')}
              placeholder="0"
              min="0"
              step="0.1"
            />
            <RetroInput
              label="Carbs (g):"
              id="cal-carbs"
              type="number"
              value={newEntry.carbs}
              onChange={updateField('carbs')}
              placeholder="0"
              min="0"
              step="0.1"
            />
            <RetroInput
              label="Fat (g):"
              id="cal-fat"
              type="number"
              value={newEntry.fat}
              onChange={updateField('fat')}
              placeholder="0"
              min="0"
              step="0.1"
            />
            <RetroSelect
              label="Meal Type:"
              id="cal-meal"
              value={newEntry.mealType}
              onChange={updateField('mealType')}
              options={mealOptions}
            />
          </div>
          <div className="flex gap-2">
            <RetroButton type="submit" primary disabled={loading}>
              {loading ? 'Adding...' : 'Add Entry'}
            </RetroButton>
          </div>
        </form>
      </div>

      {/* Entries List */}
      <div className="retro-groupbox">
        <span className="retro-groupbox-label">
          📋 Log for {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ({activeEntries.length} items)
        </span>
        <div className="retro-scroll-area" style={{ maxHeight: 160 }}>
          {activeEntries.length === 0 ? (
            <p className="text-gray-500 text-center p-4 text-[11px]">
              No food entries for this date.
            </p>
          ) : (
            <table className="retro-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Food</th>
                  <th>Meal</th>
                  <th>Cal</th>
                  <th>P</th>
                  <th>C</th>
                  <th>F</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="text-[10px]">{entry.timestamp}</td>
                    <td>{entry.name}</td>
                    <td className="text-[10px]">{entry.mealType}</td>
                    <td>{entry.calories}</td>
                    <td>{entry.protein}g</td>
                    <td>{entry.carbs}g</td>
                    <td>{entry.fat}g</td>
                    <td>
                      <button
                        type="button"
                        className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="retro-statusbar mt-auto">
        <div className="retro-statusbar-section">{statusMessage}</div>
        <div className="retro-statusbar-section" style={{ flex: 'none', width: 120 }}>
          Items: {activeEntries.length}
        </div>
      </div>
    </div>
  )
}
