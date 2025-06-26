import { CS571DefaultPublicConfig } from "@cs571/api-framework";

export default interface CS571BucketPublicConfig extends CS571DefaultPublicConfig {
    MAX_REQUEST_SIZE_KB: number
    MAX_BUCKET_SIZE_KB: number
}