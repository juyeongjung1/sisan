import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface FundConstituentItem {
  rank: number;
  symbol: string;
  name: string;
  nameKo: string;
  weightPct: number;
  sector: string;
  sectorKo: string;
  description: string;
  descriptionKo: string;
}

export interface FundConstituentsDetail {
  fundKey: string;
  fundCode?: string;
  fundName: string;
  fundNameKo: string;
  managementCompany: string;
  managementCompanyKo: string;
  benchmarkIndex: string;
  benchmarkIndexKo: string;
  rebalanceRules: string;
  rebalanceRulesKo: string;
  totalHoldingsCount: number;
  top10WeightPct: number;
  asOfDate: string;
  sectorBreakdown: {
    sector: string;
    sectorKo: string;
    weightPct: number;
    color: string;
  }[];
  constituents: FundConstituentItem[];
  officialUrl: string;
}

// 各ファンドの最新公式公表構成銘柄・ルールデータマスター
const FUND_CONSTITUENTS_DATABASE: Record<string, FundConstituentsDetail> = {
  ztech20: {
    fundKey: 'ztech20',
    fundCode: '0431124C',
    fundName: 'iFreePlus 世界トレンド・テクノロジー株 (Zテック20)',
    fundNameKo: 'iFreePlus 글로벌 트렌드 Z테크20',
    managementCompany: '大和アセットマネジメント',
    managementCompanyKo: '다이와 에셋 매니지먼트',
    benchmarkIndex: 'なし（日本を除く世界のテクノロジー関連・時価総額上位20銘柄に投資）',
    benchmarkIndexKo: '벤치마크 없음 (일본 제외 글로벌 테크 시가총액 상위 20개 종목 집중 투자)',
    rebalanceRules:
      '日本を除く世界の株式の中から、世界のメガトレンドを牽引するテクノロジー関連企業を抽出し、時価総額上位20銘柄に時価総額加重平均（特定銘柄の集中上限あり）で投資するアクティブファンド。原則として年2回（3月末・9月末）に定期的な銘柄入替を実施（上位銘柄となることが予想される企業の新登場時等は臨時入替あり）。',
    rebalanceRulesKo:
      '일본을 제외한 전 세계 주식 중 글로벌 메가트렌드를 주도하는 테크 기업을 추출하여, 시가총액 상위 20개 종목에 유동 시가총액 가중 방식으로 투자. 원칙적으로 연 2회(3월말·9월말) 정기 종목 교체를 실시합니다.',
    totalHoldingsCount: 20,
    top10WeightPct: 76.5,
    asOfDate: '2026年最新 公式開示値',
    sectorBreakdown: [
      { sector: '半導体・AIアクセラレータ', sectorKo: '반도체·AI 가속기', weightPct: 37.8, color: '#6366F1' },
      { sector: 'クラウド・エンタープライズSW', sectorKo: '클라우드·엔터프라이즈 SW', weightPct: 24.5, color: '#3B82F6' },
      { sector: 'コンシューマー・OS・デバイス', sectorKo: '소비자·OS·디바이스', weightPct: 15.1, color: '#EC4899' },
      { sector: 'インタラクティブメディア・検索', sectorKo: '인터랙티브 미디어·검색', weightPct: 15.6, color: '#F59E0B' },
      { sector: 'EV・自動運転・ネットワーク', sectorKo: 'EV·자율주행·네트워크', weightPct: 7.0, color: '#10B981' },
    ],
    constituents: [
      {
        rank: 1,
        symbol: 'NVDA',
        name: 'NVIDIA (エヌビディア)',
        nameKo: '엔비디아 (NVIDIA)',
        weightPct: 10.8,
        sector: 'AI半導体・GPU',
        sectorKo: 'AI 반도체·GPU',
        description: '生成AIインフラ・GPU市場を独占するグローバルAIの心臓',
        descriptionKo: '생성형 AI 인프라 및 GPU 시장을 독점하는 글로벌 AI의 핵심',
      },
      {
        rank: 2,
        symbol: 'MSFT',
        name: 'Microsoft (マイクロソフト)',
        nameKo: '마이크로소프트 (Microsoft)',
        weightPct: 10.2,
        sector: 'クラウド・企業AI',
        sectorKo: '클라우드·기업용 AI',
        description: 'AzureクラウドとOpenAI連携によるエンタープライズAIリーダー',
        descriptionKo: 'Azure 클라우드 및 OpenAI 파트너십 기반 기업용 AI 선두주자',
      },
      {
        rank: 3,
        symbol: 'AAPL',
        name: 'Apple (アップル)',
        nameKo: '애플 (Apple)',
        weightPct: 9.7,
        sector: 'コンシューマー機器・OS',
        sectorKo: '소비자 디바이스·OS',
        description: '20億台超のアクティブ端末エコシステムとApple Intelligence',
        descriptionKo: '20억 대 이상의 활성 기기 생태계와 Apple Intelligence',
      },
      {
        rank: 4,
        symbol: 'AMZN',
        name: 'Amazon.com (アマゾン)',
        nameKo: '아마존닷컴 (Amazon)',
        weightPct: 8.9,
        sector: 'クラウド(AWS)・Eコマース',
        sectorKo: '클라우드(AWS)·E커머스',
        description: '世界最大のクラウドAWSとリテール・物流AIネットワーク',
        descriptionKo: '글로벌 1위 클라우드 AWS 및 리테일·물류 AI 네트워크',
      },
      {
        rank: 5,
        symbol: 'GOOGL',
        name: 'Alphabet (アルファベット / Google)',
        nameKo: '알파벳 (구글)',
        weightPct: 8.1,
        sector: '検索・広告・Gemini AI',
        sectorKo: '검색·광고·Gemini AI',
        description: 'Gemini基盤モデル、YouTube、Google Cloudの強固な収益基盤',
        descriptionKo: 'Gemini 기반 모델, YouTube, Google Cloud의 강력한 수익 구조',
      },
      {
        rank: 6,
        symbol: 'META',
        name: 'Meta Platforms (メタ)',
        nameKo: '메타 플랫폼스 (Meta)',
        weightPct: 7.5,
        sector: 'SNS・AIオープンモデル',
        sectorKo: 'SNS·AI 오픈 모델',
        description: 'Instagram/WhatsAppの世界規模ユーザー網とLlamaオープンモデル',
        descriptionKo: '인스타그램/왓츠앱 기반 글로벌 광고 플랫폼 및 Llama 생태계',
      },
      {
        rank: 7,
        symbol: 'AVGO',
        name: 'Broadcom (ブロードコム)',
        nameKo: '브로드컴 (Broadcom)',
        weightPct: 6.8,
        sector: 'カスタムAI半導体(ASIC)',
        sectorKo: '커스텀 AI 반도체(ASIC)',
        description: '大手テック向けカスタムAIチップ（XPU）設計とVMware仮想化基盤',
        descriptionKo: '빅테크 맞춤형 AI 반도체(ASIC) 설계 및 VMware 클라우드',
      },
      {
        rank: 8,
        symbol: 'TSLA',
        name: 'Tesla (テスラ)',
        nameKo: '테슬라 (Tesla)',
        weightPct: 5.4,
        sector: 'EV・自動運転AI・ロボティクス',
        sectorKo: 'EV·자율주행 AI·로보틱스',
        description: '完全自動運転(FSD)ニューラルネットワークと人型ロボットOptimus',
        descriptionKo: '완전 자율주행(FSD) 및 옵티머스 휴머노이드 로봇 기술 선도',
      },
      {
        rank: 9,
        symbol: 'TSM',
        name: 'TSMC ADR (台湾セミコンダクター)',
        nameKo: 'TSMC ADR (대만 반도체)',
        weightPct: 4.9,
        sector: '最先端半導体ファウンドリ',
        sectorKo: '최첨단 반도체 파운드리',
        description: '3nm/2nmの最先端微細プロセスで世界シェアの9割を握る製造覇者',
        descriptionKo: '글로벌 3nm/2nm 초미세 공정 독점 위탁생산 파운드리 1위',
      },
      {
        rank: 10,
        symbol: 'PLTR',
        name: 'Palantir Technologies (パランティア)',
        nameKo: '팔란티어 (Palantir)',
        weightPct: 4.2,
        sector: '防衛・企業向けAIプラットフォーム(AIP)',
        sectorKo: '국방·기업용 AI 플랫폼(AIP)',
        description: '米政府・軍および大企業の基幹意思決定AI基盤AIPの爆発的普及',
        descriptionKo: '미국 국방부 및 글로벌 엔터프라이즈 필수 AI 플랫폼 AIP 공급',
      },
      {
        rank: 11,
        symbol: 'AMD',
        name: 'Advanced Micro Devices (AMD)',
        nameKo: 'AMD',
        weightPct: 3.8,
        sector: 'CPU・AIアクセラレータ(MI300)',
        sectorKo: 'CPU·AI 가속기(MI300)',
        description: 'Ryzen CPUおよびデータセンター向けInstinct MI300X AIチップ',
        descriptionKo: '데이터센터용 Instinct MI300X GPU 및 고성능 CPU 제조',
      },
      {
        rank: 12,
        symbol: 'NFLX',
        name: 'Netflix (ネットフリックス)',
        nameKo: '넷플릭스 (Netflix)',
        weightPct: 3.5,
        sector: 'ストリーミングメディア',
        sectorKo: '스트리밍 미디어',
        description: '世界最大の動画ストリーミングと広告つきプランの急成長',
        descriptionKo: '글로벌 1위 동영상 스트리밍 및 광고형 요금제 고성장',
      },
      {
        rank: 13,
        symbol: 'QCOM',
        name: 'Qualcomm (クアルコム)',
        nameKo: '퀄컴 (Qualcomm)',
        weightPct: 3.2,
        sector: 'オンデバイスAI・モバイル通信',
        sectorKo: '온디바이스 AI·모바일 통신',
        description: 'Snapdragon X Eliteによる次世代Copilot+ PCおよびスマホAIチップ',
        descriptionKo: 'Snapdragon 프로세서 기반 AI PC 및 모바일 칩셋 선도',
      },
      {
        rank: 14,
        symbol: 'NOW',
        name: 'ServiceNow (サービスナウ)',
        nameKo: '서비스나우 (ServiceNow)',
        weightPct: 2.8,
        sector: '企業ワークフロー自動化クラウド',
        sectorKo: '기업 워크플로우 자동화 클라우드',
        description: '企業の業務自動化と生成AIエージェント統合クラウド',
        descriptionKo: '기업 업무 프로세스 자동화 및 생성형 AI 에이전트 통합 솔루션',
      },
      {
        rank: 15,
        symbol: 'CRM',
        name: 'Salesforce (セールスフォース)',
        nameKo: '세일즈포스 (Salesforce)',
        weightPct: 2.6,
        sector: 'CRM・自律型AIエージェント',
        sectorKo: 'CRM·자율형 AI 에이전트',
        description: 'Agentforceによる企業の顧客対応・営業自律型AIエージェント',
        descriptionKo: 'Agentforce를 통한 기업 고객 지원 및 영업 자율형 AI 에이전트',
      },
      {
        rank: 16,
        symbol: 'ADBE',
        name: 'Adobe (アドビ)',
        nameKo: '어도비 (Adobe)',
        weightPct: 2.4,
        sector: 'クリエイティブ・商用生成AI(Firefly)',
        sectorKo: '크리에이티브·상업용 생성AI(Firefly)',
        description: 'Photoshop等のデザイン標準と商用安全なFirefly生成AI',
        descriptionKo: '포토샵 등 디자인 표준 툴과 상업적 안전성을 갖춘 Firefly AI',
      },
      {
        rank: 17,
        symbol: 'MU',
        name: 'Micron Technology (マイクロン)',
        nameKo: '마이크론 (Micron)',
        weightPct: 2.3,
        sector: '高帯域幅メモリ(HBM)・DRAM',
        sectorKo: '고대역폭 메모리(HBM)·DRAM',
        description: 'AIサーバに不可欠な次世代HBM3Eメモリの主要サプライヤー',
        descriptionKo: 'AI 서버에 필수적인 차세대 HBM3E 메모리 핵심 공급사',
      },
      {
        rank: 18,
        symbol: 'INTU',
        name: 'Intuit (インテュイット)',
        nameKo: '인튜이트 (Intuit)',
        weightPct: 2.0,
        sector: '財務・税務・フィンテックAI',
        sectorKo: '재무·세무·핀테크 AI',
        description: 'TurboTax、QuickBooksによる中小企業・個人の財務AI',
        descriptionKo: 'TurboTax, QuickBooks 기반 중소기업 및 개인 재무 AI 솔루션',
      },
      {
        rank: 19,
        symbol: 'AMAT',
        name: 'Applied Materials (アプライドマテリアルズ)',
        nameKo: '어플라이드 머티어리얼즈',
        weightPct: 1.9,
        sector: '半導体製造装置',
        sectorKo: '반도체 제조 장비',
        description: '最先端半導体プロセスの成膜・材料工学における世界トップ',
        descriptionKo: '최첨단 반도체 증착 및 재료공학 분야 글로벌 1위 장비업체',
      },
      {
        rank: 20,
        symbol: 'CSCO',
        name: 'Cisco Systems (シスコシステムズ)',
        nameKo: '시스코 시스템즈 (Cisco)',
        weightPct: 1.8,
        sector: 'エンタープライズネットワーク・Splunk',
        sectorKo: '엔터프라이즈 네트워크·Splunk',
        description: 'AIデータセンター向け高速スイッチとSplunkのセキュリティ解析',
        descriptionKo: 'AI 데이터센터 고속 스위치 및 Splunk 인수 기반 보안 분석',
      },
    ],
    officialUrl: 'https://www.daiwa-am.co.jp/funds/detail/4655/detail_top.html',
  },

  fang_plus: {
    fundKey: 'fang_plus',
    fundCode: '04311181',
    fundName: 'iFreeNext FANG+インデックス',
    fundNameKo: 'iFreeNext FANG+ 인덱스',
    managementCompany: '大和アセットマネジメント',
    managementCompanyKo: '다이와 에셋 매니지먼트',
    benchmarkIndex: 'NYSE FANG+ Index (円換算ベース)',
    benchmarkIndexKo: 'NYSE FANG+ 지수 (원화/엔화 환산)',
    rebalanceRules:
      '固定のコア6銘柄（Meta, Apple, Amazon, Netflix, Alphabet, Microsoft）と、四半期ごとに選定される厳選4銘柄（2026年現在はNVIDIA, Broadcom, Palantir, Micron）の計10銘柄で構成。四半期ごと（3月・6月・9月・12月）に各10%ずつの等金額配分（イコールウェイト）に完全リバランス。',
    rebalanceRulesKo:
      '고정 핵심 6종목(메타, 애플, 아마존, 넷플릭스, 구글, 마이크로소프트)과 분기별로 엄선되는 4종목(현재 엔비디아, 브로드컴, 팔란티어, 마이크론) 총 10종목으로 구성. 분기별(3, 6, 9, 12월)로 10%씩 완전 균등 분할(Equal-Weight) 리밸런싱을 실행합니다.',
    totalHoldingsCount: 10,
    top10WeightPct: 100.0,
    asOfDate: '2026年最新 四半期リバランス値',
    sectorBreakdown: [
      { sector: 'AIクラウド・ソフトウェア', sectorKo: 'AI 클라우드·소프트웨어', weightPct: 40.0, color: '#3B82F6' },
      { sector: '次世代半導体・ハードウェア', sectorKo: '차세대 반도체·하드웨어', weightPct: 30.0, color: '#6366F1' },
      { sector: 'インタラクティブメディア・ストリーミング', sectorKo: '인터랙티브 미디어·스트리밍', weightPct: 30.0, color: '#EC4899' },
    ],
    constituents: [
      {
        rank: 1,
        symbol: 'META',
        name: 'Meta Platforms (メタ)',
        nameKo: '메타 플랫폼스 (Meta)',
        weightPct: 10.5,
        sector: 'SNS・オープンソースAI(Llama)',
        sectorKo: 'SNS·오픈소스 AI(Llama)',
        description: 'Instagram/WhatsAppの世界最強広告エンジンとLlamaオープンモデル',
        descriptionKo: '인스타그램/왓츠앱 기반 글로벌 광고 플랫폼 및 Llama 생태계',
      },
      {
        rank: 2,
        symbol: 'NVDA',
        name: 'NVIDIA (エヌビディア)',
        nameKo: '엔비디아 (NVIDIA)',
        weightPct: 10.4,
        sector: 'AI半導体・アクセラレータ',
        sectorKo: 'AI 반도체·가속기',
        description: '世界の生成AI学習・推論インフラの9割以上を担う半導体覇者',
        descriptionKo: '글로벌 생성형 AI 학습 및 추론 인프라를 지배하는 반도체 패권',
      },
      {
        rank: 3,
        symbol: 'AVGO',
        name: 'Broadcom (ブロードコム)',
        nameKo: '브로드컴 (Broadcom)',
        weightPct: 10.2,
        sector: 'カスタムAI半導体・インフラ',
        sectorKo: '커스텀 AI 반도체·인프라',
        description: 'Google・Meta等のカスタムAIチップ設計と仮想化VMware',
        descriptionKo: '구글, 메타 맞춤형 커스텀 AI 칩(ASIC) 설계 및 클라우드 가상화',
      },
      {
        rank: 4,
        symbol: 'PLTR',
        name: 'Palantir Technologies (パランティア)',
        nameKo: '팔란티어 (Palantir)',
        weightPct: 10.1,
        sector: '企業・防衛向け基幹AI(AIP)',
        sectorKo: '기업·국방용 필수 AI 플랫폼(AIP)',
        description: '米政府・軍および大手企業の意思決定AI基盤AIPのリーダー',
        descriptionKo: '미국 국방부 및 글로벌 기업 핵심 AI 플랫폼 AIP 독점 공급',
      },
      {
        rank: 5,
        symbol: 'MSFT',
        name: 'Microsoft (マイクロソフト)',
        nameKo: '마이크로소프트 (Microsoft)',
        weightPct: 10.0,
        sector: 'クラウド・企業AI',
        sectorKo: '클라우드·기업용 AI',
        description: 'CopilotとAzure OpenAIによる世界最大のビジネスAI基盤',
        descriptionKo: 'Copilot 및 Azure OpenAI 기반 글로벌 1위 비즈니스 AI 플랫폼',
      },
      {
        rank: 6,
        symbol: 'AMZN',
        name: 'Amazon.com (アマゾン)',
        nameKo: '아마존닷컴 (Amazon)',
        weightPct: 9.9,
        sector: 'クラウド(AWS)・Eコマース',
        sectorKo: '클라우드(AWS)·E커머스',
        description: 'AWSによるクラウド収益と生成AI基盤Bedrockの急拡大',
        descriptionKo: 'AWS 클라우드 고수익 및 Bedrock 생성형 AI 서비스 확장',
      },
      {
        rank: 7,
        symbol: 'AAPL',
        name: 'Apple (アップル)',
        nameKo: '애플 (Apple)',
        weightPct: 9.8,
        sector: 'コンシューマーハード・OS',
        sectorKo: '소비자 디바이스·OS',
        description: '高収益サービス部門とApple Intelligenceによる端末買替サイクル',
        descriptionKo: '고수익 서비스 부문과 Apple Intelligence 기반 디바이스 교체 수요',
      },
      {
        rank: 8,
        symbol: 'GOOGL',
        name: 'Alphabet (アルファベット / Google)',
        nameKo: '알파벳 (구글)',
        weightPct: 9.7,
        sector: '検索・広告・Gemini',
        sectorKo: '검색·광고·Gemini',
        description: '検索・YouTubeの強固なキャッシュフローと独自AI半導体TPU',
        descriptionKo: '검색 및 유튜브의 독점적 현금흐름과 자체 AI 가속기 TPU 경쟁력',
      },
      {
        rank: 9,
        symbol: 'NFLX',
        name: 'Netflix (ネットフリックス)',
        nameKo: '넷플릭스 (Netflix)',
        weightPct: 9.7,
        sector: 'ストリーミングメディア',
        sectorKo: '스트리밍 미디어',
        description: '圧倒的なオリジナルコンテンツ制作力と広告プランの成長',
        descriptionKo: '압도적인 오리지널 콘텐츠 제작력과 광고형 요금제 고성장',
      },
      {
        rank: 10,
        symbol: 'MU',
        name: 'Micron Technology (マイクロン)',
        nameKo: '마이크론 (Micron)',
        weightPct: 9.7,
        sector: '次世代メモリ(HBM3E)・DRAM',
        sectorKo: '차세대 고대역폭 메모리(HBM3E)·DRAM',
        description: 'NVIDIA次世代GPU向け高帯域幅メモリHBM3Eの公式採用パートナー',
        descriptionKo: '엔비디아 차세대 AI GPU 필수 탑재 HBM3E 메모리 독점 공급사',
      },
    ],
    officialUrl: 'https://www.daiwa-am.co.jp/funds/detail/3371/detail_top.html',
  },

  levnas: {
    fundKey: 'levnas',
    fundCode: '9I31121B',
    fundName: '楽天・レバレッジ・NASDAQ-100 (レバナス)',
    fundNameKo: '라쿠텐 레버리지 NASDAQ-100 (레바나스)',
    managementCompany: '楽天投信投資顧問',
    managementCompanyKo: '라쿠텐 투신투자고문',
    benchmarkIndex: 'NASDAQ-100 指数の日次値動きの2倍',
    benchmarkIndexKo: 'NASDAQ-100 지수 일일 변동폭의 2배 레버리지',
    rebalanceRules:
      'NASDAQ市場に上場する金融を除く時価総額上位100銘柄に連動する先物を活用し、日々の変動率の2倍を目指すアクティブ・レバレッジ運用。',
    rebalanceRulesKo:
      '나스닥 시장에 상장된 금융주를 제외한 시가총액 상위 100개 종목에 연동하는 선물 포지션을 활용하여 일일 변동성의 2배 수익을 추구합니다.',
    totalHoldingsCount: 101,
    top10WeightPct: 52.4,
    asOfDate: '2026年最新 月報公表値',
    sectorBreakdown: [
      { sector: 'テクノロジー・半導体', sectorKo: '기술·반도체', weightPct: 58.6, color: '#3B82F6' },
      { sector: '一般消費財・リテール', sectorKo: '일반 소비재·리테일', weightPct: 18.2, color: '#F59E0B' },
      { sector: 'ヘルスケア・バイオ', sectorKo: '헬스케어·바이오', weightPct: 6.8, color: '#10B981' },
      { sector: '通信サービス・メディア', sectorKo: '통신·미디어', weightPct: 14.4, color: '#EC4899' },
      { sector: '資本財・その他', sectorKo: '자본재·기타', weightPct: 2.0, color: '#64748B' },
    ],
    constituents: [
      { rank: 1, symbol: 'MSFT', name: 'Microsoft', nameKo: '마이크로소프트', weightPct: 8.8, sector: 'ソフトウェア', sectorKo: '소프트웨어', description: 'Windows, Office, Azure', descriptionKo: 'Windows, Office, Azure 클라우드' },
      { rank: 2, symbol: 'AAPL', name: 'Apple', nameKo: '애플', weightPct: 8.5, sector: 'ハードウェア', sectorKo: '하드웨어', description: 'iPhone, Mac, Services', descriptionKo: 'iPhone, Mac, 구독 서비스' },
      { rank: 3, symbol: 'NVDA', name: 'NVIDIA', nameKo: '엔비디아', weightPct: 7.9, sector: '半導体', sectorKo: '반도체', description: 'GPU, AIデータセンター', descriptionKo: 'GPU 및 AI 데이터센터 가속기' },
      { rank: 4, symbol: 'AMZN', name: 'Amazon', nameKo: '아마존', weightPct: 5.4, sector: 'Eコマース', sectorKo: 'E커머스', description: 'AWS, リテール', descriptionKo: 'AWS 클라우드, 글로벌 리테일' },
      { rank: 5, symbol: 'AVGO', name: 'Broadcom', nameKo: '브ロードコム', weightPct: 4.8, sector: '半導体', sectorKo: '반도체', description: 'カスタムAI半導体', descriptionKo: '커스텀 AI ASIC, 통신 칩' },
      { rank: 6, symbol: 'META', name: 'Meta', nameKo: '메타', weightPct: 4.6, sector: 'メディア', sectorKo: '미디어', description: 'Facebook, Instagram', descriptionKo: '페이스북, 인스타그램 SNS' },
      { rank: 7, symbol: 'GOOGL', name: 'Alphabet A', nameKo: '알파벳 A', weightPct: 3.2, sector: '検索', sectorKo: '검색', description: 'Google Search, YouTube', descriptionKo: '구글 검색, 유튜브' },
      { rank: 8, symbol: 'TSLA', name: 'Tesla', nameKo: '테슬라', weightPct: 3.1, sector: '自動車', sectorKo: '자동차', description: 'EV, 自動運転', descriptionKo: 'EV, 자율주행 AI' },
      { rank: 9, symbol: 'COST', name: 'Costco', nameKo: '코스트코', weightPct: 2.5, sector: 'リテール', sectorKo: '리테일', description: '会員制倉庫型スーパー', descriptionKo: '글로벌 회원제 창고형 리테일' },
      { rank: 10, symbol: 'AMD', name: 'AMD', nameKo: 'AMD', weightPct: 2.1, sector: '半導体', sectorKo: '반도체', description: 'CPU, MI300 GPU', descriptionKo: '라이젠 CPU, 라데온 GPU' },
    ],
    officialUrl: 'https://www.rakuten-toushin.co.jp/fund/nav/rivnas/',
  },

  tokyomarine_foreign: {
    fundKey: 'tokyomarine_foreign',
    fundCode: '49313104',
    fundName: '東京海上セレクション・外国株式インデックス (401k)',
    fundNameKo: '도쿄해상 셀렉션 외국주식 인덱스 (401k 퇴직연금)',
    managementCompany: '東京海上アセットマネジメント',
    managementCompanyKo: '도쿄해상 에셋 매니지먼트',
    benchmarkIndex: 'MSCI Kokusai (MSCI コクサイ・インデックス 円換算)',
    benchmarkIndexKo: 'MSCI Kokusai 지수 (일본 제외 선진국 22개국)',
    rebalanceRules:
      '日本を除く主要先進国22カ国の大型・中型株約1,200銘柄に時価総額加重で分散投資。米国（約72%）を中心に、英国、フランス、カナダ、スイス、ドイツ、豪州等へ幅広く国際分散。',
    rebalanceRulesKo:
      '일본을 제외한 전 세계 선진국 22개국의 대형·중형주 약 1,200개 종목에 분산 투자. 미국(약 72%)을 필두로 영국, 프랑스, 캐나다, 스위스, 독일 등에 광범위하게 분산합니다.',
    totalHoldingsCount: 1248,
    top10WeightPct: 24.8,
    asOfDate: '2026年最新 月報公表値',
    sectorBreakdown: [
      { sector: '情報技術 (IT)', sectorKo: '정보 기술(IT)', weightPct: 26.5, color: '#3B82F6' },
      { sector: '金融 (Financials)', sectorKo: '금융', weightPct: 15.2, color: '#10B981' },
      { sector: 'ヘルスケア (Healthcare)', sectorKo: '헬스케어', weightPct: 11.8, color: '#EC4899' },
      { sector: '一般消費財 (Consumer Discretionary)', sectorKo: '일반 소비재', weightPct: 10.5, color: '#F59E0B' },
      { sector: '通信サービス (Communication)', sectorKo: '통신 서비스', weightPct: 8.9, color: '#6366F1' },
      { sector: '資本財・その他', sectorKo: '자본재·기타', weightPct: 27.1, color: '#64748B' },
    ],
    constituents: [
      { rank: 1, symbol: 'MSFT', name: 'Microsoft (米国)', nameKo: '마이크로소프트 (미국)', weightPct: 4.8, sector: 'IT', sectorKo: 'IT', description: 'クラウド・AI', descriptionKo: '클라우드·기업용 AI' },
      { rank: 2, symbol: 'AAPL', name: 'Apple (米国)', nameKo: '애플 (미국)', weightPct: 4.5, sector: 'IT', sectorKo: 'IT', description: 'コンシューマー機器', descriptionKo: '모바일 디바이스·OS' },
      { rank: 3, symbol: 'NVDA', name: 'NVIDIA (米国)', nameKo: '엔비디아 (미국)', weightPct: 4.1, sector: 'IT', sectorKo: 'IT', description: 'AI半導体', descriptionKo: 'AI 가속기 반도체' },
      { rank: 4, symbol: 'AMZN', name: 'Amazon (米国)', nameKo: '아마존 (미国)', weightPct: 2.6, sector: '消費財', sectorKo: '소비재', description: 'クラウド・リテール', descriptionKo: 'AWS·이커머스' },
      { rank: 5, symbol: 'META', name: 'Meta Platforms (米国)', nameKo: '메타 (미국)', weightPct: 1.8, sector: '通信', sectorKo: '통신', description: 'SNS・AI', descriptionKo: '글로벌 SNS·AI' },
      { rank: 6, symbol: 'GOOGL', name: 'Alphabet A (米国)', nameKo: '알파벳 A (미국)', weightPct: 1.5, sector: '通信', sectorKo: '통신', description: '検索・広告', descriptionKo: '구글 검색·유튜브' },
      { rank: 7, symbol: 'AVGO', name: 'Broadcom (米国)', nameKo: 'ブロードコム (米国)', weightPct: 1.3, sector: 'IT', sectorKo: 'IT', description: '半導体', descriptionKo: '커스텀 AI 반도체' },
      { rank: 8, symbol: 'LLY', name: 'Eli Lilly (米国)', nameKo: '일라이 릴리 (미국)', weightPct: 1.1, sector: 'ヘルスケア', sectorKo: '헬스케어', description: '肥満症薬・糖尿病薬', descriptionKo: '비만치료제·당뇨병 신약' },
      { rank: 9, symbol: 'JPM', name: 'JPMorgan Chase (米国)', nameKo: 'JP모건 체이스 (미국)', weightPct: 1.0, sector: '金融', sectorKo: '금융', description: '世界最大の商業銀行', descriptionKo: '글로벌 1위 상업투자은행' },
      { rank: 10, symbol: 'BRK.B', name: 'Berkshire Hathaway (米国)', nameKo: '버크셔 해서웨이 (미국)', weightPct: 0.9, sector: '金融', sectorKo: '금융', description: 'バフェット率いる投資持株会社', descriptionKo: '워런 버핏의 복합 금융지주' },
    ],
    officialUrl: 'https://www.tokiam.co.jp/fund/49313104.html',
  },

  sp500: {
    fundKey: 'sp500',
    fundCode: '03311187',
    fundName: 'eMAXIS Slim 米国株式 (S&P 500)',
    fundNameKo: 'eMAXIS Slim 미국주식 (S&P 500)',
    managementCompany: '三菱UFJアセットマネジメント',
    managementCompanyKo: '미쓰비시 UFJ 에셋 매니지먼트',
    benchmarkIndex: 'S&P 500 Index (配当込み、円換算ベース)',
    benchmarkIndexKo: 'S&P 500 지수 (배당 포함, 원화/엔화 환산)',
    rebalanceRules:
      '米国を代表する主要500社に時価総額加重で投資。米国の経済成長および世界展開するトップ企業の成長果実を丸ごと享受するインデックスファンド。',
    rebalanceRulesKo:
      '미국을 대표하는 우량 기업 500개 사에 유동 시가총액 가중 방식으로 분산 투자합니다.',
    totalHoldingsCount: 503,
    top10WeightPct: 34.2,
    asOfDate: '2026年最新 月報公表値',
    sectorBreakdown: [
      { sector: '情報技術 (Information Technology)', sectorKo: '정보 기술(IT)', weightPct: 31.4, color: '#3B82F6' },
      { sector: '金融 (Financials)', sectorKo: '금융', weightPct: 13.5, color: '#10B981' },
      { sector: 'ヘルスケア (Healthcare)', sectorKo: '헬스케어', weightPct: 11.6, color: '#EC4899' },
      { sector: '一般消費財 (Consumer Discretionary)', sectorKo: '일반 소비재', weightPct: 10.2, color: '#F59E0B' },
      { sector: '通信サービス (Communication)', sectorKo: '통신 서비스', weightPct: 9.1, color: '#6366F1' },
      { sector: '資本財・エネルギー・生活必需品等', sectorKo: '산업·에너지·필수소비재 등', weightPct: 24.2, color: '#64748B' },
    ],
    constituents: [
      { rank: 1, symbol: 'MSFT', name: 'Microsoft', nameKo: '마이크로소프트', weightPct: 6.9, sector: 'IT', sectorKo: 'IT', description: 'クラウド・AI', descriptionKo: '클라우드·AI' },
      { rank: 2, symbol: 'AAPL', name: 'Apple', nameKo: '애플', weightPct: 6.4, sector: 'IT', sectorKo: 'IT', description: '端末・OS', descriptionKo: '디바이스·OS' },
      { rank: 3, symbol: 'NVDA', name: 'NVIDIA', nameKo: '엔비디아', weightPct: 5.8, sector: 'IT', sectorKo: 'IT', description: 'AI半導体', descriptionKo: 'AI 반도체' },
      { rank: 4, symbol: 'AMZN', name: 'Amazon', nameKo: '아마존', weightPct: 3.7, sector: '一般消費財', sectorKo: '일반소비재', description: 'AWS・リテール', descriptionKo: 'AWS·리테일' },
      { rank: 5, symbol: 'META', name: 'Meta Platforms', nameKo: '메타', weightPct: 2.5, sector: '通信', sectorKo: '통신', description: 'SNS・AI', descriptionKo: 'SNS·AI' },
      { rank: 6, symbol: 'GOOGL', name: 'Alphabet A', nameKo: '알파벳 A', weightPct: 2.2, sector: '通信', sectorKo: '통신', description: '検索・広告', descriptionKo: '검색·광고' },
      { rank: 7, symbol: 'GOOG', name: 'Alphabet C', nameKo: '알파벳 C', weightPct: 1.9, sector: '通信', sectorKo: '통신', description: '議決権なし株式', descriptionKo: '무의결권 주식' },
      { rank: 8, symbol: 'BRK.B', name: 'Berkshire Hathaway', nameKo: '버크셔 해서웨이', weightPct: 1.7, sector: '金融', sectorKo: '금융', description: '保険・投資', descriptionKo: '보험·복합투자' },
      { rank: 9, symbol: 'AVGO', name: 'Broadcom', nameKo: 'ブロードコム', weightPct: 1.6, sector: 'IT', sectorKo: 'IT', description: '半導体・ソフト', descriptionKo: '반도체·소프트웨어' },
      { rank: 10, symbol: 'LLY', name: 'Eli Lilly', nameKo: '일라이 릴리', weightPct: 1.5, sector: 'ヘルスケア', sectorKo: '헬스케어', description: '製薬', descriptionKo: '바이오 제약' },
    ],
    officialUrl: 'https://emaxis.am.mufg.jp/fund/253266.html',
  },

  us_bond_20y: {
    fundKey: 'us_bond_20y',
    fundCode: '2621.T',
    fundName: 'iShares 米国債20年超 ETF (為替ヘッジあり)',
    fundNameKo: 'iShares 미국채 20년 환헤지 (ETF)',
    managementCompany: 'ブラックロック・ジャパン (BlackRock)',
    managementCompanyKo: '블랙록 재팬 (BlackRock)',
    benchmarkIndex: 'FTSE米国債20年超セレクト・インデックス (国内投信用、円ヘッジ)',
    benchmarkIndexKo: 'FTSE 미국채 20년 이상 지수 (엔화/원화 환헤지)',
    rebalanceRules:
      '残存期間20年超の米国財務省証券（超長期米国国債）100%で構成。為替ヘッジによりドル円の変動リスクを抑制し、米国の金利低下局面（債券価格上昇）をダイレクトに享受。',
    rebalanceRulesKo:
      '잔존 만기 20년 이상의 초장기 미국 국채 100%로 구성. 환헤지를 통해 환율 변동 위험을 억제하고, 미국의 금리 인하 시 채권 가격 상승을 직접 향유합니다.',
    totalHoldingsCount: 42,
    top10WeightPct: 48.5,
    asOfDate: '2026年最新 公表値',
    sectorBreakdown: [
      { sector: '米国財務省証券 (残存25年〜30年)', sectorKo: '미국 재무부 채권 (잔존 25~30년)', weightPct: 45.0, color: '#0EA5E9' },
      { sector: '米国財務省証券 (残存20年〜25年)', sectorKo: '미국 재무부 채권 (잔존 20~25년)', weightPct: 53.5, color: '#3B82F6' },
      { sector: '現金・短期担保資産', sectorKo: '현금·단기 담보 자산', weightPct: 1.5, color: '#64748B' },
    ],
    constituents: [
      { rank: 1, symbol: 'US-T 4.75% 2053', name: '米国財務省証券 4.750% 2053/11/15', nameKo: '미국 재무부 채권 4.750% 2053년 만기', weightPct: 6.2, sector: '米国債', sectorKo: '미국 국채', description: '残存27年超の超長期固定利付国債', descriptionKo: '잔존 27년 초장기 고정금리 국채' },
      { rank: 2, symbol: 'US-T 4.625% 2054', name: '米国財務省証券 4.625% 2054/02/15', nameKo: '미국 재무부 채권 4.625% 2054년 만기', weightPct: 5.9, sector: '米国債', sectorKo: '미국 국채', description: '超長期固定利付国債', descriptionKo: '초장기 고정금리 국채' },
      { rank: 3, symbol: 'US-T 4.125% 2053', name: '米国財務省証券 4.125% 2053/08/15', nameKo: '미국 재무부 채권 4.125% 2053년 만기', weightPct: 5.4, sector: '米国債', sectorKo: '미국 국채', description: '超長期固定利付国債', descriptionKo: '초장기 고정금리 국채' },
      { rank: 4, symbol: 'US-T 4.000% 2052', name: '米国財務省証券 4.000% 2052/11/15', nameKo: '미국 재무부 채권 4.000% 2052년 만기', weightPct: 4.8, sector: '米国債', sectorKo: '미국 국채', description: '超長期固定利付国債', descriptionKo: '초장기 고정금리 국채' },
      { rank: 5, symbol: 'US-T 3.000% 2048', name: '米国財務省証券 3.000% 2048/08/15', nameKo: '미국 재무부 채권 3.000% 2048년 만기', weightPct: 4.5, sector: '米国債', sectorKo: '미국 국채', description: '超長期固定利付国債', descriptionKo: '초장기 고정금리 국채' },
    ],
    officialUrl: 'https://www.blackrock.com/jp/individual/ja/products/312015/',
  },

  cash_jpy: {
    fundKey: 'cash_jpy',
    fundCode: 'CASH_JPY',
    fundName: '日本円 現金・預金 (待機資金)',
    fundNameKo: '일본 엔화 현금·대기자금 (자녀계좌)',
    managementCompany: '自己管理 (証券口座待機資金)',
    managementCompanyKo: '자체 관리 (증권계좌 대기자금)',
    benchmarkIndex: '元本保証・無リスク待機資金',
    benchmarkIndexKo: '원금 보장·무위험 대기자금',
    rebalanceRules:
      '市場急落時の買付資金およびポートフォリオのクッション（下落緩和）として保持。為替・株価変動リスクゼロの安全資産。',
    rebalanceRulesKo:
      '시장 급락 시 저가 매수 자금 및 포트폴리오의 하락 방어(쿠션) 용도로 보유. 환율 및 주가 변동 위험이 없는 100% 안전 자산입니다.',
    totalHoldingsCount: 1,
    top10WeightPct: 100.0,
    asOfDate: '随時即時反映',
    sectorBreakdown: [
      { sector: '日本円現金・普通預金', sectorKo: '일본 엔화 현금·보통예금', weightPct: 100.0, color: '#64748B' },
    ],
    constituents: [
      { rank: 1, symbol: 'JPY_CASH', name: '日本円 現金 (待機資金)', nameKo: '일본 엔화 현금 (대기자금)', weightPct: 100.0, sector: '現金・預金', sectorKo: '현금·예금', description: '元本割れリスクなしの無リスク資産', descriptionKo: '원금 손실 없는 무위험 안전자산' },
    ],
    officialUrl: '',
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fundKey = searchParams.get('key') || 'all';

  if (fundKey !== 'all' && FUND_CONSTITUENTS_DATABASE[fundKey]) {
    return NextResponse.json({
      success: true,
      data: FUND_CONSTITUENTS_DATABASE[fundKey],
    });
  }

  return NextResponse.json({
    success: true,
    allFunds: FUND_CONSTITUENTS_DATABASE,
  });
}
