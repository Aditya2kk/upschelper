import React, { useState } from 'react';
import { GraduationCap, CheckCircle2, HelpCircle, MessageSquare, BookOpen, Sparkles, Filter } from 'lucide-react';

export const UpscHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PRELIMS' | 'MAINS' | 'INTERVIEW'>('PRELIMS');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Civil Services Exam Hub</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          UPSC Current Affairs & Exam Preparation
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Structured preparation for Prelims key facts, Mains analytical answer structures, and Interview perspective builder.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('PRELIMS')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'PRELIMS'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Prelims Facts</span>
        </button>

        <button
          onClick={() => setActiveTab('MAINS')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'MAINS'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mains Answer Structures</span>
        </button>

        <button
          onClick={() => setActiveTab('INTERVIEW')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'INTERVIEW'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Interview Perspectives</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'PRELIMS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
              ENVIRONMENT & SPECIES
            </span>
            <h3 className="font-bold text-white text-base">Great Indian Bustard (Ardeotis nigriceps)</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p>• <strong>IUCN Status:</strong> Critically Endangered</p>
              <p>• <strong>Habitat:</strong> Arid and semi-arid grasslands in Rajasthan (Desert National Park)</p>
              <p>• <strong>Threats:</strong> Overhead powerlines collision, habitat fragmentation</p>
              <p>• <strong>Supreme Court Ruling:</strong> Right to be free from adverse impacts of climate change linked to Articles 14 & 21.</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300">
              INTERNATIONAL ORGANIZATIONS
            </span>
            <h3 className="font-bold text-white text-base">International Seabed Authority (ISA)</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p>• <strong>Headquarters:</strong> Kingston, Jamaica</p>
              <p>• <strong>Established under:</strong> UN Convention on the Law of the Sea (UNCLOS) 1982</p>
              <p>• <strong>India Mandate:</strong> Exploration rights for Polymetallic Nodules in Central Indian Ocean Basin.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MAINS' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300">
                GS-III: SCIENCE & TECHNOLOGY
              </span>
              <span className="text-xs text-slate-400 font-semibold">15 Marks / 250 Words</span>
            </div>

            <h3 className="font-bold text-white text-lg leading-snug">
              Question: "Analyze the strategic and economic significance of the India Semiconductor Mission in establishing a resilient global supply chain."
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
              <p className="font-semibold text-purple-300 uppercase tracking-wider text-[11px]">Model Answer Structure:</p>
              <p><strong>1. Introduction (30 words):</strong> Define semiconductor geopolitics & India's current 100% import dependency for advanced nodes.</p>
              <p><strong>2. Strategic Significance (80 words):</strong> Reduces reliance on single-geography foundries (Taiwan/China); strengthens defence electronics sovereignty.</p>
              <p><strong>3. Challenges (60 words):</strong> Capital intensity, ultra-pure water requirement, talent gap in sub-micron photolithography.</p>
              <p><strong>4. Way Forward (50 words):</strong> Focus on compound semiconductors (SiC/GaN), fabless design incentive schemes, and QUAD semiconductor partnership.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'INTERVIEW' && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Personality Test Simulation: AI Governance</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Question:</strong> "Should India opt for strict AI regulation like the EU AI Act, or an innovation-first approach like the US?"
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
            <p className="font-semibold text-amber-300">Balanced Viewpoint Strategy:</p>
            <p>1. Acknowledge India's unique position as a developer of Digital Public Infrastructure (DPI).</p>
            <p>2. Advocate for a hybrid 'risk-based regulation' framework protecting citizen data while enabling startup sandbox innovation.</p>
          </div>
        </div>
      )}
    </div>
  );
};
