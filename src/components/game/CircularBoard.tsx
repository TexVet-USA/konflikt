import React, { useMemo } from 'react';
import { useGame } from '@/lib/GameContext';
import { PLAYER_COLORS, TOTAL_SPACES, Player } from '@/lib/gameTypes';

const CX = 400;
const CY = 400;
const OUTER_R = 340;
const INNER_R = 105;
const PIECE_R = 16;
const ANGLE_PER_SPACE = 360 / TOTAL_SPACES;

function getAngle(index: number): number {
  return 90 - index * ANGLE_PER_SPACE;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = toRad(deg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedge(cx: number, cy: number, ir: number, or_: number, sDeg: number, eDeg: number): string {
  const os = polar(cx, cy, or_, sDeg);
  const oe = polar(cx, cy, or_, eDeg);
  const is_ = polar(cx, cy, ir, sDeg);
  const ie = polar(cx, cy, ir, eDeg);
  return `M ${os.x} ${os.y} A ${or_} ${or_} 0 0 1 ${oe.x} ${oe.y} L ${ie.x} ${ie.y} A ${ir} ${ir} 0 0 0 ${is_.x} ${is_.y} Z`;
}

const CircularBoard: React.FC = () => {
  const { state, selectSpace, moveTo, deselect } = useGame();
  const half = ANGLE_PER_SPACE / 2;
  const player = state.currentPlayer;

  const spaceData = useMemo(() => {
    return Array.from({ length: TOTAL_SPACES }, (_, i) => {
      const mid = getAngle(i);
      return {
        index: i,
        mid,
        startDeg: mid - half,
        endDeg: mid + half,
        isEntry: i < 6,
        isExit: i >= 18,
        white: state.board[i].white,
        black: state.board[i].black,
      };
    });
  }, [state.board]);

  const isMoving = state.phase === 'moving';

  return (
    <svg viewBox="0 0 800 800" className="w-full h-full select-none">
      <defs>
        <radialGradient id="bgGrad">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="pitGrad">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#4C1D95" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.03" />
        </radialGradient>
        <filter id="ps">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.5" />
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="validGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer background */}
      <circle cx={CX} cy={CY} r={OUTER_R + 40} fill="url(#bgGrad)" />

      {/* Decorative outer rings */}
      <circle cx={CX} cy={CY} r={OUTER_R + 8} fill="none" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
      <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="#334155" strokeWidth="1.5" />

      {/* Zone labels */}
      <text x={CX} y={CY + OUTER_R + 26} textAnchor="middle" fill="#60A5FA" fontSize="12" fontWeight="bold" letterSpacing="2">
        ON
      </text>
      <text x={CX - OUTER_R - 26} y={CY} textAnchor="middle" fill="#FBBF24" fontSize="12" fontWeight="bold" letterSpacing="2"
        transform={`rotate(-90, ${CX - OUTER_R - 26}, ${CY})`}>
        OFF
      </text>

      {/* Space wedges */}
      {spaceData.map((s) => {
        const isSelected = state.selectedSpace === s.index;
        const isValid = state.validMoves.includes(s.index);
        const hasMy = player === 'white' ? s.white > 0 : s.black > 0;

        const canSelect = isMoving && hasMy && state.pit[player] === 0;

        let fill: string;
        if (isValid) fill = '#22C55E25';
        else if (isSelected) fill = '#3B82F640';
        else if (s.isEntry) fill = s.index % 2 === 0 ? '#000000' : '#FF6600';
        else if (s.isExit) fill = s.index % 2 === 0 ? '#000000' : '#FF6600';
        else fill = s.index % 2 === 0 ? '#000000' : '#FF6600';

        let stroke = '#1E293B';
        let sw = 0.8;
        if (isValid) { stroke = '#22C55E'; sw = 2; }
        else if (isSelected) { stroke = '#60A5FA'; sw = 2; }
        else if (canSelect) { stroke = '#334155'; sw = 1; }

        const path = wedge(CX, CY, INNER_R + 6, OUTER_R - 2, s.startDeg, s.endDeg);

        return (
          <path
            key={`w-${s.index}`}
            d={path}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            className={`transition-colors duration-75 ${(isValid || canSelect) ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (isValid) moveTo(s.index);
              else if (canSelect) selectSpace(s.index);
              else deselect();
            }}
          />
        );
      })}

      {/* Inner ring border */}
      <circle cx={CX} cy={CY} r={INNER_R + 5} fill="none" stroke="#1E293B" strokeWidth="1" />

      {/* Space numbers */}
      {spaceData.map((s) => {
        const lp = polar(CX, CY, OUTER_R - 15, s.mid);
        return (
          <text
            key={`n-${s.index}`}
            x={lp.x} y={lp.y}
            textAnchor="middle" dominantBaseline="central"
            fill={s.isEntry ? '#FFFFFF' : s.isExit ? '#FFFFFF' : '#FFFFFF'}
            fontSize="9" fontWeight="700"
            className="pointer-events-none"
          >
            {s.index + 1}
          </text>
        );
      })}

      {/* Pieces on board */}
      {spaceData.map((s) => {
        const pieces: React.ReactNode[] = [];
        const colors: { player: Player; count: number }[] = [];
        if (s.white > 0) colors.push({ player: 'white', count: s.white });
        if (s.black > 0) colors.push({ player: 'black', count: s.black });

        const midR = (INNER_R + 30 + OUTER_R - 35) / 2;

        colors.forEach((c, ci) => {
          const offset = colors.length > 1 ? (ci === 0 ? -18 : 18) : 0;
          const p = polar(CX, CY, midR + offset, s.mid);
          const pc = PLAYER_COLORS[c.player];
          const isMyPiece = c.player === player;
          const isThisSelected = state.selectedSpace === s.index && isMyPiece;

          pieces.push(
            <g key={`p-${s.index}-${c.player}`} className="pointer-events-none">
              {/* Piece circle */}
              <circle
                cx={p.x} cy={p.y} r={PIECE_R}
                fill={pc.main}
                stroke={isThisSelected ? '#60A5FA' : pc.dark}
                strokeWidth={isThisSelected ? 2.5 : 1.5}
                filter="url(#ps)"
              />
              {/* Inner detail */}
              <circle
                cx={p.x} cy={p.y} r={PIECE_R - 4}
                fill="none"
                stroke={pc.light}
                strokeWidth="0.8"
                opacity="0.4"
              />
              {/* Count */}
              <text
                x={p.x} y={p.y}
                textAnchor="middle" dominantBaseline="central"
                fill="#000000" fontSize="11" fontWeight="bold"
              >
                {c.count > 1 ? c.count : ''}
              </text>
            </g>
          );
        });

        return <g key={`pieces-${s.index}`}>{pieces}</g>;
      })}

      {/* Direction indicators - small arrows showing CCW movement */}
      {[45, 135, 225, 315].map((a) => {
        const r = (OUTER_R + INNER_R) / 2;
        // Arrow pointing in CCW direction (decreasing angle)
        const tip = polar(CX, CY, r, a - 8);
        const tail = polar(CX, CY, r, a + 4);
        return (
          <line
            key={`dir-${a}`}
            x1={tail.x} y1={tail.y}
            x2={tip.x} y2={tip.y}
            stroke="#475569" strokeWidth="1.5" opacity="0.3"
            strokeLinecap="round"
            className="pointer-events-none"
          />
        );
      })}

      {/* THE PIT */}
      <circle cx={CX} cy={CY} r={INNER_R} fill="url(#pitGrad)" />
      <circle cx={CX} cy={CY} r={INNER_R - 1} fill="none" stroke="#7C3AED" strokeWidth="1.5" opacity="0.4" />

      <text x={CX} y={CY - 42} textAnchor="middle" fill="#A78BFA" fontSize="15" fontWeight="800" letterSpacing="3" className="pointer-events-none">
        THE PIT
      </text>

      {/* Pit pieces */}
      {state.pit.white > 0 && (() => {
        const canClick = isMoving && player === 'white';
        const isSel = state.selectedSpace === -2 && player === 'white';
        return (
          <g className={canClick ? 'cursor-pointer' : ''} onClick={() => canClick && selectSpace('pit')}>
            <circle cx={CX - 28} cy={CY + 5} r={18}
              fill={PLAYER_COLORS.white.main}
              stroke={isSel ? '#60A5FA' : PLAYER_COLORS.white.dark}
              strokeWidth={isSel ? 3 : 2}
              filter="url(#ps)" />
            <circle cx={CX - 28} cy={CY + 5} r={12} fill="none" stroke={PLAYER_COLORS.white.light} strokeWidth="0.8" opacity="0.3" />
            <text x={CX - 28} y={CY + 5} textAnchor="middle" dominantBaseline="central" fill="#000000" fontSize="13" fontWeight="bold" className="pointer-events-none">
              {state.pit.white}
            </text>
          </g>
        );
      })()}

      {state.pit.black > 0 && (() => {
        const canClick = isMoving && player === 'black';
        const isSel = state.selectedSpace === -2 && player === 'black';
        return (
          <g className={canClick ? 'cursor-pointer' : ''} onClick={() => canClick && selectSpace('pit')}>
            <circle cx={CX + 28} cy={CY + 5} r={18}
              fill={PLAYER_COLORS.black.main}
              stroke={isSel ? '#60A5FA' : PLAYER_COLORS.black.dark}
              strokeWidth={isSel ? 3 : 2}
              filter="url(#ps)" />
            <circle cx={CX + 28} cy={CY + 5} r={12} fill="none" stroke={PLAYER_COLORS.black.light} strokeWidth="0.8" opacity="0.3" />
            <text x={CX + 28} y={CY + 5} textAnchor="middle" dominantBaseline="central" fill="#000000" fontSize="13" fontWeight="bold" className="pointer-events-none">
              {state.pit.black}
            </text>
          </g>
        );
      })()}

      {state.pit.white === 0 && state.pit.black === 0 && (
        <text x={CX} y={CY + 8} textAnchor="middle" fill="#4C1D95" fontSize="10" opacity="0.6" className="pointer-events-none">
          Empty
        </text>
      )}

      {/* Bear off target */}
      {state.validMoves.includes(-1) && (
        <g className="cursor-pointer" onClick={() => moveTo(-1)}>
          <circle cx={CX} cy={52} r={30} fill="#22C55E15" stroke="#22C55E" strokeWidth="2" filter="url(#validGlow)" />
          <text x={CX} y={47} textAnchor="middle" dominantBaseline="central" fill="#22C55E" fontSize="12" fontWeight="bold" className="pointer-events-none">
            BEAR
          </text>
          <text x={CX} y={60} textAnchor="middle" dominantBaseline="central" fill="#22C55E" fontSize="10" fontWeight="bold" className="pointer-events-none">
            OFF
          </text>
        </g>
      )}

      {/* Current player indicator */}
      <circle cx={CX} cy={CY + INNER_R - 30} r={8}
        fill={PLAYER_COLORS[player].main}
        opacity={isMoving ? 1 : 0.3}
        className="pointer-events-none"
      >
        {isMoving && (
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>
    </svg>
  );
};

export default CircularBoard;

      {/* ON label next to space 1 */}
      <text x={420} y={720} textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">ON</text>
      
      {/* OFF label next to space 19 */}
      <text x={130} y={250} textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">OFF</text>
