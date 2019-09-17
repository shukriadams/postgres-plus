let http = require('http'),
    process = require('process'),
    port = process.env.port || 3100; 

let server = http.createServer(async function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('It works \n');

});

server.listen(port);
console.log(`Server running at port ${port}`);
