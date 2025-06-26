import { Express } from 'express';

import { stat } from 'fs/promises';

import { CS571Route } from "@cs571/api-framework/src/interfaces/route";
import { CS571BucketRetrieverService } from '../services/bucket-retriever-service';
import { CS571MutexService } from '../services/mutex-service';
import CS571BucketPublicConfig from '../model/configs/bucket-public-config';

export class CS571CollectionDeleteRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/:collection';

    private readonly brs: CS571BucketRetrieverService;
    private readonly ms: CS571MutexService;

    public constructor(brs: CS571BucketRetrieverService, ms: CS571MutexService) {
        this.brs = brs;
        this.ms = ms;
    }

    public addRoute(app: Express): void {
        app.delete(CS571CollectionDeleteRoute.ROUTE_NAME, async (req, res) => {
            const { collection } = req.params;
            const { id } = req.query;

            const BID = req.header("X-CS571-ID") as string;

            if (!id) {
                res.status(400).send({
                    msg: "You must specify an id to delete or 'entire_collection'."
                });
                return;
            }

            const db = this.brs.getDbByBid(BID);

            await this.ms.getLock(BID).runExclusive(async () => {
                await db.read();
                db.data![collection] ||= {};
                if((id as string) === "entire_collection") {
                    delete db.data![collection];
                    res.status(200).json({ collection });
                    await db.write();
                } else if(Object.keys(db.data![collection]).includes(id as string)) {
                    delete db.data![collection][id as string];
                    res.status(200).json({ id });
                    await db.write();
                } else {
                    res.status(404).send({
                        msg: `No item with id '${id}' exists in collection '${collection}'`
                    });
                    return;
                }
            });
            
        })
    }

    public getRouteName(): string {
        return CS571CollectionDeleteRoute.ROUTE_NAME;
    }
}