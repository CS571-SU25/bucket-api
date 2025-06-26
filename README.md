build
```bash
docker build . -t ctnelson1997/cs571-su25-bucket-api
docker push ctnelson1997/cs571-su25-bucket-api
```

run
```bash
docker pull ctnelson1997/cs571-su25-bucket-api
docker run --name=cs571_su25_bucket_api -d --restart=always -p 38989:38989 -v /cs571/su25/bucket:/cs571 ctnelson1997/cs571-su25-bucket-api
```
