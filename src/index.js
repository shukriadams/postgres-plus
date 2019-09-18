(async function(){

    let http = require('http'),
        process = require('process'),
        port = process.env.port || 3000,
        yaml = require('js-yaml'),
        Logger = require('winston-wrapper'),
        daemon = require('./lib/daemon'),
        fs = require('fs-extra'),
        logPath = './logs',
        settings = {};

    fs.ensureDirSync(logPath);
    Logger.initialize(logPath);

    try {
        let rawSettings = await fs.readFile('./settings.yml', 'utf8');
        settings = yaml.safeLoad(rawSettings);
    } catch (e) {
        console.log('settings.yml contains invalid markup');
        console.log(e);
    }

    // force default structures
    settings = Object.assign({
        jobs : {}
    }, settings);

    for (let jobName in settings.jobs){
        let job = settings.jobs[jobName];
        settings.jobs[jobName] = Object.assign({
            database : 'not-set',
            cronmask : '*/10 * * * * *',
            enabled : true,
            archive : null
        }, job);
    }
    

    daemon.start(settings.jobs);

    let server = http.createServer(async function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('It works \n');

    });

    server.listen(port);
    console.log(`Server running at port ${port}`);

})()

