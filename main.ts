import axios from 'axios';
import { createLogger, transports, format } from 'winston';
import {MongoClient, ServerApiVersion} from 'mongodb';
import {error} from 'console';

const wfStatAPI = 'https://api.warframestat.us/pc';
const dbUri = '';
const dbName = 'CPresDB'
const pollTime = 5000
// -------------------Logger setup-------------------
const logger = createLogger({
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      console.log(`[${level}]: ${message}`);
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
});

logger.log('info','App started\n');

const dbClient = new MongoClient(dbUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

logger.log('info','Polling interval started.')
setInterval( async function(){
  axios.get(wfStatAPI).then( resp => {
    if (resp.status !== 200){
      logger.error(wfStatAPI + '- expected status 200 got: ' + resp.status)
    }
    else{
      console.log(resp);
      dbRun().catch( function (error) {logger.error("MongoDB" + " - " + error)});
    }
  })
  .catch( function (error) {logger.error(wfStatAPI + " - " + error)});
}, pollTime); 

async function dbRun() {
  try {
    await dbClient.connect();
    await checkWfEvents(dbClient);
  } finally {
    await dbClient.close();
  }
}

async function checkWfEvents(dbClient) {
  const db = await dbClient.db(dbName);
  const coll = await db.collection("DiscordPingSubcriptionsTable");
  await coll.find().forEach(entry => {
    console.log(entry)
  });

}