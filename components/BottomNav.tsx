import React from 'react';
import { Sparkles, Calendar, User, Activity, Flower2 } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'calendar', label: '日历', icon: Calendar },
    { id: 'trends', label: '趋势', icon: Activity },
    { id: 'divination', label: '', icon: Sparkles, isCenter: true }, // Center label hidden for cleaner look
    { id: 'practice', label: '修习', icon: Flower2 },
    { id: 'soul', label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-[360px] z-50 px-4">
      {/* Floating Glass Pill */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-16 flex items-center justify-between px-2 relative">
        
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          
          // Special Center Button
          if (item.isCenter) {
             return (
                <div key={item.id} className="relative -top-6 w-16 flex justify-center">
                    <button
                      onClick={() => onTabChange(item.id as Tab)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg border ${
                          isActive 
                          ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-110' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                        <Icon size={24} strokeWidth={2} className={isActive ? 'animate-pulse' : ''} />
                    </button>
                    {/* Glow effect under center button */}
                    <div className={`absolute -bottom-2 w-10 h-2 bg-indigo-500/50 blur-lg rounded-full transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                </div>
             );
          }

          // Standard Buttons
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as Tab)}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 group ${
                isActive ? 'text-indigo-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-500/10' : 'bg-transparent'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-medium tracking-widest mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;