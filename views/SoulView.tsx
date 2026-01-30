import React, { useState, useMemo } from 'react';
import { Activity, Heart, Sparkles, Edit2, Check, X, MapPin, Clock } from 'lucide-react';
import { MOON_PHASE_INFO } from '../constants';
import { MoonPhase, DayEntry } from '../types';
import { calculateMoonPhase } from '../utils/uiHelpers';
import RealisticMoon from '../components/RealisticMoon';

interface Props {
    data: DayEntry[];
}

const SoulView: React.FC<Props> = ({ data }) => {
  // --- STATE ---
  const [birthDate, setBirthDate] = useState('1995-10-24');
  const [birthTime, setBirthTime] = useState('22:30');
  const [birthLocation, setBirthLocation] = useState('上海, 中国');
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Temp Edit States
  const [editDate, setEditDate] = useState(birthDate);
  const [editTime, setEditTime] = useState(birthTime);
  const [editLocation, setEditLocation] = useState(birthLocation);

  // --- DERIVED DATA ---
  
  // 1. Dynamic Natal Info Calculation
  const natalPhase = useMemo(() => {
      // Create date object from birthDate string (YYYY-MM-DD)
      const dateParts = birthDate.split('-').map(Number);
      if (dateParts.length === 3) {
          // Note: Month is 0-indexed in JS Date
          const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          return calculateMoonPhase(date);
      }
      return MoonPhase.NEW;
  }, [birthDate]);
  
  const natalInfo = MOON_PHASE_INFO[natalPhase];

  // 2. Dynamic Energy Color based on Latest Entry
  const latestEntry = data[data.length - 1];
  const currentEnergy = latestEntry?.todayAwareness?.energyLevel ?? 50;

  const getMoodColor = (level: number) => {
      if (level >= 80) return { glow: 'bg-amber-500', text: 'text-amber-400', filter: 'hue-rotate(30deg)' }; 
      if (level >= 60) return { glow: 'bg-rose-500', text: 'text-rose-400', filter: 'hue-rotate(0deg) saturate(1.5)' }; 
      if (level >= 40) return { glow: 'bg-indigo-500', text: 'text-indigo-400', filter: 'none' }; 
      if (level >= 20) return { glow: 'bg-cyan-600', text: 'text-cyan-400', filter: 'hue-rotate(180deg)' }; 
      return { glow: 'bg-slate-500', text: 'text-slate-400', filter: 'grayscale(100%)' }; 
  };

  const moodStyle = getMoodColor(currentEnergy);

  // 3. Stats
  const totalDays = data.length;
  const avgComplexity = Math.round(data.reduce((acc, curr) => acc + (curr.todayAwareness?.complexityScore || 0), 0) / (totalDays || 1));

  // --- HANDLERS ---
  const saveProfile = () => {
      setBirthDate(editDate);
      setBirthTime(editTime);
      setBirthLocation(editLocation);
      setIsEditing(false);
  };

  const cancelEdit = () => {
      setEditDate(birthDate);
      setEditTime(birthTime);
      setEditLocation(birthLocation);
      setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 pt-12 text-center space-y-8 animate-in fade-in duration-700 overflow-y-auto no-scrollbar pb-24">
        
        {/* Natal Moon Visual with Dynamic Mood Color */}
        <div className="relative w-48 h-48 flex-shrink-0 group">
             {/* Background Glow (Dynamic) */}
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[60px] opacity-60 animate-pulse-slow transition-colors duration-1000 ${moodStyle.glow}`}></div>
             
             {/* Container for the Realistic Moon */}
             <div className="relative w-full h-full flex items-center justify-center animate-float" style={{ filter: moodStyle.filter, transition: 'filter 1s ease' }}>
                <RealisticMoon phase={natalPhase} size={160} />
             </div>
        </div>

        <div className="w-full">
            <h2 className="text-2xl font-serif text-white mb-1">本命月相</h2>
            <p className={`text-lg font-medium tracking-wide transition-colors duration-700 ${moodStyle.text}`}>{natalInfo.cnName}</p>
            
            {/* Editable Profile Section */}
            <div className="mt-6 flex flex-col items-center justify-center">
                {isEditing ? (
                    <div className="bg-slate-900/80 border border-indigo-500/50 rounded-xl p-4 w-full max-w-xs space-y-3 animate-in zoom-in-95 shadow-xl">
                        <div className="flex flex-col space-y-1 text-left">
                            <label className="text-[10px] text-slate-400 uppercase tracking-widest">Date</label>
                            <input 
                                type="date" 
                                value={editDate} 
                                onChange={(e) => setEditDate(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <div className="flex flex-col space-y-1 text-left flex-1">
                                <label className="text-[10px] text-slate-400 uppercase tracking-widest">Time</label>
                                <input 
                                    type="time" 
                                    value={editTime} 
                                    onChange={(e) => setEditTime(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex flex-col space-y-1 text-left flex-1">
                                <label className="text-[10px] text-slate-400 uppercase tracking-widest">Location</label>
                                <input 
                                    type="text" 
                                    value={editLocation} 
                                    onChange={(e) => setEditLocation(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                            <button onClick={saveProfile} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded text-xs flex items-center justify-center space-x-1 transition-colors">
                                <Check size={12} /> <span>保存</span>
                            </button>
                            <button onClick={cancelEdit} className="flex-1 bg-white/10 hover:bg-white/20 text-slate-300 py-1.5 rounded text-xs flex items-center justify-center space-x-1 transition-colors">
                                <X size={12} /> <span>取消</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div 
                        className="group flex flex-col items-center cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all" 
                        onClick={() => setIsEditing(true)}
                    >
                        <div className="flex items-center space-x-2 text-slate-300 text-sm font-serif tracking-widest mb-1">
                            <span>{birthDate.replace(/-/g, ' . ')}</span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span>{birthTime}</span>
                        </div>
                        <div className="flex items-center text-slate-500 text-xs gap-1.5">
                            <MapPin size={10} />
                            <span className="tracking-wide">{birthLocation}</span>
                            <Edit2 size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Natal Energy Description */}
        <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 text-left shadow-lg backdrop-blur-sm">
            <h3 className="flex items-center text-indigo-300 text-sm font-bold mb-3 uppercase tracking-wider">
                <Sparkles size={14} className="mr-2" />
                灵魂能量印记
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4 font-serif">
                作为诞生于{natalInfo.cnName}的人，你拥有{natalInfo.blessing}
            </p>
            <p className="text-slate-400 text-xs leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                你的灵魂倾向于内省与智慧的沉淀。在人生的周期中，你擅长收尾与清理，拥有将过往经验转化为精神财富的天赋。
            </p>
            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${moodStyle.glow}`}></span>
                    当前能量色调：基于你今日的表达呈现
                </p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                <Activity className="text-indigo-400 mb-2" size={20} />
                <span className="text-2xl font-bold text-white font-serif">{totalDays}</span>
                <span className="text-xs text-slate-400 mt-1">持续觉察 (天)</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                <Heart className="text-pink-400 mb-2" size={20} />
                <span className="text-2xl font-bold text-white font-serif">{avgComplexity}</span>
                <span className="text-xs text-slate-400 mt-1">平均对话深度</span>
            </div>
        </div>
    </div>
  );
};

export default SoulView;