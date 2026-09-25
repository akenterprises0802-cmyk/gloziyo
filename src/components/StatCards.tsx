import React from 'react';
import { Users, Award, ShieldAlert, CheckCircle2, UserX } from 'lucide-react';
import { Employee, TabType } from '../types';

interface StatCardsProps {
  employees: Employee[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  employees,
  activeTab,
  onTabChange,
}) => {
  const total = employees.length;
  const skilled = employees.filter(e => e.category === 'Skilled').length;
  const semiSkilled = employees.filter(e => e.category === 'Semi-Skilled').length;
  const unSkilled = employees.filter(e => e.category === 'Un Skilled').length;
  const exited = employees.filter(e => Boolean(e.exitDate && e.exitDate.trim())).length;
  const active = total - exited;

  const stats = [
    {
      id: 'all' as TabType,
      label: 'Total Workforce',
      sublabel: `${active} Active in service`,
      count: total,
      icon: Users,
      color: 'text-slate-900',
      bg: 'bg-white',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-slate-900',
    },
    {
      id: 'skilled' as TabType,
      label: 'Skilled Staff',
      sublabel: 'Engineers, Welders, PM',
      count: skilled,
      icon: Award,
      color: 'text-blue-700',
      bg: 'bg-white',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-blue-700',
    },
    {
      id: 'semi-skilled' as TabType,
      label: 'Semi-Skilled',
      sublabel: 'Fitters, Operators, Technicians',
      count: semiSkilled,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-white',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-emerald-700',
    },
    {
      id: 'unskilled' as TabType,
      label: 'Un-Skilled',
      sublabel: 'Helpers, Office Boys, Trainees',
      count: unSkilled,
      icon: ShieldAlert,
      color: 'text-amber-700',
      bg: 'bg-white',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-amber-700',
    },
    {
      id: 'exited' as TabType,
      label: 'Separated / Exited',
      sublabel: 'Relieved personnel records',
      count: exited,
      icon: UserX,
      color: 'text-rose-700',
      bg: 'bg-white',
      border: 'border-slate-200',
      activeBorder: 'ring-2 ring-rose-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {stats.map((item) => {
        const Icon = item.icon;
        const isSelected = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer bg-white border ${
              isSelected
                ? `${item.activeBorder} shadow-sm bg-slate-50/50`
                : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {item.label}
              </span>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {item.count}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-1">
              {item.sublabel}
            </p>
          </button>
        );
      })}
    </div>
  );
};
