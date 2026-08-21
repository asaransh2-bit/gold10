import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCode2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Cpu,
  Database,
  Code2,
  Terminal,
  Play
} from 'lucide-react';
import { CODE_SNIPPETS } from '../data/codeSnippets';
import { ArchitectureSnippet } from '../types';

export const ArchitectureView: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('cloud-function-purchase');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sandboxLog, setSandboxLog] = useState<{ type: 'success' | 'error' | 'info'; message: string }[]>([]);

  const selectedSnippet = CODE_SNIPPETS.find((s) => s.id === selectedSnippetId) || CODE_SNIPPETS[0];

  const handleCopy = (snippet: ArchitectureSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (snippet: ArchitectureSnippet) => {
    const element = document.createElement('a');
    const file = new Blob([snippet.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = snippet.filename.split('/').pop() || 'snippet.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Interactive Security Rules Tester
  const runSecurityTest = (testType: 'client_write' | 'cross_user_read' | 'admin_function_call') => {
    if (testType === 'client_write') {
      setSandboxLog((prev) => [
        {
          type: 'error',
          message: `[BLOCKED BY FIRESTORE RULES] Client attempted direct write: db.collection("users").doc("usr_asaransh2").update({ goldBalance: 99999 }) -> Error: FirebaseError: Missing or insufficient permissions. Evaluated 'allow write: if false;'`
        },
        ...prev
      ]);
    } else if (testType === 'cross_user_read') {
      setSandboxLog((prev) => [
        {
          type: 'error',
          message: `[BLOCKED BY FIRESTORE RULES] User 'usr_asaransh2' attempted to read document 'users/usr_swiss_vault_audit' -> Error: FirebaseError: Permission Denied. Evaluated 'allow read: if request.auth.uid == userId;' (false)`
        },
        ...prev
      ]);
    } else {
      setSandboxLog((prev) => [
        {
          type: 'success',
          message: `[AUTHORIZED] Cloud Function invoked via Firebase Admin SDK (Service Account Privileges). Atomic transaction executed -> users/usr_asaransh2 goldBalance incremented +2.0 GOLD10. EVM signature generated.`
        },
        ...prev
      ]);
    }
  };

  return (
    <div id="architecture-view-container" className="space-y-6">
      
      {/* Top Banner: Lead Architect Overview */}
      <div className="bg-[#0a0a0a] border border-[#d4af3722] rounded-sm p-6 sm:p-8 text-[#d4af37] relative overflow-hidden shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-[#d4af3722]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-semibold bg-[#050505] text-[#d4af37] border border-[#d4af3744]">
                Lead Architect Specification
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-white uppercase tracking-widest mt-1">
              GOLD10 Technical & Security Reference Architecture
            </h2>
          </div>

          <span className="text-[11px] font-mono text-zinc-400">
            Firebase Auth + Firestore + Cloud Functions + EVM Bridge
          </span>
        </div>

        {/* 3 Pillars Architecture Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="p-5 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-2">
            <div className="text-[#d4af37] font-serif uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#d4af37]" />
              1. Cloud Functions & Admin SDK
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Strictly handles all purchase, transfer, and mint logic. Uses atomic <code className="text-[#d4af37] font-mono">db.runTransaction()</code> and signs EVM mint receipts.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-2">
            <div className="text-emerald-400 font-serif uppercase tracking-wider font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              2. Zero-Trust Security Rules
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Users can only read their own <code className="text-[#d4af37] font-mono">users/{'{userId}'}</code> document. Client writes are locked with <code className="text-rose-400 font-mono">allow write: if false;</code>.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-[#050505] border border-[#d4af3722] space-y-2">
            <div className="text-sky-400 font-serif uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              3. Real-Time Web SDK React Hook
            </div>
            <p className="text-zinc-300 leading-relaxed">
              React client reads balances using Firebase modular <code className="text-sky-300 font-mono">onSnapshot()</code> for instantaneous zero-latency live sync.
            </p>
          </div>

        </div>
      </div>

      {/* Code Snippets Browser */}
      <div className="bg-[#0a0a0a] border border-[#d4af3722] rounded-sm p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Navigation Tabs for Snippets */}
        <div className="flex flex-wrap gap-2 pb-5 border-b border-[#d4af3722]">
          {CODE_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => setSelectedSnippetId(snippet.id)}
              className={`px-4 py-2.5 rounded-sm text-xs font-serif uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedSnippetId === snippet.id
                  ? 'bg-[#d4af37] text-black font-bold border border-[#d4af37]'
                  : 'bg-[#050505] text-[#d4af37] hover:text-white border border-[#d4af3722] hover:border-[#d4af3744]'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              {snippet.title}
            </button>
          ))}
        </div>

        {/* Snippet Header & Metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">
                {selectedSnippet.filename}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#050505] text-[#d4af37aa] font-mono border border-[#d4af3722]">
                {selectedSnippet.language}
              </span>
            </div>
            <p className="text-xs text-[#d4af37aa] mt-1">
              {selectedSnippet.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(selectedSnippet)}
              className="px-3.5 py-1.5 bg-[#050505] hover:bg-[#d4af37] hover:text-black text-[#d4af37] border border-[#d4af3744] text-xs font-serif uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors"
            >
              {copiedId === selectedSnippet.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload(selectedSnippet)}
              className="px-3.5 py-1.5 bg-[#050505] hover:bg-[#d4af37] hover:text-black text-[#d4af37] border border-[#d4af3744] text-xs font-serif uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* Key Security Highlights */}
        <div className="p-4 rounded-sm bg-[#050505] border border-[#d4af3722] text-xs space-y-2">
          <span className="font-serif uppercase tracking-widest text-[#d4af37] text-[10px] font-semibold">
            Security & Implementation Highlights:
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-zinc-300 list-disc list-inside text-[11px]">
            {selectedSnippet.securityHighlights.map((h, i) => (
              <li key={i} className="text-zinc-300">
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Code Content Container */}
        <div className="relative rounded-sm bg-[#050505] border border-[#d4af3722] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a0a] border-b border-[#d4af3722] text-xs text-[#d4af37aa] font-mono">
            <span>{selectedSnippet.filename}</span>
            <span className="text-emerald-400">Production Ready</span>
          </div>

          <pre className="p-4 sm:p-5 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed max-h-[480px]">
            <code>{selectedSnippet.code}</code>
          </pre>
        </div>

      </div>

      {/* Interactive Security Sandbox: Test Rules & Cloud Functions */}
      <div className="bg-[#0a0a0a] border border-[#d4af3722] rounded-sm p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af3722]">
          <div>
            <h3 className="text-base font-serif uppercase tracking-widest text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#d4af37]" />
              Interactive Security Rules & Admin SDK Sandbox
            </h3>
            <p className="text-xs text-[#d4af37aa]">
              Simulate security rule evaluations live to verify that client-side attacks are blocked and Cloud Functions succeed.
            </p>
          </div>
        </div>

        {/* Action Buttons to trigger simulation */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => runSecurityTest('client_write')}
            className="px-4 py-2.5 rounded-sm bg-[#050505] hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-serif uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            1. Test Direct Client-Side Write (Blocked)
          </button>

          <button
            onClick={() => runSecurityTest('cross_user_read')}
            className="px-4 py-2.5 rounded-sm bg-[#050505] hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-serif uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            2. Test Cross-User Document Read (Blocked)
          </button>

          <button
            onClick={() => runSecurityTest('admin_function_call')}
            className="px-4 py-2.5 rounded-sm bg-[#050505] hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-serif uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            3. Test Cloud Function Admin SDK Transaction (Authorized)
          </button>
        </div>

        {/* Sandbox Console Output */}
        <div className="bg-[#050505] rounded-sm border border-[#d4af3722] p-4 font-mono text-xs space-y-2 min-h-[140px] max-h-[240px] overflow-y-auto">
          <div className="text-[#d4af37aa] text-[10px] uppercase tracking-wider pb-1 border-b border-[#d4af3711]">
            Security Sandbox Console Output:
          </div>

          {sandboxLog.length === 0 ? (
            <div className="text-zinc-600 italic text-[11px]">
              Click any of the test buttons above to run simulated Firestore security rules checks.
            </div>
          ) : (
            sandboxLog.map((log, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-sm text-[11px] leading-relaxed break-all ${
                  log.type === 'error'
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    : log.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-[#0a0a0a] text-zinc-300'
                }`}
              >
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
