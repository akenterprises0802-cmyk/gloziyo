import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Server, 
  ShieldCheck, 
  UploadCloud, 
  Copy, 
  Check,
  Info,
  Globe,
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';
import { DbStatus, fetchDbStatus, reconnectDb, bulkSyncToRemote } from '../utils/dbSync';
import { Employee } from '../types';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onRefreshData?: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  employees,
}) => {
  const [activeTab, setActiveTab] = useState<'domain' | 'database'>('domain');
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const CNAME_TARGET = 'ais-pre-qtfyw2x7cq6lnbbdulmz6y-405869311891.asia-east1.run.app';

  const loadStatus = async () => {
    setLoading(true);
    setSyncResult(null);
    const data = await fetchDbStatus();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const handleReconnect = async () => {
    setLoading(true);
    setSyncResult(null);
    const data = await reconnectDb();
    setStatus(data);
    setLoading(false);
  };

  const handleBulkSync = async () => {
    if (!status?.connected) return;
    setSyncing(true);
    setSyncResult(null);
    const res = await bulkSyncToRemote(employees);
    setSyncing(false);
    if (res.success) {
      setSyncResult(`Successfully synchronized ${res.synced} employee records to Hostinger MySQL!`);
    } else {
      setSyncResult('Sync failed. Please check Hostinger database permissions.');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadHostingerHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Employee Management System - GLOZIYO SERVICES</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="icon" href="https://ais-pre-qtfyw2x7cq6lnbbdulmz6y-405869311891.asia-east1.run.app/favicon.ico">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: #0b1120;
    }
    #app-frame {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  </style>
</head>
<body>
  <iframe 
    id="app-frame"
    src="https://ais-pre-qtfyw2x7cq6lnbbdulmz6y-405869311891.asia-east1.run.app" 
    allow="camera; microphone; clipboard-read; clipboard-write; fullscreen; download"
    title="Employee Management System - GLOZIYO SERVICES">
  </iframe>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              {activeTab === 'domain' ? <Globe className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Hostinger Integration</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                  gloziyoemp.org
                </span>
              </h2>
              <p className="text-xs text-slate-400">Domain DNS Setup & MySQL Database Synchronization</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'domain'
                ? 'border-emerald-600 text-emerald-700 font-bold bg-white rounded-t-lg -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Domain Setup (www.gloziyoemp.org)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'border-emerald-600 text-emerald-700 font-bold bg-white rounded-t-lg -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>MySQL Database (gloziyofire.com)</span>
            {status?.connected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700">
          
          {/* TAB 1: DOMAIN SETUP */}
          {activeTab === 'domain' && (
            <div className="space-y-4">
              
              {/* Direct Application Link Card */}
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Application Live Production URL
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Live Cloud Host
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <code className="text-xs text-emerald-400 font-mono flex-1 truncate select-all">
                    https://ais-pre-qtfyw2x7cq6lnbbdulmz6y-405869311891.asia-east1.run.app
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('https://ais-pre-qtfyw2x7cq6lnbbdulmz6y-405869311891.asia-east1.run.app', 'appUrl')}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    {copiedKey === 'appUrl' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'appUrl' ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadHostingerHtml}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Ready index.html for Hostinger</span>
                  </button>

                  <a
                    href="https://ais-pre-qtfyw2x7cq6lnbbdulmz6y-405869311891.asia-east1.run.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Open Live App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Highlight card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Connect www.gloziyoemp.org in Hostinger Domains
                      </h4>
                      <p className="text-xs text-emerald-900/90 mt-0.5 leading-relaxed">
                        Add a <strong>CNAME</strong> record in your Hostinger Domains dashboard to route your domain directly to this application.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://hpanel.hostinger.com/domains"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
                  >
                    <span>Open hPanel Domains</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step by step box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Exact Steps in Hostinger hPanel &gt; Domains</span>
                </h4>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      In <a href="https://hpanel.hostinger.com/domains" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">hpanel.hostinger.com/domains</a>, click on <strong>gloziyoemp.org</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      In the left sidebar menu, click on <strong>DNS / Nameservers</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <div>
                      Scroll to <strong>Manage DNS records</strong> and add (or edit) the record with these exact values:
                    </div>
                  </div>
                </div>

                {/* DNS Record Table Representation */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs mt-2 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Field</th>
                        <th className="py-2 px-3">Value to Enter in Hostinger</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-600">Type</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">CNAME</td>
                        <td className="py-2 px-3 text-right text-slate-400 text-[11px]">Select CNAME</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-600">Name</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">www</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => copyToClipboard('www', 'name')}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'name' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'name' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </td>
                      </tr>
                      <tr className="bg-emerald-50/40">
                        <td className="py-2 px-3 font-semibold text-slate-600">Target / Points to</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800 break-all text-[11px]">
                          {CNAME_TARGET}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(CNAME_TARGET, 'target')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            {copiedKey === 'target' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'target' ? 'Copied' : 'Copy Target'}</span>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-600">TTL</td>
                        <td className="py-2 px-3 font-mono text-slate-700">300 (or Default)</td>
                        <td className="py-2 px-3 text-right text-slate-400 text-[11px]">Default</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex items-start gap-2.5 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                  <div>
                    Click <strong>Add Record</strong> (or <strong>Update</strong>). DNS propagation typically takes 5 to 15 minutes.
                  </div>
                </div>
              </div>

              {/* Root domain note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>To also support http://gloziyoemp.org (without www):</strong>
                  In Hostinger hPanel, go to <strong>Websites &gt; Redirects</strong>, and set a 301 Permanent Redirect from <code>gloziyoemp.org</code> to <code>https://www.gloziyoemp.org</code>.
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MYSQL DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              
              {/* Status Box */}
              <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                status?.connected 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-start gap-3">
                  {status?.connected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {status?.connected 
                        ? 'Connected to Hostinger MySQL Database' 
                        : status?.configured 
                        ? 'Database Configured - Connecting / Waiting for Remote MySQL Access' 
                        : 'Awaiting Hostinger MySQL Credentials'}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90">
                      {status?.connected
                        ? `Active connection established to database "${status.database}" on host "${status.host}". Tables auto-synchronized.`
                        : status?.error || 'Enter your Hostinger MySQL details from hPanel to activate central database synchronization.'}
                    </p>
                    {status?.lastChecked && (
                      <p className="text-[10px] font-mono mt-1 opacity-70">
                        Last probe: {new Date(status.lastChecked).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReconnect}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Checking...' : 'Test Connection'}</span>
                </button>
              </div>

              {/* Sync Box if Connected */}
              {status?.connected && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-950">
                        Hostinger Database Synchronization Active
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                      Live MySQL Pool
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    New and updated employee records are automatically written to your Hostinger MySQL database. You can also push all {employees.length} local records right now.
                  </p>
                  {syncResult && (
                    <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-lg font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{syncResult}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleBulkSync}
                    disabled={syncing}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                  >
                    <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                    <span>{syncing ? 'Synchronizing Records...' : `Push All ${employees.length} Records to Hostinger MySQL`}</span>
                  </button>
                </div>
              )}

              {/* Hostinger hPanel Quick Instructions */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Hostinger MySQL Credentials Setup
                    </h4>
                  </div>
                  <a
                    href="https://hpanel.hostinger.com/websites/gloziyofire.com/databases/my-sql-databases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Open MySQL Databases</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-xs text-slate-600 space-y-2">
                  <p>
                    1. In Hostinger hPanel &gt; Databases &gt; <strong>Remote MySQL</strong>, enter <code>%</code> to authorize outside connections.
                  </p>
                  <p>
                    2. Copy your MySQL Host, Database name, User, and Password from the Hostinger MySQL databases list.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Offline Resiliency Guarantee */}
          <div className="p-3 bg-slate-100 rounded-xl flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Zero-Downtime Guarantee:</strong> Your records are securely preserved in the browser and ready to synchronize whenever your Hostinger database or domain is active.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>GLOZIYO SERVICES PVT LTD • Hostinger Cloud Integration</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
