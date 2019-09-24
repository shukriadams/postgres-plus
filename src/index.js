(async function(){

    let http = require('http'),
        settingsProvider = require('./lib/settings'),
        Logger = require('winston-wrapper'),
        daemon = require('./lib/daemon'),
        fs = require('fs-extra'),
        process = require('process'),
        settings = await settingsProvider.get(),
        logPath = './backups/logs';

    if (!await fs.exists('./settings.yml')){
        console.log('settings.yml not found, app will exit');
        process.exit(1);
    }

    fs.ensureDirSync(logPath);
    Logger.initialize(logPath);
    await daemon.start();

    // query types :
    // get job status : returns json with job's last expected run, and if that run failed. also returns a count of how many times the job has passed, and failed
    // 
    let server = http.createServer(async function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('It works \n');
    });

    server.listen(settings.port);
    console.log(`Server running at port ${settings.port}`);

})()
