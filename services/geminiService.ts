import { GoogleGenAI, Type } from "@google/genai";
import { Report } from "../types";

export const generateMarketReport = async (apiKey: string): Promise<Report> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // 현재 뉴욕 시간 및 한국 시간 계산하여 프롬프트에 주입
  const now = new Date();
  const nyTime = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const krTime = now.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  const prompt = `
    Current System Time (New York): ${nyTime}
    Current System Time (Seoul): ${krTime}

    당신은 월가 수석 금융 분석가입니다.
    **반드시 Google Search 도구를 사용하여** 아래의 데이터를 **실시간(Live)**으로 검색한 후 보고서를 작성하세요.
    
    **데이터 검색 및 추출 지침:**
    1. **Live Data Only**: "Yesterday's close"나 과거 데이터를 사용하지 마세요. 현재 거래 중이라면 **현재가(Current Price)**를, 장 마감 직후라면 **최종 종가(Last Close)**를 사용하세요.
    2. **Language**: 모든 종목명(Company Name)은 반드시 **한글**로 표기하세요. (예: Apple Inc. -> 애플, Microsoft -> 마이크로소프트, Tesla -> 테슬라)
    3. **S&P 500 Only**: '상승/하락 Top 10' 리스트는 반드시 **S&P 500 지수에 포함된 기업**들 중에서만 선정하세요. 소형주나 페니스톡(Penny stocks)은 제외합니다.
    4. **Stock Lists**: 리스트 작성 시 반드시 **현재 주식 가격(Price)**을 포함해야 합니다.

    **필수 검색 쿼리(Search Queries):**
    - "S&P 500 NASDAQ Dow Jones VIX live price"
    - "USD KRW exchange rate live"
    - "S&P 500 top gainers today live price"
    - "S&P 500 top losers today live price"
    - "AI stocks nvda msft amd goog current price live trend"
    
    **보고서 작성 요구사항 (JSON 포맷):**
    1. reportTitle: "미국 증시 브리핑 - [YYYY-MM-DD (현지시간 기준)]"
    2. marketIndices: 5개 지표(S&P500, NASDAQ, Dow, USD/KRW, VIX)의 실시간 수치.
    3. marketOverview: 시장 전반적인 분위기 및 주요 이슈 (마크다운).
    4. gainers: S&P 500 내 실시간 상승률 상위 10개 종목.
       - ticker, name (한글 표기), price(현재가, 예: "$150.23"), change(등락률)
    5. losers: S&P 500 내 실시간 하락률 상위 10개 종목.
       - ticker, name (한글 표기), price(현재가), change(등락률)
    6. aiTrend: AI 관련주 동향.
       - rising: 상승 중인 AI 종목 (티커, 이름(한글), **현재가**, 변동률)
       - falling: 하락 중인 AI 종목 (티커, 이름(한글), **현재가**, 변동률)
       - summary: AI 섹터 요약.
    7. economicContext: 경제 지표 연관성 분석 (마크다운).
    8. conclusion: 결론 및 전망 (마크다운).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportTitle: { type: Type.STRING },
            marketIndices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING },
                  isPositive: { type: Type.BOOLEAN }
                },
                required: ["name", "value", "change", "isPositive"]
              }
            },
            marketOverview: { type: Type.STRING },
            gainers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ticker: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  change: { type: Type.STRING }
                },
                required: ["ticker", "name", "price", "change"]
              }
            },
            losers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ticker: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  change: { type: Type.STRING }
                },
                required: ["ticker", "name", "price", "change"]
              }
            },
            aiTrend: {
              type: Type.OBJECT,
              properties: {
                rising: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      ticker: { type: Type.STRING },
                      name: { type: Type.STRING },
                      price: { type: Type.STRING },
                      change: { type: Type.STRING }
                    },
                    required: ["ticker", "name", "price", "change"]
                  }
                },
                falling: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      ticker: { type: Type.STRING },
                      name: { type: Type.STRING },
                      price: { type: Type.STRING },
                      change: { type: Type.STRING }
                    },
                    required: ["ticker", "name", "price", "change"]
                  }
                },
                summary: { type: Type.STRING }
              },
              required: ["rising", "falling", "summary"]
            },
            economicContext: { type: Type.STRING },
            conclusion: { type: Type.STRING }
          },
          required: ["reportTitle", "marketIndices", "marketOverview", "gainers", "losers", "aiTrend", "economicContext", "conclusion"]
        }
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    return {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ko-KR'),
      reportTitle: data.reportTitle || "시장 분석 보고서",
      marketIndices: data.marketIndices || [],
      marketOverview: data.marketOverview || "데이터를 불러올 수 없습니다.",
      gainers: data.gainers || [],
      losers: data.losers || [],
      aiTrend: data.aiTrend || { rising: [], falling: [], summary: "데이터 없음" },
      economicContext: data.economicContext || "",
      conclusion: data.conclusion || ""
    };

  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};