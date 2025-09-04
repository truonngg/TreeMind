"use client";

import { useMemo } from 'react';

interface DailyTheme {
  date: string;
  themes: string[];
  hasEntry: boolean;
}

interface ThemeCalendarProps {
  data: DailyTheme[];
  className?: string;
}

// Theme colors to match the library page tags (using 500 variants for small dots)
const themeColors: Record<string, string> = {
  work: "bg-purple-500",
  health: "bg-green-500", 
  relationships: "bg-pink-500",
  creativity: "bg-orange-500",
  school: "bg-indigo-500",
  money: "bg-yellow-500",
  learning: "bg-indigo-500",
  technology: "bg-blue-500",
  family: "bg-yellow-500",
  travel: "bg-cyan-500",
  general: "bg-gray-500"
};

export default function ThemeCalendar({ data, className = "" }: ThemeCalendarProps) {
  const calendarData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Create a 7x5 grid (35 days max) to ensure proper weekday alignment
    const grid = Array(35).fill(null);
    
    // Find the first day of the 30-day period to determine starting weekday
    const firstDate = new Date(data[0].date + 'T00:00:00.000Z');
    const startDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Place data starting from the correct weekday position
    data.forEach((day, index) => {
      const gridIndex = startDayOfWeek + index;
      if (gridIndex < 35) {
        grid[gridIndex] = day;
      }
    });

    // Group into weeks (7 days each)
    const weeks = [];
    for (let i = 0; i < 35; i += 7) {
      weeks.push(grid.slice(i, i + 7));
    }

    return weeks;
  }, [data]);

  if (!calendarData) {
    return (
      <div className={`flex items-center justify-center h-32 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500 text-sm">No calendar data available</p>
      </div>
    );
  }

  // Get unique themes from the data for legend
  const uniqueThemes = useMemo(() => {
    const themes = new Set<string>();
    data.forEach(day => {
      if (day.hasEntry && day.themes) {
        day.themes.forEach(theme => themes.add(theme));
      }
    });
    return Array.from(themes).sort();
  }, [data]);

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Themes - Past 30 Days</h4>
      <div className="flex gap-4">
        {/* Calendar */}
        <div className="space-y-2 flex-1">
          {/* Weekday labels */}
          <div className="flex gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
              <div key={dayName} className="w-8 h-4 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">{dayName}</span>
              </div>
            ))}
          </div>
          
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((day, dayIndex) => {
                // If no day data for this position, render empty cell
                if (!day) {
                  return (
                    <div
                      key={dayIndex}
                      className="w-8 h-8 rounded-md flex flex-col items-center justify-center text-xs relative"
                    />
                  );
                }
                
                // Extract day number directly from date string to avoid timezone issues
                const dayNumber = parseInt(day.date.split('-')[2], 10);
                const date = new Date(day.date + 'T00:00:00.000Z'); // Use UTC to avoid timezone issues
                const dayOfWeek = date.getDay();
                
                return (
                  <div
                    key={dayIndex}
                    className={`
                      w-8 h-8 rounded-md flex flex-col items-center justify-center text-xs relative
                      ${day.hasEntry 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-gray-50 border border-gray-200'
                      }
                    `}
                    title={`${day.date}: ${day.hasEntry ? day.themes.join(', ') || 'No themes' : 'No entry'}`}
                  >
                    <span className={`text-xs font-medium ${
                      day.hasEntry ? 'text-emerald-700' : 'text-gray-400'
                    }`}>
                      {dayNumber}
                    </span>
                    
                    {/* Theme indicators */}
                    {day.hasEntry && day.themes.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {day.themes.slice(0, 2).map((theme, themeIndex) => (
                          <div
                            key={themeIndex}
                            className={`w-1 h-1 rounded-full ${
                              themeColors[theme] || 'bg-gray-400'
                            }`}
                          />
                        ))}
                        {day.themes.length > 2 && (
                          <div className="w-1 h-1 rounded-full bg-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Theme Legend */}
        {uniqueThemes.length > 0 && (
          <div className="flex-shrink-0">
            <div className="text-xs font-medium text-gray-600 mb-2">Themes</div>
            <div className="space-y-1">
              {uniqueThemes.slice(0, 8).map((theme) => (
                <div key={theme} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${themeColors[theme] || 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-600 capitalize">{theme}</span>
                </div>
              ))}
              {uniqueThemes.length > 8 && (
                <div className="text-xs text-gray-400">
                  +{uniqueThemes.length - 8} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
