import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarketDashboard } from './components/MarketDashboard';
import { ReportView } from './components/ReportView';
import { SchedulerModal } from './components/SchedulerModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Report, ScheduleConfig } from './types';
import { generateMarketReport } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  
  // Initialize schedule config from localStorage or default
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(() => {
    const saved = localStorage.getItem('marketMorning_schedule');
    return saved ? JSON.parse(saved) : {
      isEnabled: false,
      time: "09:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    };
  });

  // Check for stored API key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // Save schedule changes
  const handleSaveSchedule = (config: ScheduleConfig) => {
    setScheduleConfig(config);
    localStorage.setItem('marketMorning_schedule', JSON.stringify(config));
    
    // Simulate setting a notification
    if (config.isEnabled) {
      if ('Notification' in window) {
         Notification.requestPermission().then(permission => {
           if (permission === 'granted') {
             // Just a confirmation for the demo
             new Notification("스케줄링 완료", {
               body: `매일 ${config.time}에 미국 증시 보고서를 받아보게 됩니다.`
             });
           }
         });
      } else {
        alert(`${config.time}에 알림이 설정되었습니다.`);
      }
    }
  };

  const handleGenerateReport = async () => {
    if (!apiKey) return;
    
    setLoading(true);
    try {
      const data = await generateMarketReport(apiKey);
      setReport(data);
    } catch (error) {
      console.error(error);
      alert("보고서 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // Mock checking if it's 9 AM (for demo purposes, check on mount)
  useEffect(() => {
    if (scheduleConfig.isEnabled) {
      const now = new Date();
      const [hours, minutes] = scheduleConfig.time.split(':').map(Number);
      
      // If it's roughly the scheduled time, trigger a toast or auto-fetch
      if (now.getHours() === hours && Math.abs(now.getMinutes() - minutes) < 5) {
        // Logic to auto-fetch could go here
        console.log("Scheduled time reached");
      }
    }
  }, [scheduleConfig]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header 
        onOpenScheduler={() => setIsSchedulerOpen(true)} 
        isScheduled={scheduleConfig.isEnabled}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
           <h2 className="text-3xl font-bold text-slate-900">Today's Dashboard</h2>
           <p className="text-slate-500 mt-2">미국 시장 및 글로벌 경제 실시간 요약</p>
        </div>

        <MarketDashboard indices={report?.marketIndices} />
        
        <div id="report-section" className="mt-8">
          <ReportView 
            report={report} 
            loading={loading} 
            onGenerate={handleGenerateReport} 
          />
        </div>
      </main>

      <SchedulerModal 
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onSave={handleSaveSchedule}
        currentConfig={scheduleConfig}
      />
      
      <ApiKeyModal 
        isOpen={!apiKey} 
        onSave={handleSaveApiKey} 
      />
    </div>
  );
};

export default App;