import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { Users, Clock, CheckCircle, XCircle, UserCheck, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard, Card } from '../../components/ui';
import { formatDisplayDate } from '../../services/storage';
import { parseISO, format, subDays } from 'date-fns';

function buildTrendData(visitors) {
  const days = 7;
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayVisitors = visitors.filter((v) => {
      try { return v.registeredAt?.startsWith(dateStr); } catch { return false; }
    });
    data.push({
      date: format(date, 'dd MMM'),
      Total: dayVisitors.length,
      Approved: dayVisitors.filter((v) => v.approvalStatus === 'Approved').length,
      Rejected: dayVisitors.filter((v) => v.approvalStatus === 'Rejected').length,
    });
  }
  return data;
}

export default function AdminDashboard() {
  const { visitors, stats } = useApp();
  const trendData = buildTrendData(visitors);

  const deptData = Object.entries(
    visitors.reduce((acc, v) => {
      if (v.department) acc[v.department] = (acc[v.department] || 0) + 1;
      return acc;
    }, {})
  ).map(([dept, count]) => ({ dept, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Comprehensive overview of visitor management activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Today" value={stats.totalToday ?? 0} icon={Users} color="navy" />
        <StatCard label="Pending" value={stats.pendingAll ?? 0} icon={Clock} color="amber" />
        <StatCard label="Approved Today" value={stats.approvedToday ?? 0} icon={CheckCircle} color="green" />
        <StatCard label="Rejected Today" value={stats.rejectedToday ?? 0} icon={XCircle} color="red" />
        <StatCard label="Currently Inside" value={stats.currentlyInside ?? 0} icon={UserCheck} color="blue" />
        <StatCard label="Completed Today" value={stats.completedToday ?? 0} icon={LogOut} color="slate" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800">Visitor Trend — Last 7 Days</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Total" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Approved" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Rejected" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800">By Department</h2>
          </div>
          <div className="p-4">
            {deptData.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis dataKey="dept" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#1e3a5f" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Summary */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-800">All-Time Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
          {[
            { label: 'Total Visitors', value: stats.totalAll ?? 0 },
            { label: 'Total Approved', value: visitors.filter((v) => v.approvalStatus === 'Approved').length },
            { label: 'Total Rejected', value: visitors.filter((v) => v.approvalStatus === 'Rejected').length },
            { label: 'Total Completed', value: visitors.filter((v) => v.visitStatus === 'Checked Out').length },
          ].map(({ label, value }) => (
            <div key={label} className="p-5 text-center">
              <p className="text-3xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
