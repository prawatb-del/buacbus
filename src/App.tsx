import React, { useState } from "react";
import { GraduationCap, Landmark, ShieldCheck, Heart, Users2, HelpCircle } from "lucide-react";
import { GameScreen, PlayerInfo, BusinessSetup } from "./types";
import LoginScreen from "./components/LoginScreen";
import SetupScreen from "./components/SetupScreen";
import QuizScreen from "./components/QuizScreen";
import SummaryScreen from "./components/SummaryScreen";
import AdminScreen from "./components/AdminScreen";

export default function App() {
  const [screen, setScreen] = useState<GameScreen>("LOGIN");
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [businessSetup, setBusinessSetup] = useState<BusinessSetup | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);

  const handleLoginSuccess = (info: PlayerInfo) => {
    setPlayerInfo(info);
    setScreen("SETUP");
  };

  const handleEnterAdminScreen = () => {
    setScreen("ADMIN");
  };

  const handleSetupComplete = (setup: BusinessSetup) => {
    setBusinessSetup(setup);
    setScreen("QUIZ");
  };

  const handleQuizComplete = (score: number) => {
    setFinalScore(score);
    setScreen("SUMMARY");
  };

  const handleRestartGame = () => {
    // Keep player profile, just restart business setup
    setBusinessSetup(null);
    setFinalScore(0);
    setScreen("SETUP");
  };

  const handleBackToLogin = () => {
    setScreen("LOGIN");
  };

  return (
    <div id="game-root" className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-orange-500/30 selection:text-white">
      
      {/* Premium Bangkok University Co-Branded Header Bar */}
      <header id="game-global-header" className="bg-slate-950 border-b border-purple-500/25 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          {/* Logo Brand Cluster */}
          <div className="flex items-center gap-3">
            {/* Academic Insignia Indicator */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-500/10">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
                <span>BUSINESS MASTERMIND</span>
                {screen === "ADMIN" && (
                  <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                    ADMIN MODE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                <span>คณะบัญชี มหาวิทยาลัยกรุงเทพ</span>
                <span className="text-orange-500">•</span>
                <span>BU ACCOUNTING SCHOOL</span>
              </div>
            </div>
          </div>

          {/* User Presence Badge (Only shown when active) */}
          {playerInfo && screen !== "LOGIN" && screen !== "ADMIN" && (
            <div id="user-header-status" className="hidden sm:flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-slate-400 font-medium">ผู้เล่น:</span>
              <span className="font-bold text-slate-100">{playerInfo.username}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Core Viewport */}
      <main id="game-main-content" className="flex-grow py-8 px-2 sm:px-4 relative">
        {screen === "LOGIN" && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onEnterAdmin={handleEnterAdminScreen}
          />
        )}

        {screen === "SETUP" && (
          <SetupScreen
            onBack={handleBackToLogin}
            onSetupComplete={handleSetupComplete}
            initialSetup={businessSetup}
          />
        )}

        {screen === "QUIZ" && businessSetup && (
          <QuizScreen
            setup={businessSetup}
            onQuizComplete={handleQuizComplete}
            onBackToSetup={handleRestartGame}
          />
        )}

        {screen === "SUMMARY" && playerInfo && businessSetup && (
          <SummaryScreen
            player={playerInfo}
            setup={businessSetup}
            score={finalScore}
            onRestart={handleRestartGame}
          />
        )}

        {screen === "ADMIN" && (
          <AdminScreen onBackToLogin={handleBackToLogin} />
        )}
      </main>

      {/* Responsive Elegant Fine Footer */}
      <footer id="game-global-footer" className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 คณะบัญชี มหาวิทยาลัยกรุงเทพ. สงวนลิขสิทธิ์ความรู้หลักสูตร.</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 hover:text-orange-400 transition-colors">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
              มาตรฐานวิชาชีพ
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 hover:text-purple-400 transition-colors">
              <Heart className="h-3.5 w-3.5 text-purple-500" />
              สร้างฝันสตาร์ทอัพ
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
