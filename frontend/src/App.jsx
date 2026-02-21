// frontend/src/App.jsx - 21/02/2026 - V 0.17
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Server, Monitor, Globe, Network,
  Settings, Plus, Trash2, Edit, Search, HardDrive,
  Radar, Play, Activity, Clock, CheckCircle, AlertCircle,
  Share2, GitCommit, Link as LinkIcon, FolderTree, Hash,
  FileText, Download, History, BarChart3, Cpu, Laptop,
  ExternalLink, Info, Users, ShieldCheck, BookOpen, Database
} from 'lucide-react';

// =========================================================================
// DATI MOCK (Per il funzionamento standalone nell'anteprima e frontend)
// =========================================================================

const initialRacks = [
  { id: 1, name: 'RACK-A01', site: 'Milano HQ', height: 42, location: 'Sala Server 1' },
  { id: 2, name: 'RACK-A02', site: 'Milano HQ', height: 42, location: 'Sala Server 1' },
];

const initialDevices = [
  { id: 1, name: 'SW-CORE-01', type: 'Switch', model: 'Cisco Catalyst 9300', ip: '192.168.1.1', locationType: 'rack', rackId: 1, position: 42, height: 1, status: 'attivo', ports: [
    { name: 'Gi1/0/1', type: 'Gigabit Ethernet (RJ45)', isPoE: true },
    { name: 'Gi1/0/2', type: 'Gigabit Ethernet (RJ45)', isPoE: true },
    { name: 'Gi1/0/3', type: 'Gigabit Ethernet (RJ45)', isPoE: false },
    { name: 'Gi1/0/24', type: 'Gigabit Ethernet (RJ45)', isPoE: false },
    { name: 'Te1/1/1', type: 'Fibra SFP+ (10G)', isPoE: false }
  ] },
  { id: 2, name: 'FW-MAIN', type: 'Firewall', model: 'FortiGate 100F', ip: '192.168.1.254', locationType: 'rack', rackId: 1, position: 40, height: 1, status: 'attivo', ports: [
    { name: 'WAN1', type: 'Fibra SFP (1G)', isPoE: false },
    { name: 'LAN1', type: 'Gigabit Ethernet (RJ45)', isPoE: false }
  ] },
  { id: 3, name: 'SRV-DB-01', type: 'Server', model: 'Dell PowerEdge R740', ip: '10.0.0.10', locationType: 'rack', rackId: 2, position: 10, height: 2, status: 'attivo', ports: [
    { name: 'eth0', type: 'Gigabit Ethernet (RJ45)', isPoE: false }
  ] },
  { id: 4, name: 'PP-A01', type: 'Patch Panel', model: 'CommScope 24P', ip: '-', locationType: 'rack', rackId: 1, position: 41, height: 1, status: 'passivo', ports: [
    { name: 'Porta 1', type: 'Ethernet 10/100 (RJ45)', isPoE: false },
    { name: 'Porta 2', type: 'Ethernet 10/100 (RJ45)', isPoE: false }
  ] },
];

const initialDeviceTypes = [
  { id: 1, name: 'Server', isRackable: true, category: 'network' },
  { id: 2, name: 'Switch', isRackable: true, category: 'network' },
  { id: 3, name: 'Router', isRackable: true, category: 'network' },
  { id: 4, name: 'Firewall', isRackable: true, category: 'network' },
  { id: 5, name: 'Patch Panel', isRackable: true, category: 'network' },
  { id: 6, name: 'Notebook', isRackable: false, category: 'peripheral' },
];

const initialCables = [
  { id: 1, sourceDev: 'PP-A01', sourcePort: 'Porta 1', targetDev: 'SW-CORE-01', targetPort: 'Gi1/0/1', type: 'Cat6a', color: 'Blu' },
  { id: 3, sourceDev: 'FW-MAIN', sourcePort: 'LAN1', targetDev: 'SW-CORE-01', targetPort: 'Gi1/0/24', type: 'Cat6', color: 'Giallo' },
  { id: 4, sourceDev: 'SW-CORE-01', sourcePort: 'Gi1/0/2', targetDev: 'SRV-DB-01', targetPort: 'eth0', type: 'Cat6', color: 'Rosso' },
];

