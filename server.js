'use strict';

const express = require('express');
const { spawn } = require('child_process');

//Initilization
const app = express();
var zipfilename;
app.use(express.static('public')); //serves files in public. 

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

app.get('/today', (req, res) => {

  res.redirect('/date'); 

});

app.get('/date/:day?/:month?/:year?/:product?', (req, res) => {

  let day = req.params.day;
  let month = req.params.month;
  let year = req.params.year;
  let product = req.params.product;

  if(req.body){
    console.log(body);
  }

  console.log(`${day}, ${month}, ${year}`);
  console.log(`"${product}"`);

  const child = spawn('node', ['-e', `require("./snapshot").getFiles(${day}, ${month}, ${year}, "${product}")`], {
    detached: true,
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  child.on('message', message => { 
    if(message === "Done zipping") res.redirect('/download'); //Child says the zip is ready for download, let's get it.
    else zipfilename = message; 
  } )

});

app.get('/download', (req, res) => {
  res.download(`./${zipfilename}`);
})

//Binding to servo specified port
app.listen(process.env.PORT, () => {
  console.log(`Snapshot-Service listening on port ${process.env.PORT}...`);
});