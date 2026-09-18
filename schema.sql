PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS connections;
DROP TABLE IF EXISTS ports;
DROP TABLE IF EXISTS nodes;

CREATE TABLE nodes (
    id INTEGER PRIMARY KEY
);

CREATE TABLE ports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value REAL NULL,

    UNIQUE(node_id,label)
);

CREATE TABLE connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_port_id INTEGER NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
    target_port_id INTEGER NOT NULL REFERENCES ports(id) ON DELETE CASCADE,

    UNIQUE(source_port_id),
    UNIQUE(target_port_id),

    CHECK(source_port_id <> target_port_id)
);

