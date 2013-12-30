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

//Obiekt który reprezentuje  daną kartę
var karta = (function () {
	"use strict";
	var id = -1,
		nazwa = "",
		figura = "",
		kolor = "",
		mocBicia = 0,
		czekasz = false,
		zadanieFigury = false,
		zadanieKoloru = false,
		nowa = false;
	return {
		tworzKarte: function (id, nazwa, figura, kolor, mocBicia, czekasz, zadanieFigury, zadanieKoloru) {
			this.id = id;
			this.nazwa = nazwa;
			this.figura = figura;
			this.kolor = kolor;
			this.mocBicia = mocBicia;
			this.czekasz = czekasz;
			this.zadanieFigury = zadanieFigury;
			this.zadanieKoloru = zadanieKoloru;
			this.nowa = false;
		},
		getId: function () { return this.id; },
		getNazwa: function () { return this.nazwa; },
		getFigura: function () { return this.figura; },
		getKolor: function () { return this.kolor; },
		getBicie: function () { return this.bicie; },
		getMocBicia: function () { return this.mocBicia; },
		getCzekasz: function () { return this.czekasz; },
		getZadanieFigury: function () { return this.zadanieFigury; },
		getZadanieKoloru: function () { return this.zadanieKoloru; },
		setNowa: function (nowa) { this.nowa = nowa; }
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
    }
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

var socket = io.listen(server);

// --------- CONNECT ------------------
socket.on('connection', function (client) {
	'use strict';
	var username, i, j;

	if (gracze.length <= iluGraczy && gra === false) {
		//iluGraczy += 1;

		client.emit('ustawIstniejacychGraczy', gracze);

		client.on('nowyU', function (login) {
			username = login;
			client.emit('message', 'Witaj ' + username + '!');
			client.broadcast.emit('message', 'Użytkownik ' + username + ' wszedł do gry!');
			gracze.push(Object.create(Gracz));
			if (gracze.length === 1) {
				gracze[gracze.length - 1].tworzGracza(username, true, true);
				gracze[gracze.length - 1].karty = Object.create(Array.prototype);
			} else {
				gracze[gracze.length - 1].tworzGracza(username, false, true);
				gracze[gracze.length - 1].karty = Object.create(Array.prototype);
			}
			client.emit('ustawGracza', username);
			client.emit('ustawIndex', gracze.length - 1);
			client.broadcast.emit('ustawIstniejacychGraczy', gracze);
		});

		client.on('message', function (msg) {
			//Chat
			client.emit('message', username + ": " + msg);
			client.broadcast.emit('message', username + ': ' + msg);

		});
		//Start gry
		client.on('zacznij', function () {
			if (gracze.length > 1) {
				gra = true;
				wez = 0;
				czekanie = 0;
				zadanaFigura = undefined;
				zadanyKolor = undefined;

				talia = tworzTalie();
				tasTalia = tasowanie(talia);
				odloz = [];
				//Zerowanie kart graczy np po grze gdzie byl koniec
				for (i = 0; i < gracze.length; i += 1) {
					gracze[i].karty = [];
				}

				for (i = 0; i < 5; i += 1) {
					for (j = 0; j < gracze.length; j += 1) {
						gracze[j].karty.push(tasTalia.pop());
					}
				}

				for (j = 0; j < gracze.length; j += 1) {
					gracze[j].karty.sort(sortfun);
				}
				client.emit('ustawKarty', gracze);
				client.broadcast.emit('ustawKarty', gracze);

				//ustawienie pierwszej karty bez mocBicia
				odloz.push(tasTalia.pop());
				while (odloz[odloz.length - 1].getMocBicia() > 0 || odloz[odloz.length - 1].getCzekasz() === true || odloz[odloz.length - 1].getZadanieFigury() === true || odloz[odloz.length - 1].getZadanieKoloru() === true) {
					tasTalia.unshift(odloz.pop());
					odloz.push(tasTalia.pop());
				}
				client.emit('ustawKarteOdloz', odloz[odloz.length - 1].getNazwa());
				client.broadcast.emit('ustawKarteOdloz', odloz[odloz.length - 1].getNazwa());

				client.emit('ustawLicznikKart', tasTalia.length);
				client.broadcast.emit('ustawLicznikKart', tasTalia.length);

				client.emit('schowajStart');
				client.broadcast.emit('schowajStart');

				kogoRuch = 0;
				client.emit('ustawKogoRuch', kogoRuch);
				client.broadcast.emit('ustawKogoRuch', kogoRuch);
			}
		});
		client.on('rzucKarte', function (karta) {
			rzucKarte(karta, client);
		});
		client.on('dajKarte', function () {
			dajKarte(client);
		});
		client.on('sprKarte', function (karta) {
			sprKarte(karta, client);
		});
		client.on('zerujCzekanie', function () {
			czekanie = 0;
		});
		client.on('ustawZadanaFigure', function (figura) {
			if (figura === 'nic') {
				zadanaFigura = undefined;
				return;
			}
			zadanaFigura = figura.split('f')[1];
			client.emit('pokazZadanaFigure', zadanaFigura);
			client.broadcast.emit('pokazZadanaFigure', zadanaFigura);
		});
		
		client.on('usunZadanaFigure', function () {
			zadanaFigura = undefined;
			client.emit('schowajZadanaFigure');
			client.broadcast.emit('schowajZadanaFigure');
		});

		client.on('ustawZadanyKolor', function (kolor) {
			if (kolor === 'nic') {
				zadanyKolor = undefined;
				return;
			}
			zadanyKolor = kolor.split('k')[1];
			client.emit('pokazZadanyKolor', zadanyKolor);
			client.broadcast.emit('pokazZadanyKolor', zadanyKolor);
		});
		
		client.on('usunZadanyKolor', function () {
			zadanyKolor = undefined;
			client.emit('schowajZadanyKolor');
			client.broadcast.emit('schowajZadanyKolor');
		});


		client.on('nastepnyGracz', function () {
			kogoRuch = (kogoRuch + 1) % iluGraczy;

			client.emit('ustawKogoRuch', kogoRuch);
			client.broadcast.emit('ustawKogoRuch', kogoRuch);
		});

		client.on('uPZFNF', function () { //Ustaw przeciwnikom zadanie figury na false
			client.broadcast.emit('usunZadanieF');
		});

		client.on('uPZKNF', function () { //Ustaw przeciwnikom zadanie koloru na false
			client.broadcast.emit('usunZadanieK');
		});

	} else {
		console.log("stolik pełen");
	}
	
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

//server.listen(8888, 'localhost', function () {
server.listen(8888, function () {
	'use strict';
	console.log("Listening on " + 8888);
});