const initialPrefixes = [
  { id: 1, prefix: '192.168.1.0/24', vlanId: 10, description: 'Management Network', status: 'attivo', utilized: 2, capacity: 254 },
  { id: 2, prefix: '10.0.0.0/24', vlanId: 20, description: 'Server Farm', status: 'attivo', utilized: 1, capacity: 254 },
];

const initialVlans = [
  { id: 1, vid: 10, name: 'MGMT', description: 'Management Devices', status: 'attivo' },
  { id: 2, vid: 20, name: 'SERVERS', description: 'Production Servers', status: 'attivo' },
];

const initialIPs = [
  { id: 1, address: '192.168.1.1', subnet: '192.168.1.0/24', device: 'SW-CORE-01', status: 'occupato' },
  { id: 2, address: '192.168.1.254', subnet: '192.168.1.0/24', device: 'FW-MAIN', status: 'occupato' },
];

const initialUsers = [
  { id: 1, username: 'admin', fullName: 'Amministratore Sistema', role: 'Super Admin', email: 'admin@nett1.local', status: 'Attivo' },
  { id: 2, username: 'net_eng_1', fullName: 'Mario Rossi', role: 'Network Engineer', email: 'mario.rossi@azienda.it', status: 'Attivo' },
];

const initialContracts = [
  { id: 1, name: 'Cisco SmartNet NBD', provider: 'Cisco Systems', type: 'Supporto Hardware', startDate: '2025-01-01', endDate: '2028-01-01', status: 'Attivo', deviceCount: 3 },
  { id: 2, name: 'Dell ProSupport Plus', provider: 'Dell EMC', type: 'Garanzia & Supporto', startDate: '2024-06-15', endDate: '2027-06-14', status: 'Attivo', deviceCount: 1 },
];

const initialAuditLogs = [
  { id: 1, timestamp: '2026-02-21 10:15:22', user: 'admin', action: 'CREATE', resource: 'Device', details: 'Creato dispositivo SRV-DB-01' },
];

