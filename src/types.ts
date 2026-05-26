export type GameScreen = 'LOGIN' | 'SETUP' | 'QUIZ' | 'SUMMARY' | 'ADMIN';

export interface PlayerInfo {
  username: string;
  email: string;
}

export type BusinessActivityType = 
  | '1_clothe_saler'
  | '2_car_repair'
  | '3_leather_handicraft'
  | '4_fresh_fish'
  | '5_cafe_bakery'
  | '6_printing_box'
  | '7_digital_marketing';

export interface BusinessActivity {
  id: BusinessActivityType;
  title: string;
  category: 'trading' | 'service' | 'manufacturing' | 'vat_exempt' | 'mixed_service_trading';
  description: string;
}

export type BusinessFormType = 
  | 'sole_proprietorship'
  | 'ordinary_partnership_unregistered'
  | 'ordinary_partnership_registered'
  | 'limited_partnership'
  | 'company_limited';

export interface BusinessForm {
  id: BusinessFormType;
  title: string;
  legalClass: 'individual' | 'corporate';
  description: string;
}

export interface BusinessSetup {
  brandName: string;
  activityId: BusinessActivityType;
  formId: BusinessFormType;
  annualRevenue: number;
  totalAssets: number;
  registeredCapital: number;
}

export interface ScoreRecord {
  id: string;
  username: string;
  email: string;
  brandName: string;
  businessActivity: string;
  businessType: string;
  revenue: number;
  assets: number;
  capital: number;
  score: number;
  completedAt: string;
}

export interface QuizQuestion {
  id: number;
  title: string;
  questionText: string;
  options: string[];
  getCorrectAnswerIndex: (setup: BusinessSetup) => number;
  getExplanation: (setup: BusinessSetup) => string;
}
