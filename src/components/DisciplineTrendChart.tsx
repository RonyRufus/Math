import React, { useState } from 'react';
import { UserStats, OperationType } from '../types';

interface DisciplineTrendChartProps {
  stats: UserStats;
}

const OPERATION_COLORS: Record<OperationType, { name: string; stroke: string; glow: string; text: string }> = {
  addition: { name: 'Addition', stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.2)', text: 'text-emerald-450' },
  subtraction: { name: 'Subtraction', stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)', text: 'text-amber-450' },
  multiplication: { name: 'Multiplication', stroke: '#a855f7', glow: 'rgba(168, 85, 247, 0.2)', text: 'text-purple-400' },
  division: { name: 'Division', stroke: '#38bdf8', glow: 'rgba(56, 189, 248, 0.2)', text: 'text-sky-450' },
  squares: { name: 'Squares', stroke: '#d946ef', glow: 'rgba(217, 70, 239, 0.2)', text: 'text-fuchsia-400' },
  roots: { name: 'Roots', stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.2)', text: 'text-cyan-400' },
  algebra: { name: 'Algebra', stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.2)', text: 'text-rose-450' },
};

export default function DisciplineTrendChart({ stats }: DisciplineTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<OperationType, boolean>>({
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true,
    squares: true,
    roots: true,
    algebra: true,
  });

  const recentSessions = stats.recentSessions || [];
  
  // Reconstruct chronological order from oldest to newest
  const chronologicalSessions = [...recentSessions].reverse();

  // Core tracking structure to map sequential progression points
  const dataPoints: { label: string; timestamp: number; ratings: Record<OperationType, number> }[] = [];

  const currentRatings: Record<OperationType, number> = {
    addition: 1000,
    subtraction: 1000,
    multiplication: 1000,
    division: 1000,
    squares: 1000,
    roots: 1000,
    algebra: 1000,
  };

  // 1st starting base point
  dataPoints.push({
    label: 'Start (1000)',
    timestamp: Date.now() - (chronologicalSessions.length + 1) * 3600 * 1000,
    ratings: { ...currentRatings },
  });

  // Track state progression over every played session
  chronologicalSessions.forEach((session, idx) => {
    if (session.ratingsSnapshot) {
      Object.keys(currentRatings).forEach((opKey) => {
        const op = opKey as OperationType;
        if (session.ratingsSnapshot?.[op] !== undefined) {
          currentRatings[op] = session.ratingsSnapshot[op];
        }
      });
    } else {
      // Fallback for older sessions prior to Snapshot release: check operations trained
      session.operations.forEach((op) => {
        // Approximate slightly based on average outcome if no granular snapshot exists, or just keep active stats.ratings
        // Here we can just keep current known final rating if it was trained
        if (idx === chronologicalSessions.length - 1) {
          currentRatings[op] = stats.ratings[op];
        }
      });
    }

    dataPoints.push({
      label: `Run ${idx + 1}`,
      timestamp: session.timestamp,
      ratings: { ...currentRatings },
    });
  });

  // Dynamic axis boundary scaling based on actual data bounds
  let minRating = 900;
  let maxRating = 1100;

  dataPoints.forEach((pt) => {
    Object.keys(pt.ratings).forEach((opKey) => {
      const op = opKey as OperationType;
      if (!activeFilters[op]) return; // Skip inactive lines for scaling calculations
      const val = pt.ratings[op];
      if (val < minRating) minRating = val;
      if (val > maxRating) maxRating = val;
    });
  });

  // Standard cosmetic bounds adjustments with safety margins
  minRating = Math.floor((minRating - 40) / 50) * 50;
  maxRating = Math.ceil((maxRating + 40) / 50) * 50;

  if (minRating === maxRating) {
    minRating -= 50;
    maxRating += 50;
  }

  // Dimensions of SVG plot bounding box
  const viewWidth = 600;
  const viewHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const graphWidth = viewWidth - paddingLeft - paddingRight;
  const graphHeight = viewHeight - paddingTop - paddingBottom;

  // Grid tick creation
  const yTicks: number[] = [];
  const tickCount = 5;
  for (let i = 0; i < tickCount; i++) {
    yTicks.push(Math.round(minRating + (i / (tickCount - 1)) * (maxRating - minRating)));
  }

  // Calculate coordinates for SVG paths
  const getCoordinatesForLine = (op: OperationType) => {
    return dataPoints.map((pt, idx) => {
      const x = paddingLeft + (idx / (dataPoints.length - 1)) * graphWidth;
      const y =
        paddingTop +
        graphHeight -
        ((pt.ratings[op] - minRating) / (maxRating - minRating)) * graphHeight;
      return { x, y, value: pt.ratings[op] };
    });
  };

  const toggleFilter = (op: OperationType) => {
    setActiveFilters((prev) => {
      const next = { ...prev, [op]: !prev[op] };
      // Keep at least one active to avoid blank space errors
      if (Object.values(next).every((v) => !v)) return prev;
      return next;
    });
  };

  return (
    <div className="bg-[#0F1115]/40 border border-slate-800/80 rounded-2xl p-4.5 mt-5 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
        <div>
          <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-405 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Discipline ELO Trajectory
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
            Superimposed lifetime learning curve curves across all active mental math areas
          </p>
        </div>

        {/* Legend pills acting as toggle switches */}
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {(Object.keys(OPERATION_COLORS) as OperationType[]).map((op) => {
            const isActive = activeFilters[op];
            const col = OPERATION_COLORS[op];
            return (
              <button
                key={op}
                type="button"
                onClick={() => toggleFilter(op)}
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all duration-300 cursor-pointer select-none
                  ${
                    isActive
                      ? 'bg-slate-900 shadow-md'
                      : 'opacity-35 border-transparent bg-transparent hover:opacity-50'
                  }
                `}
                style={{
                  borderColor: isActive ? col.stroke : 'transparent',
                  color: isActive ? col.stroke : '#64748b',
                }}
              >
                {col.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Y-Axis dashed gridlines */}
          {yTicks.map((tick, idx) => {
            const y =
              paddingTop +
              graphHeight -
              ((tick - minRating) / (maxRating - minRating)) * graphHeight;
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={viewWidth - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4,4"
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#64748b"
                  className="font-mono text-[9px] font-semibold"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X-Axis run index labels */}
          {dataPoints.map((pt, idx) => {
            // Draw x axes coordinates dynamically. To avoid cluttering mobile views, thin them down
            if (dataPoints.length > 8 && idx % 2 !== 0 && idx !== dataPoints.length - 1) {
              return null;
            }
            const x = paddingLeft + (idx / (dataPoints.length - 1)) * graphWidth;
            return (
              <text
                key={idx}
                x={x}
                y={viewHeight - 8}
                textAnchor="middle"
                fill="#64748b"
                className="font-mono text-[8px] font-bold opacity-75"
              >
                {pt.label}
              </text>
            );
          })}

          {/* Superimposed Trend Lines */}
          {(Object.keys(OPERATION_COLORS) as OperationType[]).map((op) => {
            if (!activeFilters[op]) return null;
            const coords = getCoordinatesForLine(op);
            const col = OPERATION_COLORS[op];

            // Build path string d="M x0 y0 L x1 y1 ..."
            let dPath = '';
            coords.forEach((c, idx) => {
              if (idx === 0) {
                dPath += `M ${c.x} ${c.y}`;
              } else {
                // Generate clean bezier curves for elegant smooth curves
                const prev = coords[idx - 1];
                const cpX1 = prev.x + (c.x - prev.x) / 2;
                const cpY1 = prev.y;
                const cpX2 = prev.x + (c.x - prev.x) / 2;
                const cpY2 = c.y;
                dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${c.x} ${c.y}`;
              }
            });

            return (
              <g key={op}>
                {/* Glow Filter Backup Line representation */}
                <path
                  d={dPath}
                  fill="none"
                  stroke={col.stroke}
                  strokeWidth={4.5}
                  className="opacity-15 blur-[2.5px] transition-all duration-300"
                />
                {/* Clean sharp foreground line */}
                <path
                  d={dPath}
                  fill="none"
                  stroke={col.stroke}
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Draw small indicator dots on runs */}
                {coords.map((c, idx) => {
                  const isHovered = hoveredIndex === idx;
                  return (
                    <circle
                      key={idx}
                      cx={c.x}
                      cy={c.y}
                      r={isHovered ? 4 : 2}
                      fill={isHovered ? '#ffffff' : col.stroke}
                      stroke={col.stroke}
                      strokeWidth={isHovered ? 2 : 0}
                      className="transition-all duration-150"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Highlight Line on active hover index */}
          {hoveredIndex !== null && (
            <line
              x1={paddingLeft + (hoveredIndex / (dataPoints.length - 1)) * graphWidth}
              y1={paddingTop}
              x2={paddingLeft + (hoveredIndex / (dataPoints.length - 1)) * graphWidth}
              y2={paddingTop + graphHeight}
              stroke="rgba(99, 102, 241, 0.45)"
              strokeWidth={1.25}
              strokeDasharray="2,2"
              pointerEvents="none"
            />
          )}

          {/* Invisible interactive vertical segments mapped for seamless tracking */}
          {dataPoints.map((_, idx) => {
            const x = paddingLeft + (idx / (dataPoints.length - 1)) * graphWidth;
            const nextX = paddingLeft + ((idx + 1) / (dataPoints.length - 1)) * graphWidth;
            const width = idx === dataPoints.length - 1 ? graphWidth / (dataPoints.length - 1) : nextX - x;
            return (
              <rect
                key={idx}
                x={x - width / 2}
                y={paddingTop}
                width={width}
                height={graphHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(idx)}
                onTouchStart={() => setHoveredIndex(idx)}
              />
            );
          })}
        </svg>

        {/* Hover Floating Overlay Box panel */}
        {hoveredIndex !== null && (
          <div
            className="absolute top-2.5 bg-[#08080A]/95 border border-slate-800 backdrop-blur-md rounded-xl p-3 shadow-xl right-2 z-20 pointer-events-none text-left flex flex-col gap-1 w-36"
            style={{
              transition: 'all 120ms ease-out',
            }}
          >
            <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 font-mono leading-none border-b border-slate-800 pb-1.5 mb-1.5">
              {dataPoints[hoveredIndex].label} CheckPoint
            </div>
            {(Object.keys(OPERATION_COLORS) as OperationType[]).map((op) => {
              if (!activeFilters[op]) return null;
              const col = OPERATION_COLORS[op];
              const score = dataPoints[hoveredIndex].ratings[op];
              return (
                <div key={op} className="flex justify-between items-center text-[10px] font-mono leading-none">
                  <span className="text-slate-500 font-medium truncate w-[60%]">{col.name}</span>
                  <span className={`font-bold ${col.text}`}>{score}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
