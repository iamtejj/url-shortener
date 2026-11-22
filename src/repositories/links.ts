// Data-access layer. Only this file should know how links are stored.
// In-memory placeholder; swap for a real database later.

export interface LinkRecord {
  code: string;
  originalUrl: string;
  createdAt: Date;
}

const store = new Map<string, LinkRecord>();

export async function saveLink(record: LinkRecord): Promise<LinkRecord> {
  store.set(record.code, record);
  return record;
}

export async function findLinkByCode(code: string): Promise<LinkRecord | undefined> {
  return store.get(code);
}
