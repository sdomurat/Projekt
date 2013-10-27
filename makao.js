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
};	
