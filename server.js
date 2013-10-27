var server = http.createServer(function (req, res) {
	'use strict';
    var filePath = '.' + req.url,
        contentType = 'text/html',
        extName;
    console.log('request starting...');
    if (filePath === './') {
        filePath = './stol.html';
    }//sadsda
    extName = path.extname(filePath);
    switch (extName) {
    case '.js':
        contentType = 'text/javascript';
        break;
    case '.css':
        contentType = 'text/css';
        break;
    }

    path.exists(filePath, function (exists) {

        if (exists) {
            fs.readFile(filePath, function (error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });
});