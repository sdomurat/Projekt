var socket = io.connect(window.location.hostname),
	index = -1,
	kogoRuch,
	czekasz,
	username = '',
	loginU,
	zadanieF = false,
	zadanieK = false;
	
$(document).ready(function () {
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
};	
