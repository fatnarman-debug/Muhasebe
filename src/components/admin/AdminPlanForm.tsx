"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

interface Props {
  userId: string;
  currentPlan: string;
}

export function AdminPlanForm({ userId, currentPlan }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {[
          { value: "individual", label: "Bireysel", desc: "Tek şirket" },
          { value: "accountant", label: "Muhasebeci", desc: "Çoklu şirket" },
        ].map((p) => (
          <label key={p.value} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${plan === p.value ? "bg-blue-50 border-blue-300" : "border-slate-200 hover:border-slate-300"}`}>
            <input type="radio" name="plan" value={p.value} checked={plan === p.value} onChange={() => setPlan(p.value)} className="accent-blue-600" />
            <div>
              <div className="text-sm font-semibold text-slate-900">{p.label}</div>
              <div className="text-xs text-slate-500">{p.desc}</div>
            </div>
          </label>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={loading || plan === currentPlan}
        className="w-full h-9 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
        {saved ? "Kaydedildi" : "Planı Güncelle"}
      </button>
    </div>
  );
}
