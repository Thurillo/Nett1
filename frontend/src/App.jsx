// frontend/src/App.jsx - 21/02/2026 - V 0.21
import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Server, Monitor, Globe, Network,
  Settings, Plus, Trash2, Edit, Search, HardDrive,
  Radar, Play, Activity, Clock, CheckCircle, AlertCircle,
  Share2, GitCommit, Link as LinkIcon, FolderTree, Hash,
  FileText, Download, History, BarChart3, Cpu, Laptop,
  ExternalLink, Info, Users, ShieldCheck, BookOpen, Database,
  X, Check, ChevronRight, Save, AlertTriangle
} from 'lucide-react';

// =========================================================================
// DATI MOCK INIZIALI
// =========================================================================

const initialRacks = [
  { id: 1, name: 'RACK-A01', site: 'Milano HQ', height: 42, location: 'Sala Server 1' },
];

const initialDevices = [
  {
    id: 1,
    name: 'SW-CORE-01',
    type: 'Switch',
    model: 'Cisco Catalyst 9300',
    ip: '192.168.1.1',
    locationType: 'rack',
    rackId: 1,
    position: 42,
    height: 1,
    status: 'attivo',
    description: 'Switch di core primario del data center',
    portCount: 48,
    ports: []
  },
];

const initialDeviceTypes = [
  { id: 1, name: 'Server', isRackable: true, category: 'network' },
  { id: 2, name: 'Switch', isRackable: true, category: 'network' },
  { id: 3, name: 'Router', isRackable: true, category: 'network' },
  { id: 4, name: 'Firewall', isRackable: true, category: 'network' },
  { id: 5, name: 'Patch Panel', isRackable: true, category: 'network' },
  { id: 6, name: 'Notebook', isRackable: false, category: 'peripheral' },
];

// =========================================================================
// COMPONENTI ATOMICI & UI
// =========================================================================

