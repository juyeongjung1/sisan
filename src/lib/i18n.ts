import { PaymentMethod } from '@/types';

export type Language = 'ja' | 'ko';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  syncBtn: string;
  historyBtn: string;
  dataBtn: string;
  accountBtn: string;
  addBtn: string;
  privacyMaskOn: string;
  privacyMaskOff: string;
  
  // Navigation Tabs
  navSummary: string;
  navContribution: string;
  navHistory: string;
  navSimulator: string;
  navRecurring: string;
  navHoldings: string;

  // Summary Cards
  totalAssets: string;
  totalPrincipal: string;
  totalGain: string;
  fxGain: string;
  stockGrowth: string;
  monthlyInvest: string;

  // Contribution Analysis
  contribTitle: string;
  contribSubtitle: string;
  t1Notice: string;
  todayChange: string;
  dragFactors: string;
  cushionFactors: string;
  dragListTitle: string;
  cushionListTitle: string;
  usStocksTitle: string;
  marketDriversTitle: string;

  // History & Chart
  historyTitle: string;
  historySubtitle: string;
  zoomScaleOn: string;
  zoomScaleOff: string;
  currentVal: string;
  dailyDiff: string;
  periodCumulative: string;
  fxRateTrend: string;
  allAssets: string;
  timeframeDay: string;
  timeframeWeek: string;
  timeframeMonth: string;
  timeframeYear: string;
  timeframeAll: string;

  // Table
  tableTitle: string;
  tableSubtitle: string;
  colName: string;
  colAccount: string;
  colPrincipal: string;
  colFxRate: string;
  colValNav: string;
  colGain: string;
  colBreakdown: string;
  colActions: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  ja: {
    appTitle: '資産管理ダッシュボード',
    appSubtitle: '分散投資 & 為替要因・資産成長一元可視化システム',
    syncBtn: '投信・為替同期',
    historyBtn: '推移分析',
    dataBtn: 'データ管理',
    accountBtn: '口座管理',
    addBtn: '資産を追加',
    privacyMaskOn: '金額非表示',
    privacyMaskOff: '金額表示',

    navSummary: '概要',
    navContribution: '要因分析',
    navHistory: '推移分析',
    navSimulator: '為替試算',
    navRecurring: '積立設定',
    navHoldings: '銘柄一覧',

    totalAssets: '総資産評価額',
    totalPrincipal: '総投資元本',
    totalGain: 'トータル損益',
    fxGain: '為替要因損益 (円安恩恵)',
    stockGrowth: '原資産・株価成長要因',
    monthlyInvest: '毎月の積立総額',

    contribTitle: '本日の銘柄別・寄与度分析 ＆ 米国株・経済要因解説',
    contribSubtitle: 'どの商品が大きく影響し、どの資産が相殺（クッション）したのかを可視化',
    t1Notice: '海外投信は「前夜の米国株終値 ➔ 翌日夕方の基準価額」に反映されます',
    todayChange: '本日のポートフォリオ全体変動',
    dragFactors: '押し下げ要因（下落寄与）',
    cushionFactors: '相殺・クッション効果（下落緩和）',
    dragListTitle: '📉 下落要因となった商品',
    cushionListTitle: '🛡️ 上昇または下落を食い止めた商品（相殺要因）',
    usStocksTitle: 'インデックスを動かした前夜の米国主要株（Magnificent 7）',
    marketDriversTitle: '最新の市場・為替要因の解説',

    historyTitle: '商品別・期間別（日/週/月/年）資産推移分析',
    historySubtitle: '実際の運用期間に連動した精密ポートフォリオトラッカー',
    zoomScaleOn: '⚡ 変動強調: ON',
    zoomScaleOff: '全域表示: 0基準',
    currentVal: '現在評価額',
    dailyDiff: '前日比（昨日からの1日変動）',
    periodCumulative: '選択期間の通算増減',
    fxRateTrend: '為替レート (USD/JPY)',
    allAssets: '📊 全資産の合計推移',
    timeframeDay: '日 (7日)',
    timeframeWeek: '週 (4週)',
    timeframeMonth: '月 (1年)',
    timeframeYear: '年 (3年)',
    timeframeAll: '全期間',

    tableTitle: '保有資産・銘柄一覧',
    tableSubtitle: '口座ごとの銘柄詳細・3時間毎の公表基準価額連動',
    colName: '銘柄名 / カテゴリ / 備考',
    colAccount: '口座',
    colPrincipal: '投資元本 (円)',
    colFxRate: '購入時レート',
    colValNav: '現在評価額 / 公表基準価額',
    colGain: 'トータル損益',
    colBreakdown: '為替要因 / 株価要因',
    colActions: '操作',
  },
  ko: {
    appTitle: '자산 관리 대시보드',
    appSubtitle: '분산 투자 & 환율 요인·자산 성장 통합 시각화 시스템',
    syncBtn: '공시 데이터 동기화',
    historyBtn: '추이 분석',
    dataBtn: '데이터 관리',
    accountBtn: '계좌 관리',
    addBtn: '자산 추가',
    privacyMaskOn: '금액 숨김',
    privacyMaskOff: '금액 표시',

    navSummary: '개요',
    navContribution: '요인 분석',
    navHistory: '추이 분석',
    navSimulator: '환율 시뮬',
    navRecurring: '적립 설정',
    navHoldings: '종목 목록',

    totalAssets: '총 평가 자산',
    totalPrincipal: '총 투자 원금',
    totalGain: '총 평가 손익',
    fxGain: '환율 요인 손익 (엔저/원저 효과)',
    stockGrowth: '자산 자체 성장 요인',
    monthlyInvest: '매월 정기 적립액',

    contribTitle: '오늘의 종목별 기여도 분석 & 미국 시장 요인 해설',
    contribSubtitle: '어떤 상품이 크게 영향을 미쳤고, 어떤 자산이 하락을 방어했는지 시각화',
    t1Notice: '해외 펀드는 전날 밤 미국 증시 마감가가 다음 날 저녁 기준가에 반영됩니다',
    todayChange: '오늘의 전체 포트폴리오 변동',
    dragFactors: '하락 요인 (부정적 기여)',
    cushionFactors: '방어·쿠션 효과 (하락 완화)',
    dragListTitle: '📉 하락 원인이 된 상품',
    cushionListTitle: '🛡️ 상승 또는 하락을 방어한 상품 (쿠션 요인)',
    usStocksTitle: '지수를 움직인 전날 밤 미국 빅테크 (Magnificent 7)',
    marketDriversTitle: '최신 시장 상황 및 환율 요인 해설',

    historyTitle: '상품별·기간별(일/주/월/년) 자산 추이 분석',
    historySubtitle: '실제 투자 운용 기간을 반영한 정밀 포트폴리오 트래커',
    zoomScaleOn: '⚡ 변동 강조: ON',
    zoomScaleOff: '전체 영역: 0 기준',
    currentVal: '현재 평가액',
    dailyDiff: '전일 대비 (어제 대비 1일 변동)',
    periodCumulative: '선택 기간 누적 증감',
    fxRateTrend: '환율 추이 (USD/JPY)',
    allAssets: '📊 전체 자산 합산 추이',
    timeframeDay: '일 (7일)',
    timeframeWeek: '주 (4주)',
    timeframeMonth: '월 (1년)',
    timeframeYear: '년 (3년)',
    timeframeAll: '전체 기간',

    tableTitle: '보유 자산 및 종목 목록',
    tableSubtitle: '계좌별 종목 상세 및 3시간 단위 최신 공시 기준가 연동',
    colName: '종목명 / 카테고리 / 메모',
    colAccount: '계좌',
    colPrincipal: '투자 원금',
    colFxRate: '매수 환율',
    colValNav: '현재 평가액 / 공시 기준가',
    colGain: '총 평가 손익',
    colBreakdown: '환율 요인 / 주가 요인',
    colActions: '관리',
  },
};

