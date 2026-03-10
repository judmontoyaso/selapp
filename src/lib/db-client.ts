import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Sermon {
    id: string;
    title: string;
    pastor: string;
    date: string;
    _count?: {
        messages: number;
    };
}

interface OfflineMutation {
    id: string; // Unique ID for the mutation
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    endpoint: string;
    payload: any;
    timestamp: number;
}

interface SelappDB extends DBSchema {
    sermons_store: {
        key: string;
        value: Sermon;
        indexes: { 'by-date': string };
    };
    offline_mutations: {
        key: string;
        value: OfflineMutation;
        indexes: { 'by-timestamp': number };
    };
}

let dbPromise: Promise<IDBPDatabase<SelappDB>> | null = null;

export const getDB = () => {
    if (typeof window === 'undefined') return null;

    if (!dbPromise) {
        dbPromise = openDB<SelappDB>('selapp-db', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('sermons_store')) {
                    const sermonStore = db.createObjectStore('sermons_store', { keyPath: 'id' });
                    sermonStore.createIndex('by-date', 'date');
                }
                if (!db.objectStoreNames.contains('offline_mutations')) {
                    const mutationStore = db.createObjectStore('offline_mutations', { keyPath: 'id' });
                    mutationStore.createIndex('by-timestamp', 'timestamp');
                }
            },
        });
    }
    return dbPromise;
};

// --- SERMONS STORE METHODS ---

export const saveSermonLocal = async (sermon: Sermon) => {
    const db = await getDB();
    if (!db) return;
    await db.put('sermons_store', sermon);
};

export const saveMultipleSermonsLocal = async (sermons: Sermon[]) => {
    const db = await getDB();
    if (!db) return;
    const tx = db.transaction('sermons_store', 'readwrite');
    await Promise.all(sermons.map(s => tx.store.put(s)));
    await tx.done;
};

export const getSermonsLocal = async (): Promise<Sermon[]> => {
    const db = await getDB();
    if (!db) return [];
    const sermons = await db.getAllFromIndex('sermons_store', 'by-date');
    // Return descending by date
    return sermons.reverse();
};

export const deleteSermonLocal = async (id: string) => {
    const db = await getDB();
    if (!db) return;
    await db.delete('sermons_store', id);
};

// --- OFFLINE MUTATIONS METHODS ---

export const queueOfflineMutation = async (mutation: Omit<OfflineMutation, 'id' | 'timestamp'>) => {
    const db = await getDB();
    if (!db) return;

    const id = crypto.randomUUID();
    await db.put('offline_mutations', {
        ...mutation,
        id,
        timestamp: Date.now(),
    });
};

export const getOfflineMutations = async (): Promise<OfflineMutation[]> => {
    const db = await getDB();
    if (!db) return [];
    return await db.getAllFromIndex('offline_mutations', 'by-timestamp');
};

export const removeOfflineMutation = async (id: string) => {
    const db = await getDB();
    if (!db) return;
    await db.delete('offline_mutations', id);
};
