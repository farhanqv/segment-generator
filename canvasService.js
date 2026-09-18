// canvasService.js
import { loadGraph } from './canvasRepo.js';

export function getCanvas() {
  const { nodes, ports, connections } = loadGraph();
  const portById = new Map(ports.map(p => [p.id, p]));

  return {
    nodes: nodes.map(node => ({
      id: node.id,
      ports: ports
        .filter(p => p.nodeId === node.id)
        .map(p => ({ port: `${p.nodeId}${p.label}`, value: p.value })),
    })),
    connections: connections.map(c => {
      const source = portById.get(c.sourcePortId);
      const target = portById.get(c.targetPortId);
      return {
        source: `${source.nodeId}${source.label}`,
        target: `${target.nodeId}${target.label}`,
      };
    }),
  };
}