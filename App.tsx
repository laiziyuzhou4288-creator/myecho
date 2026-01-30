import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import ThreeStageFlow from './components/ThreeStageFlow';
import ArchiveView from './views/ArchiveView';
import SoulView from './views/SoulView';
import TrendView from './views/TrendView';
import PracticeView from './views/PracticeView';
import { Tab, DayEntry, PracticeSession } from './types';
import { MOCK_HISTORY, getTodayStr } from './constants';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('divination');
  const [userData, setUserData] = useState<DayEntry[]>([]);
  const todayStr = getTodayStr();

  // Load initial data (mock)
  useEffect(() => {
    // In a real app, load from LocalStorage or API here
    setUserData(MOCK_HISTORY);
  }, []);

  // Handle saving a completed practice session
  const handleSavePractice = (session: PracticeSession) => {
      const existingEntryIndex = userData.findIndex(d => d.date === todayStr);
      let newUserData = [...userData];

      if (existingEntryIndex >= 0) {
          const entry = newUserData[existingEntryIndex];
          const updatedEntry = {
              ...entry,
              practices: [...(entry.practices || []), session]
          };
          newUserData[existingEntryIndex] = updatedEntry;
      } else {
          // Create new entry if not exists
          newUserData.push({
              date: todayStr,
              moonPhase: 'Waxing Gibbous' as any,
              practices: [session],
              todayAwareness: undefined
          });
      }
      setUserData(newUserData);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'divination':
        return <ThreeStageFlow userData={userData} onUpdateData={setUserData} />;
      case 'calendar':
        return <ArchiveView data={userData} />;
      case 'trends':
        return <TrendView data={userData} />;
      case 'practice':
        return <PracticeView onSaveSession={handleSavePractice} />;
      case 'soul':
        return <SoulView data={userData} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
       
       {/* Top Bar / Status (Simulated Mobile) */}
       <div className="h-10 w-full flex-shrink-0 flex items-center justify-between px-6 pt-2 z-10 bg-gradient-to-b from-slate-950 to-transparent">
         <span className="text-[10px] font-bold tracking-widest text-slate-500">MOON PHASE GRAVITY</span>
         <div className="flex space-x-1">
             <div className="w-1 h-1 bg-green-500 rounded-full"></div>
             <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
         </div>
       </div>

       {/* Main Content Area with Transitions */}
       <div className="flex-1 relative w-full max-w-md mx-auto overflow-hidden">
          {/* Key prop triggers the animation when tab changes */}
          <div 
            key={currentTab} 
            className="h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
          >
            {renderContent()}
          </div>
       </div>

       {/* Navigation */}
       <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;