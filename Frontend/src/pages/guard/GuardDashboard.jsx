import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, StatCard, Card, EmptyState } from '../../components/ui';
import { Users, Clock, CheckCircle, UserCheck, UserPlus, Search } from 'lucide-react';
import { formatDisplayDateTime } from '../../services/storage';
import { useNavigate } from 'react-router-dom';
import { isToday, parseISO } from 'date-fns';

export default function GuardDashboard() {
  const { visitors, stats, refresh } = useApp();
  const navigate = useNavigate();

  const todayVisitors = visitors
    .filter((v) => {
      try { return isToday(parseISO(v.registeredAt)); } catch { return false; }
    })
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 10);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Security Gate Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/guard/checkin')}
            className="flex items-center gap-2 px-4 py-2 border border-[#1e3a5f] text-[#1e3a5f] rounded-lg text-sm font-medium hover:bg-[#1e3a5f] hover:text-white transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Check In / Out
          </button>
          <button
            onClick={() => navigate('/guard/register')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Register Visitor
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Visitors Today" value={stats.totalToday ?? 0} icon={Users} color="navy" />
        <StatCard label="Pending Approvals" value={stats.pendingAll ?? 0} icon={Clock} color="amber" />
        <StatCard label="Approved Today" value={stats.approvedToday ?? 0} icon={CheckCircle} color="green" />
        <StatCard label="Currently Inside" value={stats.currentlyInside ?? 0} icon={UserCheck} color="blue" />
      </div>

      {/* Recent visitors */}
      <Card>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Today's Visitors</h2>
          <button
            onClick={() => navigate('/guard/visitors')}
            className="text-sm text-[#1e3a5f] hover:underline font-medium"
          >
            View All →
          </button>
        </div>
        {todayVisitors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No visitors registered today"
            description="Register a new visitor using the button above."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Token</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">To Meet</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Registered</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1e3a5f] font-semibold">{v.token}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{v.visitorName}</p>
                      <p className="text-xs text-slate-500">{v.mobile}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{v.companyName}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{v.personToMeet}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{formatDisplayDateTime(v.registeredAt)}</td>
                    <td className="px-4 py-3">
                      {v.approvalStatus === 'Approved' && !v.visitStatus && (
                        <button
                          onClick={() => navigate('/guard/checkin')}
                          className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded font-medium hover:bg-green-100 transition-colors whitespace-nowrap"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
