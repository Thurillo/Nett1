// frontend/src/App.jsx - 21/02/2026 - V 0.18
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Server, Monitor, Globe, Network,
  Settings, Plus, Trash2, Edit, Search, HardDrive,
  Radar, Play, Activity, Clock, CheckCircle, AlertCircle,
  Share2, GitCommit, Link as LinkIcon, FolderTree, Hash,
  FileText, Download, History, BarChart3, Cpu, Laptop,
  ExternalLink, Info, Users, ShieldCheck, BookOpen, Database,
  X, Check
} from 'lucide-react';

// =========================================================================
// DATI MOCK
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
// MAIN APP COMPONENT
// =========================================================================

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const [racks, setRacks] = useState(initialRacks);
  const [devices, setDevices] = useState(initialDevices);
  const [deviceTypes, setDeviceTypes] = useState(initialDeviceTypes);
  const [auditLogs, setAuditLogs] = useState([]);

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
        } else {
          setApiStatus('disconnected');
        }
      } catch (e) {
        setApiStatus('disconnected');
      }
    };
    loadData();
  }, []);

  const SidebarItem = ({ icon: Icon, label, view }) => (
    <div
      onClick={() => setCurrentView(view)}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        currentView === view ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  );

  // --- VISTA RACK ---
  const RacksView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newRack, setNewRack] = useState({ name: '', site: '', height: 42, location: '' });
    const [selectedRack, setSelectedRack] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);

    const handleAddRack = async (e) => {
      e.preventDefault();
      if (apiStatus === 'connected') {
        const res = await fetch('/api/v1/racks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRack)
        });
        const created = await res.json();
        setRacks([...racks, created]);
      } else {
        setRacks([...racks, { ...newRack, id: Date.now() }]);
      }
      setIsAdding(false);
      setNewRack({ name: '', site: '', height: 42, location: '' });
    };

    const deleteRack = async (id) => {
      if (apiStatus === 'connected') await fetch(`/api/v1/racks/${id}`, { method: 'DELETE' });
      setRacks(racks.filter(r => r.id !== id));
    };

    const handleSlotClick = (u) => setSelectedDevice({ isNew: true, position: u, name: '', type: 'Server', height: 1, existingDeviceId: '' });

    const saveDevicePosition = async (e) => {
      e.preventDefault();
      let updatedDevices = [...devices];

      if (selectedDevice.isNew) {
        if (selectedDevice.existingDeviceId) {
          // Assegnazione di un dispositivo esistente "libero"
          const devId = parseInt(selectedDevice.existingDeviceId);
          const targetDev = devices.find(d => d.id === devId);
          const updatedDev = { ...targetDev, rackId: selectedRack.id, locationType: 'rack', position: selectedDevice.position, height: selectedDevice.height };

          if (apiStatus === 'connected') {
            await fetch(`/api/v1/devices/${devId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedDev)
            });
          }
          updatedDevices = devices.map(d => d.id === devId ? updatedDev : d);
        } else {
          // Creazione nuovo
          const newDev = { ...selectedDevice, rackId: selectedRack.id, locationType: 'rack', ports: [], portCount: 0, description: '' };
          delete newDev.isNew;
          delete newDev.existingDeviceId;

          if (apiStatus === 'connected') {
            const res = await fetch('/api/v1/devices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newDev)
            });
            updatedDevices.push(await res.json());
          } else {
            updatedDevices.push({ ...newDev, id: Date.now() });
          }
        }
      } else {
        // Spostamento esistente
        if (apiStatus === 'connected') {
          await fetch(`/api/v1/devices/${selectedDevice.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ height: selectedDevice.height, position: selectedDevice.position })
          });
        }
        updatedDevices = devices.map(d => d.id === selectedDevice.id ? { ...d, height: selectedDevice.height, position: selectedDevice.position } : d);
      }
      setDevices(updatedDevices);
      setSelectedDevice(null);
    };

    if (selectedRack) {
      let rackUnits = [];
      for (let u = selectedRack.height; u >= 1; u--) {
        const dev = devices.find(d => d.rackId === selectedRack.id && d.position === u && d.locationType === 'rack');
        if (dev) {
          rackUnits.push({ type: 'device', u, device: dev });
          u -= ((dev.height || 1) - 1);
        } else {
          const covered = devices.find(d => d.rackId === selectedRack.id && d.locationType === 'rack' && u >= d.position && u < d.position + (d.height || 1));
          if (!covered) rackUnits.push({ type: 'empty', u });
        }
      }

      const freeDevices = devices.filter(d => !d.rackId && deviceTypes.find(dt => dt.name === d.type)?.isRackable);

      return (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
             <button onClick={() => setSelectedRack(null)} className="text-blue-600 hover:underline flex items-center">&larr; Torna alla lista</button>
             <h2 className="text-2xl font-bold text-gray-800">Rack: {selectedRack.name}</h2>
           </div>

           <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="w-full md:w-96 bg-gray-800 p-4 rounded-lg shadow-xl border-4 border-gray-900 flex flex-col">
               {rackUnits.map((item) => (
                 item.type === 'empty' ? (
                   <div key={`u-${item.u}`} onClick={() => handleSlotClick(item.u)} className="h-8 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded flex items-center px-2 cursor-pointer group mb-1">
                     <span className="text-[10px] text-gray-500 font-mono w-6">U{item.u}</span>
                     <Plus size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 ml-2"/>
                   </div>
                 ) : (
                   <div key={`dev-${item.device.id}`} onClick={() => setSelectedDevice({...item.device, isNew: false})}
                        className="border-2 rounded flex items-center px-2 cursor-pointer bg-blue-100 hover:bg-blue-200 border-blue-400 mb-1"
                        style={{ height: `calc(${item.device.height * 2.25}rem)` }}>
                     <span className="text-[10px] text-blue-800 font-mono w-6 font-bold">U{item.u}</span>
                     <span className="font-bold text-blue-900 text-xs truncate ml-2">{item.device.name}</span>
                   </div>
                 )
               ))}
             </div>

             {selectedDevice && (
               <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">{selectedDevice.isNew ? `Inserimento in U${selectedDevice.position}` : `Proprietà Apparato`}</h3>
                 <form onSubmit={saveDevicePosition} className="space-y-4">
                    {selectedDevice.isNew && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                        <label className="block text-xs font-bold text-blue-600 uppercase mb-2">Seleziona apparato esistente (Libero)</label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={selectedDevice.existingDeviceId}
                          onChange={e => setSelectedDevice({...selectedDevice, existingDeviceId: e.target.value})}
                        >
                          <option value="">-- Crea un nuovo apparato --</option>
                          {freeDevices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type})</option>)}
                        </select>
                      </div>
                    )}

                    {!selectedDevice.existingDeviceId && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                            <input required disabled={!selectedDevice.isNew} type="text" className="w-full p-2 border border-gray-300 rounded" value={selectedDevice.name} onChange={e => setSelectedDevice({...selectedDevice, name: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                            <select disabled={!selectedDevice.isNew} className="w-full p-2 border border-gray-300 rounded" value={selectedDevice.type} onChange={e => setSelectedDevice({...selectedDevice, type: e.target.value})}>
                              {deviceTypes.filter(dt => dt.isRackable).map(dt => <option key={dt.id} value={dt.name}>{dt.name}</option>)}
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Posizione (U)</label>
                        <input required type="number" className="w-full p-2 border border-gray-300 rounded" value={selectedDevice.position} onChange={e => setSelectedDevice({...selectedDevice, position: parseInt(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Altezza (U)</label>
                        <input required type="number" className="w-full p-2 border border-gray-300 rounded" value={selectedDevice.height} onChange={e => setSelectedDevice({...selectedDevice, height: parseInt(e.target.value)})} />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      {!selectedDevice.isNew && (
                        <button type="button" onClick={() => { setDevices(devices.map(d => d.id === selectedDevice.id ? {...d, rackId: null, position: null} : d)); setSelectedDevice(null); }} className="text-red-500 flex items-center text-sm font-bold"><Trash2 size={16} className="mr-1"/> Rimuovi dal Rack</button>
                      )}
                      <div className="flex space-x-2 ml-auto">
                        <button type="button" onClick={() => setSelectedDevice(null)} className="px-4 py-2 border rounded text-sm">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold">Salva</button>
                      </div>
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
          <h2 className="text-2xl font-bold text-gray-800">Armadi Rack</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 shadow-sm">
            <Plus size={18} /> <span>Aggiungi Rack</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddRack} className="bg-white p-4 rounded-xl shadow-md border border-blue-100 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">NOME RACK</label>
              <input required type="text" className="w-full p-2 border rounded" value={newRack.name} onChange={e => setNewRack({...newRack, name: e.target.value})} placeholder="RACK-01" />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-gray-500 mb-1">UNITÀ (U)</label>
              <input required type="number" className="w-full p-2 border rounded" value={newRack.height} onChange={e => setNewRack({...newRack, height: parseInt(e.target.value)})} />
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 h-[42px]">Crea</button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {racks.map(rack => (
            <div key={rack.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Server size={24}/></div>
                <button onClick={() => deleteRack(rack.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{rack.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{rack.site || 'Nessun sito'} • {rack.height}U</p>
              <button onClick={() => setSelectedRack(rack)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100">Apri Vista Rack</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- VISTA INVENTARIO (NETWORK & PERIPHERALS) ---
  const InventoryView = ({ category, title }) => {
    const validTypes = deviceTypes.filter(dt => dt.category === category);
    const validNames = validTypes.map(t => t.name);
    const filteredDevices = devices.filter(d => validNames.includes(d.type));

    const [editingDevice, setEditingDevice] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ name: '', type: validNames[0] || '', ip: '', description: '', portCount: 0 });

    const handleSave = async (e) => {
      e.preventDefault();
      const payload = { ...form, category, status: 'attivo', ports: [] };

      if (editingDevice) {
        if (apiStatus === 'connected') {
          await fetch(`/api/v1/devices/${editingDevice.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
        setDevices(devices.map(d => d.id === editingDevice.id ? { ...d, ...payload } : d));
      } else {
        if (apiStatus === 'connected') {
          const res = await fetch('/api/v1/devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          setDevices([...devices, await res.json()]);
        } else {
          setDevices([...devices, { ...payload, id: Date.now() }]);
        }
      }
      resetForm();
    };

    const resetForm = () => {
      setEditingDevice(null);
      setIsAdding(false);
      setForm({ name: '', type: validNames[0] || '', ip: '', description: '', portCount: 0 });
    };

    const startEdit = (dev) => {
      setEditingDevice(dev);
      setForm({ name: dev.name, type: dev.type, ip: dev.ip || '', description: dev.description || '', portCount: dev.portCount || 0 });
      setIsAdding(true);
    };

    const handleDelete = async (id) => {
      if (apiStatus === 'connected') await fetch(`/api/v1/devices/${id}`, { method: 'DELETE' });
      setDevices(devices.filter(d => d.id !== id));
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 shadow-sm">
            {isAdding ? <X size={18} /> : <Plus size={18} />} <span>{isAdding ? 'Annulla' : 'Nuovo Apparato'}</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-md border border-blue-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-gray-700 mb-4">{editingDevice ? 'Modifica Apparato' : 'Crea Nuovo Apparato'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">NOME</label>
                <input required type="text" className="w-full p-2 border rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">TIPO</label>
                <select className="w-full p-2 border rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {validTypes.map(dt => <option key={dt.id} value={dt.name}>{dt.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">IP</label>
                <input type="text" className="w-full p-2 border rounded" value={form.ip} onChange={e => setForm({...form, ip: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 mb-1">DESCRIZIONE</label>
                <input type="text" className="w-full p-2 border rounded" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">NUMERO PORTE</label>
                <input type="number" className="w-full p-2 border rounded" value={form.portCount} onChange={e => setForm({...form, portCount: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
               <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Annulla</button>
               <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Salva Modifiche</button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Apparato</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Tipo</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">IP / Porte</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Posizione</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map(dev => (
                <tr key={dev.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-blue-700">{dev.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{dev.description || 'Nessuna descrizione'}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{dev.type}</td>
                  <td className="py-3 px-4">
                    <div className="text-xs font-mono">{dev.ip || '-'}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">{dev.portCount || 0} Porte</div>
                  </td>
                  <td className="py-3 px-4">
                    {dev.rackId ? (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">RACK: {racks.find(r => r.id === dev.rackId)?.name} (U{dev.position})</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded uppercase">Libero</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button onClick={() => startEdit(dev)} className="text-gray-400 hover:text-blue-600"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(dev.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- VISTA TIPI DISPOSITIVO ---
  const DeviceTypesView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newType, setNewType] = useState({ name: '', category: 'network', isRackable: true });

    const handleAddType = async (e) => {
      e.preventDefault();
      if (apiStatus === 'connected') {
        const res = await fetch('/api/v1/device-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newType)
        });
        setDeviceTypes([...deviceTypes, await res.json()]);
      } else {
        setDeviceTypes([...deviceTypes, { ...newType, id: Date.now() }]);
      }
      setIsAdding(false);
      setNewType({ name: '', category: 'network', isRackable: true });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Tipi di Dispositivo</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 shadow-sm">
            {isAdding ? <X size={18} /> : <Plus size={18} />} <span>Nuovo Tipo</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddType} className="bg-white p-4 rounded-xl shadow-md border border-blue-100 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nome Categoria</label>
              <input required type="text" className="w-full p-2 border rounded" value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} placeholder="Es. Access Point" />
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Gruppo</label>
              <select className="w-full p-2 border rounded" value={newType.category} onChange={e => setNewType({...newType, category: e.target.value})}>
                <option value="network">Dispositivi di Rete</option>
                <option value="peripheral">Periferiche</option>
              </select>
            </div>
            <div className="flex items-center mb-3">
              <input type="checkbox" id="rack" className="mr-2" checked={newType.isRackable} onChange={e => setNewType({...newType, isRackable: e.target.checked})} />
              <label htmlFor="rack" className="text-xs font-bold text-gray-500 uppercase">Rackable</label>
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 h-[42px]">Salva</button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Tipo</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Gruppo</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Rackable</th>
              </tr>
            </thead>
            <tbody>
              {deviceTypes.map(type => (
                <tr key={type.id} className="border-t border-gray-100">
                  <td className="py-3 px-4 font-bold text-gray-800">{type.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{type.category === 'network' ? 'Rete' : 'Periferica'}</td>
                  <td className="py-3 px-4 text-sm">
                    {type.isRackable ? <Check className="text-green-500" size={18}/> : <X className="text-gray-300" size={18}/>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        {apiStatus === 'connected' ? (
          <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200"><Database size={14} className="mr-2"/> Online</span>
        ) : (
          <span className="flex items-center text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200"><Database size={14} className="mr-2"/> Offline</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Server size={24} /></div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Armadi Rack</p>
            <p className="text-2xl font-bold text-gray-800">{racks.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><HardDrive size={24} /></div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Apparati Totali</p>
            <p className="text-2xl font-bold text-gray-800">{devices.length}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-10">
        <div className="p-5 border-b border-slate-700 flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg"><Network size={24} className="text-white" /></div>
          <h1 className="text-xl font-bold tracking-tight text-white">Nett<span className="text-blue-400">1</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" view="dashboard" />
          <div className="h-px bg-slate-700 my-4 mx-2"></div>
          <SidebarItem icon={Server} label="Armadi Rack" view="racks" />
          <SidebarItem icon={Network} label="Dispositivi Rete" view="devices" />
          <SidebarItem icon={Laptop} label="Periferiche" view="peripherals" />
          <SidebarItem icon={Cpu} label="Tipi Dispositivo" view="device-types" />
          <SidebarItem icon={Globe} label="IPAM" view="ipam" />
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-700 capitalize">{currentView.replace('-', ' ')}</h2>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'racks' && <RacksView />}
            {currentView === 'devices' && <InventoryView category="network" title="Dispositivi di Rete" />}
            {currentView === 'peripherals' && <InventoryView category="peripheral" title="Periferiche" />}
            {currentView === 'device-types' && <DeviceTypesView />}
            {currentView === 'ipam' && <div className="p-12 text-center text-gray-400 italic">Modulo IPAM in fase di sviluppo...</div>}
          </div>
        </div>
      </main>
    </div>
  );
}