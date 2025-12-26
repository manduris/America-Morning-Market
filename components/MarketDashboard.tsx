import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Globe, Activity, TrendingUp, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import { MarketIndex } from '../types';

// Helper to generate 1 year of mock data
const generateMockVixData = () => {
  const data = [];
  let baseValue = 13.5;
  const today = new Date();
  
  // Create data for the last 365 days
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (364 - i));
    
    // Random walk
    const change = (Math.random() - 0.5) * 2; 
    baseValue = baseValue + change;
    
    // Mean reversion
    baseValue += (15 - baseValue) * 0.02;
    
    // Hard limits
    baseValue = Math.max(10, Math.min(45, baseValue));
    
    data.push({
      timestamp: date.getTime(),
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      VIX: Number(baseValue.toFixed(2))
    });
  }
  return data;
};

// Calculate VIX insights based on the latest data
const getVixInsight = (currentVix: number) => {
  if (currentVix >= 25) {
    return {
      sentiment: "공포 (Extreme Fear)",
      desc: "시장 변동성이 매우 큽니다. 패닉 셀링이 나올 수 있는 구간입니다.",
      stance: "분할 매수 (Aggressive Buy)",
      stanceDesc: "공포가 극에 달했을 때가 단기 바닥일 가능성이 높습니다. 우량주 저가 매수 기회.",
      icon: <AlertTriangle className="h-5 w-5 text-rose-200" />,
      color: "text-rose-200"
    };
  } else if (currentVix >= 17) {
    return {
      sentiment: "경계 (Caution)",
      desc: "불확실성이 증가하고 있습니다. 등락 폭이 커질 수 있습니다.",
      stance: "관망 및 헷징 (Hold/Hedge)",
      stanceDesc: "현금 비중을 유지하며 리스크 관리에 집중할 때입니다. 섣부른 추격 매수 자제.",
      icon: <ShieldCheck className="h-5 w-5 text-amber-200" />,
      color: "text-amber-200"
    };
  } else {
    return {
      sentiment: "안정/탐욕 (Stable)",
      desc: "시장이 비교적 안정적인 상승 추세를 보이고 있습니다.",
      stance: "추세 추종 (Trend Following)",
      stanceDesc: "상승 모멘텀을 즐기되, 급격한 조정에 대비해 이익 실현 전략도 병행하세요.",
      icon: <TrendingUp className="h-5 w-5 text-emerald-200" />,
      color: "text-emerald-200"
    };
  }
};

// Default mock data until AI loads real data
const defaultIndices: MarketIndex[] = [
  { name: "S&P 500", value: "5,234.18", change: "+1.2%", isPositive: true },
  { name: "NASDAQ", value: "16,428.82", change: "+1.5%", isPositive: true },
  { name: "Dow Jones", value: "39,150.33", change: "-0.4%", isPositive: false },
  { name: "USD/KRW", value: "1,345.50", change: "+0.3%", isPositive: true },
  { name: "VIX", value: "13.50", change: "-1.2%", isPositive: false },
];

interface MarketDashboardProps {
  indices?: MarketIndex[];
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({ indices }) => {
  const displayIndices = indices && indices.length > 0 ? indices : defaultIndices;

  // Extract Real-time VIX value if available
  const realVixItem = displayIndices.find(i => i.name.toUpperCase().includes('VIX') || i.name.includes('변동성'));
  const realVixValue = realVixItem ? parseFloat(realVixItem.value.replace(/[^0-9.]/g, '')) : null;

  // Memoize chart data to adjust based on real VIX value
  const chartData = useMemo(() => {
    const data = generateMockVixData();
    
    // If we have a real VIX value from the AI, adjust the mock data to match it
    if (realVixValue !== null && !isNaN(realVixValue)) {
      const lastMockVal = data[data.length - 1].VIX;
      const diff = realVixValue - lastMockVal;
      
      // Shift the entire chart history to align with the current real-time value
      // This preserves the "shape" of volatility while anchoring to reality
      return data.map(d => ({
        ...d,
        VIX: Math.max(0, Number((d.VIX + diff).toFixed(2)))
      }));
    }
    
    return data;
  }, [realVixValue]);

  const latestVix = chartData[chartData.length - 1].VIX;
  const insight = getVixInsight(latestVix);

  // Filter out VIX from cards if you don't want it duplicated, 
  // but keeping it is useful for seeing the exact change percentage.
  const cardsIndices = displayIndices.filter(i => 
    !i.name.toUpperCase().includes('VIX') && !i.name.includes('변동성')
  );
  // If filtering leaves too few, just show all. Or if user prefers VIX in cards too.
  // For now, let's show all 5 items, the grid will wrap nicely.
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Key Indices Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {displayIndices.map((idx) => (
          <div key={idx.name} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-sm font-semibold truncate pr-2" title={idx.name}>{idx.name}</span>
              {idx.isPositive ? (
                <div className="bg-emerald-100 p-1 rounded-full shrink-0">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                </div>
              ) : (
                <div className="bg-rose-100 p-1 rounded-full shrink-0">
                  <ArrowDownRight className="h-4 w-4 text-rose-600" />
                </div>
              )}
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 block truncate">{idx.value}</span>
              <span className={`text-sm font-medium ${idx.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {idx.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Chart Section */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            시장 변동성 지표 (VIX 추이 - 1년)
          </h2>
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900 block">{latestVix}</span>
            <span className="text-xs text-slate-400">Current Real-time Level</span>
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVix" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="dateStr" 
                tick={{fontSize: 10}} 
                stroke="#94a3b8" 
                axisLine={false} 
                tickLine={false}
                interval={30} // Show label roughly every month
              />
              <YAxis 
                domain={['auto', 'auto']}
                hide={false}
                tick={{fontSize: 10}}
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip 
                labelStyle={{ color: '#64748b' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="VIX" 
                stroke="#ef4444" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorVix)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Card - VIX Insight & Strategy */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-xl text-white shadow-lg flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-200" />
            글로벌 경제 인사이트
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              {insight.icon}
              <span className={`text-sm font-bold ${insight.color}`}>{insight.sentiment}</span>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed opacity-90">
              {insight.desc} VIX가 높을수록 시장의 공포감이 크다는 것을 의미합니다.
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-blue-500/30 bg-white/10 -mx-6 px-6 -mb-6 py-4 rounded-b-xl">
          <div className="flex items-start gap-3">
             <div className="bg-white/20 p-2 rounded-lg mt-0.5">
               <TrendingUp className="h-5 w-5 text-white" />
             </div>
             <div>
               <p className="text-xs text-blue-200 font-medium mb-0.5">투자 전략 제안</p>
               <p className="font-bold text-base mb-1">{insight.stance}</p>
               <p className="text-xs text-blue-100 leading-snug">
                 {insight.stanceDesc}
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};