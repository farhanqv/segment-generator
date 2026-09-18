# Segment Generator

Backend take-home test: model a directed graph canvas (nodes, ports, ,values connections) as a database, and expose an HTTP API that returns the full canvas and every computed **segment**.

**Stack:** Node.js + Express + SQLite (`better-sqlite3`)

---

## Prerequisites

- Node.js 18+ (tested on Node 20)
- npm

---

## Setup & Run

```bash
npm install
npm run seed     # creates canvas.sqlite and loads the canvas data
npm start        # starts the API on http://localhost:3000
```

You should see:
```
Server listening on http://localhost:3000
```

## Test It

```bash
curl localhost:3000/health
curl localhost:3000/canvas
curl localhost:3000/segments
```

For readable (pretty-printed) output:
```bash
curl -s localhost:3000/canvas   | python3 -m json.tool
curl -s localhost:3000/segments | python3 -m json.tool
```

---

## Project Structure

```
segment-generator/
├── canvas.json             # the canvas as data (nodes, ports, connections)
├── db.js                   # opens the SQLite connection
├── parsePortName.js        # "11d" -> { node: 11, label: "d" }
├── schema.sql              # table definitions + constraints
├── seed.js                 # applies schema.sql, then inserts nodes -> ports -> connections
├── canvasRepo.js           # SQL queries
├── canvasService.js        # shapes the raw graph into nested JSON for the API
├── segmentService.js       # segment logic
├── server.js               # Express app; routes: /canvas, /segments
├── package.json
├── package-lock.json
└── README.md
```
---

## Database Schema

```sql
nodes       (id)
ports       (id, node_id -> nodes.id, label, value NULL)   UNIQUE(node_id, label)
connections (id, source_port_id -> ports.id, target_port_id -> ports.id)
            UNIQUE(source_port_id)
            UNIQUE(target_port_id)
            CHECK (source_port_id <> target_port_id)
```
---

## API

### `GET /health`
```json
{ "status": "ok" }
```

### `GET /canvas`
Full canvas, every node with its nested ports (value or `null`), and every connection by readable port name.
```json
{
  "nodes": [
    { "id": 6, "ports": [
      { "port": "6a", "value": null },
      { "port": "6b", "value": null },
      { "port": "6c", "value": null }
    ]}
  ],
  "connections": [
    { "source": "1a", "target": "2a" }
  ]
}
```

### `GET /segments`
Segment count, list, and results.
```json
{
  "count": 9,
  "segments": [
    { "target": "2a",  "sources": ["1a"],            "result": -10 },
    { "target": "12a", "sources": ["3a", "2b"],       "result": -30 },
    { "target": "12b", "sources": ["4a", "5a"],       "result": -30 },
    { "target": "11a", "sources": ["8a"],             "result": -50 },
    { "target": "11b", "sources": ["9a"],             "result": -20 },
    { "target": "11d", "sources": ["10a"],            "result": -20 },
    { "target": "12c", "sources": ["11c"],            "result": 100 },
    { "target": "2b",  "sources": ["2a"],             "result": 40 },
    { "target": "11c", "sources": ["11a","11b","11d"],"result": -10 }
  ]
}
```