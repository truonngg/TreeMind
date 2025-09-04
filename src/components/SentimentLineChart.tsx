"use client";

import { useMemo } from 'react';

interface SentimentDataPoint {
  date: string;
  sentiment: number;
  entries: number;
}

interface SentimentLineChartProps {
  data: SentimentDataPoint[];
  className?: string;
}

export default function SentimentLineChart({ data, className = "" }: SentimentLineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Sort data by date to ensure proper chronological order
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find min and max sentiment for scaling
    const sentiments = sortedData.map(d => d.sentiment).filter(s => s !== 0);
    const minSentiment = Math.min(...sentiments, -1);
    const maxSentiment = Math.max(...sentiments, 1);
    const range = maxSentiment - minSentiment;

    // Find date range for x-axis scaling
    const dates = sortedData.map(d => new Date(d.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate;

    // Create SVG path for the trendline
    const width = 300;
    const height = 120;
    const padding = 20;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Calculate linear regression for trendline
    const n = sortedData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    sortedData.forEach((point, index) => {
      const x = index; // Use index as x value for simplicity
      const y = point.sentiment;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    // Calculate slope and intercept
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Create trendline points
    const startX = padding;
    const endX = padding + chartWidth;
    const startY = padding + ((maxSentiment - (slope * 0 + intercept)) / range) * chartHeight;
    const endY = padding + ((maxSentiment - (slope * (n - 1) + intercept)) / range) * chartHeight;
    
    const trendlinePath = `M ${startX},${startY} L ${endX},${endY}`;

    return {
      width,
      height,
      trendlinePath,
      points: sortedData.map((point, index) => {
        const x = padding + (index / (n - 1)) * chartWidth;
        const y = padding + ((maxSentiment - point.sentiment) / range) * chartHeight;
        return {
          x,
          y,
          sentiment: point.sentiment,
          entries: point.entries,
          date: point.date
        };
      })
    };
  }, [data]);

  if (!chartData) {
    return (
      <div className={`flex items-center justify-center h-32 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500 text-sm">No sentiment data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-3">Sentiment Over Time</h4>
      <div className="relative">
        <svg width={chartData.width} height={chartData.height + 30} className="w-full h-auto">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height={chartData.height} fill="url(#grid)" />
          
          {/* Sentiment trendline */}
          <path
            d={chartData.trendlinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4,2"
          />
          
          {/* Data points */}
          {chartData.points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={point.entries > 0 ? "4" : "2"}
              fill={point.entries > 0 
                ? (point.sentiment > 0.1 ? "#10b981" : point.sentiment < -0.1 ? "#ef4444" : "#6b7280")
                : "#d1d5db" // Gray for days with no entries
              }
              className="hover:r-6 transition-all cursor-pointer"
              title={`${point.date}: ${point.entries > 0 ? `${point.sentiment.toFixed(2)} sentiment, ${point.entries} entries` : 'No entry'}`}
            />
          ))}
          
          {/* Zero line */}
          <line
            x1={20}
            y1={chartData.height / 2}
            x2={chartData.width - 20}
            y2={chartData.height / 2}
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          
          {/* Date labels on x-axis */}
          {chartData.points.length > 0 && (
            <>
              {/* First date */}
              <text
                x={chartData.points[0].x}
                y={chartData.height + 15}
                textAnchor="start"
                className="text-xs fill-gray-600"
              >
                {new Date(chartData.points[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
              
              {/* Middle date */}
              {chartData.points.length > 1 && (
                <text
                  x={chartData.points[Math.floor(chartData.points.length / 2)].x}
                  y={chartData.height + 15}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {new Date(chartData.points[Math.floor(chartData.points.length / 2)].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              )}
              
              {/* Last date */}
              {chartData.points.length > 2 && (
                <text
                  x={chartData.points[chartData.points.length - 1].x}
                  y={chartData.height + 15}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  {new Date(chartData.points[chartData.points.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              )}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
