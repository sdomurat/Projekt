/*jslint browser: true window: true*/

var addEvent, removeEvent, isDomReady, domReady;

addEvent = function addEvent(obj, type, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(type, fn, false);
    } else if (obj.attachEvent) {
        obj["e" + type + fn] = fn;
        obj[type + fn] = function () {
            obj["e" + type + fn](window.event);
        };
        obj.attachEvent("on" + type, obj[type + fn]);
    }
};

removeEvent = function ( obj, type, fn ) {
	if (obj.detachEvent) {
		obj.detachEvent("on" + type, obj[type + fn]);
		obj[type + fn] = null;
	} else {
		obj.removeEventListener(type, fn, false);
	}
};

domReady = function domReady(f) {
    if (domReady.done) {
        return f();
    }
    if (domReady.timer) {
        domReady.ready.push(f);
    } else {
        addEvent(window, "load", isDomReady);
        domReady.ready = [f];
        domReady.timer = setInterval(isDomReady, 13);
    }
};

isDomReady = function isDomReady() {
    var i;
    if (domReady.done) {
        return false;
    }
    if (document && document.getElementsByTagName && document.getElementById && document.body) {
        clearInterval(domReady.timer);
        domReady.timer = null;
        for (i = 0; i < domReady.ready.length; i = i + 1) {
            domReady.ready[i]();
        }
        domReady.ready = null;
        domReady.done = true;
    }
};
