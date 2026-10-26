import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, Card, Input, EmptyState } from '../../components/ui';
import { Search, Users } from 'lucide-react';
import { formatDisplayDateTime } from '../../services/storage';

export default function VisitorListPage() {
  const { visitors } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = visitors
    .filter((v) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        v.visitorName?.toLowerCase().includes(q) ||
        v.token?.toLowerCase().includes(q) ||
        v.mobile?.includes(q) ||
        v.companyName?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || v.status === statusFilter || v.approvalStatus === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  const statuses = ['Pending', 'Approved', 'Rejected', 'On Hold', 'Checked In', 'Checked Out'];

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Visitor Records</h1>
        <p className="text-sm text-slate-500">{visitors.length} total records</p>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, token, mobile..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No visitors found" description="Try adjusting your search or filter." />
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Entry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Exit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1e3a5f] font-semibold whitespace-nowrap">{v.token}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {v.photoDataUrl ? (
                          <img src={v.photoDataUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-slate-500 font-semibold">{v.visitorName?.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 whitespace-nowrap">{v.visitorName}</p>
                          <p className="text-xs text-slate-500">{v.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell max-w-32 truncate">{v.companyName}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell whitespace-nowrap">{v.personToMeet}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell whitespace-nowrap">{formatDisplayDateTime(v.registeredAt)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden xl:table-cell whitespace-nowrap">{formatDisplayDateTime(v.checkedInAt)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden xl:table-cell whitespace-nowrap">{formatDisplayDateTime(v.checkedOutAt)}</td>
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
