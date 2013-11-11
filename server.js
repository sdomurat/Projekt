var http = require('http'),
	util = require('util'),
	fs = require('fs'),
	path = require('path'),
	io = require('socket.io'),
	gra = false,
	iluGraczy = 2,
	gracze = [],
	talia = [],
	tasTalia = [],
	odloz = [],
	kogoRuch,
	wez,
	czekanie,
	zadanaFigura,
	zadanyKolor;

var Gracz = (function () {
	"use strict";
	var nick = "", szefStolu = false, czyGra = true;
	return {
		tworzGracza: function (nick, szefStolu, czyGra) {
			this.nick = nick;
			this.szefStolu = szefStolu;
			this.czyGra = czyGra;
		},
		getNick: function () { return this.nick; },
		getSzefStolu: function () { return this.szefStolu; },
		getCzyGra: function () { return this.czyGra; },
		getKarty: function () { return this.karty; },
		setSzefStolu: function (szefStolu) {this.szefStolu = szefStolu; },
		setCzyGra: function (czyGra) {this.czyGra = czyGra; },
		karty: []
	};
}());	
	
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
	
	client.on('disconnect', function () {
		for (i = 0; i < gracze.length; i += 1) {
			if (gracze[i].getNick() === username) {
				while (gracze[i + 1] !== undefined) {
					gracze[i] = gracze[i + 1];
					i += 1;
				}
				gracze.pop();
			}
		}

		client.broadcast.emit('disconnectGracz', username);
		client.broadcast.emit('pokazStart');
		gra = false;

	});
});

server.listen(8888, function () {
	'use strict';
	console.log("Listening on " + 8888);
});