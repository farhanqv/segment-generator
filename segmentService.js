import { loadGraph } from './canvasRepo.js';

function buildLookups({ ports, connections }) {
  const portById = new Map(ports.map(p => [p.id, p]));

  const portsByNode = new Map();
  for (const p of ports) {
    if (!portsByNode.has(p.nodeId)) portsByNode.set(p.nodeId, []);
    portsByNode.get(p.nodeId).push(p);
  }

  const connectionByTarget = new Map();
  for (const c of connections) {
    connectionByTarget.set(c.targetPortId, c);
  }

  return { portById, portsByNode, connectionByTarget };
}

function resolveSources(portId, lookups) {
  const port = lookups.portById.get(portId);

  if (port.value !== null) {
    return [port];
  }

  const incoming = lookups.connectionByTarget.get(portId);
  if (incoming) {
    return resolveSources(incoming.sourcePortId, lookups);
  }

  const siblings = lookups.portsByNode.get(port.nodeId).filter(p => p.id !== portId);
  let found = [];
  for (const sibling of siblings) {
    found = found.concat(resolveSources(sibling.id, lookups));
  }
  return found;
}

export function generateSegments(graph) {
  const lookups = buildLookups(graph);
  const segments = [];

  for (const connection of graph.connections) {
    const targetPort = lookups.portById.get(connection.targetPortId);
    if (targetPort.value === null) continue;

    const sourcePorts = resolveSources(connection.sourcePortId, lookups);
    const sourceSum = sourcePorts.reduce((total, p) => total + p.value, 0);

    segments.push({
      target: targetPort,
      sources: sourcePorts,
      result: targetPort.value - sourceSum,
    });
  }

  const bySource = new Map(graph.connections.map(c => [c.sourcePortId, c]));

  for (const [nodeId, nodePorts] of lookups.portsByNode) {
    for (const outPort of nodePorts) {
      const isOutgoing = bySource.has(outPort.id);
      if (!isOutgoing) continue;
      if (outPort.value === null) continue;

      const feeders = nodePorts.filter(p =>
        p.id !== outPort.id &&
        lookups.connectionByTarget.has(p.id) &&
        p.value !== null
      );

      if (feeders.length === 0) continue;

      const feederSum = feeders.reduce((total, p) => total + p.value, 0);

      segments.push({
        target: outPort,
        sources: feeders,
        result: outPort.value - feederSum,
      });
    }
  }

  return segments;
}