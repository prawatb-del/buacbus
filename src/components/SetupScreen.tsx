import React, { useState } from "react";
import { ArrowLeft, Play, Info, Landmark, HelpCircle, Briefcase, Coins, PiggyBank } from "lucide-react";
import { BusinessSetup, BusinessActivityType, BusinessFormType } from "../types";
import { BUSINESS_ACTIVITIES, BUSINESS_FORMS } from "../data";

interface SetupProps {
  onBack: () => void;
  onSetupComplete: (setup: BusinessSetup) => void;
  initialSetup?: BusinessSetup | null;
}

export default function SetupScreen({ onBack, onSetupComplete, initialSetup }: SetupProps) {
  const [brandName, setBrandName] = useState(initialSetup?.brandName || "");
  const [activityId, setActivityId] = useState<BusinessActivityType | "">(initialSetup?.activityId || "");
  const [formId, setFormId] = useState<BusinessFormType | "">(initialSetup?.formId || "");
  const [annualRevenueStr, setAnnualRevenueStr] = useState(initialSetup ? initialSetup.annualRevenue.toString() : "");
  const [totalAssetsStr, setTotalAssetsStr] = useState(initialSetup ? initialSetup.totalAssets.toString() : "");
  const [registeredCapitalStr, setRegisteredCapitalStr] = useState(initialSetup ? initialSetup.registeredCapital.toString() : "");
  
  const [valError, setValError] = useState("");

  // Presets/Shortcuts for easy testing
  const applyPreset = (type: "sme_sole" | "exempt_vat" | "small_corp" | "large_corp") => {
    switch (type) {
      case "sme_sole":
        setBrandName("เสื้อผ้าวัยรุ่นฟันน้ำน้ำ");
        setActivityId("1_clothe_saler");
        setFormId("sole_proprietorship");
        setAnnualRevenueStr("1500000"); // 1.5M (Under 1.8M VAT)
        setTotalAssetsStr("450000");
        setRegisteredCapitalStr("200000");
        break;
      case "exempt_vat":
        setBrandName("สิริสดเลเลแช่แข็ง");
        setActivityId("4_fresh_fish"); // VAT Exempt
        setFormId("company_limited");
        setAnnualRevenueStr("3500000"); // 3.5M (Over 1.8M but exempt!)
        setTotalAssetsStr("4000000");
        setRegisteredCapitalStr("2000000");
        break;
      case "small_corp":
        setBrandName("เทคสตูดิโอ จำกัด");
        setActivityId("7_digital_marketing");
        setFormId("limited_partnership"); // LP Small
        setAnnualRevenueStr("12000000"); // 12M (Over 1.8M VAT)
        setTotalAssetsStr("4000000"); // Assets under 30M
        setRegisteredCapitalStr("3000000"); // Capital under 5M -> Can use TA!
        break;
      case "large_corp":
        setBrandName("สยามพริ้นท์ติ้ง จำกัด");
        setActivityId("6_printing_box");
        setFormId("company_limited");
        setAnnualRevenueStr("45000000"); // 45M
        setTotalAssetsStr("35000000"); // Assets over 30M
        setRegisteredCapitalStr("8000000"); // Capital over 5M -> CPA only
        break;
    }
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    setValError("");

    if (!brandName.trim()) {
      setValError("กรุณาระบุ 'ชื่อแบรนด์/ชื่อธุรกิจ' ของคุณ");
      return;
    }
    if (!activityId) {
      setValError("กรุณาเลือก 'กิจกรรมหลักทางธุรกิจ' เพื่อใช้วิเคราะห์ภาษีมูลค่าเพิ่ม");
      return;
    }
    if (!formId) {
      setValError("กรุณาเลือก 'รูปแบบองค์กรธุรกิจ' เพื่อวิเคราะห์ประเภทผู้ลงนามและรูปแบบภาษี");
      return;
    }

    const revenue = parseFloat(annualRevenueStr);
    const assets = parseFloat(totalAssetsStr);
    const capital = parseFloat(registeredCapitalStr);

    if (isNaN(revenue) || revenue < 0) {
      setValError("กรุณากรอก 'ประมาณการรายได้ต่อปี' เป็นตัวเลขที่ถูกต้อง (ไม่ต่ำกว่า 0)");
      return;
    }
    if (isNaN(assets) || assets < 0) {
      setValError("กรุณากรอก 'ประมาณการสินทรัพย์รวมทั้งหมด' เป็นตัวเลขที่ถูกต้อง (ไม่ต่ำกว่า 0)");
      return;
    }
    if (isNaN(capital) || capital < 0) {
      setValError("กรุณากรอก 'ทุนจดทะเบียน' เป็นตัวเลขที่ถูกต้อง (ไม่ต่ำกว่า 0)");
      return;
    }

    // Adjust capital to no more than assets for business reality
    // (though in game we accept any positive values, we just validate positive numbers)

    onSetupComplete({
      brandName: brandName.trim(),
      activityId,
      formId,
      annualRevenue: revenue,
      totalAssets: assets,
      registeredCapital: capital
    });
  };

  const activeActivityObj = BUSINESS_ACTIVITIES.find(a => a.id === activityId);
  const activeFormObj = BUSINESS_FORMS.find(f => f.id === formId);

  return (
    <div id="setup-container" className="max-w-4xl mx-auto py-6 px-4">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          id="setup-back-btn"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider py-2"
        >
          <ArrowLeft className="h-4 w-4 text-bu-orange" />
          ย้อนกลับไปหน้าแรก
        </button>
        <span className="text-xs font-mono text-purple-300 font-bold tracking-wider uppercase">
          ขั้นตอนที่ 2: วางแผนพารามิเตอร์ธุรกิจ
        </span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
          BUSINESS <span className="text-bu-orange">MASTERMIND</span>
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mt-2">
          Simulation by Bangkok University Accounting
        </p>
        <p className="text-slate-300 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
          ข้อมูลแบรนด์ ตัวเลขรายได้ และทุนจดทะเบียนเหล่านี้ จะถูกป้อนส่งต่อไปยังเงื่อนไขโจทย์คำถาม 8 ข้อสำคัญ เพื่อให้สอดคล้องกับพารามิเตอร์ทางบัญชีของคุณจริง!
        </p>
      </div>



      <form onSubmit={handleStartGame} className="space-y-6">
        
        {valError && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
            {valError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section Left: Core Profile */}
          <div className="space-y-5 glass-panel p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <span className="bg-bu-orange w-2 h-6 rounded-full inline-block"></span>
                เอกลักษณ์และประเภทธุรกิจ
              </h2>

              {/* Brand Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                  ชื่อแบรนด์ / ชื่อธุรกิจ <span className="text-bu-orange">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="ระบุชื่อบริษัทสตาร์ทอัพของคุณ"
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:border-bu-orange outline-none transition-all"
                />
              </div>

              {/* Business Activity (7 hints) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                  กิจกรรมหลักของกิจการ <span className="text-bu-orange">*</span>
                </label>
                <select
                  value={activityId}
                  onChange={(e) => setActivityId(e.target.value as BusinessActivityType)}
                  className="w-full bg-slate-900 border border-white/20 text-white rounded-xl px-3 py-2.5 text-sm focus:border-bu-orange outline-none transition-all cursor-pointer"
                >
                  <option value="">-- กรุณาเลือกกิจกรรมเริ่มต้น --</option>
                  {BUSINESS_ACTIVITIES.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Form (5 Options) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                  รูปแบบจดทะเบียนธุรกิจ <span className="text-bu-orange">*</span>
                </label>
                <select
                  value={formId}
                  onChange={(e) => setFormId(e.target.value as BusinessFormType)}
                  className="w-full bg-slate-900 border border-white/20 text-white rounded-xl px-3 py-2.5 text-sm focus:border-bu-orange outline-none transition-all cursor-pointer"
                >
                  <option value="">-- กรุณาเลือกสถานภาพจดทะเบียน --</option>
                  {BUSINESS_FORMS.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-4">
            </div>
          </div>

          {/* Section Right: Financial Metrics */}
          <div className="space-y-6 glass-panel p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <span className="bg-bu-purple w-2 h-6 rounded-full inline-block"></span>
                ประมาณการตัวเลขการเงิน (บาท)
              </h2>

              {/* Annual Revenue */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    ประมาณการรายได้ปีแรก <span className="text-bu-orange">*</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">เกณฑ์ VAT 1.8M</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={annualRevenueStr}
                    onChange={(e) => setAnnualRevenueStr(e.target.value)}
                    placeholder="ป้อนรายได้รวมต่อปี"
                    className="w-full bg-white/5 border border-white/20 text-white rounded-xl pl-4 pr-12 py-2.5 text-sm focus:border-bu-orange outline-none transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-bold">บาท</span>
                </div>
              </div>

              {/* Total Assets */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    ประมาณการสินทรัพย์รวม <span className="text-bu-orange">*</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">เกณฑ์งบการเงิน 30M</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={totalAssetsStr}
                    onChange={(e) => setTotalAssetsStr(e.target.value)}
                    placeholder="ป้อนสินทรัพย์รวมสินค้าและเงินสำรอง"
                    className="w-full bg-white/5 border border-white/20 text-white rounded-xl pl-4 pr-12 py-2.5 text-sm focus:border-bu-orange outline-none transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-bold">บาท</span>
                </div>
              </div>

              {/* Registered Capital */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    ทุนจดทะเบียนจดตั้ง <span className="text-bu-orange">*</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">เกณฑ์ลงนามงบ 5M</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={registeredCapitalStr}
                    onChange={(e) => setRegisteredCapitalStr(e.target.value)}
                    placeholder="ทุนจดตั้งนิติบุคคล"
                    className="w-full bg-white/5 border border-white/20 text-white rounded-xl pl-4 pr-12 py-2.5 text-sm focus:border-bu-orange outline-none transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-bold">บาท</span>
                </div>
              </div>
            </div>

            {/* Empty block to replace tip */}
            <div className="pt-2"></div>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="pt-4 text-center">
          <button
            type="submit"
            id="setup-complete-btn"
            className="w-full sm:w-auto min-w-[280px] bg-bu-orange hover:bg-bu-orange/90 text-white font-bold text-base py-4 px-10 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer inline-flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <Play className="h-5 w-5 fill-current" />
            Launch Business
          </button>
        </div>
      </form>
    </div>
  );
}
