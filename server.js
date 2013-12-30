/*jslint node: true devel: true*/
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

//tworzenie talię 52 kart do tab
var tworzTalie = function () {
	"use strict";
	var talia = [], i, j, tabKolor = ['T', 'K', 'P', 'S'], id = 0;
	//karty 2-10
	for (i = 0; i < 9; i += 1) {
		for (j = 0; j < tabKolor.length; j += 1) {
			if (i + 2 === 2 || i + 2 === 3) {
				talia.push(Object.create(karta));
				talia[id].tworzKarte(id, (i + 2) + "_" + tabKolor[j], (i + 2).toString(), tabKolor[j], (i + 2), false, false, false);
			} else if (i + 2 === 4) {
				talia.push(Object.create(karta));
				talia[id].tworzKarte(id, (i + 2) + "_" + tabKolor[j], (i + 2).toString(), tabKolor[j], 0, true, false, false);
			} else {
				talia.push(Object.create(karta));
				talia[id].tworzKarte(id, (i + 2) + "_" + tabKolor[j], (i + 2).toString(), tabKolor[j], 0, false, false, false);
			}
			id += 1;
		}
	}
	//Jopek
	for (j = 0; j < tabKolor.length; j += 1) {
		talia.push(Object.create(karta));
		talia[id].tworzKarte(id, "J_" + tabKolor[j], "J", tabKolor[j], 0, false, true, false);
		id += 1;
	}
	//Damy
	for (j = 0; j < tabKolor.length; j += 1) {
		talia.push(Object.create(karta));
		talia[id].tworzKarte(id, "D_" + tabKolor[j], "D", tabKolor[j], 0, false, false, false);
		id += 1;
	}
	//Króle
	for (j = 0; j < tabKolor.length; j += 1) {
		talia.push(Object.create(karta));
		if (tabKolor[j] === 'S' || tabKolor[j] === 'P') {
			talia[id].tworzKarte(id, "K_" + tabKolor[j], "K", tabKolor[j], 5, false, false, false);
		} else {
			talia[id].tworzKarte(id, "K_" + tabKolor[j], "K", tabKolor[j], 0, false, false, false);
		}
		id += 1;
	}
	//Asy
	for (j = 0; j < tabKolor.length; j += 1) {
		talia.push(Object.create(karta));
		talia[id].tworzKarte(id, "A_" + tabKolor[j], "A", tabKolor[j], 0, false, false, true);
		id += 1;
	}
	return talia;
};

var sortfun = function (a, b) {
	"use strict";
	return a.id - b.id;
};

//tasowanie kart
var tasowanie = function (orgTalia) {
	"use strict";
	var i,
		talia = Object.create(orgTalia),
		randomTalia = []; //tablica przechowująca przetasowane karty
	while (randomTalia.length !== orgTalia.length) {
		i = Math.floor(Math.random() * talia.length);
		randomTalia.push(talia[i]);
		talia[i] = talia[talia.length - 1];
		talia.pop();
	}
	return randomTalia;
};

//przetasowanie kart
var przetasowanie = function () {
	"use strict";
	var tmp = odloz.pop(); //zmienna pomocnicza

	tasTalia = Object.create(odloz);
	tasTalia = tasowanie(tasTalia);
	odloz = [];
	odloz.push(tmp);
};
//zasady gry
var zasady = function (k) {
	"use strict";
	var kOdlozona = odloz[odloz.length - 1];

	if (zadanaFigura !== undefined) {
		if (k.getFigura() === zadanaFigura || kOdlozona.getFigura() === k.getFigura()) {//if jop mozna polozyc jop
			return true;
		}
		return false;
	}

	if (zadanyKolor !== undefined) {
		if (k.getKolor() === zadanyKolor || kOdlozona.getFigura() === k.getFigura()) {
			return true;
		}
		return false;
	}

	if (k.getKolor() === kOdlozona.getKolor() || k.getFigura() === kOdlozona.getFigura()) {//zgadza sie kolorlub figura
		if (wez > 0) { 
			if (kOdlozona.getMocBicia() > 0) { 
				if ((k.getKolor() === kOdlozona.getKolor() && k.getMocBicia() > 0) || k.getMocBicia() === kOdlozona.getMocBicia()) {
					return true;
				}
				return false;
			}
		}
		if (czekanie > 0) { //tylko czek karta
			if (k.getCzekasz() === true) {
				return true;
			}
			return false;
		}
		return true;
	}
	return false;
};
//branie kart
var dajKarte = function (client) {
	"use strict";
	var i;

	if (wez > 0) {
		for (i = 0; i < wez; i += 1) {
			gracze[kogoRuch].karty.push(tasTalia.pop()); 
			gracze[kogoRuch].karty[gracze[kogoRuch].karty.length - 1].setNowa(true);
			if (tasTalia.length === 0) {
				przetasowanie();
			}
		}
		wez = 0;

		client.emit('ustawWez', wez);
		client.broadcast.emit('ustawWez', wez);
	} else {

		gracze[kogoRuch].karty.push(tasTalia.pop()); //gracz dostaje jedna karte
		gracze[kogoRuch].karty[gracze[kogoRuch].karty.length - 1].setNowa(true);

		if (tasTalia.length === 0) {
			przetasowanie();
		}
	}

	client.emit('ustawLicznikKart', tasTalia.length);
	client.broadcast.emit('ustawLicznikKart', tasTalia.length);

	gracze[kogoRuch].karty.sort(sortfun); //sortowanie kart gracza
	client.emit('ulozWzieteKarty', gracze[kogoRuch].karty);

	for (i = 0; i < gracze[kogoRuch].karty.length; i += 1) {
		gracze[kogoRuch].karty[i].setNowa(false);
	}

	kogoRuch = (kogoRuch + 1) % iluGraczy;
	client.emit('ustawKogoRuch', kogoRuch);
	client.broadcast.emit('ustawKogoRuch', kogoRuch);

};

