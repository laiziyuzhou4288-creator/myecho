import React, { useState, useEffect } from 'react';
import { Eye, Ear, Wind, Fingerprint, Apple, Play, Pause, X, ChevronRight, Moon, Star, Orbit, Sparkles, Infinity, Loader2, ChevronLeft, Hexagon, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { PracticeSession } from '../types';

interface Props {
    onSaveSession?: (session: PracticeSession) => void;
}

// --- COSMIC & TAROT THEMES ---

const WEEKLY_THEME = {
    title: "本周：愚人的坠落",
    sub: "The Fool's Leap",
    desc: "在塔罗中，愚人迈向悬崖并非为了毁灭，而是为了信任风的托举。这周，试着信任宇宙的引力。",
    task: "做一件你没有任何把握的小事（比如画一幅画、走一条新路），并享受那种'失控'的轻盈感。"
};

const SENSES_GUIDE = [
    { id: 'visual', icon: Eye, title: '视觉 · 寻光', task: '在阴影中寻找一个微小的反光点，想象那是遥远恒星传来的讯号。' },
    { id: 'audio', icon: Ear, title: '听觉 · 虚空', task: '闭上眼，穿越所有的人造噪音，去倾听声音消失后的寂静。' },
    { id: 'touch', icon: Fingerprint, title: '触觉 · 熵增', task: '触摸一个冰冷的物体，感受体温传递给它的过程。' },
    { id: 'smell', icon: Wind, title: '嗅觉 · 尘埃', task: '雨后或旧书的味道，其实是星尘落定后的气息。' },
    { id: 'taste', icon: Apple, title: '味觉 · 元素', task: '喝水时，想象这是亿万年前撞击地球的冰彗星融化后的产物。' },
];

const SCENARIOS = [
    { 
        id: 'moon', 
        title: '月亮 · 潜意识净化', 
        desc: '面对恐惧与内在滋养', 
        icon: Moon,
        color: 'from-slate-800 to-indigo-950', 
        accent: 'text-indigo-200',
        duration: 300, // 5 mins
        guide: "想象你正躺在一片漆黑的荒原，头顶是巨大的满月。银白色的月光像液态的水银一样流淌下来，覆盖你的皮肤。它是冰凉的，却不寒冷。月光渗入你的毛孔，把你体内黑色的、沉重的焦虑一点点置换出来。你在发光，你变成了月亮在地面的倒影，纯净而圆满。"
    },
    { 
        id: 'star', 
        title: '星星 · 宇宙呼吸', 
        desc: '治愈与希望注入', 
        icon: Star,
        color: 'from-sky-900 to-slate-950', 
        accent: 'text-sky-200',
        duration: 180, // 3 mins
        guide: "每一次吸气，想象你吸入了天狼星清澈的蓝光。每一次呼气，想象你呼出了体内陈旧的灰烬。你的胸腔就是一颗搏动的恒星。吸气——光芒汇聚，核心变热。呼气——光芒爆发，向宇宙扩散。你不再是孤独的个体，你是银河系呼吸韵律的一部分。"
    },
    { 
        id: 'world', 
        title: '世界 · 轨道漂流', 
        desc: '完整性与宏观视角', 
        icon: Orbit,
        color: 'from-violet-950 to-slate-950', 
        accent: 'text-violet-300',
        duration: 300,
        guide: "重力消失了，你缓慢地飘浮起来，穿过屋顶，穿过大气层。地球在你脚下变成了一颗静谧的蓝宝石，而周围是永恒旋转的星体。在这里，你生活中的那些烦恼，比一粒尘埃还要小。你处于宇宙的中心，又处于宇宙的边缘。一切都已完成，一切都恰到好处。"
    },
    { 
        id: 'hermit', 
        title: '隐士 · 虚空提灯', 
        desc: '内省与独处智慧', 
        icon: Hexagon, 
        color: 'from-zinc-900 to-black', 
        accent: 'text-amber-100',
        duration: 300,
        guide: "想象你站在宇宙边缘的黑暗中，手里提着一盏微弱的灯。周围是绝对的虚空与寂静。不要害怕这种空无，这是你的圣殿。在这里，不需要扮演任何角色，不需要回应任何期待。你只需要看着那盏灯——那就是你唯一的念头，你永不熄灭的觉知。"
    }
];

// --- COMPONENTS ---

const PracticeView: React.FC<Props> = ({ onSaveSession }) => {
  const [activeScenario, setActiveScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [sessionState, setSessionState] = useState<'intro' | 'timer' | 'summary'>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [guideOpacity, setGuideOpacity] = useState(1); // Control fade transition
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [sessionResult, setSessionResult] = useState<{completed: boolean, energyScore: number} | null>(null);

  // Parse guide into sentences for the intro
  const guideSentences = activeScenario ? activeScenario.guide.split(/。/).filter(s => s.trim().length > 0) : [];

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
        interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    } else if (timeLeft === 0 && sessionState === 'timer' && timerActive) {
        // Timer Finished naturally
        finishSession(true);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, sessionState]);

  const startScenario = (scenario: typeof SCENARIOS[0]) => {
      setActiveScenario(scenario);
      setSessionState('intro');
      setIntroStep(0);
      setTimeLeft(scenario.duration);
      setTimerActive(false);
      setShowExitConfirm(false);
      setGuideOpacity(1);
  };

  const nextIntroStep = () => {
      // Fade Out
      setGuideOpacity(0);
      
      // Wait for transition, then change text and Fade In
      setTimeout(() => {
          if (introStep < guideSentences.length - 1) {
              setIntroStep(prev => prev + 1);
              setGuideOpacity(1);
          } else {
              setSessionState('timer');
              setTimerActive(true);
              setGuideOpacity(1);
          }
      }, 500); // 500ms matches CSS duration
  };

  const finishSession = (isNaturalCompletion: boolean = true) => {
      if (!activeScenario) return;

      setTimerActive(false);
      setShowExitConfirm(false); // Close overlay if it was open
      
      const durationSeconds = activeScenario.duration - timeLeft;
      const totalDuration = activeScenario.duration;
      // Calculate Energy Score based on completion percentage
      // Minimum 10 points if started, 100 points if finished.
      const rawScore = Math.floor((durationSeconds / totalDuration) * 100);
      const energyScore = isNaturalCompletion ? 100 : Math.max(10, rawScore);

      setSessionResult({
          completed: isNaturalCompletion,
          energyScore
      });

      setSessionState('summary');
      
      if (onSaveSession) {
          onSaveSession({
              id: Date.now().toString(),
              scenarioId: activeScenario.id,
              scenarioTitle: activeScenario.title.split('·')[0],
              durationSeconds: durationSeconds,
              totalDuration: totalDuration,
              energyScore: energyScore,
              completed: isNaturalCompletion,
              timestamp: Date.now()
          });
      }
  };

  const requestExit = () => {
      setTimerActive(false);
      setShowExitConfirm(true);
  };

  const confirmExit = () => {
      // If user confirms exit, we treat it as an early completion and show summary
      // unless it was barely started (< 5 seconds), then we might just quit.
      const spent = activeScenario ? activeScenario.duration - timeLeft : 0;
      
      if (spent > 5) {
          finishSession(false);
      } else {
          setActiveScenario(null);
          setTimerActive(false);
          setShowExitConfirm(false);
      }
  };

  const cancelExit = () => {
      if (sessionState === 'timer') {
         setTimerActive(true);
      }
      setShowExitConfirm(false);
  };

  const closeSummary = () => {
      setActiveScenario(null);
      setSessionState('intro');
      setSessionResult(null);
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-24 px-5 pt-8 font-serif relative">
       {/* Header */}
       <div className="mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
           <div>
               <h2 className="text-2xl text-white mb-1">能量修习</h2>
               <p className="text-slate-400 text-xs tracking-widest">通过冥想连接塔罗原型的力量</p>
           </div>
           <Sparkles className="text-slate-600 opacity-50" size={24} />
       </div>

       {/* 1. Weekly Theme Card */}
       <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="bg-gradient-to-br from-indigo-900/40 to-slate-950 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-indigo-400/30 transition-colors"></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
               
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                        <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-indigo-200 tracking-wider backdrop-blur-sm border border-white/5">WEEKLY TRANSMISSION</span>
                        <ChevronRight className="text-indigo-300 opacity-50" size={16} />
                   </div>
                   <h3 className="text-xl text-white font-medium mb-2">{WEEKLY_THEME.title}</h3>
                   <p className="text-indigo-200/70 text-sm leading-relaxed mb-4">{WEEKLY_THEME.desc}</p>
               </div>
           </div>
       </section>

       {/* 2. Senses Manual */}
       <section className="mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
           <h3 className="text-indigo-200 text-xs uppercase tracking-[0.2em] mb-4">知觉校准 · Calibration</h3>
           <div className="grid grid-cols-1 gap-3">
               {SENSES_GUIDE.map((sense) => (
                   <div key={sense.id} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all duration-300 flex items-start space-x-4 group cursor-default">
                       <div className="p-2 bg-slate-900 rounded-lg text-slate-500 group-hover:text-indigo-300 group-hover:bg-slate-800 transition-colors border border-white/5">
                           <sense.icon size={18} />
                       </div>
                       <div className="flex-1">
                           <h4 className="text-sm text-white mb-1 font-sans font-medium">{sense.title}</h4>
                           <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{sense.task}</p>
                       </div>
                   </div>
               ))}
           </div>
       </section>

       {/* 3. Mindfulness Scenarios */}
       <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
           <h3 className="text-indigo-200 text-xs uppercase tracking-[0.2em] mb-4">原型冥想 · Archetypes</h3>
           <div className="grid grid-cols-2 gap-3">
               {SCENARIOS.map((s) => (
                   <button 
                        key={s.id} 
                        onClick={() => startScenario(s)}
                        className="relative h-36 rounded-2xl overflow-hidden border border-white/10 group text-left p-4 flex flex-col justify-between hover:border-indigo-500/30 transition-all hover:scale-[1.02]"
                   >
                       <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-60 group-hover:opacity-80 transition-opacity`}></div>
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                       
                       <div className="relative z-10 flex justify-between w-full">
                           <s.icon className={`${s.accent} opacity-80`} size={20} />
                           <span className="text-[10px] text-slate-300 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/5">{Math.floor(s.duration / 60)} min</span>
                       </div>
                       
                       <div className="relative z-10">
                           <h4 className="text-white text-sm font-medium tracking-wide">{s.title.split('·')[0]}</h4>
                           <p className="text-[10px] text-slate-400 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">{s.desc}</p>
                       </div>
                   </button>
               ))}
           </div>
       </section>

       {/* --- FULL SCREEN MODAL --- */}
       {activeScenario && (
           <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in zoom-in-95 duration-500 w-full max-w-md mx-auto left-0 right-0">
               {/* Dynamic Background */}
               <div className={`absolute inset-0 bg-gradient-to-b ${activeScenario.color} opacity-40 transition-opacity duration-1000`}></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse-slow"></div>

               {/* VISIBLE EXIT BUTTON (Hide in summary view) */}
               {sessionState !== 'summary' && (
                   <button 
                       onClick={requestExit} 
                       className="absolute top-8 left-6 flex items-center space-x-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-slate-300 hover:text-white hover:bg-white/10 z-[60] backdrop-blur-md transition-all active:scale-95 group"
                   >
                       <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                       <span className="text-xs font-serif tracking-widest">结束</span>
                   </button>
               )}

               {/* -- FLOW A: INTRO SEQUENCE -- */}
               {sessionState === 'intro' && (
                   <div 
                        className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center cursor-pointer h-full w-full"
                        onClick={nextIntroStep}
                    >
                        {/* Icon Small Top */}
                        <div className="mb-12 opacity-50 animate-pulse-slow">
                            <activeScenario.icon size={32} className={`${activeScenario.accent}`} />
                        </div>

                        {/* Sentence Display with Smooth Transition */}
                        <div className="h-40 flex items-center justify-center w-full max-w-xs">
                            <p 
                                key={introStep} 
                                className="text-2xl md:text-3xl font-serif text-white leading-relaxed transition-opacity duration-500 ease-in-out"
                                style={{ opacity: guideOpacity }}
                            >
                                "{guideSentences[introStep]}。"
                            </p>
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex space-x-2 mt-16 mb-8 transition-opacity duration-500" style={{ opacity: guideOpacity }}>
                            {guideSentences.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === introStep ? 'w-8 bg-indigo-400' : 'w-2 bg-slate-700'}`}></div>
                            ))}
                        </div>
                        
                        <div className="absolute bottom-20 flex flex-col items-center animate-bounce opacity-50">
                            <span className="text-[10px] text-slate-400 tracking-[0.3em] uppercase mb-2">
                                {introStep < guideSentences.length - 1 ? "Tap to continue" : "Begin Meditation"}
                            </span>
                            {introStep === guideSentences.length - 1 && <ChevronRight className="text-white" />}
                        </div>
                   </div>
               )}

               {/* -- FLOW B: TIMER ACTIVE -- */}
               {sessionState === 'timer' && (
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
                        
                        {/* Icon Animation */}
                        <div className="mb-10 relative">
                            <div className={`absolute inset-0 ${activeScenario.accent} blur-[60px] opacity-20 animate-pulse-slow`}></div>
                            <div className="relative">
                                    <activeScenario.icon size={56} className={`${activeScenario.accent} opacity-90 animate-float`} strokeWidth={1} />
                                    {timerActive && (
                                        <div className="absolute inset-0 border border-white/20 rounded-full w-full h-full animate-ping opacity-20"></div>
                                    )}
                            </div>
                        </div>

                        <h2 className="text-3xl font-serif text-white mb-2 tracking-[0.2em] shadow-lg">{activeScenario.title.split('·')[0]}</h2>
                        <p className="text-xs text-indigo-200/60 uppercase tracking-[0.3em] mb-16">{activeScenario.title.split('·')[1]}</p>

                        {/* Timer */}
                        <div className="text-7xl font-light text-white/90 font-sans tracking-widest mb-16 tabular-nums drop-shadow-2xl">
                            {formatTime(timeLeft)}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-6">
                            <button 
                                    onClick={() => setTimerActive(!timerActive)}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105 transition-all duration-500 ${timerActive ? 'bg-indigo-100' : 'bg-white'}`}
                            >
                                {timerActive ? <Pause size={28} fill="currentColor" className="opacity-80" /> : <Play size={28} fill="currentColor" className="ml-1 opacity-80" />}
                            </button>
                        </div>
                        
                        {/* Manual Finish */}
                        <button onClick={() => finishSession(false)} className="mt-12 text-slate-500 text-xs tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-1">
                            提前完成修习
                        </button>
                    </div>
               )}

               {/* -- FLOW C: SUMMARY CARD (NEW & IMPROVED) -- */}
               {sessionState === 'summary' && sessionResult && (
                   <div className="relative z-10 flex-1 flex items-center justify-center p-6 animate-in zoom-in-95 duration-700">
                       <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
                           {/* Decor */}
                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                           <div className={`absolute -right-10 -bottom-10 w-40 h-40 blur-[50px] rounded-full ${sessionResult.completed ? 'bg-indigo-500/10' : 'bg-slate-500/10'}`}></div>

                           <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 animate-in slide-in-from-bottom-4 duration-700">
                               <activeScenario.icon size={32} className={sessionResult.completed ? "text-indigo-300" : "text-slate-400"} />
                           </div>

                           <h2 className="text-2xl font-serif text-white mb-2 tracking-wide">
                               {sessionResult.completed ? "能量整合完成" : "修习中止"}
                           </h2>
                           <p className="text-slate-400 text-xs tracking-widest uppercase mb-8">
                               {sessionResult.completed ? "Session Complete" : "Partial Session"}
                           </p>

                           {/* Stats Grid */}
                           <div className="grid grid-cols-2 gap-4 w-full mb-8">
                               <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center border border-white/5">
                                   <span className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">能量聚集</span>
                                   <div className="flex items-center space-x-1">
                                       <span className={`font-serif text-lg ${sessionResult.energyScore > 80 ? 'text-amber-200' : 'text-white'}`}>{sessionResult.energyScore}</span>
                                       <Zap size={12} className={sessionResult.energyScore > 80 ? 'text-amber-200' : 'text-slate-500'} fill="currentColor" />
                                   </div>
                               </div>
                               <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center border border-white/5">
                                   <span className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">专注时长</span>
                                   <span className="text-white font-serif text-lg">
                                       {Math.floor((activeScenario.duration - timeLeft) / 60)}<span className="text-xs text-slate-500 ml-0.5">m</span>
                                       {(activeScenario.duration - timeLeft) % 60}<span className="text-xs text-slate-500 ml-0.5">s</span>
                                   </span>
                               </div>
                           </div>

                           <div className="text-center mb-8">
                               <p className="text-indigo-200/80 font-serif italic text-sm leading-relaxed">
                                   {sessionResult.completed 
                                     ? "你刚刚为自己创造了一片神圣的真空，\n让宇宙的能量得以重新校准。" 
                                     : "每一次暂停也是一种觉察。\n能量已记录，期待下次圆满。"
                                   }
                               </p>
                           </div>

                           <button 
                                onClick={closeSummary}
                                className={`w-full py-4 rounded-full font-serif font-bold tracking-widest hover:scale-105 transition-all shadow-lg flex items-center justify-center space-x-2 ${
                                    sessionResult.completed 
                                    ? 'bg-white text-slate-900 hover:bg-indigo-50' 
                                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                                }`}
                           >
                               <CheckCircle2 size={18} />
                               <span>收入日历</span>
                           </button>
                       </div>
                   </div>
               )}

               {/* --- EXIT CONFIRMATION OVERLAY (Only for Early Exit Prompt) --- */}
               {showExitConfirm && (
                   <div className="absolute inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300">
                       <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-100 animate-in zoom-in-95 relative overflow-hidden">
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                           
                           <div className="flex justify-center mb-5 text-indigo-400">
                               <Loader2 size={32} className="animate-spin" />
                           </div>
                           <h3 className="text-xl text-white font-serif text-center mb-3 tracking-wide">能量场正在构建</h3>
                           <p className="text-slate-300 text-sm text-center leading-relaxed mb-8 font-serif opacity-80">
                               你正在与{activeScenario.title.split('·')[0]}的原型能量共振。<br/>
                               此刻中断将生成<span className="text-amber-200">不完整</span>的能量记录。
                           </p>
                           <div className="grid grid-cols-2 gap-4">
                               <button 
                                    onClick={confirmExit}
                                    className="py-3 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 hover:text-white transition-colors"
                               >
                                   结算离开
                               </button>
                               <button 
                                    onClick={cancelExit}
                                    className="py-3 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all font-medium tracking-wide"
                               >
                                   继续沉浸
                               </button>
                           </div>
                       </div>
                   </div>
               )}
           </div>
       )}

    </div>
  );
};

export default PracticeView;