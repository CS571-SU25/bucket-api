import { Express } from 'express';

import { stat } from 'fs/promises';
import { CS571Route } from "@cs571/api-framework/src/interfaces/route";
import { CS571BucketRetrieverService } from '../services/bucket-retriever-service';
import { CS571MutexService } from '../services/mutex-service';
import CS571BucketPublicConfig from '../model/configs/bucket-public-config';

export class CS571CollectionAddRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/:collection';

    private readonly brs: CS571BucketRetrieverService;
    private readonly ms: CS571MutexService;
    private readonly pubConfig: CS571BucketPublicConfig;
    
    public constructor(brs: CS571BucketRetrieverService, ms: CS571MutexService, pubConfig: CS571BucketPublicConfig) {
        this.brs = brs;
        this.ms = ms;
        this.pubConfig = pubConfig;
    }

    public addRoute(app: Express): void {
        app.post(CS571CollectionAddRoute.ROUTE_NAME, async (req, res) => {
            const { collection } = req.params;

            const BID = req.header("X-CS571-ID") as string;

            if(Buffer.byteLength(JSON.stringify(req.body)) > this.pubConfig.MAX_REQUEST_SIZE_KB * 1024) {
                res.status(413).send({
                    msg: `Request is too large, max size of ${ this.pubConfig.MAX_REQUEST_SIZE_KB}kb`
                });
                return;
            }

            try {
                if ((await stat(`./buckets/${BID}.json`)).size > this.pubConfig.MAX_BUCKET_SIZE_KB * 1024) {
                    res.status(413).send({
                        msg: `Bucket is currently too full, exceeds max size of ${ this.pubConfig.MAX_BUCKET_SIZE_KB}kb`
                    });
                    return;
                }
            } catch (e) {}

            if (typeof req.body !== "object" || Object.keys(req.body).length === 0) {
                res.status(400).send({
                    msg: "You must specify a non-empty object in the request body."
                });
                return;
            }           

            const db = this.brs.getDbByBid(BID);
           
            const id = crypto.randomUUID();

            await this.ms.getLock(BID).runExclusive(async () => {
                await db.read();
                db.data![collection] ||= {};
                db.data![collection][id] = req.body;
                await db.write();
            });

            res.status(200).json({ id });
            
        })
    }

    public getRouteName(): string {
        return CS571CollectionAddRoute.ROUTE_NAME;
    }
}