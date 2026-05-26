import React, { useEffect, useState } from "react";
import { Award, RefreshCw, Trophy, Coins, Download, ShieldCheck, Mail, HelpCircle, Star, ArrowRight, BookOpen } from "lucide-react";
import { BusinessSetup, PlayerInfo } from "../types";
import { BUSINESS_ACTIVITIES, BUSINESS_FORMS } from "../data";

interface SummaryProps {
  player: PlayerInfo;
  setup: BusinessSetup;
  score: number;
  onRestart: () => void;
}

export default function SummaryScreen({ player, setup, score, onRestart }: SummaryProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const activeActivity = BUSINESS_ACTIVITIES.find(a => a.id === setup.activityId);
  const activeForm = BUSINESS_FORMS.find(f => f.id === setup.formId);

  // Determine rating based on score
  let rating = "C";
  let ratingTitle = "Novice Learner (ผู้เรียนรู้ระยะเริ่มต้น)";
  let ratingColor = "text-amber-500 border-amber-500/30 bg-amber-500/10";
  let ratingDesc = "อาจต้องเข้ารับคำแนะนำวิชาชีพหรือแวะปรึกษาอาจารย์ภาควิชาบัญชีเพื่อทบทวนทักษะประมวลรัษฎากรรอบใหม่!";

  if (score >= 4500) {
    rating = "S";
    ratingTitle = "Mastermind Specialist (ผู้เชี่ยวชาญระดับมาสเตอร์)";
    ratingColor = "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 border-orange-500/40 bg-orange-500/10";
    ratingDesc = "สุดยอดความเฉียบแหลมด้านกฎหมายบัญชีระดับเพชรยอดมงกุฎ ม.กรุงเทพ! เหมาะเป็น CFO คมกริบในการนำทางความสำเร็จองค์กร";
  } else if (score >= 3500) {
    rating = "A";
    ratingTitle = "Expert Generalist (ผู้ชำนาญการแผนปฏิบัติการ)";
    ratingColor = "text-purple-400 border-purple-500/30 bg-purple-500/10";
    ratingDesc = "คุณอัดแน่นด้วยความเข้าใจในโครงสร้างจัดตั้งและกฎระเบียบสรรพากรที่มีประสิทธิภาพ สามารถบริหารแบรนด์ของตนเองได้อย่างไร้มลทิน";
  } else if (score >= 2500) {
    rating = "B";
    ratingTitle = "Competent Operator (ผู้ดำเนินงานผ่านเกณฑ์ปฏิบัติ)";
    ratingColor = "text-blue-400 border-blue-500/30 bg-blue-500/10";
    ratingDesc = "เข้าใจหลักแนวคิดบัญชีเป็นส่วนใหญ่ แต่อาจเกิดความผิดพลาดเล็กน้อยในเงื่อนไขการเลือกผู้สอบบัญชีหรือเกณฑ์รายได้นำสมรรถนะ";
  }

  // Automate saving score in the background upon landing
  useEffect(() => {
    let active = true;
    async function submitScore() {
      if (submitSuccess || submitting) return;
      setSubmitting(true);
      try {
        const response = await fetch("/api/scores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: player.username,
            email: player.email,
            brandName: setup.brandName,
            businessActivity: activeActivity?.title || "N/A",
            businessType: activeForm?.title || "N/A",
            revenue: setup.annualRevenue,
            assets: setup.totalAssets,
            capital: setup.registeredCapital,
            score: score,
          }),
        });
        if (response.ok) {
          if (active) {
            setSubmitSuccess(true);
            setApiError("");
          }
        } else {
          throw new Error("ระบบล้มเหลวในการเซฟคะแนน");
        }
      } catch (err) {
        if (active) {
          setApiError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อนำส่งคะแนนได้ (แต่คะแนนเก็บโลคอลสำเร็จ)");
        }
      } finally {
        if (active) {
          setSubmitting(false);
        }
      }
    }
    submitScore();
    return () => {
      active = false;
    };
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("th-TH", { style: "decimal" }).format(val);
  };

  return (
    <div id="summary-container" className="max-w-3xl mx-auto py-6 px-4">
      
      {/* Upper Success Badge Card */}
      <div className="glass-panel p-8 text-center relative overflow-hidden shadow-2xl mb-8">
        
        {/* Confetti Background FX Decoration */}
        <div className="absolute inset-0 bg-gradient-to-tr from-bu-purple/20 via-slate-900/10 to-bu-orange/10 pointer-events-none"></div>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-bu-orange flex items-center justify-center text-white shadow-lg animate-bounce duration-1000">
            <Trophy className="h-8 w-8" />
          </div>
        </div>

        <span className="text-xs text-bu-orange font-bold uppercase tracking-widest block mb-1">
          การทดสอบประเมินสัมฤทธิผลสมบูรณ์
        </span>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          CONGRATULATIONS!
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          ผู้เรียน <b>{player.username}</b> ({player.email}) ดำเนินการจัดทำวิเคราะห์สรรพากรและจดบัญชีสำเร็จลุล่วง
        </p>

        {/* Big Score Render */}
        <div className="my-8 inline-block bg-slate-950/80 border border-white/10 rounded-2xl px-10 py-5 shadow-inner">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest block mb-1">คะแนนสรุปสุดท้ายของคุณ</span>
          <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-bu-orange via-amber-300 to-purple-400 font-mono">
            {formatCurrency(score)}
          </span>
          <span className="text-xs text-gray-400 block mt-2 uppercase tracking-wide font-semibold">จากคะแนนเต็ม 5,000 คะแนน</span>
        </div>

        {/* Academic Evaluation Rating Block */}
        <div className={`mt-2 border-2 rounded-2xl p-5 max-w-lg mx-auto ${ratingColor}`}>
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center justify-center gap-1">
            <Star className="h-3.5 w-3.5 fill-current text-bu-orange" />
            ระดับผลประเมินสัมพันธภาพ
            <Star className="h-3.5 w-3.5 fill-current text-bu-orange" />
          </div>
          <div className="text-3xl font-black tracking-tight mt-1.5 font-sans">
            RATING: {rating}
          </div>
          <div className="text-sm font-bold mt-1">
            {ratingTitle}
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md mx-auto">
            {ratingDesc}
          </p>
        </div>

        {/* Server Score Submission Auto indicators */}
        <div className="mt-8 border-t border-white/10 pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          {submitting && (
            <span className="flex items-center gap-1.5 text-bu-orange font-bold uppercase tracking-wider">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              กำลังนำส่งคะแนนเข้าคลังบัญชี ม.กรุงเทพ...
            </span>
          )}
          {submitSuccess && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-4 w-4" />
              เชื่อมบันทึกคะแนนในฐานแอดมินกลาง เรียบร้อยแลัว!
            </span>
          )}
          {apiError && (
            <span className="text-red-400 font-bold">
              ⚠️ {apiError}
            </span>
          )}
        </div>
      </div>

      {/* Corporate profile setup review summary list */}
      <div className="glass-panel p-6 shadow-xl mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
          <BookOpen className="h-4 w-4 text-bu-orange" />
          สรุปประวัติแฟ้มจัดตั้งธุรกิจ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">ชื่อแบรนด์วิสาหกิจ:</span>
              <span className="font-bold text-white">{setup.brandName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">ประเภทกิจกรรม:</span>
              <span className="font-bold text-bu-orange">{activeActivity?.title}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">ประเภทองค์กรสรรพสิทธิ์:</span>
              <span className="font-bold text-purple-400">{activeForm?.title}</span>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">ประมาณยอดขายรายปี:</span>
              <span className="font-bold text-emerald-300 font-mono">{formatCurrency(setup.annualRevenue)} บาท</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">ขนาดสินทรัพย์จดงบ:</span>
              <span className="font-bold text-white font-mono">{formatCurrency(setup.totalAssets)} บาท</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">ทุนจดทะเบียนหลัก:</span>
              <span className="font-bold text-white font-mono">{formatCurrency(setup.registeredCapital)} บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-bu-orange hover:bg-bu-orange/92 text-white font-bold text-base py-3 px-8 rounded-full cursor-pointer shadow-md transition-transform hover:scale-105 active:scale-95 uppercase tracking-wide"
        >
          <RefreshCw className="h-5 w-5" />
          เริ่มวิเคราะห์รอบใหม่
        </button>
      </div>

    </div>
  );
}
