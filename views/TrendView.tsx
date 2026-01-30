import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, Dot } from 'recharts';
import { DayEntry, MoonPhase } from '../types';
import { TAROT_DECK } from '../constants';
import { GeminiService } from '../services/geminiService';
import { Sparkles, Quote, Loader2 } from 'lucide-react';

interface Props {
  data: DayEntry[];
}

const TrendView: React.FC<Props> = ({ data }) => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  
  // Sort data by date
  const sortedData = useMemo(() => {
      return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Extract Keywords for the month (Aggregate from tarot cards)
  const topKeywords = useMemo(() => {
      const allKeywords = sortedData.flatMap(d => {
          if (!d.todayAwareness?.cardId) return [];
          const card = TAROT_DECK.find(c => c.id === d.todayAwareness!.cardId);
          return card ? card.keywords : [];
      });

      // Simple frequency map
      const counts: Record<string, number> = {};
      allKeywords.forEach(k => counts[k] = (counts[k] || 0) + 1);
      
      // Sort and take top 3
      return Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([k]) => k);
  }, [sortedData]);

  // Generate Insight on Mount
  useEffect(() => {
      const fetchInsight = async () => {
          if (topKeywords.length > 0) {
              setLoadingInsight(true);
              const result = await GeminiService.generateMonthlyInsight(topKeywords);
              setInsight(result);
              setLoadingInsight(false);
          } else {
              setInsight("本月的数据如未写的诗篇，等待你去填充觉察的瞬间。");
          }
      };
      fetchInsight();
  }, [topKeywords]);

  // Prepare chart data
  const chartData = sortedData.map(d => ({
    date: d.date.split('-').slice(1).join('/'), // MM/DD
    score: d.todayAwareness?.complexityScore || 0,
    title: d.todayAwareness?.selectedTitle || '未记录',
    moonPhase: d.moonPhase
  }));

  // Custom Dot Component for Glowing Particles
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    
    // Determine glow based on moon phase concept (Full = Brightest, New = Dim)
    // Simplified mapping for demo
    const isBright = payload.moonPhase === MoonPhase.FULL || payload.moonPhase === MoonPhase.WAXING_GIBBOUS || payload.moonPhase === MoonPhase.WANING_GIBBOUS;
    
    return (
      <g>
        {/* Outer Glow */}
        <circle cx={cx} cy={cy} r={8} fill={isBright ? "#818cf8" : "#6366f1"} fillOpacity={0.2} className="animate-pulse" />
        {/* Core */}
        <circle cx={cx} cy={cy} r={3} fill="#fff" stroke="none" />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-indigo-500/30 p-3 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] backdrop-blur-md text-xs">
          <p className="text-indigo-200 font-bold mb-1">{label}</p>
          <p className="text-white text-sm mb-1">{payload[0].payload.title}</p>
          <div className="flex justify-between items-center text-slate-400 space-x-4">
              <span>灵魂潮汐值: {payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-24 px-6 pt-10 font-serif">
      <div className="mb-8">
        <h2 className="text-2xl text-white mb-2 tracking-wide">趋势观察</h2>
        <p className="text-slate-400 text-sm tracking-widest">观测你内心的引力场</p>
      </div>

      {/* Soul Tides Chart */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-indigo-200 text-xs uppercase tracking-[0.2em] flex items-center">
                <Sparkles size={12} className="mr-2 text-indigo-400" />
                灵魂潮汐 · Soul Tides
            </h3>
            <span className="text-[10px] text-slate-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">Complexity Index</span>
        </div>
        
        <div className="h-64 w-full bg-slate-900/50 rounded-2xl border border-white/5 p-4 relative shadow-lg backdrop-blur-sm">
             {/* Grid Lines Overlay (Manual for aesthetics if needed, but keeping Recharts simple) */}
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="date" 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#64748b' }}
                        dy={10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#818cf8" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        dot={<CustomDot />}
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#fff" }}
                        animationDuration={1500}
                    />
                </AreaChart>
             </ResponsiveContainer>
        </div>
      </section>

      {/* Insight Card */}
      <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h3 className="text-indigo-200 text-xs uppercase tracking-[0.2em] mb-4">月度回响 · Monthly Echo</h3>
          
          <div className="relative p-1 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-slate-800/20">
              <div className="relative bg-slate-900/90 rounded-xl p-6 border border-white/5 backdrop-blur-xl overflow-hidden min-h-[160px] flex flex-col justify-center">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Quote size={60} className="text-white" />
                  </div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]"></div>

                  {/* Content */}
                  <div className="relative z-10">
                      <div className="flex items-center space-x-2 mb-4">
                           {topKeywords.map((k, i) => (
                               <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-500/20 tracking-wider">
                                   #{k}
                               </span>
                           ))}
                      </div>

                      {loadingInsight ? (
                          <div className="flex items-center space-x-3 text-slate-500 py-2">
                              <Loader2 size={16} className="animate-spin" />
                              <span className="text-xs tracking-widest">星辰正在编织寄语...</span>
                          </div>
                      ) : (
                          <p className="text-white/90 text-sm leading-7 font-serif italic tracking-wide">
                              "{insight}"
                          </p>
                      )}
                  </div>
                  
                  {/* Signature */}
                  <div className="absolute bottom-4 right-6">
                      <span className="text-[9px] text-slate-600 tracking-[0.3em] uppercase">AI Oracle</span>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
};

export default TrendView;