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
app.get('/snap', (req, res) => {

  const child = spawn('node', ['-e', 'require("./snapshot").takeSnapshot()'], {
    detached: true,
    stdio: 'inherit'
  });

  res.status(200).send('<h1>Snapping, check the logs!</h1>');

});

app.get('/list', (req, res) => {

  const child = spawn('node', ['-e', 'require("./snapshot").checkFiles()'], {
    detached: true,
    stdio: 'inherit'
  });

  res.send('<p>Listing, yay?...</p>');

});

app.get('/', (req, res) => {

  res.redirect('/date'); return;

  const child = spawn('node', ['-e', `require("./snapshot").getFiles()`], {
    detached: true,
    stdio: 'inherit'
  });

  setTimeout( () => {
    //Go get the zip we just made!
    res.redirect('/download');
  }, 1000);


});

app.get('/date/:day?/:month?/:year?', (req, res) => {

  let day = req.params.day;
  let month = req.params.month;
  let year = req.params.year;

  console.log(`${day}, ${month}, ${year}`);

  const child = spawn('node', ['-e', `require("./snapshot").getFiles(${day}, ${month}, ${year})`], {
    detached: true,
    stdio: 'inherit'
  });

  setTimeout( () => {
    //Go get the zip we just made!
    res.redirect('/download');
  }, 1000);

});

app.get('/download', (req, res) => {
   res.download('./snapshot.zip');
})

//Binding to servo specified port
app.listen(process.env.PORT, () => {
  console.log(`Snapshot-Service listening on port ${process.env.PORT}...`);
});