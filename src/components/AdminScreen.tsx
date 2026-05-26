import React, { useEffect, useState } from "react";
import { ArrowLeft, Trash2, FileSpreadsheet, RefreshCw, Layers, Award, ShieldAlert, Sparkles, Database, CheckCircle, Clock } from "lucide-react";
import { ScoreRecord } from "../types";

interface AdminProps {
  onBackToLogin: () => void;
}

export default function AdminScreen({ onBackToLogin }: AdminProps) {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchScores = async () => {
    setLoading(true);
    setApiError("");
    setSuccessMsg("");
    try {
      const resp = await fetch("/api/scores");
      if (resp.ok) {
        const data = await resp.json();
        // Sort descending by score/date
        data.sort((a: ScoreRecord, b: ScoreRecord) => b.score - a.score);
        setScores(data);
      } else {
        throw new Error("ล้มเหลวในการโหลดรายการจากเว็บเซอร์วิส");
      }
    } catch (err) {
      setApiError("ไม่สามารถติดต่อเซิร์ฟเวอร์หลักเพื่อดึงตารางคะแนนได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleDeleteAll = async () => {
    setLoading(true);
    setApiError("");
    try {
      const resp = await fetch("/api/scores", { method: "DELETE" });
      if (resp.ok) {
        setScores([]);
        setSuccessMsg("ล้มล้างตารางหน่วยผลคะแนนทั้งหมดครบถ้วน!");
        setShowConfirmDelete(false);
      } else {
        throw new Error("ไม่สามารถลบข้อมูลผู้เล่นได้");
      }
    } catch (err) {
      setApiError("เกิดข้อผิดพลาดในการรันคอมมานด์ล้างข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (scores.length === 0) {
      alert("ไม่มีพบตัวเลขคะแนนสะสมที่สามารถส่งออกได้ในขณะนี้");
      return;
    }

    // Standard CSV headers in Thai with BOM for Excel UTF-8 compatibility
    const headers = [
      "ID ย้อนหลัง",
      "ชื่อผู้เล่น",
      "อีเมลนศ.",
      "ชื่อแบรนด์/แบรนด์ธุรกิจ",
      "กลุ่มกิจกรรมหลัก",
      "ประเภทจัดตั้งกฎหมาย",
      "ประมาณการรายได้ต่อปี (บาท)",
      "ประมาณการสินทรัพย์รวม (บาท)",
      "ประมาณการทุนจดทะเบียน (บาท)",
      "คะแนนสอบประเมินได้",
      "วันเวลาที่ทำกิจกรรมเสร็จ"
    ];

    const csvRows = [headers.join(",")];

    for (const row of scores) {
      const cleanField = (field: any) => {
        const str = String(field || "").replace(/"/g, '""');
        return `"${str}"`;
      };

      const values = [
        cleanField(row.id),
        cleanField(row.username),
        cleanField(row.email),
        cleanField(row.brandName),
        cleanField(row.businessActivity),
        cleanField(row.businessType),
        row.revenue,
        row.assets,
        row.capital,
        row.score,
        cleanField(row.completedAt)
      ];
      csvRows.push(values.join(","));
    }

    const csvString = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Business_Mastermind_Scores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("th-TH", { style: "decimal" }).format(val);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("th-TH") + " - " + d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div id="admin-container" className="max-w-7xl mx-auto py-6 px-4">
      
      {/* Top action header info alignment */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 col-span-full">
        <button
          onClick={onBackToLogin}
          id="admin-to-login-btn"
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับสู่หน้าล็อกอินเข้าเกม
        </button>

        <div className="flex items-center gap-2 text-xs text-bu-purple font-mono tracking-wider font-extrabold uppercase">
          <Database className="h-4 w-4 text-bu-orange animate-pulse" />
          ระบบสารสนเทศคณาจารย์บัญชี BU
        </div>
      </div>

      <div className="text-center sm:text-left mb-8">
        <h1 className="text-3xl font-black text-white flex items-center justify-center sm:justify-start gap-2.5 uppercase tracking-tight">
          <Layers className="h-8 w-8 text-bu-orange animate-bounce duration-1000" />
          ศูนย์ผู้จัดการคะแนน <span className="text-bu-orange">ADMIN PANEL</span>
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          อาจารย์ผู้สอนสามารถตรวจสอบตัวเลขการสอบประเมินความเร็วและความแม่นยำด้านภาษีอากรนิติบุคคล/บุคคลธรรมดาของนักศึกษาแบบเรียลไทม์
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm text-center font-bold mb-6 flex items-center justify-center gap-2 animate-bounce">
          <CheckCircle className="h-5 w-5" />
          {successMsg}
        </div>
      )}

      {apiError && (
        <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-sm text-center mb-6">
          {apiError}
        </div>
      )}

      {/* Control Tools panel */}
      <div className="glass-panel p-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-200 font-bold uppercase tracking-wider">ยอดส่งรายงานประเมิน:</span>
          <span className="bg-bu-orange/20 text-bu-orange border border-bu-orange/40 px-3.5 py-1 rounded-full font-mono text-base font-black">
            {scores.length} รายการ
          </span>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={fetchScores}
            id="admin-refresh-btn"
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
            title="Reload Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            รีเฟรชตาราง
          </button>

          <button
            onClick={downloadCSV}
            disabled={scores.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            <FileSpreadsheet className="h-4 w-4" />
            ดาวน์โหลด Excel (CSV)
          </button>

          <button
            onClick={() => setShowConfirmDelete(true)}
            disabled={scores.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-950 hover:bg-red-900 text-red-100 text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer border border-red-500/30 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            ล้างผลคะแนนทั้งหมด
          </button>
        </div>
      </div>

      {/* Scores Grid / Desktop Table */}
      <div className="glass-panel overflow-hidden shadow-2xl p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 border-collapse table-auto">
            <thead>
              <tr className="bg-slate-950 text-gray-400 border-b border-white/5 text-xs uppercase tracking-wider font-extrabold">
                <th className="px-6 py-4">อันดับผู้เรียน</th>
                <th className="px-6 py-4">นักศึกษา / อีเมล</th>
                <th className="px-6 py-4">รายละเอียดกิจการที่จัดตั้ง</th>
                <th className="px-6 py-4 text-right">รายได้จำลอง / ทุน</th>
                <th className="px-6 py-4 text-right">คะแนนประเมินได้</th>
                <th className="px-6 py-4 text-center">ส่งรายงานผล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {scores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-500 italic">
                    <Database className="h-10 w-10 text-bu-orange mx-auto mb-3 animate-pulse" />
                    ยังไม่มีข้อมูลผลการส่งคะแนนในขณะนี้ สั่งให้นักศึกษาเริ่มต้นเล่นเพื่อบันทึกข้อมูล
                  </td>
                </tr>
              ) : (
                scores.map((rec, index) => {
                  let badge = null;
                  if (index === 0) {
                    badge = <span className="bg-amber-500/15 border border-amber-500/35 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">🥇 แชมป์เปี้ยน</span>;
                  } else if (index === 1) {
                    badge = <span className="bg-slate-400/15 border border-slate-400/35 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">🥈 รองชนะเลิศ A</span>;
                  } else if (index === 2) {
                    badge = <span className="bg-amber-800/15 border border-amber-800/35 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">🥉 รองชนะเลิศ B</span>;
                  } else {
                    badge = <span className="text-gray-500 text-xs font-mono font-bold">อันดับที่ {index + 1}</span>;
                  }

                  return (
                    <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold">
                        {badge}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white shrink-0 font-sans tracking-tight">{rec.username}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{rec.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-black text-orange-200 uppercase tracking-tight">
                          {rec.brandName.toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium">
                          {rec.businessActivity} | <span className="text-bu-purple text-[11px] font-bold">{rec.businessType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs">
                        <div className="text-emerald-400 font-bold">รายได้: {formatCurrency(rec.revenue)} ฿</div>
                        <div className="text-slate-400 mt-0.5 font-semibold">ทุนจด: {formatCurrency(rec.capital)} ฿</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-bu-orange to-amber-300 font-mono">
                          {formatCurrency(rec.score)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-400 font-mono">
                        {formatDate(rec.completedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secret confirm dialog for safety */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4 mx-auto">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            
            <h3 className="text-lg font-bold text-white text-center mb-1">
              ต้องการลบข้อมูลคะแนนทั้งหมดจริงหรือ?
            </h3>
            <p className="text-xs text-red-300 text-center mb-4 leading-relaxed">
              * คำเตือน: ระบบจะดำเนินการทำลายคะแนนสะสมทั้งหมดของนักศึกษาในระบบอย่างถาวร ไม่สามารถกู้ข้อมูลคืนมาได้ในกาลข้างหน้า
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                ยกเลิกการลบ
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                ลบแบบถาวร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
