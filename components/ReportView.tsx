import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Report, StockItem } from '../types';
import { Calendar, Loader2, TrendingUp, TrendingDown, FileText, Globe, Lightbulb, BrainCircuit, Copy, Check, Share2 } from 'lucide-react';
import { StockDetailModal } from './StockDetailModal';

interface ReportViewProps {
  report: Report | null;
  loading: boolean;
  onGenerate: () => void;
}

// Helper component for Copy/Share buttons
const HeaderActions: React.FC<{ content: string; title: string }> = ({ content, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering row click if placed inside
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content,
        });
      } catch (err) {
        if ((err as any).name !== 'AbortError') handleCopy(e);
      }
    } else {
      handleCopy(e);
    }
  };

  return (
    <div className="flex items-center gap-1 ml-auto">
      <button
        onClick={handleCopy}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
        title="텍스트 복사"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      </button>
      <button
        onClick={handleShare}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
        title="공유하기"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
};

// Updated SectionBox with actions
const SectionBox: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; content: string; className?: string }> = ({ title, icon, children, content, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 ${className}`}>
    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
      {icon}
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <HeaderActions title={title} content={content} />
    </div>
    <div className="p-6 prose prose-slate max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-li:text-slate-700">
      {children}
    </div>
  </div>
);

// Updated StockTable with onClick handler
interface StockTableProps {
  title: string;
  items: StockItem[];
  type: 'gainer' | 'loser' | 'neutral';
  icon?: React.ReactNode;
  onItemClick: (item: StockItem) => void;
}

const StockTable: React.FC<StockTableProps> = ({ title, items, type, icon, onItemClick }) => {
  let headerColor = "";
  let iconColor = "";
  let textColor = "";
  let IconComponent = TrendingUp; // default

  if (type === 'gainer') {
    headerColor = "bg-emerald-50";
    iconColor = "text-emerald-600";
    textColor = "text-emerald-900";
    IconComponent = TrendingUp;
  } else if (type === 'loser') {
    headerColor = "bg-rose-50";
    iconColor = "text-rose-600";
    textColor = "text-rose-900";
    IconComponent = TrendingDown;
  } else {
    headerColor = "bg-blue-50";
    iconColor = "text-blue-600";
    textColor = "text-blue-900";
    IconComponent = BrainCircuit;
  }

  // Format table data for clipboard
  const formatTableData = () => {
    if (items.length === 0) return `${title}\n데이터 없음`;
    const header = `${title}\n티커 | 종목명 | 현재가 | 등락률`;
    const rows = items.map(item => `${item.ticker} | ${item.name} | ${item.price} | ${item.change}`).join('\n');
    return `${header}\n${rows}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 h-full flex flex-col">
      <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-2 ${headerColor}`}>
        {icon || <IconComponent className={`h-5 w-5 ${iconColor}`} />}
        <h3 className={`font-semibold ${textColor}`}>{title}</h3>
        <HeaderActions title={title} content={formatTableData()} />
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
            <tr>
              <th className="px-4 py-3 w-[70px] whitespace-nowrap">티커</th>
              <th className="px-4 py-3 w-auto">종목명</th>
              <th className="px-4 py-3 w-[100px] text-right whitespace-nowrap">현재가</th>
              <th className="px-4 py-3 w-[80px] text-right whitespace-nowrap">등락률</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr 
                key={idx} 
                onClick={() => onItemClick(item)}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                title="클릭하여 상세 차트 보기"
              >
                <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">{item.ticker}</td>
                <td className="px-4 py-3 text-slate-600 break-words min-w-[100px]">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-800 whitespace-nowrap">
                  {item.price}
                </td>
                <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                    item.change.startsWith('+') || type === 'gainer' ? 'text-emerald-600' : 
                    item.change.startsWith('-') || type === 'loser' ? 'text-rose-600' : 'text-slate-600'
                  }`}>
                  {item.change}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-slate-400">데이터 없음</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const ReportView: React.FC<ReportViewProps> = ({ report, loading, onGenerate }) => {
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);

  return (
    <div className="min-h-[400px]">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI 심층 시장 분석</h2>
            <p className="text-slate-500 text-sm mt-1">
              Gemini 3 Pro 모델이 실시간 데이터를 기반으로 분석합니다.
            </p>
          </div>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                <span>지금 분석 보고서 생성</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!report && !loading && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-slate-400">
          <Calendar className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-lg font-medium">아직 생성된 보고서가 없습니다.</p>
          <p className="text-sm">위 버튼을 눌러 최신 시장 분석을 시작하세요.</p>
        </div>
      )}

      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-48 bg-slate-200 rounded-xl w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="h-48 bg-slate-200 rounded-xl w-full"></div>
        </div>
      )}

      {report && !loading && (
        <div className="animate-fade-in space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pb-2">
             <h1 className="text-2xl font-bold text-slate-900">{report.reportTitle}</h1>
             <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
               {report.date} 기준
             </div>
          </div>

          {/* 1. Market Overview */}
          <SectionBox 
            title="시장 동향 분석" 
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            content={report.marketOverview}
          >
            <ReactMarkdown>{report.marketOverview}</ReactMarkdown>
          </SectionBox>

          {/* 2. Top Gainers & Losers Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockTable 
              title="주가 상승 Top 10" 
              items={report.gainers} 
              type="gainer" 
              onItemClick={setSelectedStock}
            />
            <StockTable 
              title="주가 하락 Top 10" 
              items={report.losers} 
              type="loser" 
              onItemClick={setSelectedStock}
            />
          </div>

          {/* 3. AI Trend Section (New) */}
          {report.aiTrend && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">AI 섹터 동향 (최근 5일)</h3>
                <HeaderActions title="AI 섹터 동향" content={`AI 섹터 요약: ${report.aiTrend.summary}`} />
              </div>
              <p className="text-sm text-slate-600 mb-6 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                <span className="font-bold text-purple-700 mr-2">Trend Summary:</span>
                {report.aiTrend.summary}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StockTable 
                  title="AI 상승세 (Rising)" 
                  items={report.aiTrend.rising} 
                  type="neutral" 
                  icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                  onItemClick={setSelectedStock}
                />
                <StockTable 
                  title="AI 조정/하락세 (Falling)" 
                  items={report.aiTrend.falling} 
                  type="neutral" 
                  icon={<TrendingDown className="h-5 w-5 text-indigo-600" />}
                  onItemClick={setSelectedStock}
                />
              </div>
            </div>
          )}

          {/* 4. Economic Context */}
          <SectionBox 
            title="글로벌 경제 연관성 분석" 
            icon={<Globe className="h-5 w-5 text-indigo-500" />}
            content={report.economicContext}
          >
            <ReactMarkdown>{report.economicContext}</ReactMarkdown>
          </SectionBox>

          {/* 5. Conclusion */}
          <SectionBox 
            title="핵심 요약 및 전망" 
            icon={<Lightbulb className="h-5 w-5 text-amber-500" />}
            className="border-amber-200 ring-4 ring-amber-50/50"
            content={report.conclusion}
          >
            <ReactMarkdown>{report.conclusion}</ReactMarkdown>
          </SectionBox>
        </div>
      )}

      {/* Detail Modal */}
      <StockDetailModal 
        stock={selectedStock} 
        onClose={() => setSelectedStock(null)} 
      />
    </div>
  );
};