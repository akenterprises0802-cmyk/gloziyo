import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { FormDRecord, AttendanceStatus } from '../types';
import { getDaysCountForMonth, MONTHS } from '../data/initialFormD';

interface FormDEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FormDRecord | null;
  onSave: (updatedRecord: FormDRecord) => void;
}

const STATUS_OPTIONS: { key: AttendanceStatus; label: string; desc: string; color: string }[] = [
  { key: 'P', label: 'P', desc: 'Present (Full Day)', color: 'bg-emerald-600 text-white' },
  { key: 'WO', label: 'WO', desc: 'Weekly Off (Sunday/Holiday)', color: 'bg-slate-200 text-slate-800' },
  { key: 'A', label: 'A', desc: 'Absent', color: 'bg-rose-600 text-white' },
  { key: 'HD', label: 'HD', desc: 'Half Day (4 hrs)', color: 'bg-amber-500 text-white' },
  { key: 'L', label: 'L', desc: 'Leave (Authorized)', color: 'bg-blue-600 text-white' },
];

export const FormDEditModal: React.FC<FormDEditModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave,
}) => {
  const [placeOfWork, setPlaceOfWork] = useState('');
  const [remarksNoOfHours, setRemarksNoOfHours] = useState('');
  const [signature, setSignature] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({});
  const [totalDaysCount, setTotalDaysCount] = useState(30);

  useEffect(() => {
    if (record) {
      setPlaceOfWork(record.placeOfWork || '');
      setRemarksNoOfHours(record.remarksNoOfHours || '');
      setSignature(record.registerKeeperSignature || 'Ashraf Belal (Owner)');
      setAttendanceMap({ ...(record.dailyAttendance || {}) });
      setTotalDaysCount(getDaysCountForMonth(record.month, record.year));
    }
  }, [record]);

  if (!isOpen || !record) return null;

  // Calculate summary days
  const calculatedDays = Object.values(attendanceMap).reduce<number>((acc: number, status: string) => {
    if (status === 'P' || status === 'WO' || status === 'L') return acc + 1;
    if (status === 'HD') return acc + 0.5;
    return acc;
  }, 0);

  const handleDayClick = (day: number) => {
    const current = attendanceMap[day] || 'P';
    const cycle: Record<string, string> = {
      P: 'WO',
      WO: 'A',
      A: 'HD',
      HD: 'L',
      L: 'P',
    };
    const next = cycle[current] || 'P';
    setAttendanceMap((prev) => ({ ...prev, [day]: next }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newMap: Record<number, string> = {};
    for (let d = 1; d <= totalDaysCount; d++) {
      newMap[d] = status;
    }
    setAttendanceMap(newMap);
  };

  const autoFillSundays = () => {
    const monthIndex = MONTHS.indexOf(record.month);
    const newMap = { ...attendanceMap };
    for (let d = 1; d <= totalDaysCount; d++) {
      const dayOfWeek = new Date(record.year, monthIndex, d).getDay();
      if (dayOfWeek === 0) {
        newMap[d] = 'WO';
      }
    }
    setAttendanceMap(newMap);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: FormDRecord = {
      ...record,
      placeOfWork: placeOfWork.trim(),
      remarksNoOfHours: remarksNoOfHours.trim() || `${Math.round(calculatedDays * 8)} Hours`,
      summaryDays: calculatedDays,
      dailyAttendance: attendanceMap,
      registerKeeperSignature: signature.trim(),
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/30 text-[10px] font-mono font-bold tracking-wider text-indigo-200 uppercase">
                FORM D Attendance
              </span>
              <h2 className="text-base font-bold text-white">
                Edit Muster Roll: {record.name} ({record.empCode})
              </h2>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Period: {record.month} {record.year} • DOJ: {record.doj}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-800">
          
          {/* Top Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Place of work*
              </label>
              <input
                type="text"
                value={placeOfWork}
                onChange={(e) => setPlaceOfWork(e.target.value)}
                placeholder="e.g. Mumbai Works Yard / Head Office"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Remarks No. of hours
              </label>
              <input
                type="text"
                value={remarksNoOfHours}
                onChange={(e) => setRemarksNoOfHours(e.target.value)}
                placeholder={`e.g. ${Math.round(calculatedDays * 8)} Hours / Regular shift`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Daily Attendance Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800 text-xs">
                  Daily Attendance (Days 1 to {totalDaysCount}):
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Click on any day cell to cycle: P (Present) → WO (Weekly Off) → A (Absent) → HD (Half Day) → L (Leave)
                </span>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => markAll('P')}
                  className="px-2 py-1 text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded border border-emerald-300 cursor-pointer"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={autoFillSundays}
                  className="px-2 py-1 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded border border-slate-400 cursor-pointer"
                >
                  Sundays WO
                </button>
              </div>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 pt-1">
              {Array.from({ length: totalDaysCount }, (_, i) => i + 1).map((day) => {
                const val = attendanceMap[day] || 'P';
                let cellStyle = 'bg-emerald-500 text-white';
                if (val === 'WO') cellStyle = 'bg-slate-300 text-slate-800';
                if (val === 'A') cellStyle = 'bg-rose-500 text-white';
                if (val === 'HD') cellStyle = 'bg-amber-500 text-white';
                if (val === 'L') cellStyle = 'bg-blue-500 text-white';

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{day}</span>
                    <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${cellStyle} mt-0.5 leading-none`}>
                      {val}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Calculated summary row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-semibold">
              <span className="text-slate-600">
                Summary No. of Days: <strong className="text-indigo-600 font-bold text-sm">{calculatedDays}</strong> / {totalDaysCount} Days
              </span>
              <span className="text-slate-500">
                Estimated Hours: <strong className="text-slate-800">{Math.round(calculatedDays * 8)} hrs</strong>
              </span>
            </div>
          </div>

          {/* Signature of Register Keeper */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              **Signature of Register Keeper
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Ashraf Belal (Owner)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Attendance Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
