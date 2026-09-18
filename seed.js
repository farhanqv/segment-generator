import fs from 'node:fs';
import db from './db.js';
import { parsePortName } from './parsePortName.js';

const schemaSql = fs.readFileSync('schema.sql', 'utf8');
db.exec(schemaSql);

const canvas = JSON.parse(fs.readFileSync('canvas.json', 'utf8'));

console.log('Nodes:', canvas.nodes);
console.log('Ports:', canvas.ports.length);
console.log('Connections:', canvas.connections.length);

const insertNode = db.prepare('INSERT INTO nodes (id) VALUES (?)');
for (const nodeId of canvas.nodes) {
  insertNode.run(nodeId);
}
console.log('Inserted nodes.');

const insertPort = db.prepare(
  'INSERT INTO ports (node_id, label, value) VALUES (?, ?, ?)'
);
for (const { port, value } of canvas.ports) {
  const { node, label } = parsePortName(port);
  insertPort.run(node, label, value);
}
console.log('Inserted ports.');


const findPort = db.prepare('SELECT id FROM ports WHERE node_id = ? AND label = ?');
const insertConnection = db.prepare(
  'INSERT INTO connections (source_port_id, target_port_id) VALUES (?, ?)'
);
for (const {source, target} of canvas.connections) {
  const s = parsePortName(source);
  const t = parsePortName(target);

  const sourceRow = findPort.get(s.node, s.label);
  const targetRow = findPort.get(t.node, t.label);

  if (!sourceRow) throw new Error(`Unknown source port: ${source}`);
  if (!targetRow) throw new Error(`Unknown target port: ${target}`);

  insertConnection.run(sourceRow.id, targetRow.id);
}
console.log('Inserted connections.');