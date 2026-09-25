import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Download, 
  Printer, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Edit3, 
  CheckCircle, 
  Building2, 
  UserCheck, 
  Clock, 
  FileSpreadsheet, 
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { FormDRecord, Employee, AuthUser, RolePermissions } from '../types';
import { MONTHS, getDaysCountForMonth, generateDefaultFormDRecord, generateInitialFormDList } from '../data/initialFormD';
import { exportFormDToExcel, exportFormDToPDF } from '../utils/formDExport';
import { FormDEditModal } from './FormDEditModal';

interface FormDPageProps {
  records: FormDRecord[];
  employees: Employee[];
  currentUser: AuthUser;
  permissions: RolePermissions;
  onUpdateRecord: (updated: FormDRecord) => void;
  onUpdateAllRecords: (records: FormDRecord[]) => void;
  onResetFormDData: (month: string, year: number) => void;
  onBackToMaster: () => void;
}

export const FormDPage: React.FC<FormDPageProps> = ({
  records,
  employees,
  currentUser,
  permissions,
  onUpdateRecord,
  onUpdateAllRecords,
  onResetFormDData,
  onBackToMaster,
}) => {
  // Period dropdowns
  const [fromMonth, setFromMonth] = useState<string>('April');
  const [fromYear, setFromYear] = useState<number>(2024);
  const [toMonth, setToMonth] = useState<string>('March');
  const [toYear, setToYear] = useState<number>(2025);

  // Active Attendance Sheet Month & Year (Drop Box)
  const [selectedMonth, setSelectedMonth] = useState<string>('September');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  // Sorting and Search
  const [sortBy, setSortBy] = useState<'srNo' | 'name' | 'summaryDays' | 'placeOfWork'>('srNo');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Register Keeper name
  const [registerKeeper, setRegisterKeeper] = useState<string>('Ashraf Belal (Owner)');

  // Edit Modal
  const [editingRecord, setEditingRecord] = useState<FormDRecord | null>(null);

  const daysInMonth = useMemo(() => {
    return getDaysCountForMonth(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Filter records for the currently selected month and year, or sync if needed
  const monthRecords = useMemo(() => {
    const existing = records.filter(
      (r) => r.month === selectedMonth && r.year === selectedYear
    );
    if (existing.length > 0) {
      return existing;
    }
    // If not existing for this month, generate automatically from employees
    return generateInitialFormDList(employees, selectedMonth, selectedYear);
  }, [records, employees, selectedMonth, selectedYear]);

  // Filter & Sort
  const displayedRecords = useMemo(() => {
    let list = monthRecords.filter((r) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.empCode.toLowerCase().includes(q) ||
        r.placeOfWork.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'summaryDays') return b.summaryDays - a.summaryDays;
      if (sortBy === 'placeOfWork') return a.placeOfWork.localeCompare(b.placeOfWork);
      return a.srNo - b.srNo;
    });

    return list;
  }, [monthRecords, searchTerm, sortBy]);

  // Period formatted text
  const periodText = `From ${fromMonth} ${fromYear} to ${toMonth} ${toYear}`;

  // Quick cycle attendance cell
  const handleQuickToggleDay = (rec: FormDRecord, day: number) => {
    if (currentUser.role !== 'admin') return;
    const current = rec.dailyAttendance[day] || 'P';
    const cycle: Record<string, string> = {
      P: 'WO',
      WO: 'A',
      A: 'HD',
      HD: 'L',
      L: 'P',
    };
    const next = cycle[current] || 'P';
    const newDaily = { ...rec.dailyAttendance, [day]: next };

    const calculatedDays = Object.values(newDaily).reduce<number>((acc: number, status: string) => {
      if (status === 'P' || status === 'WO' || status === 'L') return acc + 1;
      if (status === 'HD') return acc + 0.5;
      return acc;
    }, 0);

    const updated: FormDRecord = {
      ...rec,
      dailyAttendance: newDaily,
      summaryDays: calculatedDays,
      remarksNoOfHours: `${Math.round(calculatedDays * 8)} Hours / Regular shift`,
    };
    onUpdateRecord(updated);
  };

  // Bulk: Mark All Employees Present
  const handleBulkAllPresent = () => {
    if (currentUser.role !== 'admin') return;
    const updated = monthRecords.map((r) => {
      const daily: Record<number, string> = {};
      for (let d = 1; d <= daysInMonth; d++) {
        daily[d] = 'P';
      }
      return {
        ...r,
        dailyAttendance: daily,
        summaryDays: daysInMonth,
        remarksNoOfHours: `${daysInMonth * 8} Hours / Full attendance`,
      };
    });
    onUpdateAllRecords(updated);
  };

  // Bulk: Auto-set Sundays as Weekly Off (WO)
  const handleAutoSetSundays = () => {
    if (currentUser.role !== 'admin') return;
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const updated = monthRecords.map((r) => {
      const daily = { ...r.dailyAttendance };
      for (let d = 1; d <= daysInMonth; d++) {
        const dayOfWeek = new Date(selectedYear, monthIndex, d).getDay();
        if (dayOfWeek === 0) {
          daily[d] = 'WO';
        } else if (!daily[d]) {
          daily[d] = 'P';
        }
      }
      const calculatedDays = Object.values(daily).reduce<number>((acc: number, status: string) => {
        if (status === 'P' || status === 'WO' || status === 'L') return acc + 1;
        if (status === 'HD') return acc + 0.5;
        return acc;
      }, 0);

      return {
        ...r,
        dailyAttendance: daily,
        summaryDays: calculatedDays,
        remarksNoOfHours: `${Math.round(calculatedDays * 8)} Hours / Regular shift`,
      };
    });
    onUpdateAllRecords(updated);
  };

  // Export handlers
  const handleExcelExport = () => {
    exportFormDToExcel(
      displayedRecords,
      periodText,
      selectedMonth,
      selectedYear,
      registerKeeper,
      `FORM_D_${selectedMonth}_${selectedYear}_GLOZIYO.xlsx`
    );
  };

  const handlePDFExport = () => {
    exportFormDToPDF(
      displayedRecords,
      periodText,
      selectedMonth,
      selectedYear,
      registerKeeper,
      `FORM_D_${selectedMonth}_${selectedYear}_GLOZIYO.pdf`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Back to Master Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btnBackToEmployeesMaster"
            onClick={onBackToMaster}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Back to Employee Master Register"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                FORM D
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                ATTENDANCE REGISTER / MUSTER ROLL
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-700">
                ADMINISTRATOR ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory Form D Register of Attendance & Hours under Indian Labour Regulations • Legal Landscape Ready
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <button
            type="button"
            id="btnFormDExportExcel"
            onClick={handleExcelExport}
            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Export FORM D to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            id="btnFormDExportPDF"
            onClick={handlePDFExport}
            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Export FORM D to PDF (Formatted for Legal Landscape 8.5 × 14 in)"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF (Legal Landscape)</span>
          </button>

          <button
            type="button"
            id="btnFormDPrint"
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-950 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            title="Print Form D (Pre-set for Legal Landscape Paper: 8.5 × 14 in / 216 × 356 mm)"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Print Legal (Landscape)</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
              8.5×14″
            </span>
          </button>
        </div>
      </div>

      {/* DEDICATED STATUTORY PRINT HEADER (Appears only on printed Legal page) */}
      <div className="hidden print:block mb-3 border-b-2 border-slate-900 pb-2 bg-white text-black">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-sm font-black tracking-wider uppercase text-black">
              FORM D — MUSTER ROLL & ATTENDANCE REGISTER
            </div>
            <div className="text-[10pt] font-extrabold text-black">
              Name of Establishment :- GLOZIYO SERVICES PRIVATE LIMITED,
            </div>
            <div className="text-[9pt] font-bold text-slate-800">
              Name of Owner : ASHRAF BELAL
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-[9pt] font-bold text-black">
              For the Period From:- <span className="underline">{periodText}</span>
            </div>
            <div className="text-[9pt] font-semibold text-slate-900">
              Attendance Sheet for Month: <span className="font-extrabold">{selectedMonth} {selectedYear}</span>
            </div>
            <div className="text-[7pt] text-slate-600 font-mono">
              Statutory Register • Page Format: Legal Landscape (8.5 × 14 in)
            </div>
          </div>
        </div>
      </div>

      {/* STATUTORY MANDATORY HEADINGS CARD (Interactive UI on screen) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl border border-indigo-900 p-6 space-y-5 print:hidden">
        
        {/* Top establishment and owner block */}
        <div className="border-b border-indigo-800/60 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  Name of Establishment :- <span className="text-amber-300">GLOZIYO SERVICES PRIVATE LIMITED,</span>
                </h2>
              </div>
              
              <div className="flex items-center gap-2 pl-7">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-sm font-bold text-slate-200">
                  Name of Owner : <span className="text-emerald-300 font-extrabold">ASHRAF BELAL</span>
                </p>
              </div>
            </div>

            {/* Statutory Register Keeper badge */}
            <div className="bg-indigo-900/60 border border-indigo-700/50 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
              <div>
                <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-mono font-bold block">
                  **Signature of Register Keeper
                </span>
                <input
                  type="text"
                  value={registerKeeper}
                  onChange={(e) => setRegisterKeeper(e.target.value)}
                  className="bg-transparent border-b border-indigo-400/50 text-white text-xs font-bold focus:outline-none focus:border-indigo-300 py-0.5"
                  title="Click to edit register keeper's signatory name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PERIOD DROPDOWN CONTROLS: "For the Period From:- From To Month in Drop Down" */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 items-center">
          
          {/* Period Selection */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-bold">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>For the Period From:-</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* FROM MONTH IN DROP DOWN */}
              <div>
                <label className="text-[10px] text-indigo-300 font-semibold block mb-0.5">
                  From Month:
                </label>
                <div className="flex gap-1">
                  <select
                    id="selectFromMonth"
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-medium text-xs focus:ring-1 focus:ring-indigo-400"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={fromYear}
                    onChange={(e) => setFromYear(Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-white font-medium text-xs text-center"
                  />
                </div>
              </div>

              {/* TO MONTH IN DROP DOWN */}
              <div>
                <label className="text-[10px] text-indigo-300 font-semibold block mb-0.5">
                  To Month:
                </label>
                <div className="flex gap-1">
                  <select
                    id="selectToMonth"
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-medium text-xs focus:ring-1 focus:ring-indigo-400"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={toYear}
                    onChange={(e) => setToYear(Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-white font-medium text-xs text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ATTENDANCE SHEET SHORT BY MONTH IN DROP BOX */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-indigo-200 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Attendance Sheet Short By Month In Drop Box</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                {daysInMonth} Days
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-indigo-300 font-semibold block mb-0.5">
                  Select Month:
                </label>
                <select
                  id="selectAttendanceMonth"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-lg px-2.5 py-1.5 text-emerald-300 font-bold text-xs focus:ring-2 focus:ring-emerald-400"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-indigo-300 font-semibold block mb-0.5">
                  Select Year:
                </label>
                <select
                  id="selectAttendanceYear"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-lg px-2.5 py-1.5 text-emerald-300 font-bold text-xs focus:ring-2 focus:ring-emerald-400"
                >
                  {[2023, 2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Sort & Preset Controls */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-bold">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Sort Attendance Sheet:</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                id="selectAttendanceSort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-200 font-semibold text-xs focus:ring-2 focus:ring-amber-400"
              >
                <option value="srNo">Sort by: Sr No. (1, 2, 3...)</option>
                <option value="name">Sort by: Employee Name (A-Z)</option>
                <option value="summaryDays">Sort by: Summary No. of Days (High to Low)</option>
                <option value="placeOfWork">Sort by: Place of work*</option>
              </select>
            </div>

            {/* Quick Bulk Tools for Admin */}
            {currentUser.role === 'admin' && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleBulkAllPresent}
                  className="px-2 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors cursor-pointer"
                  title="Mark full month attendance for all staff"
                >
                  Mark All P
                </button>
                <button
                  type="button"
                  onClick={handleAutoSetSundays}
                  className="px-2 py-1 text-[10px] font-bold bg-indigo-700 hover:bg-indigo-600 text-white rounded transition-colors cursor-pointer"
                  title="Auto-mark Sundays as Weekly Off (WO)"
                >
                  Sundays WO
                </button>
                <button
                  type="button"
                  onClick={() => onResetFormDData(selectedMonth, selectedYear)}
                  className="px-2 py-1 text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors cursor-pointer"
                  title="Reload defaults for this month"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FILTER & LEGEND TOOLBAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, place of work, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
          <span className="font-bold text-slate-800 text-[11px]">Legend:</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            <strong>P</strong> = Present
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-400">
            <strong>WO</strong> = Weekly Off
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
            <strong>A</strong> = Absent
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
            <strong>HD</strong> = Half Day (0.5)
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
            <strong>L</strong> = Leave
          </span>
          {currentUser.role === 'admin' && (
            <span className="text-[10px] text-indigo-600 font-semibold italic pl-1">
              (Click any cell to toggle status)
            </span>
          )}
        </div>
      </div>

      {/* FORM D MUSTER ROLL ATTENDANCE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Statutory Sheet Header Banner in print / view */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-extrabold text-slate-900 uppercase tracking-wider">
              FORM D — MUSTER ROLL & ATTENDANCE REGISTER
            </span>
            <span className="text-slate-500 ml-2">
              (Establishment: GLOZIYO SERVICES PRIVATE LIMITED | Owner: ASHRAF BELAL)
            </span>
          </div>
          <span className="font-mono text-slate-600 font-bold">
            Showing {displayedRecords.length} Employees • Month: {selectedMonth} {selectedYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] select-none">
                <th className="py-3 px-2 border-r border-slate-800 text-center w-12 sticky left-0 bg-slate-900 z-10">
                  Sr No.
                </th>
                <th className="py-3 px-3 border-r border-slate-800 min-w-[150px] sticky left-12 bg-slate-900 z-10">
                  Name
                </th>
                <th className="py-3 px-3 border-r border-slate-800 min-w-[140px]">
                  Place of work*
                </th>
                <th className="py-3 px-2 border-r border-slate-800 min-w-[90px] text-center">
                  DOJ
                </th>

                {/* Date from Like 1 2 3 4 5 6 7 8 9 10 ........... */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const monthIdx = MONTHS.indexOf(selectedMonth);
                  const isSunday = new Date(selectedYear, monthIdx, day).getDay() === 0;
                  return (
                    <th
                      key={day}
                      className={`py-2 px-1 text-center border-r border-slate-800 min-w-[28px] max-w-[32px] ${
                        isSunday ? 'bg-indigo-950 text-amber-300 font-black' : ''
                      }`}
                      title={`Day ${day} (${isSunday ? 'Sunday' : 'Working Day'})`}
                    >
                      {day}
                    </th>
                  );
                })}

                <th className="py-3 px-3 border-r border-slate-800 min-w-[110px] text-center bg-indigo-950 text-indigo-100">
                  Summary No. of Days
                </th>
                <th className="py-3 px-3 border-r border-slate-800 min-w-[140px]">
                  Remarks No. of hours
                </th>
                <th className="py-3 px-3 border-r border-slate-800 min-w-[150px] text-center">
                  **Signature of Register Keeper
                </th>
                {currentUser.role === 'admin' && (
                  <th className="py-3 px-2 text-center w-12 sticky right-0 bg-slate-900 z-10">
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={daysInMonth + 7}
                    className="py-12 text-center text-slate-500 font-normal"
                  >
                    No attendance records found for this period.
                  </td>
                </tr>
              ) : (
                displayedRecords.map((rec, index) => (
                  <tr
                    key={rec.id || index}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Sr No. */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                      {rec.srNo || index + 1}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-3 border-r border-slate-200 sticky left-12 bg-white group-hover:bg-slate-50 z-10">
                      <div className="font-bold text-slate-900 leading-tight">
                        {rec.name}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {rec.empCode}
                      </span>
                    </td>

                    {/* Place of work* */}
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <span className="text-slate-700 font-medium">
                        {rec.placeOfWork || '—'}
                      </span>
                    </td>

                    {/* DOJ */}
                    <td className="py-2.5 px-2 border-r border-slate-200 text-center font-mono text-[11px] text-slate-600">
                      {rec.doj || '—'}
                    </td>

                    {/* Date from Like 1 2 3 4 5 6 7 8 9 10 ........... */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const val = rec.dailyAttendance[day] || 'P';
                      const monthIdx = MONTHS.indexOf(selectedMonth);
                      const isSunday = new Date(selectedYear, monthIdx, day).getDay() === 0;

                      let badgeColor = 'bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100';
                      if (val === 'WO') badgeColor = 'bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200';
                      if (val === 'A') badgeColor = 'bg-rose-100 text-rose-800 font-bold hover:bg-rose-200';
                      if (val === 'HD') badgeColor = 'bg-amber-100 text-amber-800 font-bold hover:bg-amber-200';
                      if (val === 'L') badgeColor = 'bg-blue-100 text-blue-800 font-bold hover:bg-blue-200';

                      return (
                        <td
                          key={day}
                          onClick={() => handleQuickToggleDay(rec, day)}
                          className={`py-1 px-0.5 text-center border-r border-slate-200 select-none ${
                            currentUser.role === 'admin' ? 'cursor-pointer hover:scale-105 transition-transform' : ''
                          } ${isSunday ? 'bg-indigo-50/40' : ''}`}
                          title={`Day ${day}: ${val} (Click to change)`}
                        >
                          <span className={`inline-block w-5 h-5 leading-5 rounded text-[10px] ${badgeColor}`}>
                            {val}
                          </span>
                        </td>
                      );
                    })}

                    {/* Summary No. of Days */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center bg-indigo-50/30">
                      <span className="font-mono font-bold text-indigo-900 text-xs px-2 py-0.5 rounded bg-indigo-100 border border-indigo-200">
                        {rec.summaryDays}
                      </span>
                    </td>

                    {/* Remarks No. of hours */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700 text-[11px]">
                      {rec.remarksNoOfHours || '—'}
                    </td>

                    {/* **Signature of Register Keeper */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-serif text-[11px] text-slate-600 italic">
                      {rec.registerKeeperSignature || registerKeeper}
                    </td>

                    {/* Action */}
                    {currentUser.role === 'admin' && (
                      <td className="py-2.5 px-2 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10">
                        <button
                          type="button"
                          onClick={() => setEditingRecord(rec)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                          title="Edit Muster Roll record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statutory Signature Block */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-800">
              Establishment: GLOZIYO SERVICES PRIVATE LIMITED
            </span>
            <span className="mx-2">•</span>
            <span>Owner: ASHRAF BELAL</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-800">
              **Signature of Register Keeper :
            </span>
            <span className="font-serif italic font-bold text-indigo-900 border-b-2 border-slate-400 pb-0.5 px-2">
              {registerKeeper}
            </span>
          </div>
        </div>

      </div>

      {/* Edit Record Modal */}
      <FormDEditModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
        onSave={(updated) => {
          onUpdateRecord(updated);
          setEditingRecord(null);
        }}
      />

    </div>
  );
};
