import express from 'express';
import { getCanvas } from './canvasService.js';
import { loadGraph } from './canvasRepo.js';
import { generateSegments } from './segmentService.js';

const app = express();

app.get('/health', (req, res) => {
  res.json({status: 'ok'});
});

app.get('/canvas', (req, res) => {
  res.json(getCanvas());
});

app.get('/segments', (req, res) => {
  const graph = loadGraph();
  const segments = generateSegments(graph);
  res.json({
    count: segments.length,
    segments: segments.map(s => ({
      target: `${s.target.nodeId}${s.target.label}`,
      sources: s.sources.map(p => `${p.nodeId}${p.label}`),
      result: s.result,
    })),
  });
});

const PORT =3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost: ${PORT}`);
});