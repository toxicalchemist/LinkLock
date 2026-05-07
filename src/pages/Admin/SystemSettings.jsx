import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/api';
import { Settings, ShieldAlert, Clock, Network, ServerCrash } from 'lucide-react';
import { useSnackbar } from '../../context/SnackbarContext';

const SystemSettings = () => {
  const [settings, setSettings] = useState({ 
    maintenanceMode: false, 
    enforce2FA: false,
    retentionPeriod: 604800,
    companyIpRange: ''
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useSnackbar();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        if (res) {
          setSettings({
            maintenanceMode: res.maintenanceMode || false,
            enforce2FA: res.enforce2FA || false,
            retentionPeriod: res.retentionPeriod || res.globalMaxExpiry || 604800,
            companyIpRange: res.companyIpRange || ''
          });
        }
      } catch (err) {
        showToast('Failed to load system settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleSave = async () => {
    try {
      await updateSettings({
        ...settings,
        globalMaxExpiry: settings.retentionPeriod // keep backwards compatibility
      });
      showToast('POLICY_ENFORCED: System parameters updated.', 'success');
    } catch (err) {
      showToast('FAILED_TO_UPDATE_POLICY', 'error');
    }
  };

  if (loading) return <div className="text-slate-500 font-mono animate-pulse p-8">[ LOADING_SETTINGS ]</div>;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-[#2A2A2A] pb-6">
        <h1 className="text-3xl font-light tracking-tight text-slate-100 flex items-center gap-3">
          <Settings className="text-copper" /> Corporate Policies
        </h1>
        <p className="text-slate-500 font-mono text-sm mt-2">Manage global governance rules and security parameters.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Enforce 2FA */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-slate-800 p-2 rounded-lg"><ShieldAlert size={20} className="text-copper" /></div>
            <div>
              <h3 className="text-lg font-medium text-slate-200">Enforce 2FA for all links</h3>
              <p className="text-slate-500 text-sm font-mono mt-1">Require Multi-Factor Authentication for any recipient attempting to unlock a secure payload.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.enforce2FA} 
              onChange={(e) => setSettings({...settings, enforce2FA: e.target.checked})} 
            />
            <div className="w-14 h-7 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-copper peer-checked:after:bg-white border border-[#3A3A3A]"></div>
          </label>
        </div>

        {/* Retention Period */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-slate-800 p-2 rounded-lg"><Clock size={20} className="text-copper" /></div>
            <div>
              <h3 className="text-lg font-medium text-slate-200">Maximum Retention Period</h3>
              <p className="text-slate-500 text-sm font-mono mt-1">The maximum allowable lifespan for any payload before automatic data scrub.</p>
            </div>
          </div>
          <select 
            value={settings.retentionPeriod}
            onChange={(e) => setSettings({...settings, retentionPeriod: parseInt(e.target.value)})}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg py-3 px-4 text-slate-300 font-mono text-sm focus:border-copper outline-none transition-colors w-full md:w-48 shrink-0"
          >
            <option value={86400}>24 Hours</option>
            <option value={172800}>48 Hours</option>
            <option value={604800}>7 Days</option>
          </select>
        </div>

        {/* IP Range */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col gap-4 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-slate-800 p-2 rounded-lg"><Network size={20} className="text-copper" /></div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-200">Restrict to Company IP Range</h3>
              <p className="text-slate-500 text-sm font-mono mt-1 mb-4">Limit access to LinkLock payload creation and viewing to specific corporate network addresses (CIDR format).</p>
              <input 
                type="text" 
                placeholder="e.g., 192.168.1.0/24, 10.0.0.0/8" 
                value={settings.companyIpRange}
                onChange={(e) => setSettings({...settings, companyIpRange: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3 text-slate-300 font-mono text-sm focus:border-copper outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-[#121212] border border-red-900/30 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/5 pointer-events-none"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="mt-1 bg-red-900/20 p-2 rounded-lg border border-red-900/50"><ServerCrash size={20} className="text-red-500" /></div>
            <div>
              <h3 className="text-lg font-medium text-slate-200 text-red-100">Maintenance Mode</h3>
              <p className="text-slate-500 text-sm font-mono mt-1">Halt all new secure payload creation operations. Existing instances remain accessible.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 z-10">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.maintenanceMode} 
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} 
            />
            <div className="w-14 h-7 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white border border-[#3A3A3A]"></div>
          </label>
        </div>

        <div className="flex justify-end mt-4">
          <button 
            onClick={handleSave}
            className="bg-copper hover:bg-[#A3662A] text-slate-900 font-bold font-mono tracking-widest px-8 py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(184,115,51,0.2)] hover:shadow-[0_0_25px_rgba(184,115,51,0.4)] uppercase text-sm"
          >
            Commit Policy Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default SystemSettings;
