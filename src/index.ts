import fs from 'fs'

import express, { Express } from 'express';
import cookies from "cookie-parser";

import { CS571Initializer } from '@cs571/api-framework'
import CS571BucketPublicConfig from './model/configs/bucket-public-config';
import CS571BucketSecretConfig from './model/configs/bucket-secret-config';
import { CS571CollectionAddRoute } from './routes/collection-add';
import { CS571CollectionGetRoute } from './routes/collection-get';
import { CS571BucketRetrieverService } from './services/bucket-retriever-service';
import { CS571MutexService } from './services/mutex-service';
import { CS571CollectionUpdateRoute } from './routes/collection-update';
import { CS571CollectionDeleteRoute } from './routes/collection-delete';
import { CS571GetAllCollections } from './routes/collections';

console.log("Welcome to bucket!");

if (!fs.existsSync("./buckets")) {
  fs.mkdirSync("buckets")
}

const app: Express = express();

app.use(cookies());

// https://github.com/expressjs/express/issues/5275
declare module "express-serve-static-core" {
  export interface CookieOptions {
    partitioned?: boolean;
  }
}

const appBundle = CS571Initializer.init<CS571BucketPublicConfig, CS571BucketSecretConfig>(app, {
  allowNoAuth: [],
  skipAuth: false,
  skipCors: true
});

const brs = new CS571BucketRetrieverService();
const ms = new CS571MutexService();

appBundle.router.addRoutes([
  new CS571GetAllCollections(brs),
  new CS571CollectionGetRoute(brs),
  new CS571CollectionAddRoute(brs, ms, appBundle.config.PUBLIC_CONFIG),
  new CS571CollectionUpdateRoute(brs, ms, appBundle.config.PUBLIC_CONFIG),
  new CS571CollectionDeleteRoute(brs, ms),
])

app.listen(appBundle.config.PORT, () => {
  console.log(`Running at :${appBundle.config.PORT}`);
});
