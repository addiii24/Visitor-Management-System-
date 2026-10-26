import React, { useState } from 'react';
import { Search, Download, Printer, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportVisitorRecords, formatDisplayDateTime } from '../../services/storage';
import { Card, StatusBadge, EmptyState, Button } from '../../components/ui';
import { DEPARTMENTS } from '../../config/company';
import { parseISO, isWithinInterval } from 'date-fns';
import GatePass from '../../components/GatePass';

const STATUSES = ['Pending', 'Approved', 'Rejected', 'On Hold', 'Checked In', 'Checked Out'];
const PAGE_SIZE = 15;

export default function VisitorRecordsPage() {
  const { visitors } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPass, setSelectedPass] = useState(null);

  const filtered = visitors.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      v.visitorName?.toLowerCase().includes(q) ||
      v.token?.toLowerCase().includes(q) ||
      v.mobile?.includes(q) ||
      v.companyName?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || v.status === statusFilter || v.approvalStatus === statusFilter;
    const matchDept = !deptFilter || v.department === deptFilter;
    const matchCompany = !companyFilter || v.companyName?.toLowerCase().includes(companyFilter.toLowerCase());
    let matchDate = true;
    if (dateFrom || dateTo) {
      try {
        const regDate = parseISO(v.registeredAt);
        if (dateFrom && regDate < parseISO(dateFrom)) matchDate = false;
        if (dateTo && regDate > new Date(dateTo + 'T23:59:59')) matchDate = false;
      } catch { matchDate = false; }
    }
    return matchSearch && matchStatus && matchDept && matchCompany && matchDate;
  }).sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  function handleExport() {
    exportVisitorRecords(filtered);
  }

  function handlePrint() {
    window.print();
  }

  if (selectedPass) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <GatePass visitor={selectedPass} onClose={() => setSelectedPass(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visitor Records</h1>
          <p className="text-sm text-slate-500">{filtered.length} records matching current filters.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, token, mobile..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input
            value={companyFilter}
            onChange={(e) => { setCompanyFilter(e.target.value); setPage(1); }}
            placeholder="Filter by company..."
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          {(search || statusFilter || deptFilter || companyFilter || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setDeptFilter(''); setCompanyFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {paginated.length === 0 ? (
          <EmptyState icon={Search} title="No records found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Token', 'Visitor Name', 'Company', 'To Meet', 'Department', 'Registered', 'Status', 'Entry', 'Exit', 'Approved By', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#1e3a5f] font-semibold whitespace-nowrap">{v.token}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 whitespace-nowrap">{v.visitorName}</p>
                        <p className="text-xs text-slate-500">{v.mobile}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-28 truncate">{v.companyName}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{v.personToMeet}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{v.department}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDisplayDateTime(v.registeredAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDisplayDateTime(v.checkedInAt)}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDisplayDateTime(v.checkedOutAt)}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{v.approvedBy || '—'}</td>
                      <td className="px-4 py-3">
                        {v.approvalStatus === 'Approved' && (
                          <button
                            onClick={() => setSelectedPass(v)}
                            className="text-xs text-[#1e3a5f] border border-[#1e3a5f]/30 bg-[#1e3a5f]/5 px-2 py-1 rounded font-medium hover:bg-[#1e3a5f]/10 transition-colors whitespace-nowrap"
                          >
                            Gate Pass
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 py-1.5 text-sm text-slate-400">…</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${p === page ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'border-slate-300 hover:bg-slate-50'}`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