/**
 * 保有銘柄名の動的翻訳
 */
export function translateHoldingName(name: string, lang: Language): string {
  if (lang === 'ja') {
    if (name.includes('미국채') || name.includes('IS米国債')) return 'IS米国債20年ヘッジ (特定)';
    if (name.includes('레바나스') || name.includes('レバナス')) return '楽天レバレッジNASDAQ-100(レバナス) (旧NISA)';
    if (name.includes('FANG+')) return 'iFreeNext FANG+インデックス (積み立てNISA)';
    if (name.includes('Z테크') || name.includes('Zテック')) {
      if (name.includes('미키') || name.includes('거치') || name.includes('ミキ')) return 'iFreePlus世界トレンド・テクノロジー株(Zテック20)';
      return 'iFreePlus世界トレンド・テクノロジー株(Zテック20)';
    }
    if (name.includes('S&P') || name.includes('Slim')) return 'eMAXIS Slim 米国株式(S&P 500)';
    if (name.includes('외국주식') || name.includes('도쿄해상') || name.includes('東京海上')) return '東京海上セレクション・外国株式インデックス';
    if (name.includes('현금') || name.includes('現金')) return '日本円 現金 (待機資金)';
    return name;
  }

  // Korean
  if (name.includes('IS米国債') || name.includes('미국채')) return 'iShares 미국채 20년 환헤지';
  if (name.includes('レバナス') || name.includes('레바나스') || name.includes('NASDAQ-100')) return '라쿠텐 레버리지 NASDAQ-100 (레바나스)';
  if (name.includes('FANG+')) return 'iFreeNext FANG+ 인덱스 (적립식)';
  if (name.includes('Zテック') || name.includes('Z테크')) {
    if (name.includes('ミキ') || name.includes('미키') || name.includes('거치')) return 'iFreePlus 글로벌 트렌드 Z테크20 (미키 거치)';
    return 'iFreePlus 글로벌 트렌드 Z테크20 (정주영 적립)';
  }
  if (name.includes('S&P') || name.includes('Slim')) return 'eMAXIS Slim 미국주식 (S&P 500)';
  if (name.includes('東京海上') || name.includes('外国株式') || name.includes('외국주식')) return '도쿄해상 셀렉션 외국주식 인덱스 (퇴직연금)';
  if (name.includes('日本円') || name.includes('現金') || name.includes('현금')) return '현금 대기자금 (엔화/원화)';

  return name;
}

