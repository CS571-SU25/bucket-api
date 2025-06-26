import { Express } from 'express';

import { CS571Route } from "@cs571/api-framework/src/interfaces/route";
import { CS571BucketRetrieverService } from '../services/bucket-retriever-service';
import { CS571MutexService } from '../services/mutex-service';

export class CS571GetAllCollections implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/';

    private readonly brs: CS571BucketRetrieverService;
    
    public constructor(brs: CS571BucketRetrieverService) {
        this.brs = brs;
    }

    public addRoute(app: Express): void {
        app.get(CS571GetAllCollections.ROUTE_NAME, async (req, res) => {
            const BID = req.header("X-CS571-ID") as string;
            const db = this.brs.getDbByBid(BID);

            await db.read();

            const collections = Object.keys(db.data) || [];
            res.status(200).json(collections);
        })
    }

    public getRouteName(): string {
        return CS571GetAllCollections.ROUTE_NAME;
    }
}