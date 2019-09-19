(async function(){

    let http = require('http'),
        settingsProvider = require('./lib/settings'),
        Logger = require('winston-wrapper'),
        daemon = require('./lib/daemon'),
        fs = require('fs-extra'),
        settings = await settingsProvider.get(),
        logPath = './logs';

    fs.ensureDirSync(logPath);
    Logger.initialize(logPath);

    daemon.start(settings.jobs);

    let server = http.createServer(async function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('It works \n');
    });

    server.listen(settings.port);
    console.log(`Server running at port ${settings.port}`);

})()
