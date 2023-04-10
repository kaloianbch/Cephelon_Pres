const http = require('http');
const axios = require('axios');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const WFStatAPI = 'https://api.warframestat.us/pc';

// -------------------Logger setup-------------------
const logFormat = printf(({ level, message, timestamp }) => {
  console.log(`[${level}]: ${message}`)
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app.log' })
  ]
});

logger.log('info','App started.');

logger.log('info','Polling interval started.')
let apiPollInterval = setInterval( async function(){
  axios.get(WFStatAPI).then( resp => {
    if (resp.status !== 200){
      logger.error(WFStatAPI + '- expected status 200 got: ' + resp.status)
    }
    else{
      console.log(resp);
    }
  })
  .catch( function (error) {
    logger.error(WFStatAPI + " - " + error)
  });
}, 5000); 