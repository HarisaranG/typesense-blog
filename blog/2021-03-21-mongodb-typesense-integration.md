---
title: MongoDB Integration with Typesense
description: Indexing MongoDB documents in Typesense
author: Harisaran
type: article
picture: mongodb.svg
sidebar: auto
---

# MongoDB Integration with Typesense

Hey there! 👋. This post gives you a guide to integrate Typesense server with MongoDB by setting up a trigger using MongoDB's Change Streams.

![Typesense DynamoDB Integration Chart](~@alias/mongodb.svg)

## Step 1: Install and Run Typesense

To install and start typesense using docker issue the following docker command,

```bash
docker run -p 8108:8108 -v/tmp/typesense-data:/data typesense/typesense:0.19.0 \
--data-dir /data --api-key=$TYPESENSE_API_KEY
```

Now, we can check if our Typsense server is ready to accept requests.

```bash
curl http://localhost:8108/health
{"ok":true}
```

You can also run Typesense in other ways. Check out [Typesense Installation](https://typesense.org/docs/0.19.0/guide/install-typesense.html) for more details.

## Step 2: Start a MongoDB Replica Set

Here we will convert a standalone MongoDB instance to a replica set. 
To convert to replica set:
* Shutdown already running MongoDB server.
* Start the MongoDB server by specifying -- replSet option
```bash
mongod --port "PORT" --dbpath "YOUR_DB_DATA_PATH" --replSet "REPLICA_SET_INSTANCE_NAME"
```

Check the status of replica set issuing the command `rs.status()` in mongo shell.

## Step 3: Open a Change Stream

We can open a change stream for MongoDB Replica Set from any of the data-bearing members.

Example,
```js
const uri = '<MongoDB-URI>';
const mongodbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
const client = new MongoClient(uri, mongodbOptions);
await client.connect();
const collection = client.db("sample").collection("books");
const changeStream = collection.watch();
changeStream.on('change', (next) => {
    // process next document
});
```

## Step 4: Create a Typesense Collection

To use Typesense, we first need to create a client. Typesense supports multiple API clients including Javascript, Python, Ruby, PHP etc.

To create the Javascript client, you need the API key of the Typesense server:

```js
import Typesense from 'typesense'

let typesense = new Typesense.Client({
  'nodes': [{
    'host': 'localhost',
    'port': '8108',
    'protocol': 'http'
  }],
  'apiKey': '<API_KEY>',
  'connectionTimeoutSeconds': 2
})
```
Next, we will create a collection. A collection needs a schema, that represents how a douments would look like.

```js
let schema = {
    'name': 'books',
    'fields': [
        { 'name': 'id', 'type': 'string', 'facet': false },
        { 'name': 'name', 'type': 'string','facet': false },
        { 'name': 'author', 'type': 'string', 'facet': false },
        { 'name': 'year', 'type': 'int32', 'facet': true },
    ],
    'default_sorting_field': 'year',
}
await typesense.collections().create(schema);
```

## Step 5: Index documents to Typesense

Next, we'll write functions to listen to change streams from MongoDB and write the changes to Typesense.

A example MongoDB change streams response,

```js
{
  _id: {
    _data: '826062978E000000012B022C0100296E5'
  },
  operationType: 'insert',
  clusterTime: Timestamp { _bsontype: 'Timestamp', low_: 1, high_: 1617074062 },
  fullDocument: {
    _id: 6062978e06e4444ef0c7f16a,
    name: 'Davinci Code',
    author: 'Dan Brown',
    year: 2003
  },
  ns: { db: 'sample', coll: 'books' },
  documentKey: { _id: 6062978e06e4444ef0c7f16a }
}
{
  _id: {
    _data: '826062978E000000032B022C0100296E5'
  },
  operationType: 'update',
  clusterTime: Timestamp { _bsontype: 'Timestamp', low_: 3, high_: 1617074062 },
  ns: { db: 'sample', coll: 'books' },
  documentKey: { _id: 6062978e06e4444ef0c7f16a },
  updateDescription: { updatedFields: { year: 2000 }, removedFields: [] }
}
{
  _id: {
    _data: '826062978E000000072B022C0100296E5'
  },
  operationType: 'delete',
  clusterTime: Timestamp { _bsontype: 'Timestamp', low_: 7, high_: 1617074062 },
  ns: { db: 'sample', coll: 'books' },
  documentKey: { _id: 6062978e06e4444ef0c7f16c }
}
```
A example function,
```js
async function index(next, typesense){
    if(next.operationType == 'delete') {
        await typesense.collections('books').documents(next.documentKey._id).delete();
    } else if(next.operationType == 'update') {
        let data = JSON.stringify(next.updateDescription.updatedFields);
        await typesense.collections('books').documents(next.documentKey._id).update(data);
    } else {
        next.fullDocument.id = next.fullDocument["_id"];
        delete next.fullDocument._id;
        let data = JSON.stringify(next.fullDocument);
        await typesense.collections('books').documents().upsert(data);
    }
}
```

That's it 😊! Now you can easily search through your MongoDB documents using Typsense. You can even use [Typesense Cloud](https://cloud.typesense.org/) and [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud version.

## References
- [Sample Code](https://github.com/HarisaranG/typesense-mongodb)
- [MongoDB Change Streams](https://docs.mongodb.com/manual/changeStreams/)
- [Change Streams NodeJS](https://developer.mongodb.com/quickstart/nodejs-change-streams-triggers/)
- [Typesense API](https://typesense.org/docs/0.19.0/api/))
- [Typesense guide](https://typesense.org/docs/0.19.0/guide/)