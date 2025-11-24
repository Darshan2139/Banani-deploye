import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BananaEntry } from '@/utils/supabaseClient';

interface CalendarProps {
  entries: BananaEntry[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

export default function Calendar({ entries, onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get dates with entries
  const datesWithEntries = new Set(
    entries.map(entry => new Date(entry.date).toDateString())
  );

  // Get number of entries for each date
  const entriesByDate: Record<string, number> = {};
  entries.forEach(entry => {
    const dateStr = new Date(entry.date).toDateString();
    entriesByDate[dateStr] = (entriesByDate[dateStr] || 0) + 1;
  });

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = date.toLocaleDateString('en-IN'); // DD/MM/YYYY format
    onDateSelect(formattedDate);
  };

  const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create array of days to display
  const calendarDays: (number | null)[] = [];
  
  // Add empty slots for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 min-w-40 text-center">
          {monthName}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-12"></div>;
          }

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dateStr = date.toDateString();
          const hasEntries = datesWithEntries.has(dateStr);
          const entryCount = entriesByDate[dateStr] || 0;
          const formattedDate = date.toLocaleDateString('en-IN');
          const isSelected = selectedDate === formattedDate;
          const isToday = dateStr === new Date().toDateString();

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                h-12 rounded-lg flex flex-col items-center justify-center text-sm font-medium
                transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : isToday
                  ? 'bg-yellow-100 text-gray-900 border-2 border-yellow-400'
                  : hasEntries
                  ? 'bg-blue-50 text-gray-900 hover:bg-blue-100'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }
              `}
              title={hasEntries ? `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}` : 'No entries'}
            >
              <span>{day}</span>
              {hasEntries && (
                <span className={`text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                  {entryCount > 0 && '●'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-gray-600">Has entries</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-yellow-400"></div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </div>
  );
}
