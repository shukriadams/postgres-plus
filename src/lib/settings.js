let fs = require('fs-extra'),
    sanitize = require('sanitize-filename'),
    yaml = require('js-yaml'),
    _settings = null;

module.exports = {
    get : async function(){

        if (!_settings){

            try {
                let settingsYML = await fs.readFile('./settings.yml', 'utf8');
                rawSettings = yaml.safeLoad(settingsYML);
            } catch (e) {
                console.log('settings.yml contains invalid markup');
                console.log(e);
            }
            
            // force default structures
            rawSettings = Object.assign({
                version : 1,
                pgdumpTestMode : false,
                jobs : {}
            }, rawSettings);
    
            for (let jobName in rawSettings.jobs){
                let job = rawSettings.jobs[jobName];
                rawSettings.jobs[jobName] = Object.assign({
                    database : 'not-set',
                    cronmask : '*/10 * * * * *',
                    enabled : true,
                    archive : null
                }, job);
            }

            _settings = rawSettings;
        }

        return _settings;
    }
};