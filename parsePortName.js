// parsePortName.js
export function parsePortName(name) {
  const match = String(name).match(/^(\d+)([a-zA-Z])$/);
  if (!match) {
    throw new Error(`Invalid port name: "${name}"`);
  }
  return {
    node: Number(match[1]),
    label: match[2],
  };
}