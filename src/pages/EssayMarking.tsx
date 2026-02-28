import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Save, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Essay {
  student: string; question: string; answer: string; maxMarks: number; givenMarks: number | null; saved: boolean;
}

const initialEssays: Essay[] = [
  { student: "Kwame Asante", question: "Explain the process of photosynthesis in detail.", answer: "Photosynthesis is the process by which green plants convert light energy into chemical energy. It takes place in the chloroplasts, specifically using chlorophyll. The process involves two main stages: the light-dependent reactions and the Calvin cycle. During light reactions, water molecules are split, releasing oxygen and producing ATP and NADPH. In the Calvin cycle, carbon dioxide is fixed into glucose using ATP and NADPH from the light reactions. The overall equation is: 6CO2 + 6H2O → C6H12O6 + 6O2.", maxMarks: 20, givenMarks: null, saved: false },
  { student: "Ama Serwaa", question: "Discuss the causes and effects of deforestation.", answer: "Deforestation is caused by logging, agriculture, and urbanization. The main effects include loss of biodiversity, climate change, soil erosion, and disruption of water cycles. Forests act as carbon sinks, so their destruction releases carbon dioxide into the atmosphere.", maxMarks: 20, givenMarks: null, saved: false },
  { student: "Kofi Mensah", question: "Explain the process of photosynthesis in detail.", answer: "Plants use sunlight to make food. They take in CO2 and water and produce glucose and oxygen. This happens in the leaves.", maxMarks: 20, givenMarks: null, saved: false },
];

export default function EssayMarking() {
  const [essays, setEssays] = useState<Essay[]>(initialEssays);

  const updateMarks = (index: number, marks: number) => {
    setEssays(essays.map((e, i) => i === index ? { ...e, givenMarks: marks, saved: false } : e));
  };

  const saveMarks = (index: number) => {
    const essay = essays[index];
    if (essay.givenMarks === null || essay.givenMarks < 0) { toast.error("Please enter valid marks"); return; }
    if (essay.givenMarks > essay.maxMarks) { toast.error(`Marks cannot exceed ${essay.maxMarks}`); return; }
    setEssays(essays.map((e, i) => i === index ? { ...e, saved: true } : e));
    toast.success(`Marks saved for ${essay.student}: ${essay.givenMarks}/${essay.maxMarks}`);
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Essay Marking" }]}>
      <div className="page-header">
        <h1 className="page-title">Essay Marking</h1>
        <p className="page-subtitle">Review and score student essay answers</p>
      </div>

      <div className="space-y-4">
        {essays.map((essay, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">{essay.student}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Max Marks: {essay.maxMarks}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${essay.saved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {essay.saved ? <><CheckCircle className="w-3 h-3" /> Marked</> : "Pending Review"}
              </span>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question</label><p className="text-sm text-foreground mt-1 font-medium">{essay.question}</p></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Answer</label><p className="text-sm text-foreground mt-1 bg-muted/50 rounded-lg p-3 leading-relaxed">{essay.answer}</p></div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Marks:</label>
                  <input type="number" max={essay.maxMarks} min={0} value={essay.givenMarks ?? ""} onChange={e => updateMarks(i, Number(e.target.value))} placeholder="0" className="w-20 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground text-center outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="text-sm text-muted-foreground">/ {essay.maxMarks}</span>
                </div>
                <button onClick={() => saveMarks(i)} disabled={essay.saved} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${essay.saved ? "bg-success/10 text-success cursor-default" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
                  {essay.saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Marks</>}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </MainLayout>
  );
}
