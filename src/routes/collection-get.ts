import { Express } from 'express';

import { CS571Route } from "@cs571/api-framework/src/interfaces/route";
import { CS571BucketRetrieverService } from '../services/bucket-retriever-service';
import { CS571MutexService } from '../services/mutex-service';

export class CS571CollectionGetRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/:collection';

    private readonly brs: CS571BucketRetrieverService;
    
    public constructor(brs: CS571BucketRetrieverService) {
        this.brs = brs;
    }

    public addRoute(app: Express): void {
        app.get(CS571CollectionGetRoute.ROUTE_NAME, async (req, res) => {
            const { collection } = req.params;
            const BID = req.header("X-CS571-ID") as string;
            const db = this.brs.getDbByBid(BID);

            await db.read();
            const items = db.data?.[collection];
            if (items) {
                res.status(200).json({
                    collection,
                    results: items
                });
            } else {
                res.status(404).json({
                    msg: `Collection '${collection}' does not exist! Try POSTing first.`
                });
            }
            
        })
    }

    public getRouteName(): string {
        return CS571CollectionGetRoute.ROUTE_NAME;
    }
}