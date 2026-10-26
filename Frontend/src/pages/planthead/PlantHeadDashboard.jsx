import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, PauseCircle, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard, Card, StatusBadge, EmptyState } from '../../components/ui';
import { formatDisplayDateTime } from '../../services/storage';
import { isToday, parseISO } from 'date-fns';

export default function PlantHeadDashboard() {
  const { visitors, stats } = useApp();
  const navigate = useNavigate();

  const pending = visitors.filter((v) => v.approvalStatus === 'Pending')
    .sort((a, b) => new Date(a.registeredAt) - new Date(b.registeredAt));

  const recentProcessed = visitors
    .filter((v) => v.approvalStatus !== 'Pending' && v.approvedAt)
    .sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt))
    .slice(0, 5);

  const approvedToday = visitors.filter((v) => v.approvalStatus === 'Approved' && v.approvedAt && isToday(parseISO(v.approvedAt))).length;
  const rejectedToday = visitors.filter((v) => v.approvalStatus === 'Rejected' && v.approvedAt && isToday(parseISO(v.approvedAt))).length;
  const onHold = visitors.filter((v) => v.approvalStatus === 'On Hold').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Approval Dashboard</h1>
          <p className="text-sm text-slate-500">Review and process visitor requests.</p>
        </div>
        <button
          onClick={() => navigate('/planthead/requests')}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          {pending.length > 0 ? `Review ${pending.length} Pending` : 'View Requests'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Requests" value={stats.pendingAll ?? 0} icon={Clock} color="amber" />
        <StatCard label="Approved Today" value={approvedToday} icon={CheckCircle} color="green" />
        <StatCard label="Rejected Today" value={rejectedToday} icon={XCircle} color="red" />
        <StatCard label="On Hold" value={onHold} icon={PauseCircle} color="slate" />
      </div>

      {/* Pending Requests */}
      <Card>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            Pending Requests
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-semibold">{pending.length}</span>
            )}
          </h2>
          {pending.length > 0 && (
            <button onClick={() => navigate('/planthead/requests')} className="text-sm text-[#1e3a5f] hover:underline font-medium">
              Review All →
            </button>
          )}
        </div>
        {pending.length === 0 ? (
          <EmptyState icon={CheckCircle} title="All caught up!" description="No pending visitor requests at this time." />
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.slice(0, 5).map((v) => (
              <div key={v.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-3">
                {v.photoDataUrl ? (
                  <img src={v.photoDataUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 font-bold text-sm">{v.visitorName?.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{v.visitorName}</p>
                  <p className="text-xs text-slate-500">{v.companyName} · {v.department} · {v.visitPurpose}</p>
                  <p className="text-xs text-slate-400">{formatDisplayDateTime(v.registeredAt)} by {v.registeredBy}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs text-[#1e3a5f] font-semibold">{v.token}</span>
                  <button
                    onClick={() => navigate(`/planthead/requests?id=${v.id}`)}
                    className="px-3 py-1.5 bg-[#1e3a5f] text-white text-xs rounded-lg font-medium hover:bg-[#162d4a] transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recently Processed */}
      {recentProcessed.length > 0 && (
        <Card>
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800">Recently Processed</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Token</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Decided At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProcessed.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1e3a5f] font-semibold">{v.token}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{v.visitorName}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{v.companyName}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.approvalStatus} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{formatDisplayDateTime(v.approvedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
