import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, CheckCircle2 } from 'lucide-react';

export default function ChecklistCard({ checklist = [] }) {
  const [items, setItems] = useState(checklist);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    setItems(checklist);
  }, [checklist]);

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const newItem = {
      id: `custom_${Date.now()}`,
      task: newText.trim(),
      priority: 'Recommended',
      completed: false,
    };
    setItems([...items, newItem]);
    setNewText('');
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'immediate':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            Immediate
          </span>
        );
      case 'recommended':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Recommended
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            Standard
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#dfe8dc] p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#edf5eb] border border-[#d5e7d2] flex items-center justify-center text-[#2f662a]">
            <CheckSquare size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#18201a] font-serif-editorial">
              Counsel Action Checklist
            </h3>
            <p className="text-xs text-[#526a54]">Renegotiation roadmap & audit tasks</p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#edf4ea] text-[#2f662a] border border-[#d2e5cf]">
          {completedCount}/{items.length} Done ({progressPercent}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#edf4ea] h-1.5 rounded-full overflow-hidden mb-4">
        <div
          className="bg-[#2f7d29] h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              item.completed
                ? 'bg-[#fafcf9] border-[#e2eae0] opacity-60'
                : 'bg-white hover:bg-[#fafcf9] border-[#dfe8dc] shadow-2xs'
            }`}
          >
            <input
              type="checkbox"
              checked={!!item.completed}
              onChange={() => toggleItem(item.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 w-4 h-4 rounded text-[#2f7d29] border-[#c4d6c1] focus:ring-[#2f7d29] cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <span
                className={`text-xs font-medium block leading-relaxed ${
                  item.completed ? 'line-through text-[#8fa792]' : 'text-[#18201a]'
                }`}
              >
                {item.task}
              </span>
              <div className="mt-1.5">{getPriorityBadge(item.priority)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Note */}
      <form onSubmit={addItem} className="flex gap-2 mt-4 pt-3 border-t border-[#edf2ea]">
        <input
          type="text"
          placeholder="Add custom renegotiation note..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="flex-1 px-3.5 py-1.5 rounded-full border border-[#dce8da] text-xs text-[#18201a] placeholder:text-[#889d8b] focus:outline-none focus:border-[#4b6b4e] bg-[#fafcf9]"
        />
        <button
          type="submit"
          className="btn-lime-pill px-4 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus size={13} />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}