/**
 * 商品別アロケーション（合算銘柄名）の動的翻訳
 */
export function translateProductName(name: string, lang: Language): string {
  if (lang === 'ja') {
    if (name.includes('ZTech') || name.includes('Zテック') || name.includes('Z테크')) return 'iFreePlus 世界トレンド・テクノロジー株 (Zテック20)';
    if (name.includes('東京海上') || name.includes('외국주식')) return '東京海上セレクション・外国株式インデックス (401k)';
    if (name.includes('レバナス') || name.includes('NASDAQ-100') || name.includes('레바나스')) return '楽天レバレッジNASDAQ-100 (レバナス)';
    if (name.includes('現金') || name.includes('待機資金') || name.includes('현금')) return '日本円 現金・預金 (待機資金)';
    if (name.includes('FANG+')) return 'iFreeNext FANG+インデックス';
    if (name.includes('IS米国債') || name.includes('미국채') || name.includes('2621')) return 'iShares 米国債20年ヘッジ (IS米国債)';
    if (name.includes('S&P') || name.includes('Slim')) return 'eMAXIS Slim 米国株式 (S&P 500)';
    return name;
  }

  // Korean
  if (name.includes('Zテック') || name.includes('ZTech') || name.includes('Z테크')) return 'iFreePlus 글로벌 트렌드 Z테크20 (정주영+미키 통합)';
  if (name.includes('東京海上') || name.includes('외국주식') || name.includes('도쿄해상')) return '도쿄해상 외국주식 인덱스 (401k 퇴직연금)';
  if (name.includes('レバナス') || name.includes('NASDAQ-100') || name.includes('레바나스')) return '라쿠텐 레버리지 NASDAQ-100 (레바나스)';
  if (name.includes('現金') || name.includes('待機資金') || name.includes('현금')) return '일본 엔화 현금·대기자금 (자녀계좌)';
  if (name.includes('FANG+')) return 'iFreeNext FANG+ 인덱스 (적립식)';
  if (name.includes('IS米国債') || name.includes('미국채') || name.includes('2621')) return 'iShares 미국채 20년 환헤지 (채권형)';
  if (name.includes('S&P') || name.includes('Slim')) return 'eMAXIS Slim 미국주식 (S&P 500)';

  return name;
}

/**
 * 口座名の動的翻訳
 */
