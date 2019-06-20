'use strict';

const express = require('express');
const { spawn } = require('child_process');

//Initilization
const app = express();

//Servo required health check
app.get('/_health', (req, res) => {
  console.log('GET /_health 200');
  res.status(200).json({
    status: 'OK',
    app: 'snapshot-service',
    commit: process.env.SERVO_COMMIT
  })
})

// TODO: Work with express better!
app.get('/', async (req, res) => {

  const child = spawn('node', ['snapshot.js'], {
    detached: true,
    stdio: 'inherit'
  });

  res.send('<p>Working, check the logs...</p>');

});

//Binding to servo specified port
app.listen(process.env.PORT, () => {
  console.log(`Snapshot-Service listening on port ${process.env.PORT}...`);
});