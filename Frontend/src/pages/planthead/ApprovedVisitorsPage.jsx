import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, Card, EmptyState } from '../../components/ui';
import { formatDisplayDateTime } from '../../services/storage';
import { FileText, Printer } from 'lucide-react';
import GatePass from '../../components/GatePass';

export default function ApprovedVisitorsPage() {
  const { visitors } = useApp();
  const [selectedPass, setSelectedPass] = useState(null);

  const approved = visitors
    .filter((v) => v.approvalStatus === 'Approved')
    .sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt));

  if (selectedPass) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <GatePass visitor={selectedPass} onClose={() => setSelectedPass(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Approved Visitors</h1>
        <p className="text-sm text-slate-500">{approved.length} approved visitors. Click to view or print gate pass.</p>
      </div>

      <Card>
        {approved.length === 0 ? (
          <EmptyState icon={FileText} title="No approved visitors" description="Approved visitor gate passes will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Token</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visit Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Approved At</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approved.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1e3a5f] font-semibold">{v.token}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{v.visitorName}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{v.companyName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.visitStatus || 'Approved'} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{formatDisplayDateTime(v.approvedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedPass(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#162d4a] transition-colors"
                      >
                        <Printer className="w-3 h-3" /> Gate Pass
                      </button>
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
