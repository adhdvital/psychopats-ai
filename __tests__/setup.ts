import { vi } from "vitest";

// ── In-memory InstantDB mock ──────────────────────────────────────────────
// Stores data in plain Maps, simulates query/transact/id behaviour.

type Record = { id: string; [key: string]: unknown };
const store: Map<string, Record[]> = new Map();

export function resetStore() {
  store.clear();
}

export function seedStore(table: string, rows: Record[]) {
  store.set(table, [...rows]);
}

export function getStoreRows(table: string): Record[] {
  return store.get(table) ?? [];
}

let idCounter = 0;
function mockId(): string {
  return `mock-id-${++idCounter}`;
}

// Query: { applications: { $: { where: { email } } } }
function mockQuery(q: { [table: string]: { $?: { where?: object } } }) {
  const result: { [table: string]: Record[] } = {};
  for (const table of Object.keys(q)) {
    const rows = store.get(table) ?? [];
    const where = q[table]?.$?.where;
    if (where) {
      result[table] = rows.filter((row) => {
        return Object.entries(where).every(
          ([k, v]) => row[k] === v,
        );
      });
    } else {
      result[table] = [...rows];
    }
  }
  return Promise.resolve(result);
}

// Transact: tx.applications[id].update(data)
function mockTransact(op: { table: string; rowId: string; data: object }) {
  const table = op.table;
  if (!store.has(table)) store.set(table, []);
  const rows = store.get(table)!;

  const idx = rows.findIndex((r) => r.id === op.rowId);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...op.data };
  } else {
    rows.push({ id: op.rowId, ...op.data });
  }
  return Promise.resolve();
}

const db = {
  query: mockQuery,
  transact: mockTransact,
};

// tx proxy: tx.applications["abc"].update({...}) → { table, rowId, data }
const txHandler: ProxyHandler<object> = {
  get(_target, table: string) {
    return new Proxy(
      {},
      {
        get(_t2, rowId: string) {
          return {
            update(data: object) {
              return { table, rowId, data };
            },
          };
        },
      },
    );
  },
};
const txProxy = new Proxy({}, txHandler);

// Mock @instantdb/admin
vi.mock("@instantdb/admin", () => ({
  init: () => db,
  id: mockId,
  tx: txProxy,
}));

// Mock resend (email)
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: vi.fn().mockResolvedValue({ id: "mock-email-id" }),
    };
  },
}));

// Reset between tests
beforeEach(() => {
  resetStore();
  idCounter = 0;
});
