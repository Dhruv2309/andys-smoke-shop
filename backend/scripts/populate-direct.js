#!/usr/bin/env node

const https = require('https');
const http = require('http');
const querystring = require('querystring');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

// Parse PostgreSQL connection string
const url = connectionString.match(
  /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
);

if (!url) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = url;

console.log(`🔄 Connecting to ${user}@${host}:${port}/${database}`);

// PostgreSQL wire protocol connection
const net = require('net');

function postgresConnect() {
  const socket = net.createConnection({ host, port: parseInt(port) });
  
  socket.on('connect', () => {
    console.log('✅ Connected to database!');
    sendStartupMessage(socket, user, password, database);
  });

  socket.on('error', (err) => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });

  socket.on('data', (data) => {
    console.log('📦 Server response:', data.slice(0, 100).toString());
  });
}

function sendStartupMessage(socket, user, password, database) {
  // PostgreSQL startup message (v3 protocol)
  const params = {
    user,
    database,
    application_name: 'image-populator'
  };

  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}\0${v}`)
    .join('\0') + '\0';

  const buffer = Buffer.allocUnsafe(4 + 4 + paramStr.length);
  buffer.writeInt32BE(buffer.length - 4, 0); // Length
  buffer.writeInt32BE(196608, 4); // Protocol version 3.0
  buffer.write(paramStr, 8);

  socket.write(buffer);
}

postgresConnect();
