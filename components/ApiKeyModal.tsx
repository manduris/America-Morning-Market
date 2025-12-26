import React, { useState } from 'react';
import { Key, ShieldCheck, ChevronRight, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setError('API Key를 입력해주세요.');
      return;
    }
    onSave(inputKey.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white text-center">
          <div className="bg-blue-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <Key className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">API Key 설정</h3>
          <p className="text-slate-400 text-sm">
            서비스 이용을 위해 Google Gemini API Key가 필요합니다.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Gemini API Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError('');
                }}
                placeholder="AI Studio에서 발급받은 키 입력"
                className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            {error && <p className="text-rose-500 text-xs pl-1">{error}</p>}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 leading-relaxed">
              <strong>안전한 로컬 저장:</strong> 입력하신 API Key는 서버로 전송되지 않으며, 사용자의 브라우저(Local Storage)에만 안전하게 저장됩니다.
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
          >
            시작하기
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors underline decoration-slate-300 hover:decoration-blue-600 underline-offset-2"
            >
              API Key가 없으신가요? 여기서 발급받으세요.
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};