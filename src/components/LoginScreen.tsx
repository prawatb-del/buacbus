import React, { useState, useEffect } from "react";
import { LogIn, Key, Award, GraduationCap, Calculator } from "lucide-react";
import { PlayerInfo } from "../types";

interface LoginProps {
  onLoginSuccess: (info: PlayerInfo) => void;
  onEnterAdmin: () => void;
}

export default function LoginScreen({ onLoginSuccess, onEnterAdmin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorVisible, setErrorVisible] = useState("");
  
  // Secret admin code state
  const [badgeClicks, setBadgeClicks] = useState(0);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  // Clear click counter if inactive for 2.5 seconds
  const handleBadgeClick = () => {
    setBadgeClicks((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        setShowPasscodeModal(true);
        setAdminPasscode("");
        setPasscodeError("");
        return 0; // reset
      }
      return nextCount;
    });

    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    const timer = setTimeout(() => {
      setBadgeClicks(0);
    }, 2500);
    setClickTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (clickTimer) clearTimeout(clickTimer);
    };
  }, [clickTimer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorVisible("กรุณาระบุชื่อผู้เข้าเล่นก่อนเริ่มต้นเกม");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorVisible("กรุณาระบุรูปแบบอีเมลที่ถูกต้อง (เช่น student@bu.ac.th)");
      return;
    }
    setErrorVisible("");
    onLoginSuccess({
      username: username.trim(),
      email: email.trim(),
    });
  };

  const verifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === "BUADMIN2024") {
      setShowPasscodeModal(false);
      onEnterAdmin();
    } else {
      setPasscodeError("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div id="login-container" className="flex flex-col items-center justify-center min-h-[85vh] py-6 px-4">
      
      {/* Dynamic Animated Glowing Card matching Vibrant Palette theme */}
      <div id="login-card" className="w-full max-w-lg glass-panel shadow-2xl p-8 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-bu-orange to-bu-purple"></div>
        
        {/* BU Accounting Logo Badge (Secret Click Target) */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <button
            type="button"
            id="bu-accounting-badge"
            onClick={handleBadgeClick}
            className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-950 border-2 border-bu-orange hover:border-bu-purple p-2 cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-bu-orange/20 animate-none"
            title="Bangkok University Accounting Department"
          >
            {/* Visual element representing School Emblem */}
            <div className="absolute inset-0 rounded-full bg-bu-orange/5 animate-ping group-hover:bg-bu-purple/10 duration-1000"></div>
            <div className="flex flex-col items-center justify-center text-center">
              <GraduationCap className="h-8 w-8 text-bu-orange group-hover:text-amber-400 transition-colors" />
              <Calculator className="h-4 w-4 text-purple-400 group-hover:text-bu-orange -mt-1" />
              <span className="text-[7.5px] font-bold tracking-widest text-white mt-1 uppercase">BU ACCT</span>
            </div>
            
            {/* Quick click feedback to help teachers/initiators know it registers */}
            {badgeClicks > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-bu-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                {badgeClicks}
              </span>
            )}
          </button>
          
          <h2 className="text-xs font-bold tracking-wider text-purple-300 uppercase mt-4 text-center">
            คณะบัญชี มหาวิทยาลัยกรุงเทพ
          </h2>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 text-center">
            BUSINESS <span className="text-bu-orange">MASTERMIND</span>
          </h1>
          <p className="text-xs text-gray-400 mt-2 text-center max-w-xs uppercase tracking-widest font-semibold">
            Simulation by Bangkok University Accounting
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorVisible && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {errorVisible}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              ชื่อผู้เข้าเล่น <span className="text-bu-orange">*</span>
            </label>
            <input
              type="text"
              id="player-name-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อ-นามสกุล ของคุณ (ไทย หรือ อังกฤษ)"
              className="w-full bg-white/5 border border-white/20 text-white placeholder-slate-500 focus:border-bu-orange focus:ring-1 focus:ring-bu-orange rounded-xl px-4 py-3 text-base outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              อีเมลติดต่อ <span className="text-bu-orange">*</span>
            </label>
            <input
              type="email"
              id="player-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ตัวอย่าง student@bu.ac.th หรือ gmail"
              className="w-full bg-white/5 border border-white/20 text-white placeholder-slate-500 focus:border-bu-purple focus:ring-1 focus:ring-bu-purple rounded-xl px-4 py-3 text-base outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            id="login-submit-button"
            className="w-full flex items-center justify-center gap-2 bg-bu-orange hover:bg-bu-orange/90 text-white font-bold text-base py-3.5 px-6 rounded-xl cursor-pointer shadow-lg shadow-bu-orange/15 transition-transform hover:scale-102 active:scale-95 mt-6 uppercase tracking-wider"
          >
            <LogIn className="h-5 w-5" />
            เข้าสู่เกมหลัก
          </button>
        </form>

        {/* Footer info decoration */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 header font-semibold">
          <span>BU Account Simulator v2026</span>
          <span className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-bu-orange" />
            Gamified Tax Learning
          </span>
        </div>
      </div>

      {/* Secret Admin Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm glass-panel shadow-2xl p-6 relative">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bu-purple/20 text-bu-purple mb-4 mx-auto">
              <Key className="h-6 w-6 text-bu-orange" />
            </div>
            
            <h3 className="text-xl font-bold text-white text-center mb-1">
              ระบบผู้ดูแลระบบ (Secret Access)
            </h3>
            <p className="text-xs text-gray-400 text-center mb-4">
              กรุณาระบุรหัสผ่านฝ่ายบริหารเพื่อตรวจสอบตารางคะแนนนักศึกษา
            </p>

            <form onSubmit={verifyPasscode} className="space-y-4">
              {passcodeError && (
                <div className="p-2.5 bg-red-950/80 border border-red-500/50 rounded-lg text-red-300 text-xs text-center">
                  {passcodeError}
                </div>
              )}

              <input
                type="password"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                placeholder="ป้อนรหัสแอดมิน 10 หลักลับ"
                autoFocus
                className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-2.5 text-center text-lg tracking-widest focus:ring-1 focus:ring-bu-purple outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasscodeModal(false)}
                  className="flex-1 bg-white/5 text-slate-300 hover:bg-white/10 font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-bu-orange hover:bg-bu-orange/95 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
                >
                  ยืนยันเข้าใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
