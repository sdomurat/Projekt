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
	
};	
