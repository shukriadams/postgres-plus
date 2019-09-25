let CronJob = require('cron').CronJob,
    Logger = require('winston-wrapper'),
    exec = require('madscience-node-exec'),
    path = require('path'),
    timebelt = require('timebelt'),
    jsonfile = require('jsonfile'),
    fs = require('fs-extra'),
    settingsProvider = require('./settings'),
    _jobs = [];

class CronProcess
{
    constructor(args){

        this.cronmask = args.cronmask;
        this.database = args.database;
        this.logInfo = Logger.instance().info.info;
        this.logError = Logger.instance().error.error;
        this.busy = false;
        
    }

    async start(){
        
        this.logInfo(`Starting job ${this.database}`);
        
        const folder = path.join('./backups/dumps', this.database);
        const settings = await settingsProvider.get();
        const historyLogFolder = path.join('./backups/flags', this.database);

        fs.ensureDirSync(folder);
        fs.ensureDirSync(historyLogFolder);

        this.cronJob = new CronJob(this.cronmask, async ()=>{
        
            let jobPassed = false;

            try
            {
                let now = new Date(),
                    filenameTimestamp = `${timebelt.toShortDate(now, 'y-m-d')}__${timebelt.toShortTime(now, 'h-m-s')}`;

                if (settings.pgdumpTestMode){
                    fs.outputFile(`${folder}/${this.database}_${filenameTimestamp}.tar.gz`, 'test dump content');
                } else {
                    console.log('starting pg_dump');
                    await exec({ 
                        cmd : 'pg_dump',
                        args : [ 
                            '-f',
                            `${folder}/${this.database}_${filenameTimestamp}.dmp`,
                            this.database
                        ]
                    });
                }

                jobPassed = true;
                // backup
                // push to s3?
                //jobPassed = true;

                // log
                this.logInfo(`Completed job ${this.database}`);
            } catch (ex){
                this.logError(ex);
            } finally {
                this.busy = false;
            }
            
            const now = new Date();

            // write static status flag
            jsonfile.writeFileSync(path.join(historyLogFolder, `status.json`), {
                passed : jobPassed,
                date : now
            });
            
            // write per-fail flag
            if (!jobPassed)
                jsonfile.writeFileSync(path.join(historyLogFolder, `fail-${now.getTime()}.json`), {
                    date : now
                });

        }, null, true, null, null, true /*runonitit*/);
    }
}

module.exports = {
    
    jobs : _jobs,

    start : async ()=>{

        const settings = await settingsProvider.get();

        for (const database in settings.jobs){
            const job = settings.jobs[database],
                process = new CronProcess({
                    database : database,
                    cronmask: job.cronmask 
                });

            _jobs.push(process);
            await process.start();
        }
    }
}