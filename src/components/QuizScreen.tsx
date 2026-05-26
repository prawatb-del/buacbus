import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Clock, Award, Play, HelpCircle, ArrowRight, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import { BusinessSetup, QuizQuestion } from "../types";
import { QUIZ_QUESTIONS, BUSINESS_FORMS, BUSINESS_ACTIVITIES } from "../data";

interface QuizProps {
  setup: BusinessSetup;
  onQuizComplete: (finalScore: number) => void;
  onBackToSetup: () => void;
}

export default function QuizScreen({ setup, onQuizComplete, onBackToSetup }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(5000);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  
  // States of validation
  const [showCorrectionWarning, setShowCorrectionWarning] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  
  // Timer states
  const [isPaused, setIsPaused] = useState(false);

  const activeQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;

  const activeForm = BUSINESS_FORMS.find(f => f.id === setup.formId);
  const activeActivity = BUSINESS_ACTIVITIES.find(a => a.id === setup.activityId);

  // Time-decay loop: -2 points every second when timer is not paused and score > 0
  useEffect(() => {
    if (isPaused || currentScore <= 0 || answeredCorrectly) return;

    const interval = setInterval(() => {
      setCurrentScore((prev) => {
        const next = prev - 2;
        return next < 0 ? 0 : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, answeredCorrectly, currentScore]);

  // Retrieve correct answer dynamically
  const correctOptionIndex = activeQuestion.getCorrectAnswerIndex(setup);

  const handleOptionSelect = (optionIndex: number) => {
    // If already answered correctly, restrict modifications
    if (answeredCorrectly) return;

    setSelectedOptionIndex(optionIndex);
    setShowCorrectionWarning(false);

    if (optionIndex === correctOptionIndex) {
      // Answered CORRECTLY!
      setAnsweredCorrectly(true);
      setIsPaused(true); // Stop time-decay
      setShowCorrectionWarning(false);
    } else {
      // Answered INCORRECTLY!
      // Deduct 400 points
      setCurrentScore((prev) => {
        const next = prev - 400;
        return next < 0 ? 0 : next;
      });
      setShowCorrectionWarning(true);
      // Wait a secondary timeout or keep warning active until another choice
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setAnsweredCorrectly(false);
      setShowCorrectionWarning(false);
      setIsPaused(false); // Resume time-decay
    } else {
      // Completed last question
      onQuizComplete(currentScore);
    }
  };

  // Helper to format currency for the header
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("th-TH", { style: "decimal" }).format(val);
  };

  return (
    <div id="quiz-container" className="max-w-4xl mx-auto py-4 px-4">
      
      {/* HUD Header Status Panel using glass styling from Vibrant Palette */}
      <div className="glass-panel p-5 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center text-sm shadow-xl">
        
        {/* Left: Active Company Context */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-bu-orange flex items-center justify-center text-bu-orange font-bold text-center text-xs shadow-lg shrink-0">
            {setup.brandName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-black text-lg flex items-center gap-2 tracking-tight">
              <span>{setup.brandName.toUpperCase()}</span>
              <span className="text-xs bg-bu-purple text-purple-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {activeForm?.title.split(" (")[0]}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold flex flex-wrap gap-x-2.5">
              <span>กิจกรรม: <span className="text-white">{activeActivity?.title.split(" (")[0]}</span></span>
              <span className="text-gray-600">|</span>
              <span>รายได้: <span className="text-bu-orange">{formatCurrency(setup.annualRevenue)} ฿</span></span>
            </div>
          </div>
        </div>

        {/* Right: Score Counter & Time Decay Meter */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
          
          {/* Active Timer status */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-white/10">
            <Clock className={`h-4 w-4 ${answeredCorrectly ? "text-gray-500" : "text-bu-orange animate-pulse"}`} />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">คะแนนหักช้า ๆ (-2/วินาที)</span>
          </div>

          {/* Gamified Score Dashboard */}
          <div className="bg-gradient-to-r from-[#F27D26] to-[#512D6D] border border-white/20 px-6 py-2 rounded-xl text-right min-w-[140px] shadow-lg">
            <span className="block text-[9px] text-purple-100 uppercase tracking-widest font-bold">Current Score</span>
            <span className="text-2xl font-mono font-black text-white">
              {formatCurrency(currentScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Question Sheet */}
        <div id="quiz-question-card" className="lg:col-span-2 glass-panel p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[500px]">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
            {/* Dynamic Progress indicator */}
            <div 
              className="h-1 bg-gradient-to-r from-bu-orange to-bu-purple transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>

          <div>
            {/* Question Counter info */}
            <div className="flex items-center justify-between mb-5 mt-2">
              <span className="text-xs bg-bu-purple/35 text-purple-200 border border-bu-purple/60 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                หมวดหมู่: {activeQuestion.title}
              </span>
              <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">
                ข้อ {currentQuestionIndex + 1} จาก {totalQuestions}
              </span>
            </div>

            {/* Main Question Body */}
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
              {activeQuestion.questionText}
            </h2>

            {/* Selection Choices Container */}
            <div className="space-y-3">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const isCorrect = idx === correctOptionIndex;
                
                let btnStyle = "bg-white/5 border-white/10 text-gray-200 hover:border-bu-orange/50 hover:bg-bu-orange/5";
                
                if (answeredCorrectly) {
                  if (isCorrect) {
                     btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-100 font-bold";
                  } else if (isSelected) {
                     btnStyle = "bg-white/5 border-white/10 text-gray-500 opacity-60";
                  } else {
                     btnStyle = "bg-white/5 border-white/5 text-gray-500 opacity-40";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-red-950/60 border-red-500 text-red-200";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionSelect(idx)}
                    disabled={answeredCorrectly && !isCorrect}
                    className={`w-full text-left p-4 rounded-xl border-2 text-sm sm:text-base leading-relaxed transition-all flex items-start gap-4 cursor-pointer business-card ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 mt-0.5 bg-slate-900 border-white/20 text-white">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Control footer */}
          <div className="mt-8 border-t border-white/10 pt-5">
            
            {showCorrectionWarning && (
              <div id="wrong-answer-warning" className="p-4 bg-red-950/50 border border-red-500/50 rounded-xl flex items-center justify-center gap-3 text-red-100 animate-shake font-bold">
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
                <span className="text-sm">ลองใหม่</span>
              </div>
            )}

            {answeredCorrectly && (
              <div id="correct-answer-feedback" className="p-5 bg-gradient-to-r from-emerald-950/60 to-slate-900/80 border border-emerald-500/50 rounded-xl space-y-3.5 text-slate-100 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-wider">
                  <CheckCircle className="h-5 w-5" />
                  <span>ตอบถูกต้อง! (หยุดเวลาหักคะแนนกองกลางชั่วคราว)</span>
                </div>
                
                <div className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  <strong className="text-emerald-300 font-bold block mb-1 flex items-center gap-1.5 font-sans uppercase tracking-widest text-[11px]">
                    <BookOpen className="h-4 w-4 text-bu-orange animate-pulse" />
                    อรรถาธิบายหลักเกณฑ์ประมวลรัษฎากร/พ.ร.บ.การบัญชี:
                  </strong>
                  {activeQuestion.getExplanation(setup)}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 bg-bu-orange hover:bg-bu-orange/92 text-white font-bold text-sm py-2.5 px-6 rounded-full transition-transform hover:scale-103 active:scale-95 cursor-pointer shadow-md uppercase tracking-wide"
                  >
                    {currentQuestionIndex + 1 === totalQuestions ? "เสร็จสมบูรณ์รับผลประเมิน" : "ศึกษาเสร็จแล้วคำถามถัดไป"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            {!answeredCorrectly && !showCorrectionWarning && (
              <p className="text-center text-xs text-gray-500 italic uppercase tracking-wider">
                คลิกเลือกคำตอบที่ต้องสงสัยเพื่อดำเนินการประเมินผล
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Scenario Helper & Hint Book */}
        <div className="space-y-5">
          
          {/* Action Center Info Box */}
          <div className="glass-panel p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-bu-orange" />
              กลเกมคะแนน Gamification
            </h3>
            <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-bu-purple mt-1.5 shrink-0" />
                <span>ความเร็วคือกุญแจหลัก คะแนนจะถดถอยช้าๆ 2 คะแนนทุกวินาทีในกระบวนการพิจารณาโจทย์</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span>หลีกเลี่ยงการเลือกเดาสุ่ม หากคลิกตัวเลือกที่ผิด จะถูกหักลงโทษสถิติทันทีครั้งละ <b className="text-red-400 font-bold">400 คะแนน</b></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>เมื่อตอบวิเคราะห์ถูก นาฬิกาประเมินเวลาจะหยุดชั่วคราว เพื่อให้นักศึกษาได้อ่านทำความเข้าใจ</span>
              </li>
            </ul>
          </div>

          {/* Back/Abort Game */}
          <button
            onClick={onBackToSetup}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 text-xs py-2.5 px-4 rounded-xl border border-white/10 hover:border-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-semibold tracking-wider"
          >
            ยกเลิกและตั้งค่าธุรกิจใหม่
          </button>
        </div>

      </div>
    </div>
  );
}
