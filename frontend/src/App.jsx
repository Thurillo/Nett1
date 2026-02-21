// frontend/src/App.jsx - 21/02/2026 - V 0.19
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Server, Monitor, Globe, Network,
  Settings, Plus, Trash2, Edit, Search, HardDrive,
  Radar, Play, Activity, Clock, CheckCircle, AlertCircle,
  Share2, GitCommit, Link as LinkIcon, FolderTree, Hash,
  FileText, Download, History, BarChart3, Cpu, Laptop,
  ExternalLink, Info, Users, ShieldCheck, BookOpen, Database,
  X, Check, ChevronRight
} from 'lucide-react';

// =========================================================================
// DATI MOCK (Iniziali)
// =========================================================================

const initialRacks = [
  { id: 1, name: 'RACK-A01', site: 'Milano HQ', height: 42, location: 'Sala Server 1' },
];

const initialDevices = [
  { id: 1, name: 'SW-CORE-01', type: 'Switch', model: 'Cisco Catalyst 9300', ip: '192.168.1.1', locationType: 'rack', rackId: 1, position: 42, height: 1, status: 'attivo', description: 'Core Switch primario', portCount: 48, ports: [] },
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
// COMPONENTI DI SUPPORTO (UI REUSABLE)
// =========================================================================

const SidebarItem = ({ icon: Icon, label, view, currentView, setCurrentView }) => (
  <div
    onClick={() => setCurrentView(view)}
    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
      currentView === view ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-2">{children}</div>
);

// =========================================================================
// VISTA: DASHBOARD
// =========================================================================

const DashboardView = ({ racks, devices, apiStatus }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold border ${apiStatus === 'connected' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200 animate-pulse'}`}>
        <Database size={12} className="mr-2"/> {apiStatus === 'connected' ? 'DB ONLINE' : 'OFFLINE (MOCK)'}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Server size={24} /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase">Rack</p><p className="text-2xl font-bold text-gray-800">{racks.length}</p></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><HardDrive size={24} /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase">Apparati</p><p className="text-2xl font-bold text-gray-800">{devices.length}</p></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Globe size={24} /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase">Subnet</p><p className="text-2xl font-bold text-gray-800">0</p></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><GitCommit size={24} /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase">Cablaggi</p><p className="text-2xl font-bold text-gray-800">0</p></div>
        </div>
      </div>
    </div>
  </div>
);

// =========================================================================
// MAIN APP COMPONENT
// =========================================================================

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [racks, setRacks] = useState(initialRacks);
  const [devices, setDevices] = useState(initialDevices);
  const [deviceTypes, setDeviceTypes] = useState(initialDeviceTypes);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const loadData = async () => {
      try {
        const resHealth = await fetch('/health');
        if (resHealth.ok) {
          setApiStatus('connected');
          const resRacks = await fetch('/api/v1/racks');
          if (resRacks.ok) setRacks(await resRacks.json());
          const resDevices = await fetch('/api/v1/devices');
          if (resDevices.ok) setDevices(await resDevices.json());
          const resTypes = await fetch('/api/v1/device-types');
          if (resTypes.ok) setDeviceTypes(await resTypes.json());
        } else { setApiStatus('disconnected'); }
      } catch (e) { setApiStatus('disconnected'); }
    };
    loadData();
  }, []);

  // --- VISTA: ARMADI RACK ---
  const RacksView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newRack, setNewRack] = useState({ name: '', site: '', height: 42, location: '' });
    const [selectedRack, setSelectedRack] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const handleAddRack = async (e) => {
      e.preventDefault();
      if (apiStatus === 'connected') {
        const res = await fetch('/api/v1/racks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRack)
        });
        setRacks([...racks, await res.json()]);
      } else {
        setRacks([...racks, { ...newRack, id: Date.now() }]);
      }
      setIsAdding(false);
      setNewRack({ name: '', site: '', height: 42 });
    };

    const deleteRack = async (id) => {
      if (apiStatus === 'connected') await fetch(`/api/v1/racks/${id}`, { method: 'DELETE' });
      setRacks(racks.filter(r => r.id !== id));
    };

    const saveDeviceToRack = async (e) => {
      e.preventDefault();
      const devId = parseInt(selectedSlot.existingDeviceId);
      if (!devId) return;

      const targetDev = devices.find(d => d.id === devId);
      const updatedDev = { ...targetDev, rackId: selectedRack.id, locationType: 'rack', position: selectedSlot.u, height: selectedSlot.h || 1 };

      if (apiStatus === 'connected') {
        await fetch(`/api/v1/devices/${devId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDev)
        });
      }
      setDevices(devices.map(d => d.id === devId ? updatedDev : d));
      setSelectedSlot(null);
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
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <button onClick={() => setSelectedRack(null)} className="flex items-center text-blue-600 font-bold hover:underline"><X size={20} className="mr-1"/> Chiudi Vista Rack</button>
            <h2 className="text-xl font-bold text-gray-800">{selectedRack.name} ({selectedRack.height}U)</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-80 bg-slate-800 p-4 rounded-lg shadow-2xl border-4 border-slate-900">
              <div className="text-center text-slate-500 font-mono text-[10px] mb-4 uppercase tracking-widest border-b border-slate-700 pb-2">Front Side</div>
              {units.map(item => (
                item.type === 'empty' ? (
                  <div key={item.u} onClick={() => setSelectedSlot({ u: item.u, h: 1, existingDeviceId: '' })} className="h-8 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded flex items-center px-2 cursor-pointer group mb-1 transition-colors">
                    <span className="text-[10px] text-slate-500 font-mono w-6">U{item.u}</span>
                    <Plus size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 ml-2"/>
                  </div>
                ) : (
                  <div key={item.device.id} className="bg-blue-500 border-2 border-blue-400 rounded flex items-center px-2 mb-1 shadow-inner overflow-hidden" style={{ height: `calc(${item.device.height * 2.25}rem)` }}>
                    <span className="text-[10px] text-blue-100 font-mono w-6 font-bold">U{item.u}</span>
                    <span className="text-white text-[11px] font-bold truncate ml-2">{item.device.name}</span>
                    <button onClick={() => setDevices(devices.map(d => d.id === item.device.id ? {...d, rackId: null} : d))} className="ml-auto text-blue-200 hover:text-white"><Trash2 size={12}/></button>
                  </div>
                )
              ))}
            </div>

            {selectedSlot && (
              <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-blue-100 sticky top-6 h-fit">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Plus size={18} className="mr-2 text-blue-600"/> Alloca Apparato in U{selectedSlot.u}</h3>
                <form onSubmit={saveDeviceToRack} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Seleziona apparato dall'Inventario</label>
                    <select required className="w-full p-2 border rounded" value={selectedSlot.existingDeviceId} onChange={e => setSelectedSlot({...selectedSlot, existingDeviceId: e.target.value})}>
                      <option value="">-- Seleziona un apparato libero --</option>
                      {freeDevices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Altezza (U)</label>
                    <input type="number" min="1" max="10" className="w-full p-2 border rounded" value={selectedSlot.h} onChange={e => setSelectedSlot({...selectedSlot, h: parseInt(e.target.value)})}/>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => setSelectedSlot(null)} className="px-4 py-2 border rounded">Annulla</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Assegna</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Infrastruttura Rack</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 shadow-sm">
            {isAdding ? <X size={18} /> : <Plus size={18} />} <span>{isAdding ? 'Annulla' : 'Aggiungi Rack'}</span>
          </button>
        </div>
        {isAdding && (
          <form onSubmit={handleAddRack} className="bg-white p-4 rounded-xl shadow-md border border-blue-100 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">NOME RACK</label>
              <input required type="text" className="w-full p-2 border rounded" value={newRack.name} onChange={e => setNewRack({...newRack, name: e.target.value})} />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-gray-500 mb-1">UNITÀ (U)</label>
              <input required type="number" className="w-full p-2 border rounded" value={newRack.height} onChange={e => setNewRack({...newRack, height: parseInt(e.target.value)})} />
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 h-[42px]">Salva</button>
          </form>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {racks.map(rack => (
            <div key={rack.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><Server size={24}/></div>
                <button onClick={() => deleteRack(rack.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{rack.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{rack.site || 'Nessun sito assegnato'} • {rack.height}U</p>
              <button onClick={() => setSelectedRack(rack)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all">Visualizza Rack</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- VISTA: INVENTARIO (NETWORK / PERIPHERALS) ---
  const InventoryView = ({ category, title }) => {
    const validTypes = deviceTypes.filter(dt => dt.category === category);
    const validNames = validTypes.map(t => t.name);
    const filteredDevices = devices.filter(d => validNames.includes(d.type));

    const [isAdding, setIsAdding] = useState(false);
    const [editingDev, setEditingDev] = useState(null);
    const [form, setForm] = useState({ name: '', type: validNames[0] || '', ip: '', description: '', portCount: 0 });

    const handleSave = async (e) => {
      e.preventDefault();
      const payload = { ...form, category, status: 'attivo', ports: [] };
      if (editingDev) {
        if (apiStatus === 'connected') await fetch(`/api/v1/devices/${editingDev.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setDevices(devices.map(d => d.id === editingDev.id ? { ...d, ...payload } : d));
      } else {
        if (apiStatus === 'connected') {
          const res = await fetch('/api/v1/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          setDevices([...devices, await res.json()]);
        } else {
          setDevices([...devices, { ...payload, id: Date.now() }]);
        }
      }
      setIsAdding(false); setEditingDev(null); setForm({ name: '', type: validNames[0] || '', ip: '', description: '', portCount: 0 });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 shadow-sm">
            {isAdding ? <X size={18} /> : <Plus size={18} />} <span>{isAdding ? 'Annulla' : 'Aggiungi'}</span>
          </button>
        </div>
        {isAdding && (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-md border border-blue-100 animate-in slide-in-from-top-4">
            <h3 className="font-bold text-gray-800 mb-4">{editingDev ? 'Modifica Dettagli' : 'Nuovo Apparato'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1">NOME</label><input required className="w-full p-2 border rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">TIPO</label><select className="w-full p-2 border rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>{validTypes.map(dt => <option key={dt.id} value={dt.name}>{dt.name}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">IP ADDR</label><input className="w-full p-2 border rounded font-mono" value={form.ip} onChange={e => setForm({...form, ip: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-3"><label className="block text-xs font-bold text-gray-500 mb-1">DESCRIZIONE</label><input className="w-full p-2 border rounded" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">PORTE FISICHE</label><input type="number" className="w-full p-2 border rounded" value={form.portCount} onChange={e => setForm({...form, portCount: parseInt(e.target.value)})} /></div>
            </div>
            <div className="flex justify-end space-x-2"><button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Salva Apparato</button></div>
          </form>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">Apparato</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">IP / Porte</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Stato Posizione</th><th className="p-4 text-right">Azioni</th></tr>
            </thead>
            <tbody>
              {filteredDevices.map(dev => (
                <tr key={dev.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4"><div className="font-bold text-blue-700">{dev.name}</div><div className="text-[10px] text-gray-400">{dev.description || 'Nessuna descrizione'}</div></td>
                  <td className="p-4"><div className="text-xs font-mono">{dev.ip || '-'}</div><div className="text-[10px] text-gray-400 uppercase font-bold">{dev.portCount || 0} Porte</div></td>
                  <td className="p-4">{dev.rackId ? <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">RACK: {racks.find(r => r.id === dev.rackId)?.name} (U{dev.position})</span> : <span className="px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded uppercase">Libero</span>}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setEditingDev(dev); setForm({ name: dev.name, type: dev.type, ip: dev.ip || '', description: dev.description || '', portCount: dev.portCount || 0 }); setIsAdding(true); }} className="text-gray-400 hover:text-blue-600"><Edit size={16}/></button>
                    <button onClick={async () => { if (apiStatus === 'connected') await fetch(`/api/v1/devices/${dev.id}`, { method: 'DELETE' }); setDevices(devices.filter(d => d.id !== dev.id)); }} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- VISTA: TIPI DISPOSITIVO ---
  const DeviceTypesView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newType, setNewType] = useState({ name: '', category: 'network', isRackable: true });
    const handleAdd = async (e) => {
      e.preventDefault();
      if (apiStatus === 'connected') {
        const res = await fetch('/api/v1/device-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newType) });
        setDeviceTypes([...deviceTypes, await res.json()]);
      } else { setDeviceTypes([...deviceTypes, { ...newType, id: Date.now() }]); }
      setIsAdding(false);
    };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Tipi di Dispositivo</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm">{isAdding ? <X size={18} /> : <Plus size={18} />} <span>{isAdding ? 'Annulla' : 'Nuovo Tipo'}</span></button>
        </div>
        {isAdding && (
          <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-md border border-blue-100 flex gap-4 items-end animate-in slide-in-from-top-4">
            <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nome Categoria</label><input required className="w-full p-2 border rounded" value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} /></div>
            <div className="w-48"><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Gruppo</label><select className="w-full p-2 border rounded" value={newType.category} onChange={e => setNewType({...newType, category: e.target.value})}><option value="network">Rete</option><option value="peripheral">Periferica</option></select></div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold h-[42px]">Salva</button>
          </form>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b"><tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">Categoria</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Gruppo</th><th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Rackable</th></tr></thead>
            <tbody>
              {deviceTypes.map(type => (
                <tr key={type.id} className="border-b last:border-0 hover:bg-gray-50"><td className="p-4 font-bold text-gray-800">{type.name}</td><td className="p-4 text-sm text-gray-500 capitalize">{type.category}</td><td className="p-4 text-center">{type.isRackable ? <Check className="text-green-500 mx-auto" size={18}/> : <X className="text-gray-300 mx-auto" size={18}/>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- VISTE PLACEHOLDER (Restore Menus) ---
  const EmptyView = ({ title, icon: Icon, description }) => (
    <div className="flex flex-col items-center justify-center h-96 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
      <Icon size={48} className="mb-4 text-gray-200" />
      <h3 className="text-lg font-bold text-gray-600">{title}</h3>
      <p className="text-sm max-w-xs text-center mt-2">{description || 'Questo modulo è in fase di configurazione e sarà disponibile a breve.'}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* SIDEBAR RESTORED */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="p-5 border-b border-slate-700 flex items-center space-x-3 bg-slate-900">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg"><Network size={22} className="text-white" /></div>
          <h1 className="text-xl font-black tracking-tighter">NETT<span className="text-blue-400">1</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          <SectionTitle>Principale</SectionTitle>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" view="dashboard" currentView={currentView} setCurrentView={setCurrentView} />

          <SectionTitle>Risorse Fisiche</SectionTitle>
          <SidebarItem icon={Server} label="Armadi Rack" view="racks" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={Network} label="Dispositivi Rete" view="devices" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={Laptop} label="Periferiche" view="peripherals" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={Cpu} label="Tipi Dispositivo" view="device-types" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={GitCommit} label="Cablaggi" view="cabling" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={ShieldCheck} label="Contratti" view="contracts" currentView={currentView} setCurrentView={setCurrentView} />

          <SectionTitle>Rete Logica</SectionTitle>
          <SidebarItem icon={Share2} label="Topologia" view="topology" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={Globe} label="Gestione IPAM" view="ipam" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={Radar} label="Discovery Scan" view="discovery" currentView={currentView} setCurrentView={setCurrentView} />

          <SectionTitle>Amministrazione</SectionTitle>
          <SidebarItem icon={Users} label="Utenti & RBAC" view="users" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={FileText} label="Reports" view="reports" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={History} label="Audit Logs" view="audit" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={Settings} label="Impostazioni" view="settings" currentView={currentView} setCurrentView={setCurrentView} />
          <SidebarItem icon={BookOpen} label="API Docs" view="apidocs" currentView={currentView} setCurrentView={setCurrentView} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="text-xs font-bold uppercase tracking-widest">Nett1</span>
            <ChevronRight size={14} />
            <h2 className="text-sm font-bold text-gray-800 capitalize tracking-wide">{currentView.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">Admin Mode</span>
              <span className="text-xs font-bold text-blue-600">Amministratore</span>
            </div>
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-blue-50">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && <DashboardView racks={racks} devices={devices} apiStatus={apiStatus} />}
            {currentView === 'racks' && <RacksView />}
            {currentView === 'devices' && <InventoryView category="network" title="Dispositivi di Rete" />}
            {currentView === 'peripherals' && <InventoryView category="peripheral" title="Periferiche & Endpoints" />}
            {currentView === 'device-types' && <DeviceTypesView />}

            {/* Restored placeholders for other views */}
            {currentView === 'cabling' && <EmptyView title="Gestione Cablaggi" icon={GitCommit} description="Mappa i collegamenti fisici tra le porte degli switch e i patch panel." />}
            {currentView === 'contracts' && <EmptyView title="Contratti & Licenze" icon={ShieldCheck} description="Traccia le scadenze delle garanzie hardware e dei rinnovi software." />}
            {currentView === 'topology' && <EmptyView title="Topologia Dinamica" icon={Share2} description="Visualizzazione grafica delle interconnessioni di rete basata sui cablaggi." />}
            {currentView === 'ipam' && <EmptyView title="IPAM Management" icon={Globe} description="Gestione delle subnet, degli scope DHCP e degli indirizzi IP statici." />}
            {currentView === 'discovery' && <EmptyView title="Discovery Scanner" icon={Radar} description="Scansiona la rete via SNMP e ICMP per rilevare nuovi apparati." />}
            {currentView === 'users' && <EmptyView title="Gestione Accessi" icon={Users} description="Definisci i ruoli degli utenti (RBAC) e le autorizzazioni di sistema." />}
            {currentView === 'reports' && <EmptyView title="Reportistica" icon={FileText} description="Genera documenti PDF/CSV sulla saturazione dei rack e sull'inventario." />}
            {currentView === 'audit' && <EmptyView title="Audit Logs" icon={History} description="Registro cronologico di tutte le azioni effettuate dagli utenti." />}
            {currentView === 'settings' && <EmptyView title="Impostazioni" icon={Settings} description="Configurazione dei parametri di sistema, backup e notifiche." />}
            {currentView === 'apidocs' && <EmptyView title="API Documentation" icon={BookOpen} description="Documentazione Swagger/OpenAPI per l'integrazione di sistemi esterni." />}
          </div>
        </div>
      </main>
    </div>
  );
}