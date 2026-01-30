import React, { useState, useMemo } from 'react';
import { DayEntry, MoonPhase } from '../types';
import RealisticMoon from '../components/RealisticMoon';
import { MOON_PHASE_INFO, TAROT_DECK, getTodayStr } from '../constants';
import { calculateMoonPhase } from '../utils/uiHelpers';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles, X, MessageCircle, CheckCircle2, Circle, Flower2, Clock, Zap } from 'lucide-react';

interface Props {
  data: DayEntry[];
}

const ArchiveView: React.FC<Props> = ({ data }) => {
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDateStr, setSelectedDateStr] = useState(getTodayStr());
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Month Navigation Handlers
  const prevMonth = () => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(1); 
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(1); 
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
    });
  };

  // --- CALENDAR LOGIC ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  
  // 1. Get number of days in this month
  const daysInMonth = new Date(year, month + 1, 0).getDate(); 
  
  // 2. Get weekday of the 1st of the month (0=Sun, 1=Mon... 6=Sat)
  const firstDayObj = new Date(year, month, 1);
  const firstDayOfWeek = firstDayObj.getDay(); 
  
  // 3. Calculate Offset for Monday Start
  // If Mon(1) -> 0 padding
  // If Tue(2) -> 1 padding
  // If Sun(0) -> 6 padding
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];


  // --- SELECTION LOGIC ---
  // Ensure we have a valid phase even if no entry exists
  const entryForSelection = data.find(d => d.date === selectedDateStr);
  
  // Dynamic Calculation for Dropdown Display
  const displayMoonPhase = useMemo(() => {
      if (entryForSelection) return entryForSelection.moonPhase;
      // If no entry, calculate accurately based on the date string
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      return calculateMoonPhase(new Date(y, m - 1, d));
  }, [entryForSelection, selectedDateStr]);
  
  const selectedEntry = entryForSelection || {
    moonPhase: displayMoonPhase, 
    date: selectedDateStr,
    todayAwareness: undefined,
    tomorrowSeed: undefined,
    practices: []
  };
  
  const moonInfo = MOON_PHASE_INFO[displayMoonPhase];
  
  const card = selectedEntry.todayAwareness?.cardId 
    ? TAROT_DECK.find(c => c.id === selectedEntry.todayAwareness?.cardId)
    : null;
  const seedGoal = selectedEntry.tomorrowSeed;
  const practices = selectedEntry.practices || [];


  return (
    <div className="h-full flex flex-col pt-2 px-5 pb-20 overflow-hidden font-serif relative">
      
      {/* 1. TOP SECTION: Dropdown Details */}
      <div 
        className={`flex-shrink-0 flex flex-col items-center justify-start mb-2 relative z-10 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isDetailsExpanded ? 'flex-1 mb-0' : 'h-[30%]'}`}
      >
         {/* Atmospheric Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full animate-pulse-slow -z-10 pointer-events-none"></div>

         {/* Moon - Click to toggle */}
         <div className={`relative animate-float cursor-pointer transition-transform duration-700 ${isDetailsExpanded ? 'scale-75 mt-4' : 'scale-100 mt-8'}`} onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}>
             <RealisticMoon phase={displayMoonPhase} size={100} brightness={1} />
             <div className="absolute inset-0 rounded-full bg-white/5 blur-xl -z-10"></div>
         </div>
         
         <div className="mt-4 text-center w-full max-w-sm animate-fade-in-up flex flex-col items-center">
             <h2 className="text-3xl font-light text-white tracking-wide">{moonInfo.cnName}</h2>
             <p className="text-indigo-200/60 text-sm tracking-[0.2em] uppercase mt-1 font-sans">{selectedEntry.date}</p>
             
             {/* Collapsible Content */}
             <div 
                className={`w-full overflow-y-auto no-scrollbar transition-all duration-500 ${isDetailsExpanded ? 'opacity-100 mt-6 max-h-[50vh]' : 'max-h-0 opacity-0'}`}
             >
                 <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl mx-auto space-y-4">
                     
                     {/* Card Info */}
                     {card ? (
                         <div 
                            className="flex items-center space-x-4 bg-white/5 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setShowHistoryModal(true)}
                         >
                             <img src={card.imageUrl} alt={card.name} className="w-12 h-20 object-cover rounded shadow-md" />
                             <div className="text-left flex-1">
                                 <h4 className="text-white text-sm font-medium">{card.name}</h4>
                                 <p className="text-indigo-200 text-xs mt-1 line-clamp-1 italic">"{selectedEntry.todayAwareness?.selectedTitle || '未命名'}"</p>
                                 <div className="flex items-center text-[10px] text-slate-400 mt-2">
                                     <MessageCircle size={10} className="mr-1" />
                                     <span>点击查看对话记录</span>
                                 </div>
                             </div>
                         </div>
                     ) : (
                         <div className="text-center p-4 border border-dashed border-slate-700 rounded-xl text-slate-500 text-xs">
                             本日暂无抽牌记录
                         </div>
                     )}

                     {/* Goal Status */}
                     {seedGoal && seedGoal.energySeed && (
                         <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-start space-x-3">
                             <div className={`mt-0.5 ${seedGoal.isCompleted ? 'text-amber-400' : 'text-slate-500'}`}>
                                 {seedGoal.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                             </div>
                             <div className="text-left">
                                 <h4 className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">今日能量小目标</h4>
                                 <p className="text-white text-sm font-serif">"{seedGoal.energySeed}"</p>
                             </div>
                         </div>
                     )}

                     {/* Practice Sessions */}
                     {practices.length > 0 && (
                         <div className="bg-indigo-900/10 p-3 rounded-xl border border-indigo-500/10">
                             <h4 className="flex items-center text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                                 <Flower2 size={12} className="mr-2" />
                                 今日修习记录
                             </h4>
                             <div className="space-y-2">
                                 {practices.map((session, idx) => (
                                     <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-900/40 rounded-lg border border-white/5">
                                         <div>
                                            <span className="text-slate-200 font-serif block">{session.scenarioTitle}</span>
                                            <span className={`text-[10px] ${session.completed ? 'text-green-400/70' : 'text-amber-400/70'}`}>
                                                {session.completed ? "完整修习" : "中途结算"}
                                            </span>
                                         </div>
                                         <div className="flex flex-col items-end gap-1">
                                             <div className="flex items-center text-slate-400 text-xs">
                                                 <Clock size={10} className="mr-1" />
                                                 <span>{Math.ceil(session.durationSeconds / 60)} min</span>
                                             </div>
                                             <div className="flex items-center text-xs">
                                                <Zap size={10} className={`mr-1 ${session.energyScore > 80 ? 'text-amber-300' : 'text-slate-500'}`} fill="currentColor" />
                                                <span className={session.energyScore > 80 ? 'text-amber-200' : 'text-slate-400'}>{session.energyScore}</span>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}

                     {/* Moon Knowledge */}
                     <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20 text-left">
                         <h4 className="flex items-center text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                             <Sparkles size={12} className="mr-2" />
                             {moonInfo.cnName} · 能量状态
                         </h4>
                         <p className="text-indigo-100 text-sm font-serif leading-relaxed mb-2">
                             "{moonInfo.blessing}"
                         </p>
                     </div>
                 </div>
             </div>

             {/* Toggle Button */}
             <button 
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className={`mt-4 text-slate-500 hover:text-indigo-300 transition-colors w-full flex justify-center pb-2 ${isDetailsExpanded ? 'opacity-80' : 'opacity-100'}`}
             >
                 {isDetailsExpanded ? <ChevronUp size={24} /> : <div className="flex flex-col items-center gap-1"><span className="text-[10px] uppercase tracking-widest opacity-50">点击查看当日详情</span><ChevronDown size={20} className="animate-bounce opacity-50" /></div>}
             </button>
         </div>
      </div>

      {/* 2. BOTTOM SECTION: Calendar Grid */}
      <div className={`flex-1 flex flex-col bg-slate-900/40 rounded-t-3xl border-t border-l border-r border-white/5 p-5 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.3)] min-h-0 z-20 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isDetailsExpanded ? 'translate-y-full opacity-50' : 'translate-y-0 opacity-100'}`}>
         
         {/* Month Navigation */}
         <div className="flex justify-between items-baseline mb-2 px-1 flex-shrink-0">
            <h3 className="text-white text-2xl font-light tracking-tight">{monthNames[month]}</h3>
            <div className="flex items-center space-x-4 mb-1">
                <span className="text-slate-500 text-lg font-light tracking-widest font-sans">{year}</span>
                <div className="flex space-x-2">
                    <button onClick={prevMonth} className="text-slate-500 hover:text-white transition-colors active:scale-90 p-1"><ChevronLeft size={22} strokeWidth={1.5} /></button>
                    <button onClick={nextMonth} className="text-slate-500 hover:text-white transition-colors active:scale-90 p-1"><ChevronRight size={22} strokeWidth={1.5} /></button>
                </div>
            </div>
         </div>
         
         {/* Weekday Headers - 7 Columns */}
         <div className="grid grid-cols-7 text-center mb-2 flex-shrink-0">
            {weekDays.map(d => (
                <span key={d} className="text-[10px] text-slate-500 uppercase tracking-widest font-sans opacity-70">{d}</span>
            ))}
         </div>

         {/* Calendar Cells - Scrollable Area */}
         <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-7 gap-y-1 auto-rows-min pb-4">
                
                {/* Empty Padding Cells for Offset */}
                {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-14" />
                ))}

                {/* Date Cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                     const day = i + 1;
                     const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                     const entry = data.find(d => d.date === dateStr);
                     const isSelected = dateStr === selectedDateStr;
                     
                     const isLit = entry?.todayAwareness?.status === 'done';
                     const hasPractice = (entry?.practices?.length || 0) > 0;
                     const brightness = isLit ? 1 : (hasPractice ? 0.6 : 0.2);

                     // Accurate Phase Calculation for the grid
                     let displayPhase = entry ? entry.moonPhase : calculateMoonPhase(new Date(year, month, day));

                     return (
                        <button 
                            key={day} 
                            onClick={() => {
                                setSelectedDateStr(dateStr);
                                setIsDetailsExpanded(true); 
                            }}
                            className={`flex flex-col items-center justify-center h-14 rounded-lg transition-all duration-300 group relative ${
                                isSelected ? 'bg-white/5 shadow-inner scale-105' : 'hover:bg-white/5 active:scale-95'
                            }`}
                        >
                            {/* 1. Top: Moon Icon */}
                            <div className={`mb-1 transition-transform duration-500 ${isSelected ? 'scale-110' : 'opacity-80 group-hover:opacity-100'}`}>
                                <RealisticMoon 
                                    phase={displayPhase} 
                                    size={16} 
                                    simple={true} 
                                    brightness={brightness} 
                                />
                            </div>

                            {/* 2. Middle: Date Number */}
                            <span className={`text-[10px] font-medium font-sans leading-none ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                                {day}
                            </span>
                            
                            {/* 3. Bottom: Status Dot (Fixed height container to prevent shift) */}
                            <div className="mt-1 h-1 w-full flex justify-center items-center">
                                {isLit ? (
                                    <div className="w-1 h-1 bg-amber-300 rounded-full shadow-[0_0_4px_#fcd34d]"></div>
                                ) : hasPractice && (
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                )}
                            </div>
                        </button>
                     );
                })}
            </div>
         </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedEntry?.todayAwareness && card && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                <button 
                    onClick={() => setShowHistoryModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-1 bg-black/20 rounded-full"
                >
                    <X size={20} />
                </button>
                <div className="p-6 bg-gradient-to-b from-indigo-950 to-slate-900 flex flex-col items-center border-b border-white/5">
                    <img src={card.imageUrl} alt={card.name} className="w-20 h-32 object-cover rounded-lg shadow-lg mb-3" />
                    <h3 className="text-white font-serif text-xl">{card.name}</h3>
                    <p className="text-indigo-200 text-sm mt-1">"{selectedEntry.todayAwareness.selectedTitle}"</p>
                    <p className="text-slate-500 text-xs mt-2 font-sans tracking-widest">{selectedEntry.date}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {selectedEntry.todayAwareness.chatHistory.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed font-serif ${
                                m.role === 'user' 
                                ? 'bg-indigo-600/80 text-white rounded-tr-none' 
                                : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    <div className="h-8"></div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ArchiveView;