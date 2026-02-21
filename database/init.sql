-- database/init.sql - 21/02/2026 - V 0.13
-- =========================================================================
-- Nett1 DCIM - Schema Relazionale Definitivo (PostgreSQL)
-- =========================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'Read Only',
    email VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Attivo',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS racks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    site VARCHAR(100),
    height INTEGER DEFAULT 42,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_rackable BOOLEAN DEFAULT true,
    category VARCHAR(50) DEFAULT 'network'
);

CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type_id INTEGER REFERENCES device_types(id) ON DELETE RESTRICT,
    model VARCHAR(100),
    ip_address VARCHAR(50),
    location_type VARCHAR(50) DEFAULT 'rack',
    rack_id INTEGER REFERENCES racks(id) ON DELETE SET NULL,
    position INTEGER,
    height INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'attivo',
    custom_location VARCHAR(255),
    ports JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cables (
    id SERIAL PRIMARY KEY,
    source_dev_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    source_port VARCHAR(50) NOT NULL,
    target_dev_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    target_port VARCHAR(50) NOT NULL,
    cable_type VARCHAR(50) DEFAULT 'Cat6',
    color VARCHAR(50) DEFAULT 'Blu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT diff_ports CHECK (source_dev_id != target_dev_id OR source_port != target_port)
);

CREATE TABLE IF NOT EXISTS vlans (
    id SERIAL PRIMARY KEY,
    vid INTEGER UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'attivo'
);

CREATE TABLE IF NOT EXISTS prefixes (
    id SERIAL PRIMARY KEY,
    prefix VARCHAR(50) UNIQUE NOT NULL,
    vlan_id INTEGER REFERENCES vlans(id) ON DELETE SET NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'attivo',
    utilized INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 254
);

CREATE TABLE IF NOT EXISTS ips (
    id SERIAL PRIMARY KEY,
    address VARCHAR(50) UNIQUE NOT NULL,
    subnet_id INTEGER REFERENCES prefixes(id) ON DELETE CASCADE,
    device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'libero'
);

CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    provider VARCHAR(100),
    contract_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'Attivo',
    device_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username_cache VARCHAR(50),
    action VARCHAR(20) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dati iniziali (Seeding)
INSERT INTO users (username, full_name, role, email, password_hash) VALUES
('admin', 'Amministratore', 'Super Admin', 'admin@nett1.local', 'hash_fittizio') ON CONFLICT DO NOTHING;

INSERT INTO device_types (name, is_rackable, category) VALUES
('Server', true, 'network'), ('Switch', true, 'network'),
('Router', true, 'network'), ('Firewall', true, 'network'),
('Patch Panel', true, 'network'), ('Notebook', false, 'peripheral') ON CONFLICT DO NOTHING;