export function translateAccountName(name: string, lang: Language): string {
  if (lang === 'ja') {
    if (name.includes('정주영') && (name.includes('라쿠텐') || name.includes('楽天'))) return 'ジョンの楽天証券口座';
    if (name.includes('정주영') && (name.includes('연금') || name.includes('401k'))) return 'ジョンの確定拠出年金 (東京海上日動401k)';
    if (name.includes('라쿠텐') || name.includes('楽天')) return 'ジョンの楽天証券口座';
    if (name.includes('미키') || name.includes('ミキ')) return 'ミキの口座';
    if (name.includes('연금') || name.includes('401k') || name.includes('確定拠出')) return 'ジョンの確定拠出年金 (東京海上日動401k)';
    if (name.includes('자녀') || name.includes('어린이') || name.includes('子供')) return '子供の証券口座 (子供NISA)';
    return name;
  }

  // Korean
  if (name.includes('楽天') || name.includes('라쿠텐') || name.includes('ジョン') || name.includes('존') || name.includes('정주영')) {
    if (name.includes('연금') || name.includes('401k') || name.includes('確定拠出') || name.includes('東京海上')) {
      return '정주영의 확정기여형 연금 (401k)';
    }
    return '정주영의 라쿠텐 증권 계좌';
  }
  if (name.includes('ミキ') || name.includes('미키')) return '미키의 계좌 (가족)';
  if (name.includes('確定拠出') || name.includes('401k') || name.includes('東京海上') || name.includes('연금')) return '정주영의 확정기여형 연금 (401k)';
  if (name.includes('子供') || name.includes('ジュニア') || name.includes('자녀') || name.includes('어린이')) return '자녀 증권 계좌 (어린이 NISA)';

  return name;
}

/**
 * 決済方法の動的翻訳
 */
export function translatePaymentMethod(method: PaymentMethod, lang: Language): string {
  if (lang === 'ko') {
    switch (method) {
      case 'credit_card':
        return '신용카드 적립';
      case 'bank_transfer':
        return '급여 공제 / 계좌 자동이체';
      case 'balance':
        return '증권 계좌 잔고 / 자동 입금';
      default:
        return '기타';
    }
  }
  switch (method) {
    case 'credit_card':
      return 'クレジットカード積立';
    case 'bank_transfer':
      return '給与天引き / 口座振替';
    case 'balance':
      return '証券口座残高・自動入金';
    default:
      return 'その他';
  }
}

/**
 * 備考・メモの動的翻訳
 */
export function translateNotes(notes: string | undefined, lang: Language): string {
  if (!notes) return '';

  if (lang === 'ja') {
    if (notes.includes('환헤지') || notes.includes('為替ヘッジ')) return '為替ヘッジあり（-30.35%）。積み立て無し';
    if (notes.includes('5년간') || notes.includes('5年間') || notes.includes('旧NISA')) return '5年間積立運用。他資産への移行中 (+170.82%)';
    if (notes.includes('매월 1일') || notes.includes('毎月1日') || notes.includes('50,000') || notes.includes('5만')) return '毎月1日に50,000円積立 (+15.23%)';
    if (notes.includes('매월 8일') || notes.includes('毎月8日')) {
      if (notes.includes('36,000') || notes.includes('3.6만') || notes.includes('FANG')) return '毎月8日に36,000円積立 (+21.56%)';
      return '毎月1日に50,000円積立 (+15.23%)';
    }
    if (notes.includes('일괄') || notes.includes('一括')) return '一括購入・長期保有 (+17.98%)';
    if (notes.includes('장기') || notes.includes('長期')) return '長期保有 (+133.85%)';
    if (notes.includes('29일') || notes.includes('29日') || notes.includes('급여') || notes.includes('給与')) return '毎月29日給与天引き積立 (+68.95%)';
    if (notes.includes('무위험') || notes.includes('無リスク') || notes.includes('대기자금')) return '無リスク現金待機資金';
    return notes;
  }

  // Korean
  if (notes.includes('為替ヘッジ') || notes.includes('환헤지')) return '환헤지 채권형 (-30.35%). 적립 없음';
  if (notes.includes('5年間') || notes.includes('旧NISA') || notes.includes('5년간')) return '5년간 적립 운용. 타 자산으로 분할 전환중 (+170.82%)';
  if (notes.includes('毎月1日') || notes.includes('매월 1일') || notes.includes('50,000') || notes.includes('5만')) return '매월 1일 정기 적립 (+15.23%)';
  if (notes.includes('毎月8日') || notes.includes('매월 8일')) {
    if (notes.includes('36,000') || notes.includes('3.6만') || notes.includes('FANG')) return '매월 8일 정기 적립 (+21.56%)';
    return '매월 1일 정기 적립 (+15.23%)';
  }
  if (notes.includes('一括') || notes.includes('일괄')) return '일괄 매수 보유 (+17.98%)';
  if (notes.includes('長期') || notes.includes('장기')) return '장기保有 (+133.85%)';
  if (notes.includes('29日') || notes.includes('29일') || notes.includes('給与') || notes.includes('401k')) return '매월 29일 급여 자동 공제 적립 (+68.95%)';
  if (notes.includes('無リスク') || notes.includes('待機資金') || notes.includes('子供NISA')) return '무위험 대기자금 및 쿠션 방어자산';

  return notes;
}
