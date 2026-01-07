
import React from 'react';
import { PageAnalysis } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SummaryTabProps {
  data: PageAnalysis;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ data }) => {
  const chartData = [
    { name: 'Links', count: data.summary.linkCount, color: '#4F46E5' },
    { name: 'Images', count: data.summary.imageCount, color: '#10B981' },
    { name: 'Issues', count: data.summary.errorCount + data.summary.warningCount, color: '#EF4444' },
    { name: 'Tables', count: data.accessibility.tables.length, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Links Found', value: data.summary.linkCount, icon: 'fa-link', color: 'indigo' },
          { label: 'Total Images', value: data.summary.imageCount, icon: 'fa-image', color: 'emerald' },
          { label: 'Accessibility Score', value: `${data.accessibility.score}%`, icon: 'fa-universal-access', color: 'amber' },
          { label: 'Critical Issues', value: data.summary.errorCount, icon: 'fa-exclamation-triangle', color: 'rose' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500 uppercase">{card.label}</span>
              <div className={`text-${card.color}-600 bg-${card.color}-50 p-2 rounded-lg`}>
                <i className={`fas ${card.icon}`}></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
          <i className="fas fa-chart-simple text-indigo-500"></i>
          Metric Overview
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-file-invoice text-emerald-500"></i>
            Metadata Extraction
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Page Title</label>
              <p className="text-slate-700 text-sm font-medium">{data.title}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Meta Description</label>
              <p className="text-slate-600 text-sm leading-relaxed">{data.metaDescription}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-shield-check text-indigo-500"></i>
            Security & Compliance
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <i className={`fas ${data.url.startsWith('https') ? 'fa-check-circle text-emerald-500' : 'fa-times-circle text-rose-500'}`}></i>
              SSL Enabled (HTTPS)
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <i className="fas fa-check-circle text-emerald-500"></i>
              Robots.txt reachable (Mocked)
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <i className="fas fa-info-circle text-indigo-500"></i>
              Character Encoding: UTF-8
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
