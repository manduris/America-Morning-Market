import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StockItem } from '../types';

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
}

// Helper to parse price string to number (e.g., "$150.23" -> 150.23)
const parsePrice = (priceStr: string): number => {
  return parseFloat(priceStr.replace(/[^0-9.-]/g, '')) || 0;
};

// Helper to parse change string to percentage (e.g., "+2.5%" -> 0.025)
const parseChange = (changeStr: string): number => {
  const isNegative = changeStr.includes('-');
  const val = parseFloat(changeStr.replace(/[^0-9.]/g, ''));
  return (isNegative ? -val : val) / 100;
};

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  if (!stock) return null;

  const currentPrice = parsePrice(stock.price);
  const changeRate = parseChange(stock.change);
  const isPositive = !stock.change.includes('-');

  // Generate 30 days of mock historical data based on current price and trend
  const chartData = useMemo(() => {
    const data = [];
    const days = 30;
    const volatility = 0.02; // 2% daily volatility
    
    // Estimate price 30 days ago based on the current change rate
    // (Simplification: assuming the 'change' is reflective of recent trend)
    let price = currentPrice / (1 + changeRate); 
    
    // If change is very small, add some variance so line isn't flat
    if (Math.abs(changeRate) < 0.001) price = currentPrice * 0.95;

    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - i));
      
      // Random walk towards current price
      const progress = i / (days - 1); // 0 to 1
      const targetTrend = currentPrice * progress + price * (1 - progress);
      const randomFluctuation = targetTrend * (Math.random() - 0.5) * volatility;
      
      let dailyPrice = targetTrend + randomFluctuation;
      
      // Force the last point to match current price exactly
      if (i === days - 1) dailyPrice = currentPrice;

      data.push({
        date: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        price: Number(dailyPrice.toFixed(2))
      });
    }
    return data;
  }, [stock]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`px-6 py-5 border-b border-slate-100 flex items-start justify-between ${isPositive ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                {stock.ticker}
              </span>
              <span className="text-sm text-slate-500 font-medium">US Market</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{stock.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Price Info */}
          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-bold text-slate-900">{stock.price}</span>
            <div className={`flex items-center gap-1 text-lg font-semibold mb-1.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              <span>{stock.change}</span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                최근 1개월 추이 (30 Days)
              </h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10}} 
                    stroke="#94a3b8" 
                    axisLine={false} 
                    tickLine={false}
                    interval={6}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{fontSize: 11}}
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value}`, 'Price']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? "#10b981" : "#f43f5e"} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 leading-relaxed">
            * 본 차트는 현재가와 변동률을 기반으로 추정한 시뮬레이션 데이터입니다. 실제 과거 거래 데이터와 차이가 있을 수 있으며, 투자 참고용으로만 활용하시기 바랍니다.
          </div>
        </div>
      </div>
    </div>
  );
};