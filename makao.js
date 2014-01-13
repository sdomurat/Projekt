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
	socket.on('disconnectGracz', function (username) {
		var g = document.querySelectorAll("div#karta_gracza p"), i = 0;
		for (i = 0; i < g.length; i += 1) {
			if (g[i].textContent === username) {
				g[i].textContent = "Puste";
				//i = 6;
			}
		}
	});
	loginU();//wywolanie podania loginu
	
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
};	
