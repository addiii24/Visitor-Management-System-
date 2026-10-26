import React from 'react';
import { Printer, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportVisitorRecords, getCompanySettings, formatDisplayDateTime } from '../../services/storage';
import { Card, StatusBadge } from '../../components/ui';
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

export default function ReportsPage() {
  const { visitors } = useApp();
  const settings = getCompanySettings();

  const todayV = visitors.filter((v) => { try { return isToday(parseISO(v.registeredAt)); } catch { return false; } });
  const weekV = visitors.filter((v) => { try { return isThisWeek(parseISO(v.registeredAt)); } catch { return false; } });
  const monthV = visitors.filter((v) => { try { return isThisMonth(parseISO(v.registeredAt)); } catch { return false; } });

  const sections = [
    { label: 'Today', data: todayV },
    { label: 'This Week', data: weekV },
    { label: 'This Month', data: monthV },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visitor Reports</h1>
          <p className="text-sm text-slate-500">{settings.companyName} · {settings.plantName}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button
            onClick={() => exportVisitorRecords(visitors)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors"
          >
            <Download className="w-4 h-4" /> Export All CSV
          </button>
        </div>
      </div>

      {/* Summary sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map(({ label, data }) => (
          <Card key={label}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{label}</h3>
              <button
                onClick={() => exportVisitorRecords(data)}
                className="text-xs text-[#1e3a5f] hover:underline font-medium"
              >
                Export
              </button>
            </div>
            <div className="p-4 space-y-2">
              {[
                ['Total Registrations', data.length],
                ['Approved', data.filter((v) => v.approvalStatus === 'Approved').length],
                ['Pending', data.filter((v) => v.approvalStatus === 'Pending').length],
                ['Rejected', data.filter((v) => v.approvalStatus === 'Rejected').length],
                ['On Hold', data.filter((v) => v.approvalStatus === 'On Hold').length],
                ['Checked In', data.filter((v) => v.visitStatus === 'Checked In').length],
                ['Checked Out', data.filter((v) => v.visitStatus === 'Checked Out').length],
              ].map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{key}</span>
                  <span className="font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Visitor Table */}
      <Card>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">All Visitor Records ({visitors.length})</h3>
          <p className="text-xs text-slate-500">Generated: {formatDisplayDateTime(new Date().toISOString())}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Token</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Visitor</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Dept</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Entry</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Exit</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitors.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)).map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-[#1e3a5f] font-semibold whitespace-nowrap">{v.token}</td>
                  <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap">{v.visitorName}</td>
                  <td className="px-3 py-2 text-slate-600 max-w-32 truncate">{v.companyName}</td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{v.department}</td>
                  <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{formatDisplayDateTime(v.registeredAt)}</td>
                  <td className="px-3 py-2 whitespace-nowrap"><StatusBadge status={v.status} /></td>
                  <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{formatDisplayDateTime(v.checkedInAt)}</td>
                  <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{formatDisplayDateTime(v.checkedOutAt)}</td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{v.approvedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