var ileNieGra = function () {
	'use strict';
	var i, ile = 0;
	for (i = 0; i < gracze.length; i += 1) {
		if (gracze[i].getCzyGra() === false) {
			ile += 1;
		}
	}
	return ile;
};

//zrzucanie kart
var rzucKarte = function (karta, client) {
	"use strict";
	var i, tmp = [], ile;

	for (i = 0; i < karta.length; i += 1) {
		odloz.push(gracze[kogoRuch].karty[parseInt(karta[i], 10)]); //rzucona karta wedruje na talie kart odlozonych
		
		gracze[kogoRuch].karty[parseInt(karta[i], 10)] = undefined; //rzucane karty gracza sa ustawiane na undefined
		
		if (odloz[odloz.length - 1].getMocBicia() > 0) {
			wez += odloz[odloz.length - 1].getMocBicia();
			client.emit('ustawWez', wez);
			client.broadcast.emit('ustawWez', wez);
		}

		if (odloz[odloz.length - 1].getCzekasz() === true) {
			czekanie += 1;
		}
	}
	for (i = 0; i < gracze[kogoRuch].karty.length; i += 1) {
		if (gracze[kogoRuch].karty[i] !== undefined) {
			tmp.push(gracze[kogoRuch].karty[i]);
		}
	}
	gracze[kogoRuch].karty = tmp;

	client.emit('przeladujKarty', gracze[kogoRuch].karty);
	client.emit('ustawKarteOdloz', odloz[odloz.length - 1].getNazwa());
	client.broadcast.emit('ustawKarteOdloz', odloz[odloz.length - 1].getNazwa());

	if (gracze[kogoRuch].karty.length === 0) {
		gracze[kogoRuch].setCzyGra(false);
		ile = ileNieGra();
		if (ile === (gracze.length - 1)) {
			client.emit('miejsceGracza', ile);
			client.emit('koniecGry');
			client.broadcast.emit('koniecGry');
			client.emit('pokazStart');
			client.broadcast.emit('pokazStart');
			gra = false;
			return;
		}
		client.emit('miejsceGracza', ile);
	}
	
	if (gracze[kogoRuch].karty.length === 1) {
		client.emit('pokazMakao');
		client.broadcast.emit('pokazMakao');
	}

	if (odloz[odloz.length - 1].getFigura() === 'K' && odloz[odloz.length - 1].getKolor() === 'P') {
		kogoRuch = ((kogoRuch - 1) + iluGraczy) % iluGraczy;
		while (gracze[kogoRuch].getCzyGra() === false) {
			kogoRuch = ((kogoRuch - 1) + iluGraczy) % iluGraczy;
		}
	} else {
		kogoRuch = (kogoRuch + 1) % iluGraczy;
		while (gracze[kogoRuch].getCzyGra() === false) {
			kogoRuch = (kogoRuch + 1) % iluGraczy;
		}
	}

	client.emit('ustawKogoRuch', kogoRuch);
	client.broadcast.emit('ustawKogoRuch', kogoRuch);

	if (czekanie > 0) {
		client.broadcast.emit('czyCzekasz', czekanie);
	}

	if ((zadanyKolor !== undefined && odloz[odloz.length - 1].getKolor() !== zadanyKolor && odloz[odloz.length - 1].getFigura() !== 'A') ||
			(zadanyKolor !== undefined && (odloz[odloz.length - 1].getCzekasz() === true || odloz[odloz.length - 1].getMocBicia() > 0 || odloz[odloz.length - 1].getZadanieFigury() === true))) {//rzucenie zadanego koloru i w tej samej rudzie karte o innym kolorze tej fgury
		zadanyKolor = undefined;
		if (odloz[odloz.length - 1].getZadanieFigury() !== true) {
			client.emit('schowajZadanyKolor');
			client.broadcast.emit('schowajZadanyKolor');
		}

		client.broadcast.emit('usunZadanieK');
		client.emit('usunZadanieK');
	}
};
//zaznaczanie kart/y do rzucenia
var sprKarte = function (karta, client) {
	'use strict';
	if (zasady(gracze[kogoRuch].karty[parseInt(karta, 10)])) {//bo indexy sa w string
		if (gracze[kogoRuch].karty[parseInt(karta, 10)].getZadanieFigury() === true) {
			client.emit('ustawZadanieF');
		}

		if (gracze[kogoRuch].karty[parseInt(karta, 10)].getZadanieKoloru() === true) {
			client.emit('ustawZadanieK');
		}
		client.emit('kartaOk', karta);
	} else {
		client.emit('nieTaKarta');
	}
};
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

