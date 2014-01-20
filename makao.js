/*jslint devel: true, node: true, browser: true */
/*global $: false, io: false, addEvent: false */
//var socket = io.connect('http://localhost:8888'),
var socket = io.connect(window.location.hostname),
	index = -1,
	kogoRuch,
	czekasz,
	username = '',
	loginU,
	zadanieF = false,
	zadanieK = false;

$(document).ready(function () {
	'use strict';
	var rK, kartyDoRzucenia = [], zaznacz, kartyGracza = [], ustawCzekanie, errorInfo, makaoInfo,
		figuryDoZadania, uZF, uZK, koloryDoZadania, entry_el, trwaGra, blokada = false;

	uZF = function (e) {//ustaw zadanie figury
		var divZadanie = document.querySelector('div#zadanie');
		if (e.target.id === 'nic') {
			socket.emit('ustawZadanaFigure', 'nic');
			zadanieF = false;
			socket.emit('usunZadanaFigure');
		} else {
			socket.emit('ustawZadanaFigure', e.target.id);
		}
		socket.emit('uPZFNF'); //ustaw przeciwnikom zadanie figury na false
		socket.emit('rzucKarte', kartyDoRzucenia);
		divZadanie.innerHTML = '';
		divZadanie.style.display = '';
		blokada = false;
	};

	uZK = function (e) {//ustaw zadanie koloru
		var divZadanie = document.querySelector('div#zadanie');
		if (e.target.id === 'nic') {
			socket.emit('ustawZadanyKolor', 'nic');
			zadanieK = false;
			socket.emit('usunZadanyKolor');
		} else {
			socket.emit('ustawZadanyKolor', e.target.id);
		}
		socket.emit('uPZKNF'); //ustaw przeciwnikom zadanie koloru na folse
		socket.emit('rzucKarte', kartyDoRzucenia);
		divZadanie.innerHTML = '';
		divZadanie.style.display = '';
		blokada = false;
	};

	loginU = function () {
		var login = prompt('Podaj nick:', '');
		if (login !== null && login !== '') {
			socket.emit('nowyU', login);
		} else {
			loginU();
		}
	};

	figuryDoZadania = function () {
		var divZadanie = document.querySelector('div#zadanie'), img, i;
		divZadanie.innerHTML = '<h4>Żądanie figury</h4>' +
								'<table>' +
									'<tr>' +
									'<td><img id="f5" src="images/figury/5.jpg" alt="Figura 5"></td>' +
									'<td><img id="f6" src="images/figury/6.jpg" alt="Figura 6"></td>' +
									'<td><img id="f7" src="images/figury/7.jpg" alt="Figura 7"></td>' +
									'<td><img id="f8" src="images/figury/8.jpg" alt="Figura 8"></td>' +
									'</tr><tr>' +
									'<td><img id="f9" src="images/figury/9.jpg" alt="Figura 9"></td>' +
									'<td><img id="f10" src="images/figury/10.jpg" alt="Figura 10"></td>' +
									'<td><img id="fD" src="images/figury/D.jpg" alt="Figura Dama"></td>' +
									'<td><input id="nic" type="button" value="Nic"></td>' +
									'</tr></table>';
		divZadanie.style.display = 'block';
		img = document.querySelectorAll('div#zadanie img');
		for (i = 0; i < img.length; i += 1) {
			addEvent(img[i], 'click', uZF); //ustaw zadanie figury
		}
		addEvent(document.querySelector('div#zadanie input'), 'click', uZF); //ustaw zadanie figury
	};

	koloryDoZadania = function () {
		var divZadanie = document.querySelector('div#zadanie'), img, i;
		divZadanie.innerHTML = '<h4>Żądanie koloru</h4>' +
								'<table>' +
									'<tr>' +
									'<td><img id="kS" src="images/kolory/S.jpg" alt="Kolor Kier"></td>' +
									'<td><img id="kP" src="images/kolory/P.jpg" alt="Kolor Pik"></td>' +
									'<td><img id="kK" src="images/kolory/K.jpg" alt="Kolor Karo"></td>' +
									'<td><img id="kT" src="images/kolory/T.jpg" alt="Kolor Trefl"></td>' +
									'</tr><tr>' +
									'<td><input id="nic" type="button" value="Nic"></td>' +
									'</tr></table>';
		divZadanie.style.display = 'block';
		img = document.querySelectorAll('div#zadanie img');
		for (i = 0; i < img.length; i += 1) {
			addEvent(img[i], 'click', uZK); //ustaw zadanie koloru
		}
		addEvent(document.querySelector('div#zadanie input'), 'click', uZK); //uswat zadanie koloru
	};

	errorInfo = function (text) {
		var info = document.querySelector('div#info');
		info.firstChild.textContent = text;
		info.style.border = "3px solid red";
		info.style.color = "red";
		info.style.backgroundColor = "white";

		setTimeout(function () {
			info.firstChild.textContent = '';
			info.style.border = '';
			info.style.color = '';
			info.style.backgroundColor = '';
		}, 1500);
	};
	makaoInfo = function (text) {
		var minfo = document.querySelector('div#makao');
		minfo.firstChild.textContent = text;
		minfo.style.border = "3px solid red";
		minfo.style.color = "red";
		minfo.style.backgroundColor = "white";

		setTimeout(function () {
			minfo.firstChild.textContent = '';
			minfo.style.border = '';
			minfo.style.color = '';
			minfo.style.backgroundColor = '';
		}, 1500);
	};

	ustawCzekanie = function () {
		socket.emit('zerujCzekanie');
		socket.emit('nastepnyGracz');

		document.querySelector('div#karta_gracza p#' + username).parentNode.removeChild(document.querySelector('div#karta_gracza p#' + username).nextSibling);

		var span = document.createElement('span');
		span.textContent = 'Grasz za: ' + czekasz;
		document.getElementById(username).parentNode.appendChild(span);
		if (czekasz > 1) {
			errorInfo("Czekasz " + czekasz + " kolejki!");
		} else if (czekasz === 1) {
			errorInfo("Czekasz " + czekasz + " kolejkę!");
		}
		czekasz -= 1;
	};

	rK = function () {//rzuc karte
		if (trwaGra === false) {
			errorInfo('Nie trwa teraz gra!');
			return;
		}

		if (blokada === true) {
			errorInfo("Nie możesz teraz wykonać ruchu!");
			return;
		}
		if (kogoRuch === index) {
			if (kartyDoRzucenia.length !== 0) {
				if (document.querySelector('div#gracz_0 img#id' + kartyDoRzucenia[0]).getAttribute('figura') === 'J') {
					figuryDoZadania();
					blokada = true;
					return;
				}

				if (document.querySelector('div#gracz_0 img#id' + kartyDoRzucenia[0]).getAttribute('figura') === 'A') {
					koloryDoZadania();
					blokada = true;
					return;
				}

				if (zadanieK === true) {//karta rzcuona przez zadajacego
					zadanieK = false;
					socket.emit('usunZadanyKolor');
				}
				if (zadanieF === true) {
					zadanieF = false;
					socket.emit('usunZadanaFigure');
				}
				if (czekasz > 0) {//4 na 4 usuwa czekanie
					czekasz = 0;
					var g = document.querySelector("div#karta_gracza p#" + username);
					g.parentNode.removeChild(g.nextSibling);
				}
				socket.emit('rzucKarte', kartyDoRzucenia);
			} else {
				errorInfo("Nie zaznaczyłeś żadnych kart do rzucenia!");
			}
		} else {
			errorInfo("Teraz nie jest twój Ruch");
		}
	};

	zaznacz = function (e) {
		var i, spr;
		spr = function (el) {//spr czy zaznaczona karta jest juz w tab do rzucenia
			for (i = 1; i < kartyDoRzucenia.length; i += 1) {
				if (kartyGracza[parseInt(kartyDoRzucenia[i], 10)] === el.target) {
					return true;
				}
			}
			return false;
		};
		if (trwaGra === false) {
			errorInfo('Nie trwa teraz gra!');
			return;
		}
		if (blokada === true) {
			errorInfo("Nie możesz teraz wykonać ruchu!");
			return;
		}
		if (kogoRuch === index) {
			//jezeli nie ma jeszcze kart w tablicy kart do rzucenia to zaznaczona karta jest sprawdzana
			if (kartyDoRzucenia.length === 0) {
				socket.emit('sprKarte', e.target.id.split('id')[1]);
			} else {
				//karta ktora wczesniej zaznaczylismy jest takiej samej figury co kolejna
				if (kartyGracza[parseInt(kartyDoRzucenia[0], 10)].getAttribute('figura') === e.target.getAttribute('figura')) {
					//jezeli klikniemy na pierwsza karte zaznaczona to rezygnujemy z rzucenia wszystkich zaznaczonych kart
					if (kartyGracza[parseInt(kartyDoRzucenia[0], 10)] === e.target) {
						for (i = 0; i < kartyDoRzucenia.length; i += 1) {
							kartyGracza[parseInt(kartyDoRzucenia[i], 10)].style.bottom = '';
						}
						kartyDoRzucenia = [];
						//jezeli kliknieta karta jest Jopk lub As to ustaw zadania na false
						if (e.target.getAttribute('figura') === 'J' || e.target.getAttribute('figura') === 'A') {
							zadanieF = false;
							zadanieK = false;
						}

						//karta ktora nie byla zaznaczona jako pierwsza, ale pozniej to jest odznaczana
					} else if (spr(e)) {
						for (i = 1; i < kartyDoRzucenia.length; i += 1) {
							if (kartyGracza[parseInt(kartyDoRzucenia[i], 10)] === e.target) {
								e.target.style.bottom = '';
								while (kartyDoRzucenia[i + 1] !== undefined) {
									kartyDoRzucenia[i] = kartyDoRzucenia[i + 1];
									kartyGracza[parseInt(kartyDoRzucenia[i], 10)].style.bottom = 10 * (i + 1) + 'px';
									i += 1;
								}
								kartyDoRzucenia.pop();
							}
						}
					} else {
						kartyDoRzucenia.push(e.target.id.split('id')[1]);
						kartyGracza[parseInt(e.target.id.split('id')[1], 10)].style.bottom = 10 * kartyDoRzucenia.length + 'px';
					}
				} else {
					errorInfo("Nie możesz zanzaczyć tej karty!");
				}
			}
		} else {
			errorInfo("Teraz nie jest twój Ruch");
		}
	};

	// =============== SERWER ===============
	// ======================================

	entry_el = $('#entry');
	console.log('connecting…');

	socket.on('connect', function () {
		console.log('connected!');
	});
	socket.on('message', function (msg) {
		var data = msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		$('#log ul').append('<li>' + data + '</li>');
		entry_el.focus();
	});

	socket.on('ustawIstniejacychGraczy', function (gracze) {
		var gracz = document.querySelectorAll("div#karta_gracza p"), i = 0;
		for (i = 0; i < gracze.length; i += 1) {
			gracz[i].textContent = gracze[i].nick;
			gracz[i].id = gracze[i].nick;
		}
	});

	socket.on('ustawGracza', function (gracz) {
		var g = document.querySelectorAll("div#karta_gracza p"), i = 0;
		if (username === '') {
			username = gracz;
		}
		for (i = 0; i < g.length; i += 1) {
			if (g[i].textContent === "Puste") {
				g[i].textContent = gracz;
				g[i].id = gracz;

				i = g.length;
			}
		}
	});

	socket.on('ustawIndex', function (i) {
		index = i;//kazdy gracz ma swoj index, do spr czy jego ruch
	});

	socket.on('ustawKarty', function (g) {
		var i, gracz_0 = document.querySelector('div#gracz_0'), img;
		gracz_0.innerHTML = '';
		kartyGracza = [];
		for (i = 0; i < g[index].karty.length; i += 1) {
			gracz_0.innerHTML += '<img id="id' + i + '" class="karty" figura="' + g[index].karty[i].figura + '" src="images/karty/' + g[index].karty[i].nazwa +
				'.jpg" style="left: ' + (i * 20) + 'px;" >';

		}
		img = document.querySelectorAll('div#gracz_0 img');
		document.querySelector('div#gracz_0').style.width = 94 + (20 * (img.length - 1)) + "px";
		for (i = 0; i < img.length; i += 1) {
			kartyGracza.push(img[i]);
			addEvent(img[i], 'click', zaznacz);
		}
	});

	socket.on('przeladujKarty', function (karty) {
		var i, gracz_0 = document.querySelector('div#gracz_0'), img;
		gracz_0.innerHTML = '';
		kartyGracza = [];
		for (i = 0; i < karty.length; i += 1) {
			gracz_0.innerHTML += '<img id="id' + i + '" class="karty" figura="' + karty[i].figura + '" src="images/karty/' + karty[i].nazwa +
				'.jpg" style="left: ' + (i * 20) + 'px;" >';

		}

		kartyDoRzucenia = [];

		img = document.querySelectorAll('div#gracz_0 img');
		document.querySelector('div#gracz_0').style.width = 94 + (20 * (img.length - 1)) + "px";
		for (i = 0; i < img.length; i += 1) {
			kartyGracza.push(img[i]);
			addEvent(img[i], 'click', zaznacz);
		}
	});

	socket.on('ulozWzieteKarty', function (karty) {
		var i, gracz_0 = document.querySelector('div#gracz_0'), img;
		gracz_0.innerHTML = '';
		kartyGracza = [];
		for (i = 0; i < karty.length; i += 1) {
			if (karty[i].nowa === false) {
				gracz_0.innerHTML += '<img id="id' + i + '" class="karty" figura="' + karty[i].figura + '" src="images/karty/' + karty[i].nazwa +
					'.jpg" style="left: ' + (i * 20) + 'px;" >';

			} else {
				gracz_0.innerHTML += '<img id="id' + i + '" class="karty nowa" figura="' + karty[i].figura + '" src="images/karty/' + karty[i].nazwa +
					'.jpg" style="left: ' + (i * 20) + 'px;" >';

			}
		}
		img = document.querySelectorAll('div#gracz_0 img');
		document.querySelector('div#gracz_0').style.width = 94 + (20 * (img.length - 1)) + "px";
		for (i = 0; i < img.length; i += 1) {
			kartyGracza.push(img[i]);
			addEvent(img[i], 'click', zaznacz);
		}
		setTimeout(function () {
			for (i = 0; i < img.length; i += 1) {
				img[i].classList.remove("nowa");
				kartyGracza[i].classList.remove("nowa");
			}
		}, 1000);
	});

	socket.on('ustawKarteOdloz', function (o) {
		var divOdlozImg = document.querySelector('div#odloz img'), kartyOdlozone,
			divOdloz;
		if (divOdlozImg === null) {
			divOdloz = document.querySelector('div#odloz');
			kartyOdlozone = document.createElement('img');
			kartyOdlozone.classList.add("karty");
			kartyOdlozone.src = "images/karty/" + o + ".jpg";
			divOdloz.appendChild(kartyOdlozone);
	
			addEvent(kartyOdlozone, 'click', rK);
		} else {
			divOdlozImg.src = "images/karty/" + o + ".jpg";
		}
	});

	socket.on('ustawZadanieF', function () {
		zadanieF = true;
	});

	socket.on('ustawZadanieK', function () {
		zadanieK = true;
	});

	socket.on('usunZadanieF', function () {
		zadanieF = false;
	});

	socket.on('usunZadanieK', function () {
		zadanieK = false;
	});

	socket.on('ustawLicznikKart', function (licznik) {
		var ilosc_kart = document.querySelector("span#ilosc_kart");
		ilosc_kart.textContent = licznik.toString();
	});

	socket.on('schowajStart', function () {
		document.querySelector("input#start").style.display = 'none';
		trwaGra = true;
	});

	socket.on('pokazStart', function () {
		document.querySelector("input#start").style.display = '';
		document.querySelector('div#coZadane').innerHTML = '';
		document.querySelector('div#karta_gracza p#' + username).parentNode.innerHTML = '<p>' + username + '</p>';
		zadanieF = false;
		zadanieK = false;
		trwaGra = false;
		czekasz = 0;
		kartyGracza = [];
	});

	socket.on('koniecGry', function () {
		alert('KONIEC GRY!!');
	});

	socket.on('miejsceGracza', function (ile) {
		document.querySelector('div#karta_gracza p#' + username).parentNode.innerHTML = '<p>' + username + '</p><p>Jesteś na miejscu: ' + ile + '</p>';
	});

	socket.on('ustawKogoRuch', function (r) {
		var g = document.querySelector('div#karta_gracza p#' + username);
		if (r === index && czekasz > 0) {
			socket.emit('nastepnyGracz');
			czekasz -= 1;

			g.nextSibling.textContent = 'Gracz za: ' + (czekasz + 1);
			if ((czekasz  + 1) > 1) {
				errorInfo("Czekasz jeszcze " + (czekasz + 1) + " kolejki!");
			} else if ((czekasz + 1) === 1) {
				errorInfo("Czekasz jeszcze " + (czekasz + 1) + " kolejkę!");
			}

		} else {
			kogoRuch = r;

			if (r === index) {
				if (g.nextSibling !== null) {
					g.parentNode.removeChild(g.nextSibling);
				}
				errorInfo("Teraz jest Twój ruch!");
			}
		}
	});

	socket.on('ustawWez', function (wez) {
		var span = document.querySelector("span#wez");
		span.firstChild.textContent = wez + " ";
	});

	socket.on('kartaOk', function (karta) {
		kartyDoRzucenia.push(karta);
		kartyGracza[parseInt(karta, 10)].style.bottom = '10px';
	});

	socket.on('czyCzekasz', function (czekanie) {
		var button;
		if (index === kogoRuch) {
			button = document.createElement('input');
			button.type = 'button';
			button.id = 'czyCzekasz';
			button.value = 'Czekasz ' + czekanie + '?';
			czekasz = czekanie;
			document.getElementById(username).parentNode.appendChild(button);
			addEvent(button, 'click', ustawCzekanie);
		}
	});

	socket.on('pokazZadanaFigure', function (figura) {
		document.querySelector('div#coZadane').innerHTML = '<img class="figura" src="images/figury/' + figura + '.jpg" alt="Żądana jest figura ' + figura + '" >';
	});
	socket.on('schowajZadanaFigure', function () {
		document.querySelector('div#coZadane').innerHTML = '';
	});

	socket.on('pokazZadanyKolor', function (kolor) {
		document.querySelector('div#coZadane').innerHTML = '<img class="kolor" src="images/kolory/' + kolor + '.jpg" alt="Żądany jest kolor ' + kolor + '" >';
	});
	socket.on('schowajZadanyKolor', function () {
		document.querySelector('div#coZadane').innerHTML = '';
	});

	socket.on('nieTaKarta', function () {
		errorInfo("NIe możesz rzycić tej karty!");
	});

	socket.on('disconnectGracz', function (username) {
		var g = document.querySelectorAll("div#karta_gracza p"), i = 0;
		for (i = 0; i < g.length; i += 1) {
			if (g[i].textContent === username) {
				g[i].textContent = "Puste";
				//i = 6;
			}
		}
	});
	
	socket.on('pokazMakao', function () {
		makaoInfo("Gracz ma ostatnia karte = Makao");
	});

	addEvent(document.querySelector("div#daj img.karty"), 'click', function (e) {
		if (trwaGra === false) {
			errorInfo('Nie trwa teraz gra!');
			return;
		}
		if (blokada === true) {
			errorInfo("Nie możesz teraz wykonać ruchu!");
			return;
		}
		if (kogoRuch === index) {
			if (czekasz > 0) {
				errorInfo("Nie możesz brać karty!");
				return;
			}

			if (zadanieF === true) {
				socket.emit('usunZadanaFigure');
				zadanieF = false;
			}
			socket.emit('dajKarte', e.target.id);
		} else {
			errorInfo("Teraz nie jest twój Ruch");
		}
	});

	loginU();//wywolanie podania loginu

	addEvent(document.querySelector("input#start"), "click", function () {
		socket.emit('zacznij');
	});

	// wyslij wiad do chatu
	entry_el.keypress(function (event) {
		if (event.keyCode !== 13) {
			return;
		}
		var msg = entry_el.attr('value');
		if (msg) {
			socket.emit('message', msg);
			entry_el.attr('value', '');
		}
	});
});
