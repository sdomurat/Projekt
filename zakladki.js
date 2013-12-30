//Funcja ustawiająca zakładkę Chat na aktywną,
//zostaje wyświetlony blok z Chatem
var ustawZakladkeChat = function (e) {
	"use strict";
	var chat, ustawienia, img_chat, img_ust;
	chat = document.getElementById("chat");
	ustawienia = document.getElementById("ustawienia");
	img_chat = document.getElementById("img_chat");
	img_ust = document.getElementById("img_ust");
	chat.style.display = 'block';
	ustawienia.style.display = 'none';
	img_chat.src = "images/przyciski/chat_press.jpg";
	img_ust.src = "images/przyciski/ust.jpg";
};
//Funcja ustawiająca zakładkę Ustawienia na aktywną,
//zostaje wyświetlony blok z Ustawieniami
var ustawZakladkeUst = function (e) {
	"use strict";
	var chat, ustawienia, img_chat, img_ust;
	chat = document.getElementById("chat");
	ustawienia = document.getElementById("ustawienia");
	img_chat = document.getElementById("img_chat");
	img_ust = document.getElementById("img_ust");
	ustawienia.style.display = 'block';
	chat.style.display = 'none';
	img_chat.src = "images/przyciski/chat.jpg";
	img_ust.src = "images/przyciski/ust_press.jpg";
};
//Funcja, której są zawarte zdarzenia reagujące na kliknięcie na
//daną zakładkę
var zakladka = function () {
	"use strict";
	var zak_chat, zak_ust;
	zak_chat = document.querySelector("span#zak_chat");
	zak_ust = document.querySelector("span#zak_ust");
	addEvent(zak_chat, 'click', ustawZakladkeChat);
	addEvent(zak_ust, 'click', ustawZakladkeUst);
};

domReady(zakladka);