// =========================================================================
// MAIN APP COMPONENT
// =========================================================================

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const [racks, setRacks] = useState(initialRacks);
  const [devices, setDevices] = useState(initialDevices);
  const [deviceTypes, setDeviceTypes] = useState(initialDeviceTypes);
  const [cables, setCables] = useState(initialCables);
  const [prefixes, setPrefixes] = useState(initialPrefixes);
  const [vlans, setVlans] = useState(initialVlans);
  const [ips, setIps] = useState(initialIPs);
  const [contracts, setContracts] = useState(initialContracts);
  const [users, setUsers] = useState(initialUsers);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  const [apiStatus, setApiStatus] = useState('checking');
  const [deviceToEditFromRack, setDeviceToEditFromRack] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Interroga il vero Backend Node.js
        const resHealth = await fetch('/health');
        if (resHealth.ok) {
          setApiStatus('connected');

          // Scarica gli armadi dal server
          const resRacks = await fetch('/api/v1/racks');
          if (resRacks.ok) setRacks(await resRacks.json());

          // Scarica i dispositivi dal server
          const resDevices = await fetch('/api/v1/devices');
          if (resDevices.ok) setDevices(await resDevices.json());
        } else {
          setApiStatus('disconnected');
        }
      } catch (e) {
        console.error("Backend non raggiungibile.", e);
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

  // --- COMPONENTI DELLE VISTE ---

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        {apiStatus === 'connected' ? (
          <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200"><Database size={14} className="mr-2"/> DB Connesso</span>
        ) : apiStatus === 'disconnected' ? (
          <span className="flex items-center text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 animate-pulse"><Database size={14} className="mr-2"/> Modalità Offline (Mock)</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Server size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Armadi Rack</p>
            <p className="text-2xl font-bold text-gray-800">{racks.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><HardDrive size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dispositivi</p>
            <p className="text-2xl font-bold text-gray-800">{devices.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Globe size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">IP Utilizzati</p>
            <p className="text-2xl font-bold text-gray-800">{ips.filter(ip => ip.status === 'occupato').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><GitCommit size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Cablaggi Fisici</p>
            <p className="text-2xl font-bold text-gray-800">{cables.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Activity className="mr-2 text-blue-600" size={20}/> Attività Recenti</h3>
          <div className="space-y-4">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${log.action === 'CREATE' ? 'bg-green-500' : log.action === 'DELETE' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{log.details}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{log.timestamp} • {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Server className="mr-2 text-indigo-600" size={20}/> Saturazione Armadi Rack</h3>
           <div className="space-y-5">
             {racks.length === 0 ? <p className="text-sm text-gray-500 italic">Nessun armadio configurato.</p> : (
                racks.map(rack => {
                  const usedU = devices.filter(d => d.rackId === rack.id && d.locationType === 'rack').reduce((acc, curr) => acc + (curr.height || 1), 0);
                  const percent = Math.round((usedU / rack.height) * 100);
                  return (
                    <div key={rack.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{rack.name} <span className="text-gray-400 text-xs font-normal">({rack.location})</span></span>
                        <span className="text-gray-500 font-mono text-xs">{usedU}U / {rack.height}U ({percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 border border-gray-200">
                        <div className={`h-2.5 rounded-full ${percent > 85 ? 'bg-red-500' : percent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )
                })
             )}
           </div>
        </div>
      </div>
    </div>
  );

  const RacksView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newRack, setNewRack] = useState({ name: '', site: '', height: 42, location: '' });
    const [selectedRack, setSelectedRack] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);

    const handleAdd = async (e) => {
      e.preventDefault();
      if (apiStatus === 'connected') {
        try {
          // Salva il Rack sul Backend
          const res = await fetch('/api/v1/racks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRack)
          });
          const created = await res.json();
          setRacks([...racks, created]);
        } catch(e) { console.error(e); }
      } else {
        setRacks([...racks, { ...newRack, id: Date.now() }]);
      }
      setIsAdding(false);
      setNewRack({ name: '', site: '', height: 42, location: '' });
    };

    const deleteRack = async (id) => {
      if (apiStatus === 'connected') {
        try {
          await fetch(`/api/v1/racks/${id}`, { method: 'DELETE' });
        } catch(e) { console.error(e); }
      }
      setRacks(racks.filter(r => r.id !== id));
    };

    const handleSlotClick = (u) => setSelectedDevice({ isNew: true, position: u, name: '', type: 'Server', height: 1, status: 'attivo' });
    const handleDeviceClick = (dev) => setSelectedDevice({ ...dev, isNew: false });

    const saveDevicePosition = async (e) => {
      e.preventDefault();
      let updatedDevices = [...devices];

      if (selectedDevice.isNew) {
        const newDev = { ...selectedDevice, rackId: selectedRack.id, locationType: 'rack', ports: [] };
        if (apiStatus === 'connected') {
          try {
            const res = await fetch('/api/v1/devices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newDev)
            });
            const created = await res.json();
            updatedDevices.push(created);
          } catch(e) { console.error(e); }
        } else {
          updatedDevices.push({ ...newDev, id: Date.now() });
        }
      } else {
        if (apiStatus === 'connected') {
          try {
            await fetch(`/api/v1/devices/${selectedDevice.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ height: selectedDevice.height, position: selectedDevice.position })
            });
          } catch(e) { console.error(e); }
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

      return (
        <div className="space-y-6">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center space-x-4">
               <button onClick={() => {setSelectedRack(null); setSelectedDevice(null);}} className="text-blue-600 hover:underline flex items-center">&larr; Torna alla lista</button>
               <h2 className="text-2xl font-bold text-gray-800">Vista Rack: {selectedRack.name}</h2>
             </div>
             <div className="text-sm text-gray-500 font-medium">Capacità: {selectedRack.height}U</div>
           </div>

           <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="w-full md:w-96 bg-gray-800 p-4 rounded-lg shadow-xl border-4 border-gray-900 flex flex-col flex-shrink-0">
               <div className="text-center text-gray-400 font-mono mb-4 border-b border-gray-700 pb-2">{selectedRack.name} - Frontale</div>
               <div className="flex-1 flex flex-col space-y-1">
                 {rackUnits.map((item) => {
                   if (item.type === 'empty') {
                     return (
                       <div key={`u-${item.u}`} onClick={() => handleSlotClick(item.u)} className="h-8 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded flex items-center px-2 cursor-pointer group transition-colors">
                         <span className="text-xs text-gray-400 font-mono w-6">U{item.u}</span>
                         <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 ml-4 flex items-center"><Plus size={14} className="mr-1"/> Aggiungi</span>
                       </div>
                     );
                   } else {
                     return (
                       <div key={`dev-${item.device.id}`} onClick={() => handleDeviceClick(item.device)}
                            className={`border-2 rounded flex items-center px-2 cursor-pointer transition-colors relative overflow-hidden group shadow-sm ${selectedDevice && selectedDevice.id === item.device.id ? 'bg-blue-200 border-blue-500' : 'bg-blue-100 hover:bg-blue-200 border-blue-400'}`}
                            style={{ height: `calc(${item.device.height * 2}rem + ${(item.device.height - 1) * 0.25}rem)` }}>
                         <span className="text-xs text-blue-800 font-mono w-6 font-bold absolute left-2 top-1 z-10">U{item.u}</span>
                         <div className="ml-8 flex flex-col justify-center w-full z-10">
                           <span className="font-bold text-blue-900 text-sm truncate">{item.device.name}</span>
                         </div>
                       </div>
                     );
                   }
                 })}
               </div>
             </div>

             {selectedDevice ? (
               <div className="flex-1 w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                 <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-gray-800">{selectedDevice.isNew ? `Aggiungi Rapido a U${selectedDevice.position}` : `Dettagli Apparato`}</h3>
               </div>
               {selectedDevice.isNew ? (
                  <form onSubmit={saveDevicePosition} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Dispositivo</label>
                        <input required type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={selectedDevice.name} onChange={e => setSelectedDevice({...selectedDevice, name: e.target.value})} placeholder="Es. SRV-01" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                          <select className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={selectedDevice.type} onChange={e => setSelectedDevice({...selectedDevice, type: e.target.value})}>
                            {deviceTypes.filter(dt => dt.isRackable).map(dt => <option key={dt.id} value={dt.name}>{dt.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Altezza (U)</label>
                          <input required type="number" min="1" max={selectedRack.height - selectedDevice.position + 1} className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={selectedDevice.height} onChange={e => setSelectedDevice({...selectedDevice, height: parseInt(e.target.value)})} />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={() => setSelectedDevice(null)} className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50">Annulla</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Crea</button>
                      </div>
                    </form>
                 ) : (
                    <div className="space-y-5">
                       <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                             <div><span className="block text-xs font-semibold text-gray-500 uppercase">Nome</span><span className="font-bold text-gray-800 text-lg">{selectedDevice.name}</span></div>
                             <div><span className="block text-xs font-semibold text-gray-500 uppercase">IP</span><span className="font-mono text-gray-800">{selectedDevice.ip || '-'}</span></div>
                          </div>
                       </div>
                       <form onSubmit={saveDevicePosition} className="bg-white border border-gray-200 rounded-lg p-4">
                         <h4 className="text-sm font-bold text-gray-700 mb-3">Posizionamento Rack</h4>
                         <div className="grid grid-cols-2 gap-4 mb-4">
                           <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Posizione Iniziale (U)</label>
                             <input required type="number" min="1" max={selectedRack.height} className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={selectedDevice.position} onChange={e => setSelectedDevice({...selectedDevice, position: parseInt(e.target.value)})} />
                           </div>
                           <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Altezza (U)</label>
                             <input required type="number" min="1" max="10" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={selectedDevice.height} onChange={e => setSelectedDevice({...selectedDevice, height: parseInt(e.target.value)})} />
                           </div>
                         </div>
                         <div className="flex justify-end">
                           <button type="submit" className="px-4 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 transition-colors">Salva Posizione</button>
                         </div>
                       </form>
                    </div>
                 )}
               </div>
             ) : (
               <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-12 text-gray-500 h-96">
                 <Server size={48} className="mb-4 text-gray-400" />
                 <p className="text-lg font-medium text-gray-700">Seleziona uno slot o un dispositivo</p>
               </div>
             )}
           </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Gestione Armadi Rack</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
            <Plus size={18} /> <span>Aggiungi Rack</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 mb-6 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Rack</label>
              <input required type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={newRack.name} onChange={e => setNewRack({...newRack, name: e.target.value})} placeholder="Es. RACK-B01" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sito/Edificio</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={newRack.site} onChange={e => setNewRack({...newRack, site: e.target.value})} placeholder="Es. Milano HQ" />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Altezza (U)</label>
              <input required type="number" min="10" max="52" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={newRack.height} onChange={e => setNewRack({...newRack, height: parseInt(e.target.value)})} />
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 h-[42px] shadow-sm">Salva Rack</button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Sito</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Altezza (U)</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {racks.map(rack => (
                <tr key={rack.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800 flex items-center space-x-2"><Server size={16} className="text-gray-400" /><span>{rack.name}</span></td>
                  <td className="py-3 px-4 text-gray-600">{rack.site}</td>
                  <td className="py-3 px-4 text-gray-600">{rack.height} U</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setSelectedRack(rack)} className="text-blue-600 hover:bg-blue-50 px-3 py-1 mr-2 rounded text-sm font-medium border border-blue-200 transition-colors">Vista Frontale</button>
                    <button onClick={() => deleteRack(rack.id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const InventoryView = ({ category, title }) => {
    const validTypes = deviceTypes.filter(dt => dt.category === category);
    const validTypesNames = validTypes.map(t => t.name);
    const filteredDevices = devices.filter(d => validTypesNames.includes(d.type));

    const [isAdding, setIsAdding] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', type: validTypesNames[0] || '', ip: '' });

    const handleAdd = async (e) => {
      e.preventDefault();
      // Creiamo l'oggetto del dispositivo generico (non posizionato in un Rack per ora)
      const devToSave = {
        ...newDevice,
        id: Date.now(),
        locationType: 'other',
        rackId: null,
        position: null,
        height: 1,
        status: 'attivo',
        ports: []
      };

      if (apiStatus === 'connected') {
        try {
          const res = await fetch('/api/v1/devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(devToSave)
          });
          const created = await res.json();
          setDevices([...devices, created]);
        } catch(e) { console.error(e); }
      } else {
        setDevices([...devices, devToSave]);
      }
      setIsAdding(false);
      setNewDevice({ name: '', type: validTypesNames[0] || '', ip: '' });
    };

    const handleDelete = async (id) => {
      if (apiStatus === 'connected') {
        try {
          await fetch(`/api/v1/devices/${id}`, { method: 'DELETE' });
        } catch(e) { console.error(e); }
      }
      setDevices(devices.filter(d => d.id !== id));
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 shadow-sm">
            <Plus size={18} /> <span>Aggiungi Apparato</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 mb-6 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Apparato</label>
              <input required type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} placeholder="Es. SW-CORE-02" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
              <select className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value})}>
                {validTypes.map(dt => <option key={dt.id} value={dt.name}>{dt.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Indirizzo IP</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500" value={newDevice.ip} onChange={e => setNewDevice({...newDevice, ip: e.target.value})} placeholder="Es. 192.168.1.10" />
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 h-[42px] shadow-sm">Salva</button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Nome Apparato</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Indirizzo IP</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500 font-medium">Nessun apparato registrato in questa categoria.</td>
                </tr>
              ) : (
                filteredDevices.map(dev => (
                  <tr key={dev.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-blue-600">{dev.name}</td>
                    <td className="py-3 px-4 text-gray-800">{dev.type}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">{dev.ip || '-'}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button className="text-gray-500 hover:text-blue-600 p-1"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(dev.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
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

  const DeviceTypesView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tipi di Dispositivo</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Categoria Dispositivo</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Gruppo</th>
            </tr>
          </thead>
          <tbody>
            {deviceTypes.map(type => (
              <tr key={type.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800"><Cpu size={16} className="inline mr-2 text-blue-500"/>{type.name}</td>
                <td className="py-3 px-4">{type.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CablingView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gestione Cablaggi Fisici</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Terminazione A</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-center">Cavo</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Terminazione B</th>
            </tr>
          </thead>
          <tbody>
            {cables.map(cable => (
              <tr key={cable.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4"><span className="font-medium text-gray-800">{cable.sourceDev}</span> <span className="text-xs bg-gray-200 px-1 rounded">{cable.sourcePort}</span></td>
                <td className="py-3 px-4 text-center"><span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{cable.type}</span></td>
                <td className="py-3 px-4 text-right"><span className="font-medium text-gray-800">{cable.targetDev}</span> <span className="text-xs bg-gray-200 px-1 rounded">{cable.targetPort}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ContractsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Contratti e Garanzie</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">ID / Titolo</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Provider</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Stato</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(contract => (
              <tr key={contract.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4"><div className="font-medium text-blue-600">{contract.name}</div><div className="text-xs text-gray-500">{contract.type}</div></td>
                <td className="py-3 px-4 text-gray-800 font-medium">{contract.provider}</td>
                <td className="py-3 px-4 text-right"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{contract.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TopologyView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Topologia di Rete Logica</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 h-96 flex flex-col items-center justify-center">
        <Share2 size={48} className="mb-4 text-gray-300" />
        <p>Anteprima della mappa topologica dinamica.</p>
      </div>
    </div>
  );

  const IpamView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">IP Address Management</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Prefix</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">VLAN</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Utilizzo</th>
            </tr>
          </thead>
          <tbody>
            {prefixes.map(prefix => (
              <tr key={prefix.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
                <td className="py-3 px-4 font-mono text-blue-600 font-medium">{prefix.prefix}</td>
                <td className="py-3 px-4 text-sm">VLAN {prefix.vlanId}</td>
                <td className="py-3 px-4 text-sm">{prefix.utilized} / {prefix.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const DiscoveryView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Network Discovery & Monitoring</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Subnet (CIDR)</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 font-mono" placeholder="Es. 10.0.0.0/24" />
        </div>
        <div><button className="w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 font-medium text-white bg-blue-600 hover:bg-blue-700"><Play size={18} /> <span>Avvia Scan</span></button></div>
      </div>
    </div>
  );

  const UsersView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gestione Utenti e Ruoli</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Utente</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Ruolo (RBAC)</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Stato</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4"><div className="font-medium text-gray-800 flex items-center"><Users size={16} className="mr-2 text-gray-400"/> {user.username}</div><div className="text-xs text-gray-500">{user.fullName}</div></td>
                <td className="py-3 px-4"><span className="px-2 py-1 rounded text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">{user.role}</span></td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{user.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ReportsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Reports & Export Dati</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
        <Download size={48} className="mx-auto mb-4 text-gray-300" />
        <p>Modulo di esportazione CSV e generazione grafici analitici.</p>
      </div>
    </div>
  );

  const AuditLogView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Audit Logs (Registro Attività)</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Timestamp</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Utente</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Dettagli</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50 font-mono text-sm">
                <td className="py-3 px-4 text-gray-500">{log.timestamp}</td>
                <td className="py-3 px-4 font-medium text-gray-700">{log.user}</td>
                <td className="py-3 px-4 text-gray-600 font-sans">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Impostazioni di Sistema</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 bg-gray-50">
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><HardDrive className="mr-2 text-gray-600" size={20}/> Gestione Dati (Backup & Restore)</h3>
         <div className="flex flex-col sm:flex-row gap-4">
           <button className="flex-1 bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-4 py-4 rounded-xl flex flex-col items-center justify-center transition-all group shadow-sm">
             <Download size={28} className="text-blue-500 mb-2" /><span className="font-bold text-gray-800">Esporta Database</span>
           </button>
           <button className="flex-1 bg-white border border-gray-300 hover:border-green-500 hover:bg-green-50 px-4 py-4 rounded-xl flex flex-col items-center justify-center transition-all group shadow-sm">
             <FolderTree size={28} className="text-green-500 mb-2" /><span className="font-bold text-gray-800">Ripristina Backup</span>
           </button>
         </div>
      </div>
    </div>
  );

  const ApiDocsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Sviluppatori & API RESTful</h2>
           <p className="text-sm text-gray-500 mt-1">Integra Nett1 con i tuoi script Python, Ansible o sistemi di monitoraggio.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
         <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Endpoint Supportati</div>
            <div className="p-2 bg-blue-50 text-blue-700 rounded font-medium text-sm">/api/v1/racks</div>
            <div className="p-2 text-gray-600 font-medium text-sm">/api/v1/devices</div>
            <div className="p-2 text-gray-600 font-medium text-sm">/api/v1/cables</div>
         </div>
         <div className="flex-1 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">Racks Endpoint</h3>
            <p className="text-gray-600 text-sm mb-6">Endpoint per la gestione dell'infrastruttura fisica degli armadi.</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
               <div className="bg-blue-50 p-3 border-b border-gray-200 flex items-center">
                  <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-sm mr-4">GET</span>
                  <code className="font-mono text-gray-800 font-semibold">/api/v1/racks</code>
               </div>
               <div className="p-4 bg-white"><p className="text-sm text-gray-600">Ritorna la lista completa degli armadi registrati a sistema.</p></div>
            </div>
         </div>
      </div>
    </div>
  );

  // =========================================================================
  // RENDER APP
  // =========================================================================

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-10">
        <div className="p-5 border-b border-slate-700 flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg"><Network size={24} className="text-white" /></div>
          <h1 className="text-xl font-bold tracking-tight text-white">Nett<span className="text-blue-400">1</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2 px-2">Principale</div>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" view="dashboard" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-2">Risorse</div>
          <SidebarItem icon={Server} label="Armadi Rack" view="racks" />
          <SidebarItem icon={Network} label="Dispositivi Rete" view="devices" />
          <SidebarItem icon={Laptop} label="Periferiche" view="peripherals" />
          <SidebarItem icon={Cpu} label="Tipi Dispositivo" view="device-types" />
          <SidebarItem icon={GitCommit} label="Cablaggi Fisici" view="cabling" />
          <SidebarItem icon={ShieldCheck} label="Contratti" view="contracts" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-2">Rete Logica</div>
          <SidebarItem icon={Share2} label="Topologia" view="topology" />
          <SidebarItem icon={Globe} label="Gestione IPAM" view="ipam" />
          <SidebarItem icon={Radar} label="Discovery" view="discovery" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-2">Sviluppo & Sistema</div>
          <SidebarItem icon={Users} label="Utenti" view="users" />
          <SidebarItem icon={FileText} label="Reports" view="reports" />
          <SidebarItem icon={History} label="Audit Logs" view="audit" />
          <SidebarItem icon={Settings} label="Impostazioni" view="settings" />
          <SidebarItem icon={BookOpen} label="Documentazione API" view="apidocs" />
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {currentView.replace('-', ' ')}
          </h2>
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200">AD</div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'racks' && <RacksView />}
            {currentView === 'devices' && <InventoryView category="network" title="Dispositivi di Rete" />}
            {currentView === 'peripherals' && <InventoryView category="peripheral" title="Periferiche" />}
            {currentView === 'device-types' && <DeviceTypesView />}
            {currentView === 'cabling' && <CablingView />}
            {currentView === 'contracts' && <ContractsView />}
            {currentView === 'topology' && <TopologyView />}
            {currentView === 'ipam' && <IpamView />}
            {currentView === 'discovery' && <DiscoveryView />}
            {currentView === 'users' && <UsersView />}
            {currentView === 'reports' && <ReportsView />}
            {currentView === 'audit' && <AuditLogView />}
            {currentView === 'settings' && <SettingsView />}
            {currentView === 'apidocs' && <ApiDocsView />}
          </div>
        </div>
      </main>
    </div>
  );
}