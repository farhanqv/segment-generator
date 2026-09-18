// canvasRepo.js
import db from './db.js';

export function loadGraph() {
  const nodes = db.prepare('SELECT id FROM nodes ORDER BY id').all();

  const ports = db
    .prepare('SELECT id, node_id AS nodeId, label, value FROM ports ORDER BY node_id, label')
    .all();

  const connections = db
    .prepare('SELECT source_port_id AS sourcePortId, target_port_id AS targetPortId FROM connections')
    .all();

  return { nodes, ports, connections };
}