let CronJob = require('cron').CronJob,
    Logger = require('winston-wrapper'),
    exec = require('madscience-node-exec'),
    _jobs = [];

class CronProcess
{
    constructor(args){

        this.cronmask = args.cronmask;
        this.name = args.name;
        this.database = args.database;
        this.logInfo = Logger.instance().info.info;
        //this.logError = Logger.instance().error.error;
        this.busy = false;
    }

    start(){
        
        this.logInfo(`Starting job`);

        this.cronJob = new CronJob(this.cronmask, async()=>{
            try
            {
                console.log(`${this.name}`);
                const folder ='/tmp/postgresdumps';
                await exec({ cmd : 'pg_dump',
                    args :[this.database, 
                        '|' ,
                        'gzip',
                        `>${folder}/${this.database}_$(date +%Y-%m-%d__%H-%M-%S).tar.gz`]
                })
                // backup
                // push to s3?
                // log
                //this.logInfo(`${this.name}`);
            } catch (ex){
                //this.logError(ex);
            } finally {
                this.busy = false;
            }
        }, null, true, null, null, true /*runonitit*/);
    }
}

module.exports = {
    
    jobs : _jobs,

    start : (jobs)=>{

        for (const jobName in jobs){
            console.log(jobName);
            const job = jobs[jobName];
                process = new CronProcess({
                    name : jobName, 
                    cronmask: job.cronmask 
                });

            _jobs.push(process);
            process.start();
        }
    }
}