// backend/server.js - 21/02/2026 - V 0.13
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =========================================================================
// SIMULATORE DATABASE (In memory DB per l'MVP Backend)
// =========================================================================
let db = {
  racks: [
    { id: 1, name: 'RACK-A01', site: 'Milano HQ', height: 42, location: 'Sala Server 1' },
    { id: 2, name: 'RACK-A02', site: 'Milano HQ', height: 42, location: 'Sala Server 1' }
  ],
  devices: [
    { id: 1, name: 'SW-CORE-01', type: 'Switch', ip: '192.168.1.1', rackId: 1, position: 42, height: 1, ports: [{name: 'Gi1/0/1', isPoE: true}] }
  ],
  deviceTypes: [
    { id: 1, name: 'Server', isRackable: true, category: 'network' },
    { id: 2, name: 'Switch', isRackable: true, category: 'network' }
  ],
  cables: [], prefixes: [], vlans: [], ips: [], contracts: [], users: []
};

// =========================================================================
// DEFINIZIONE API RESTful
// =========================================================================

app.get('/health', (req, res) => res.json({ status: 'OK', message: 'API Nett1 operativa' }));

app.get('/api/v1/racks', (req, res) => res.json(db.racks));
app.post('/api/v1/racks', (req, res) => {
  const newRack = { id: Date.now(), ...req.body };
  db.racks.push(newRack);
  res.status(201).json(newRack);
});
app.delete('/api/v1/racks/:id', (req, res) => {
  db.racks = db.racks.filter(r => r.id != req.params.id);
  res.status(204).send();
});

app.get('/api/v1/devices', (req, res) => res.json(db.devices));
app.post('/api/v1/devices', (req, res) => {
  const newDevice = { id: Date.now(), ...req.body };
  db.devices.push(newDevice);
  res.status(201).json(newDevice);
});
app.delete('/api/v1/devices/:id', (req, res) => {
  db.devices = db.devices.filter(d => d.id != req.params.id);
  res.status(204).send();
});

app.get('/api/v1/device-types', (req, res) => res.json(db.deviceTypes));
app.get('/api/v1/cables', (req, res) => res.json(db.cables));
app.get('/api/v1/prefixes', (req, res) => res.json(db.prefixes));
app.get('/api/v1/vlans', (req, res) => res.json(db.vlans));
app.get('/api/v1/ips', (req, res) => res.json(db.ips));
app.get('/api/v1/contracts', (req, res) => res.json(db.contracts));
app.get('/api/v1/users', (req, res) => res.json(db.users));

app.listen(PORT, () => {
  console.log(`🚀 Backend Nett1 in ascolto sulla porta ${PORT}`);
});