const SidebarItem = ({ icon: Icon, label, view, currentView, setCurrentView }) => (
  <div
    onClick={() => setCurrentView(view)}
    className={`flex items-center space-x-3 p-2.5 rounded-lg cursor-pointer transition-all ${
      currentView === view ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const NavSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

// =========================================================================
// VISTE DELL'APPLICAZIONE
// =========================================================================

// --- DASHBOARD ---
const Dashboard = ({ racks, devices, apiStatus }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Panoramica Sistema</h2>
        <p className="text-slate-500 text-sm">Stato dell'infrastruttura DCIM in tempo reale.</p>
      </div>
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${apiStatus === 'connected' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
        <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
        <span>{apiStatus === 'connected' ? 'Database Connesso' : 'Modalità Standalone'}</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Rack Totali', val: racks.length, icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Apparati', val: devices.length, icon: HardDrive, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Subnet IPAM', val: 0, icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Connessioni', val: 0, icon: GitCommit, color: 'text-orange-600', bg: 'bg-orange-50' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800">{stat.val}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- RACKS VIEW ---
const RacksView = ({ racks, setRacks, devices, setDevices, deviceTypes, apiStatus }) => {
  const [selectedRack, setSelectedRack] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRack, setNewRack] = useState({ name: '', site: '', height: 42 });
  const [editSlot, setEditSlot] = useState(null);

  const handleAddRack = async (e) => {
    e.preventDefault();
    const payload = { ...newRack, id: Date.now() };
    if (apiStatus === 'connected') {
      try {
        const res = await fetch('/api/v1/racks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRack) });
        setRacks([...racks, await res.json()]);
      } catch (e) { setRacks([...racks, payload]); }
    } else { setRacks([...racks, payload]); }
    setIsAdding(false);
    setNewRack({ name: '', site: '', height: 42 });
  };

  const deleteRack = async (id) => {
    if (apiStatus === 'connected') await fetch(`/api/v1/racks/${id}`, { method: 'DELETE' });
    setRacks(racks.filter(r => r.id !== id));
  };

  const saveSlotAllocation = async (e) => {
    e.preventDefault();
    const devId = parseInt(editSlot.existingDeviceId);
    if (!devId) return;

    const targetDev = devices.find(d => d.id === devId);
    const updatedDev = { ...targetDev, rackId: selectedRack.id, locationType: 'rack', position: editSlot.u, height: editSlot.h || 1 };

    if (apiStatus === 'connected') {
      try {
        await fetch(`/api/v1/devices/${devId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedDev) });
      } catch (e) {}
    }
    setDevices(devices.map(d => d.id === devId ? updatedDev : d));
    setEditSlot(null);
  };

  if (selectedRack) {
    let units = [];
    for (let u = selectedRack.height; u >= 1; u--) {
      const dev = devices.find(d => d.rackId === selectedRack.id && d.position === u && d.locationType === 'rack');
      if (dev) {
        units.push({ type: 'device', u, device: dev });
        u -= ((dev.height || 1) - 1);
      } else {
        const covered = devices.find(d => d.rackId === selectedRack.id && d.locationType === 'rack' && u >= d.position && u < d.position + (d.height || 1));
        if (!covered) units.push({ type: 'empty', u });
      }
    }

    const freeDevices = devices.filter(d => !d.rackId && deviceTypes.find(dt => dt.name === d.type)?.isRackable);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button onClick={() => setSelectedRack(null)} className="flex items-center text-slate-500 hover:text-blue-600 font-bold transition-colors">
            <X size={20} className="mr-2"/> Chiudi Rack
          </button>
          <div className="text-right">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selectedRack.name}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase">{selectedRack.site || 'Sito non specificato'} • {selectedRack.height}U</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-80 bg-slate-800 p-4 rounded-2xl shadow-2xl border-x-[12px] border-slate-900 ring-4 ring-slate-200/50">
            <div className="text-center text-slate-600 font-mono text-[9px] mb-4 uppercase tracking-[0.3em] border-b border-slate-700 pb-3">Front Infrastructure</div>
            <div className="space-y-1">
              {units.map(item => (
                item.type === 'empty' ? (
                  <div key={item.u} onClick={() => setEditSlot({ u: item.u, h: 1, existingDeviceId: '' })} className="h-8 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-700/50 rounded flex items-center px-2 cursor-pointer group transition-all">
                    <span className="text-[9px] text-slate-600 font-mono w-6">U{item.u}</span>
                    <Plus size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 ml-2 transition-opacity"/>
                  </div>
                ) : (
                  <div key={item.device.id} className="bg-blue-600 border-2 border-blue-400 rounded-md flex items-center px-2 shadow-lg overflow-hidden group relative" style={{ height: `calc(${item.device.height * 2.25}rem)` }}>
                    <span className="text-[9px] text-blue-200 font-mono w-6 font-black">U{item.u}</span>
                    <div className="flex flex-col ml-2 truncate">
                      <span className="text-white text-[10px] font-black truncate">{item.device.name}</span>
                      <span className="text-blue-200 text-[8px] uppercase font-bold">{item.device.type}</span>
                    </div>
                    <button onClick={() => setDevices(devices.map(d => d.id === item.device.id ? {...d, rackId: null} : d))} className="absolute right-2 opacity-0 group-hover:opacity-100 bg-blue-700 p-1 rounded text-white hover:bg-red-600 transition-all shadow-md">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {editSlot ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 animate-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-800 uppercase tracking-wide flex items-center">
                    <Plus size={18} className="mr-2 text-blue-600"/> Alloca in U{editSlot.u}
                  </h3>
                  <button onClick={() => setEditSlot(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                </div>
                <form onSubmit={saveSlotAllocation} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seleziona apparato libero</label>
                    <select required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editSlot.existingDeviceId} onChange={e => setEditSlot({...editSlot, existingDeviceId: e.target.value})}>
                      <option value="">-- Scegli dall'inventario --</option>
                      {freeDevices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type})</option>)}
                    </select>
                    {freeDevices.length === 0 && <p className="text-[10px] text-amber-600 font-bold mt-2">Nessun apparato libero compatibile con montaggio a rack.</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Ingombro (U)</label>
                      <input type="number" min="1" max="10" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={editSlot.h} onChange={e => setEditSlot({...editSlot, h: parseInt(e.target.value)})}/>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" disabled={!editSlot.existingDeviceId} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all">Conferma Allocazione</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-slate-400">
                <Monitor size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-sm">Clicca su un'unità vuota del rack</p>
                <p className="text-xs">per assegnare un apparato dall'inventario</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Armadi Rack</h2>
          <p className="text-slate-500 text-sm">Gestione fisica degli armadi e del loro contenuto.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-blue-700 shadow-md transition-all active:scale-95">
          {isAdding ? <X size={18} /> : <Plus size={18} />} <span>{isAdding ? 'Annulla' : 'Aggiungi Rack'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddRack} className="bg-white p-6 rounded-2xl shadow-lg border border-blue-50 flex gap-6 items-end animate-in fade-in slide-in-from-top-4">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Identificativo Rack</label>
            <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={newRack.name} onChange={e => setNewRack({...newRack, name: e.target.value})} placeholder="Es. RACK-B02" />
          </div>
          <div className="w-40">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Capacità (U)</label>
            <input required type="number" min="12" max="52" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={newRack.height} onChange={e => setNewRack({...newRack, height: parseInt(e.target.value)})} />
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-700 h-[44px] shadow-lg shadow-emerald-100">Crea</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {racks.map(rack => {
          const usedU = devices.filter(d => d.rackId === rack.id).reduce((acc, curr) => acc + (curr.height || 1), 0);
          const percent = Math.round((usedU / rack.height) * 100);
          return (
            <div key={rack.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><Server size={24}/></div>
                <button onClick={() => deleteRack(rack.id)} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{rack.name}</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                  <span>Saturazione</span>
                  <span className={percent > 80 ? 'text-red-500' : 'text-slate-600'}>{usedU} / {rack.height} U</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${percent > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                </div>
              </div>
              <button onClick={() => setSelectedRack(rack)} className="w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm">Gestisci Layout</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- INVENTORY VIEW (NETWORK & PERIPHERALS) ---
const InventoryView = ({ category, title, devices, setDevices, deviceTypes, racks, apiStatus }) => {
  const validTypes = deviceTypes.filter(dt => dt.category === category).map(t => t.name);
  const filtered = devices.filter(d => validTypes.includes(d.type));

  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: validTypes[0] || '', ip: '', description: '', portCount: 0 });

  const resetForm = () => {
    setForm({ name: '', type: validTypes[0] || '', ip: '', description: '', portCount: 0 });
    setEditing(null);
    setIsAdding(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form, category, status: 'attivo' };

    if (editing) {
      if (apiStatus === 'connected') {
        try {
          await fetch(`/api/v1/devices/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        } catch (e) {}
      }
      setDevices(devices.map(d => d.id === editing.id ? { ...d, ...payload } : d));
    } else {
      if (apiStatus === 'connected') {
        try {
          const res = await fetch('/api/v1/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, ports: [] }) });
          setDevices([...devices, await res.json()]);
        } catch (e) { setDevices([...devices, { ...payload, id: Date.now() }]); }
      } else { setDevices([...devices, { ...payload, id: Date.now() }]); }
    }
    resetForm();
  };

  const deleteDevice = async (id) => {
    if (apiStatus === 'connected') await fetch(`/api/v1/devices/${id}`, { method: 'DELETE' });
    setDevices(devices.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
          <p className="text-slate-500 text-sm">Registro completo degli apparati presenti a inventario.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-blue-700 shadow-md transition-all active:scale-95">
          {isAdding ? <X size={18} /> : <Plus size={18} />} <span>{isAdding ? 'Annulla' : 'Nuovo Apparato'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-xl border border-blue-50 animate-in slide-in-from-top-6">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 flex items-center">
            {editing ? <Edit size={16} className="mr-2 text-blue-600"/> : <Plus size={16} className="mr-2 text-blue-600"/>}
            {editing ? 'Modifica Scheda Apparato' : 'Registrazione Nuovo Apparato'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Etichetta / Nome</label>
              <input required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Es. SRV-BACKUP-01" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tipologia</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {validTypes.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Indirizzo IP</label>
              <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono" value={form.ip} onChange={e => setForm({...form, ip: e.target.value})} placeholder="0.0.0.0" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Descrizione Funzionale</label>
              <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Es. Server dedicato al backup notturno dei volumi NFS" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">N. Porte Fisiche</label>
              <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={form.portCount} onChange={e => setForm({...form, portCount: parseInt(e.target.value)})} />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50">Annulla</button>
            <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-100 flex items-center">
              <Save size={16} className="mr-2"/> Salva Dati
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dettagli Apparato</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rete / Porte</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locazione</th>
              <th className="p-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-slate-300 font-bold italic">Nessun apparato registrato.</td></tr>
            ) : (
              filtered.map(dev => (
                <tr key={dev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5">
                    <div className="font-black text-slate-800 tracking-tight">{dev.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{dev.type}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">{dev.description || 'Nessuna nota tecnica'}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-mono text-xs text-blue-600 font-bold">{dev.ip || '---.---.---.---'}</div>
                    <div className="text-[10px] text-slate-400 font-black mt-1 uppercase flex items-center">
                      <GitCommit size={10} className="mr-1"/> {dev.portCount || 0} Porte Fisiche
                    </div>
                  </td>
                  <td className="p-5">
                    {dev.rackId ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded w-fit">Rack: {racks.find(r => r.id === dev.rackId)?.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 px-2">Posizione: U{dev.position}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">Non Installato</span>
                    )}
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => { setForm({ name: dev.name, type: dev.type, ip: dev.ip || '', description: dev.description || '', portCount: dev.portCount || 0 }); setEditing(dev); setIsAdding(true); }} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16}/></button>
                    <button onClick={() => deleteDevice(dev.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- VIEW: DEVICE TYPES ---
const DeviceTypesView = ({ types, setTypes, devices, apiStatus }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'network', isRackable: true });

  const resetForm = () => {
    setForm({ name: '', category: 'network', isRackable: true });
    setEditing(null);
    setIsAdding(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editing) {
      if (apiStatus === 'connected') {
        try {
          await fetch(`/api/v1/device-types/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        } catch (e) {}
      }
      setTypes(types.map(t => t.id === editing.id ? { ...t, ...form } : t));
    } else {
      if (apiStatus === 'connected') {
        try {
          const res = await fetch('/api/v1/device-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
          setTypes([...types, await res.json()]);
        } catch (e) { setTypes([...types, { ...form, id: Date.now() }]); }
      } else { setTypes([...types, { ...form, id: Date.now() }]); }
    }
    resetForm();
  };

  const startEdit = (type) => {
    setEditing(type);
    setForm({ name: type.name, category: type.category, isRackable: type.isRackable });
    setIsAdding(true);
  };

  const deleteType = async (id) => {
    const type = types.find(t => t.id === id);
    const isInUse = devices.some(d => d.type === type.name);
    if (isInUse) {
      // In un'app reale mostreremmo un messaggio all'utente
      console.warn("Impossibile eliminare: tipo in uso.");
      return;
    }
    if (apiStatus === 'connected') await fetch(`/api/v1/device-types/${id}`, { method: 'DELETE' });
    setTypes(types.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tipi di Dispositivo</h2>
          <p className="text-slate-500 text-sm">Classificazione degli apparati per tipologia e ingombro.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-blue-700 shadow-md">
          {isAdding ? <X size={18} /> : <Plus size={18} />} <span>{isAdding ? 'Annulla' : 'Nuovo Tipo'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-lg border border-blue-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center">
              {editing ? <Edit size={16} className="mr-2 text-blue-600"/> : <Plus size={16} className="mr-2 text-blue-600"/>}
              {editing ? 'Modifica Categoria' : 'Nuova Categoria'}
            </h3>
            {editing && devices.some(d => d.type === editing.name) && (
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-bold uppercase">Nome bloccato: categoria in uso nell'inventario</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Nome Categoria</label>
              <input
                required
                className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm ${editing && devices.some(d => d.type === editing.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                disabled={editing && devices.some(d => d.type === editing.name)}
                placeholder="Es. Access Point"
              />
            </div>
            <div className="w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Gruppo Logico</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="network">Infrastruttura di Rete</option>
                <option value="peripheral">Endpoint & Periferiche</option>
              </select>
            </div>
            <div className="flex items-center space-x-3 mb-3 px-2">
              <input type="checkbox" id="rackable" className="w-4 h-4 rounded text-blue-600" checked={form.isRackable} onChange={e => setForm({...form, isRackable: e.target.checked})} />
              <label htmlFor="rackable" className="text-[10px] font-black text-slate-500 uppercase cursor-pointer">Rackable</label>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
             <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50">Annulla</button>
             <button type="submit" className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-700 h-[44px] shadow-lg">Salva Modifiche</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gruppo</th>
              <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Montaggio Rack</th>
              <th className="p-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {types.map(t => {
              const inUse = devices.some(d => d.type === t.name);
              return (
                <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="p-5">
                    <div className="font-black text-slate-700 tracking-tight">{t.name}</div>
                    {inUse && <div className="text-[9px] font-black text-blue-500 uppercase mt-0.5">In uso nell'inventario</div>}
                  </td>
                  <td className="p-5 text-xs text-slate-500 font-bold uppercase">{t.category === 'network' ? 'Network' : 'Peripheral'}</td>
                  <td className="p-5 text-center">{t.isRackable ? <Check className="text-green-500 mx-auto" size={18}/> : <X className="text-slate-300 mx-auto" size={18}/>}</td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => startEdit(t)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16}/></button>
                    <button
                      onClick={() => deleteType(t.id)}
                      disabled={inUse}
                      className={`p-2 rounded-lg transition-all ${inUse ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                    >
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- PLACEHOLDER VIEW ---
const PlaceholderView = ({ title, icon: Icon, msg }) => (
  <div className="flex flex-col items-center justify-center h-[500px] text-slate-300 bg-white rounded-[40px] border border-dashed border-slate-200">
    <div className="p-8 bg-slate-50 rounded-full mb-6 ring-4 ring-slate-25"><Icon size={64} className="opacity-20" /></div>
    <h3 className="text-xl font-black text-slate-700 uppercase tracking-tight">{title}</h3>
    <p className="text-sm max-w-xs text-center mt-3 text-slate-400 font-medium leading-relaxed">{msg || 'Questo modulo è attualmente in fase di integrazione architetturale.'}</p>
  </div>
);

// =========================================================================
// MAIN CONTAINER
// =========================================================================

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [racks, setRacks] = useState(initialRacks);
  const [devices, setDevices] = useState(initialDevices);
  const [deviceTypes, setDeviceTypes] = useState(initialDeviceTypes);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Correzione URL per ambienti Canvas/Proxy
        const baseUrl = window.location.origin;
        const resHealth = await fetch(`${baseUrl}/health`).catch(() => null);

        if (resHealth && resHealth.ok) {
          setApiStatus('connected');
          const [r, d, t] = await Promise.all([
            fetch(`${baseUrl}/api/v1/racks`).then(res => res.json()),
            fetch(`${baseUrl}/api/v1/devices`).then(res => res.json()),
            fetch(`${baseUrl}/api/v1/device-types`).then(res => res.json())
          ]);
          setRacks(r); setDevices(d); setDeviceTypes(t);
        } else {
          setApiStatus('disconnected');
          console.warn("Backend offline o non raggiungibile. Utilizzo dati simulati.");
        }
      } catch (err) {
        setApiStatus('disconnected');
        console.error("Errore inizializzazione dati:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-slate-100/30 font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-800 text-white flex flex-col shadow-2xl z-20 flex-shrink-0 border-r border-slate-700/50">
        <div className="p-6 flex items-center space-x-3 bg-slate-900/50 mb-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20"><Network size={22} className="text-white" /></div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">NETT<span className="text-blue-400">1</span></h1>
            <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">Enterprise DCIM</span>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-2 overflow-y-auto scrollbar-hide">
          <NavSection title="Infrastruttura">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" view="dashboard" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={Server} label="Armadi Rack" view="racks" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={Network} label="Dispositivi Rete" view="devices" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={Laptop} label="Periferiche & End" view="peripherals" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={Cpu} label="Tipi Dispositivo" view="device-types" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={GitCommit} label="Cablaggi Fisici" view="cabling" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={ShieldCheck} label="Contratti Supporto" view="contracts" currentView={currentView} setCurrentView={setCurrentView} />
          </NavSection>

          <NavSection title="Network Logic">
            <SidebarItem icon={Share2} label="Mappa Topologia" view="topology" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={Globe} label="Gestione IPAM" view="ipam" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={Radar} label="Discovery Scan" view="discovery" currentView={currentView} setCurrentView={setCurrentView} />
          </NavSection>

          <NavSection title="Piattaforma">
            <SidebarItem icon={Users} label="Utenti & RBAC" view="users" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={FileText} label="Analisi Reports" view="reports" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={History} label="Audit Logs" view="audit" currentView={currentView} setCurrentView={setCurrentView} />
            <SidebarItem icon={Settings} label="Impostazioni" view="settings" currentView={currentView} setCurrentView={setCurrentView} />
          </NavSection>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nett1 Core</span>
            <ChevronRight size={14} />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">{currentView.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 tracking-tighter">Account Attivo</span>
              <span className="text-xs font-black text-blue-600 tracking-tight">System Admin</span>
            </div>
            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center font-black text-xs border border-slate-200">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10 bg-slate-50/30">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && <Dashboard racks={racks} devices={devices} apiStatus={apiStatus} />}
            {currentView === 'racks' && <RacksView racks={racks} setRacks={setRacks} devices={devices} setDevices={setDevices} deviceTypes={deviceTypes} apiStatus={apiStatus} />}
            {currentView === 'devices' && <InventoryView category="network" title="Dispositivi di Rete" devices={devices} setDevices={setDevices} deviceTypes={deviceTypes} racks={racks} apiStatus={apiStatus} />}
            {currentView === 'peripherals' && <InventoryView category="peripheral" title="Periferiche & Endpoint" devices={devices} setDevices={setDevices} deviceTypes={deviceTypes} racks={racks} apiStatus={apiStatus} />}
            {currentView === 'device-types' && <DeviceTypesView types={deviceTypes} setTypes={setDeviceTypes} devices={devices} apiStatus={apiStatus} />}

            {/* PLACEHOLDERS PER LE VISTE NON ANCORA IMPLEMENTATE */}
            {currentView === 'cabling' && <PlaceholderView title="Cablaggi Fisici" icon={GitCommit} msg="Modulo per la tracciatura delle patch tra switch, patch panel e terminazioni a muro." />}
            {currentView === 'contracts' && <PlaceholderView title="Contratti & Licenze" icon={ShieldCheck} msg="Gestione scadenze SmartNet, garanzie hardware e licenze software Enterprise." />}
            {currentView === 'topology' && <PlaceholderView title="Mappa Topologica" icon={Share2} msg="Generazione automatica del grafo di rete basata sui cablaggi registrati." />}
            {currentView === 'ipam' && <PlaceholderView title="Gestione IPAM" icon={Globe} msg="Tracciatura Subnet, DHCP Scopes e Indirizzi IP statici per l'intero perimetro aziendale." />}
            {currentView === 'discovery' && <PlaceholderView title="Discovery Scanner" icon={Radar} msg="Motore di scansione SNMP/ICMP per il rilevamento automatico di nuovi apparati sulla rete." />}
            {currentView === 'users' && <PlaceholderView title="Utenti & RBAC" icon={Users} msg="Gestione degli accessi, integrazione LDAP/AD e assegnazione permessi per ruolo." />}
            {currentView === 'reports' && <PlaceholderView title="Analisi Reports" icon={FileText} msg="Esportazione dati in formato CSV/PDF e visualizzazione grafici sulla saturazione delle risorse." />}
            {currentView === 'audit' && <PlaceholderView title="Audit Logs" icon={History} msg="Registro immutabile di tutte le operazioni effettuate sul database DCIM." />}
            {currentView === 'settings' && <PlaceholderView title="Impostazioni" icon={Settings} msg="Configurazione parametri globali, backup del database e preferenze di sistema." />}
            {currentView === 'apidocs' && <PlaceholderView title="Documentazione API" icon={BookOpen} msg="Riferimenti OpenAPI/Swagger per l'integrazione di script Python o Ansible con Nett1." />}
          </div>
        </div>
      </main>
    </div>
  );
}