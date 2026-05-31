import { useState, useEffect } from 'react'

export default function RetroCalendar({ selectedDate, onDateSelect, activeDates = [], onMonthChange }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  // Memicu callback onMonthChange setiap kali bulan/tahun kalender berubah
  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    }
  }, [currentMonth.getFullYear(), currentMonth.getMonth(), onMonthChange])

  // Sinkronkan ketika selectedDate berubah dari luar
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [selectedDate])

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateSelect(newDate)
  }

  const renderDays = () => {
    const days = []
    
    // Empty slots sebelum tanggal 1
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-1"></div>)
    }
    
    // Angka hari
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected = selectedDate && 
                         selectedDate.getDate() === d &&
                         selectedDate.getMonth() === currentMonth.getMonth() &&
                         selectedDate.getFullYear() === currentMonth.getFullYear()
                         
      const isToday = new Date().getDate() === d && 
                      new Date().getMonth() === currentMonth.getMonth() && 
                      new Date().getFullYear() === currentMonth.getFullYear()

      // Kita gunakan w-8 h-8 agar ukurannya konsisten dan kotak
      let btnClass = "w-8 h-8 mx-auto flex items-center justify-center text-[11px] cursor-pointer box-border"
      
      if (isSelected) {
         // Style ketika dipilih (seperti tombol ditekan / biru)
         btnClass += " bg-[#000080] text-white shadow-[inset_2px_2px_#000,inset_-1px_-1px_#fff]"
      } else {
         // Style tombol biasa: efek 3D raised manual (jangan gunakan retro-btn karena ada padding ekstra)
         btnClass += " bg-[#c0c0c0] hover:bg-gray-200 shadow-[inset_1px_1px_#fff,inset_-1px_-1px_#808080] active:shadow-[inset_1px_1px_#808080,inset_-1px_-1px_#fff]"
      }
      
      if (isToday && !isSelected) {
          btnClass += " border-2 border-[#000080] font-bold"
      }

      // Cek apakah tanggal ini memiliki history
      const currentDayStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const hasHistory = activeDates.includes(currentDayStr)

      // Kita gunakan relative container agar bisa menambahkan indikator di pojok
      days.push(
        <button 
          key={d} 
          onClick={() => handleDateClick(d)}
          className={`${btnClass} relative`}
          type="button"
        >
          {d}
          {hasHistory && (
            <div className="absolute bottom-[2px] right-[2px] w-[4px] h-[4px] bg-red-600 rounded-full" title="Ada history kalori"></div>
          )}
        </button>
      )
    }
    return days
  }

  return (
    <div className="retro-groupbox bg-[#c0c0c0] p-2 inline-block shadow-[inset_1px_1px_#dfdfdf,inset_-1px_-1px_#808080]">
      {/* Header Bulan & Tahun */}
      <div className="flex justify-between items-center mb-2 bg-[#000080] text-white p-1 shadow-[inset_1px_1px_#ffffff40]">
        <button type="button" onClick={handlePrevMonth} className="px-2 hover:bg-[#1010a0] cursor-pointer">{"<<"}</button>
        <span className="font-bold text-[11px]">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
        <button type="button" onClick={handleNextMonth} className="px-2 hover:bg-[#1010a0] cursor-pointer">{">>"}</button>
      </div>
      
      {/* Nama-nama Hari */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center font-bold text-[10px]">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>
      
      {/* Grid Tanggal */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  )
}
