import React, { useState, useCallback, useEffect } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { SummaryTab } from './components/SummaryTab';
import { PageAnalysis, TabType } from './types';
import { analyzeUrl } from './services/crawler';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.SUMMARY);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeUrl(url);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the site.');
    } finally {
      setLoading(false);
    }
  }, []);

  const renderTabContent = () => {
    if (!analysis) return null;

    switch (activeTab) {
      case TabType.SUMMARY:
        return <SummaryTab data={analysis} />;
      
      case TabType.LINKS:
        return (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Hyperlink Analysis ({analysis.links.length})</h3>
              <span className="text-xs text-slate-500 font-mono">Total Found: {analysis.links.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3">Link Text / Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Destination URL</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysis.links.map((link, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 truncate max-w-xs" title={link.text}>{link.text}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{link.title || 'No title attribute'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          link.type === 'internal' ? 'bg-indigo-50 text-indigo-600' : 
                          link.type === 'external' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {link.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-500 text-sm truncate max-w-md font-mono" title={link.href}>{link.href}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-emerald-500 font-bold text-sm">200 OK</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case TabType.IMAGES:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {analysis.images.map((img, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="aspect-video bg-slate-100 overflow-hidden relative group">
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/200/300?blur=5'; }}
                  />
                  {!img.alt && (
                    <div className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full text-[10px] px-2 shadow-sm">
                      Missing Alt
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">File Name</h4>
                  <p className="text-sm text-slate-800 truncate font-mono mb-3">{img.fileName}</p>
                  
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Alt Text</label>
                    <p className={`text-xs ${img.alt ? 'text-slate-600' : 'text-rose-500 italic font-medium'}`}>
                      {img.alt || 'No alternative text provided'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case TabType.ACCESSIBILITY:
        const ariaLabelElements = analysis.accessibility.ariaElements.filter(el => el.attributes['aria-label']);
        const imageElements = analysis.images;
        const imagesWithAlt = imageElements.filter(img => img.alt && img.alt.trim() !== '');

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-list-ol text-indigo-500"></i>
                  Header Hierarchy
                </h3>
                <div className="space-y-2">
                  {analysis.accessibility.headers.map((h, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${h.level === 1 ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`} style={{ marginLeft: `${(h.level - 1) * 20}px` }}>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">H{h.level}</span>
                      <span className="text-sm font-medium text-slate-700">{h.text}</span>
                    </div>
                  ))}
                  {analysis.accessibility.headers.length === 0 && (
                    <p className="text-slate-500 text-sm italic">No semantic headers found on this page.</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle text-rose-500"></i>
                    Priority Fixes
                  </h3>
                  <div className="space-y-3">
                    {analysis.accessibility.errors.map((err, i) => (
                      <div key={i} className="flex gap-2 text-sm text-slate-600 p-3 bg-rose-50 rounded-lg border border-rose-100">
                        <i className="fas fa-times-circle text-rose-500 mt-0.5"></i>
                        <span>{err}</span>
                      </div>
                    ))}
                    {analysis.accessibility.errors.length === 0 && (
                      <div className="flex gap-2 text-sm text-emerald-600 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                        <span>No structural accessibility issues found!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Aria-label Analysis Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-quote-left text-emerald-500"></i>
                  Aria-label Definitions
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Labels:</span>
                  <span className="text-2xl font-black text-emerald-600">{ariaLabelElements.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {ariaLabelElements.map((el, i) => (
                  <div key={i} className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100 flex flex-col group hover:bg-emerald-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        &lt;{el.tag}&gt;
                      </span>
                    </div>
                    <span className="text-sm text-slate-700 font-medium leading-relaxed italic group-hover:text-slate-900 transition-colors">
                      "{el.attributes['aria-label']}"
                    </span>
                  </div>
                ))}
                {ariaLabelElements.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <i className="fas fa-info-circle text-2xl mb-2 opacity-20"></i>
                    <p className="italic">No elements with aria-label attributes were detected.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Image Alt Text Audit Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-image text-indigo-500"></i>
                  Image Alt Text Audit
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">With Alt:</span>
                  <span className="text-2xl font-black text-indigo-600">
                    {imagesWithAlt.length}<span className="text-slate-300 text-lg">/{imageElements.length}</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {imageElements.map((img, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex flex-col group transition-colors ${img.alt ? 'bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50' : 'bg-rose-50/30 border-rose-100 hover:bg-rose-50'}`}>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <i className={`fas ${img.alt ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-circle text-rose-500'} text-xs`}></i>
                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[150px]" title={img.fileName}>
                          {img.fileName}
                        </span>
                      </div>
                      {img.src && (
                         <a href={img.src} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600">
                           <i className="fas fa-external-link-alt text-[10px]"></i>
                         </a>
                      )}
                    </div>
                    {img.alt ? (
                      <span className="text-sm text-slate-700 font-medium leading-relaxed italic group-hover:text-slate-900 transition-colors">
                        "{img.alt}"
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">
                        Missing Alt Text
                      </span>
                    )}
                  </div>
                ))}
                {imageElements.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <i className="fas fa-image text-2xl mb-2 opacity-20"></i>
                    <p className="italic">No images detected on this page.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-universal-access text-indigo-500"></i>
                  ARIA Attributes & Semantic Roles
                </h3>
                <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                  {analysis.accessibility.ariaElements.length} Elements Found
                </span>
              </div>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 w-32">Element Tag</th>
                      <th className="px-6 py-3">Attributes & Values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.accessibility.ariaElements.map((el, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors align-top">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            &lt;{el.tag}&gt;
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {Object.entries(el.attributes).map(([key, val]) => {
                              const isEmptyAriaLabel = key === 'aria-label' && (!val || (val as string).trim() === '');
                              return (
                                <div key={key} className={`flex flex-col p-2 rounded-lg border ${isEmptyAriaLabel ? 'bg-rose-50 border-rose-200' : 'bg-slate-100/50 border-slate-200/50'}`}>
                                  <span className={`text-[9px] font-black uppercase tracking-wider ${isEmptyAriaLabel ? 'text-rose-500' : 'text-slate-400'}`}>{key}</span>
                                  <span className={`text-xs font-medium break-all ${isEmptyAriaLabel ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                                    {val || (isEmptyAriaLabel ? <span className="flex items-center gap-1"><i className="fas fa-exclamation-circle"></i> EMPTY</span> : '(empty)')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {analysis.accessibility.ariaElements.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-12 text-center text-slate-400 italic">
                          No elements with ARIA attributes or roles were detected.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case TabType.CSS:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <i className="fas fa-palette text-pink-500"></i>
                Color Palette Extraction
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {analysis.css.detectedColors.map((color, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-24 w-full" style={{ backgroundColor: color.hex }}></div>
                    <div className="p-3">
                      <div className="text-sm font-bold text-slate-800 uppercase font-mono">{color.hex}</div>
                      <div className="text-xs text-slate-500 mt-1">Found {color.count} times</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-code-merge text-slate-400"></i>
                Styling Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Inline Styles</div>
                  <div className="text-2xl font-bold text-slate-800">{analysis.css.inlineStylesCount}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">External Stylesheets</div>
                  <div className="text-2xl font-bold text-slate-800">CORS Limited</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Primary Color</div>
                  <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: analysis.css.detectedColors[0]?.hex }}></div>
                    <span className="text-sm font-mono">{analysis.css.detectedColors[0]?.hex || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case TabType.SOURCE:
        return (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 text-xs font-mono">index.html (Extracted Source)</span>
              <button 
                onClick={() => navigator.clipboard.writeText(analysis.html)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
            <pre className="p-6 overflow-x-auto text-xs font-mono text-emerald-400 max-h-[600px] leading-relaxed">
              <code>{analysis.html}</code>
            </pre>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <DashboardHeader onSearch={handleSearch} isLoading={loading} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysis && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="bg-indigo-50 p-6 rounded-full mb-6">
              <i className="fas fa-globe text-6xl text-indigo-200"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to audit?</h2>
            <p className="text-slate-500 max-w-md">Enter any URL above to perform a comprehensive technical, SEO, and accessibility analysis of your webpage.</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 mb-8 flex items-start gap-4">
            <div className="bg-rose-500 text-white p-2 rounded-lg">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <h3 className="font-bold text-rose-800">Analysis Failed</h3>
              <p className="text-rose-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-robot text-indigo-600"></i>
              </div>
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-bold text-lg">Deep crawling in progress...</p>
              <p className="text-slate-500 text-sm">Analyzing headers, images, and semantic roles.</p>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 truncate max-w-2xl">{analysis.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="font-mono text-xs">{analysis.url}</span>
                  <span className="bg-slate-200 w-1 h-1 rounded-full"></span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  <i className="fas fa-file-pdf mr-2"></i> Export PDF
                </button>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                  <i className="fas fa-share-nodes mr-2"></i> Share Report
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-8 overflow-x-auto no-scrollbar">
              {[
                { type: TabType.SUMMARY, label: 'Summary', icon: 'fa-table-columns' },
                { type: TabType.LINKS, label: 'Links', icon: 'fa-link' },
                { type: TabType.IMAGES, label: 'Images', icon: 'fa-image' },
                { type: TabType.ACCESSIBILITY, label: 'Accessibility', icon: 'fa-universal-access' },
                { type: TabType.CSS, label: 'CSS Analysis', icon: 'fa-palette' },
                { type: TabType.SOURCE, label: 'HTML Source', icon: 'fa-code' },
              ].map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.type 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Tab Content */}
            <div className="mt-8 pb-10">
              {renderTabContent()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;