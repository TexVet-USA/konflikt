import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Konflikt Rules
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-300">
          {/* Setup */}
          <section>
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Setup
            </h3>
            <p>Each player has <strong className="text-white">15 pieces</strong>. All start off the board in the <strong className="text-white">Well</strong>. Both players roll one die — highest number goes first using both numbers.</p>
          </section>

          {/* Movement */}
          <section>
            <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="5 9 2 12 5 15" />
                <polyline points="9 5 12 2 15 5" />
                <polyline points="19 9 22 12 19 15" />
                <polyline points="9 19 12 22 15 19" />
              </svg>
              Entering &amp; Movement
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Both players enter pieces on spaces <strong className="text-blue-300">1-6</strong> using die values</li>
              <li>All pieces move <strong className="text-white">counter-clockwise</strong> around the board</li>
              <li>Move each die separately (not the total)</li>
              <li>Goal: reach the exit court (spaces <strong className="text-yellow-300">19-24</strong>) and bear off</li>
            </ul>
          </section>

          {/* Hitting */}
          <section>
            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Protecting &amp; Hitting
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-white">2+ pieces</strong> on a space = protected (opponent cannot land)</li>
              <li><strong className="text-red-300">1 piece</strong> alone = vulnerable to being hit</li>
              <li>Hit pieces go to <strong className="text-purple-300">THE PIT</strong> (center)</li>
              <li>Must re-enter from THE PIT before moving other pieces</li>
            </ul>
          </section>

          {/* Doubles */}
          <section>
            <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="8" height="8" rx="1" />
                <rect x="14" y="14" width="8" height="8" rx="1" />
              </svg>
              Doubles Rule
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Roll doubles = <strong className="text-white">4 moves</strong> of that number</li>
              <li>Then <strong className="text-white">4 moves</strong> of the complement (numbers add to 7)</li>
              <li>Then <strong className="text-yellow-300">roll again!</strong></li>
              <li>Total: <strong className="text-white">28 points</strong> of movement (4 × 7)</li>
              <li className="text-red-300">Must use ALL 4 moves of each set, or lose them entirely</li>
              <li>Exception during bearing off: use as many as possible</li>
            </ul>
          </section>

          {/* Bearing Off */}
          <section>
            <h3 className="text-lg font-bold text-green-400 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Bearing Off
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>ALL pieces must be in exit court (spaces 19-24) first</li>
              <li>Must roll the <strong className="text-white">exact number</strong> matching the space position</li>
              <li>Space 19 = need a 1, Space 20 = need a 2, ... Space 24 = need a 6</li>
              <li>Can use multiple moves to reach a lower space then bear off</li>
              <li>Example: piece on space 24 (position 6) can bear off with double 3s (move to position 3, then off)</li>
            </ul>
          </section>

          {/* Must Play */}
          <section>
            <h3 className="text-lg font-bold text-orange-400 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Must Play Rule
            </h3>
            <p>If a move can be made, it <strong className="text-white">must</strong> be made. You cannot forfeit a valid move to protect your position.</p>
          </section>

          {/* Strategy */}
          <section>
            <h3 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
              Strategy Tips
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Build barriers (2+ pieces) ahead of your opponent</li>
              <li>Keep pieces paired for protection when possible</li>
              <li>If behind, look for hit opportunities on lone pieces</li>
              <li>A late hit forces opponent to restart that piece from space 1</li>
              <li className="text-yellow-300 font-semibold">"Ya Neva' Give Up!" — doubles can change everything!</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
