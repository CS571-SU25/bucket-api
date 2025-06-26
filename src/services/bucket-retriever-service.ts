import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { DBData } from '../model/badger-types';

export class CS571BucketRetrieverService {
    public getDbByBid(bid: string): Low<DBData> {
        const adapter = new JSONFile<DBData>(`./buckets/${bid}.json`);
        const db = new Low<DBData>(adapter, {});
        return db;
    }
}