import React, { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { getAuditLogs, formatDisplayDateTime } from '../../services/storage';
import { Card, EmptyState } from '../../components/ui';
import { useApp } from '../../context/AppContext';

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  const { visitors } = useApp(); // trigger refresh
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const allLogs = getAuditLogs();
  const filtered = allLogs.filter((log) => {
    const q = search.toLowerCase();
    return !q || log.action?.toLowerCase().includes(q) || log.token?.toLowerCase().includes(q) || log.userName?.toLowerCase().includes(q) || log.details?.toLowerCase().includes(q);
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const ACTION_COLORS = {
    'Visitor Registered': 'bg-blue-100 text-blue-700',
    'Visitor Approved': 'bg-green-100 text-green-700',
    'Visitor Rejected': 'bg-red-100 text-red-700',
    'Visitor Put On Hold': 'bg-orange-100 text-orange-700',
    'Visitor Checked In': 'bg-purple-100 text-purple-700',
    'Visitor Checked Out': 'bg-slate-100 text-slate-700',
    'CSV Export': 'bg-indigo-100 text-indigo-700',
    'Demo Data Reset': 'bg-red-200 text-red-800',
    'Company Settings Updated': 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
        <p className="text-sm text-slate-500">{filtered.length} log entries. Local records — not tamper-proof in prototype.</p>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search action, token, user..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>
        </div>

        {paginated.length === 0 ? (
          <EmptyState icon={BookOpen} title="No log entries" description="Actions performed in the system will appear here." />
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {paginated.map((log) => (
                <div key={log.id} className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {log.token && (
                      <span className="font-mono text-xs text-[#1e3a5f] font-semibold mr-2">{log.token}</span>
                    )}
                    <span className="text-sm text-slate-700">{log.details}</span>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{log.userName}</span>
                      {log.userRole && <><span>·</span><span>{log.userRole}</span></>}
                      <span>·</span>
                      <span>{formatDisplayDateTime(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 hover:bg-slate-50">Prev</button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 hover:bg-slate-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
