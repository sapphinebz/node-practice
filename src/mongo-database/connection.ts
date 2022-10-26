import { MongoClient } from "mongodb";
import {
  fromEventPattern,
  Observable,
  ReplaySubject,
  share,
  Subject,
} from "rxjs";

// function connectToMongoDB() {
//   return new Observable<MongoClient>((subscriber) => {
//     const uri =
//       "mongodb+srv://thanadit:mon032goDB245279@cluster0.yndbzv3.mongodb.net/test";
//     const client = new MongoClient(uri);
//     client.connect().then(async () => {
//       try {
//         // await listDatabases(client);
//         subscriber.next(client);
//         subscriber.complete();
//       } catch (err) {
//         subscriber.error(err);
//       }
//     });

//     return {
//       unsubscribe: () => {
//         client.close();
//       },
//     };
//   });
// }

// async function listDatabases(client: MongoClient) {
//   const databasesList = await client.db().admin().listDatabases();

//   databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
// }

// export const mongo$ = connectToMongoDB().pipe(
//   share({ connector: () => new ReplaySubject(1) })
// );

// export function fromMongoDB() {
//   return fromEventPattern(
//     async (handler) => {
//       const uri =
//         "mongodb+srv://thanadit:mon032goDB245279@cluster0.yndbzv3.mongodb.net/test";
//       const client = new MongoClient(uri);
//       await client.connect();

//       handler(client);

//       return client;
//     },
//     (handler, client: MongoClient) => {
//       client.close();
//     }
//   );
// }

const uri =
  "mongodb+srv://thanadit:mon032goDB245279@cluster0.yndbzv3.mongodb.net/test";

const client = new MongoClient(uri);

let isConnected = false;
let refCount = 0;

// export function fromMongoDB() {
//   return new Observable((subscriber) => {
//     refCount++;
//     if (isConnected) {
//       subscriber.next(client);
//     } else {
//       try {
//         client.connect().then(() => {
//           isConnected = true;
//           subscriber.next(client);
//         });
//       } catch (err) {
//         subscriber.error(err);
//       }
//     }
//     return {
//       unsubscribe: () => {
//         refCount--;
//         if (refCount === 0) {
//           isConnected = false;
//           client.close();
//         }
//       },
//     };
//   });
// }
