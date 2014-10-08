var ip;
var port;
var username;
var password;
var connected = false;
var view = "";

/* Document ready */
$(document).ready(function() {
	getRemoteSettings();
	listeners();	
	checkConnected(true);
	setInterval(function() {
		callPopcornApi("getviewstack");
	}, 1000);
	
});

function callPopcornApi(method, params) {	//popcorn api wrapper
	if (!window.connected) {
		return false;
	}
	if(typeof params === "undefined") {
		params = [];
	}
	
	var request = {};
	request.params = params;
	request.id = 10;
	request.method = method;
	request.jsonrpc = "2.0";
	
	$.ajax({
    type: 'POST',
    url: 'http://' + window.ip + ':' + window.port,
    data: JSON.stringify(request),
    beforeSend: function (xhr) { 
			xhr.setRequestHeader('Authorization', window.btoa(window.username + ":" + window.password)); 
		},
	  success: function(data, textStatus) {
      if(request.method == 'getviewstack') { //if viewstack is checked call viewstackhandler
	      viewstackhandler(data);
      }
		},    
  });
	
}


function viewstackhandler(data){	
	// Pre 0.3.4 
	if( typeof(data.result.popcornVersion) == "undefined" ) { //check if using an old before 0.3.4
		currentview = data.result[0][data.result[0].length - 1];
	}
	else { // 0.3.4 or higher
		currentview = data.result.viewstack[data.result.viewstack.length - 1];
	}

	if(window.view != currentview &&  $("#settings").is(":visible") == false ) { //check if view is changed
		console.debug("[DEBUG] Current view: " + currentview);
		switch(currentview) {
		  case 'shows-container-contain':
		    showsContainer();
		    break;
		  case 'main-browser':
		    mainBrowser(); 
		    break;
		  case 'movie-detail':
		    movieDetail();
		    break;
		  case 'player':
		    player();
		  break;
		  default:
		    console.debug("[DEBUG] Current view: " + currentview);
		}
		view = currentview;
	}
}

/* Functions handling, showing the right buttons */

function showsContainer() {
	$("#wrapper > .section").hide();
	$("#arrows").show();
	$("#showdet").show();
	$("#seasons").show();	
}

function mainBrowser() {
	$("#wrapper > .section").hide();
	$("#arrows").show();
	$("#favseen").show();
	$("#movshows").show();
}

function movieDetail() {
	$("#wrapper > .section").hide();
	$("#movdet").show();
}

function player() {
	$("#wrapper > .section").hide();
	$("#player").show();
}

/* Registering event listeners */

function listeners(){
	
	clickHelper("#arrowsbutton", "enter", true);
	clickHelper("#arrowup", "up");
	clickHelper("#arrowleft", "left");
	clickHelper("#arrowdown", "down");
	clickHelper("#arrowright", "right");
	clickHelper(".back", "back", true);
	clickHelper(".quality", "quality");
	clickHelper(".favourite", "togglefavourite");
	clickHelper(".seen", "togglewatched");
	clickHelper("#mute", "togglemute");
	clickHelper("#fullscreen", "togglefullscreen");
	clickHelper(".play", "toggleplaying");
	clickHelper("#movies", "movieslist", true);
	clickHelper("#shows", "showslist", true);
	clickHelper("#nextseason", "nextseason");
	clickHelper("#prevseason", "previousseason");
	

	$("#pause").click(function(){
		if ($(this).attr("data-state")=="playing") {
			$(this).removeClass("fa-pause");
			$(this).addClass("fa-play");
			$(this).attr("data-state", "paused");
		}
		else {
			$(this).removeClass("fa-play");
			$(this).addClass("fa-pause");
			$(this).attr("data-state", "playing");
		}
		callPopcornApi("toggleplaying");
	});
	
	$("#volume").on('input', function() {
		callPopcornApi("setvolume", [ $(this).val() / 1000 + 0.001 ]);	
	});
	
	$("#settingscog").click(function(){
		$("#wrapper > .section").hide();
		$("#settings").show();
		$("#settingsback").show();
		$("#settingscog").hide();
	});
	
	$("#settingsback").click(function(){
		closeSettings();
	});
	
	
	/* SETTINGS HANDLERS */
	
	$("#ip").on('input', function(){
		window.localStorage.setItem("ip", $(this).val());
		refreshSettings();
	});
	$("#port").on('input', function(){
		window.localStorage.setItem("port", $(this).val());
		refreshSettings();
	});
	$("#username").on('input', function(){
		window.localStorage.setItem("username", $(this).val());
		refreshSettings();
	});
	$("#password").on('input', function(){
		window.localStorage.setItem("password", $(this).val());
		refreshSettings();
	});
	
	//only in phonegap
	$("#scanqr").click(function(){
		qrCodeScanner();
		return false;
	});
	
	$("#black").click(function(){
		window.localStorage.setItem("theme", "black");
		setTheme("black");
	});
	
	$("#white").click(function(){
		window.localStorage.setItem("theme", "white");
		setTheme("white");
	});
		
}

/*	qr code scanner (phonegap only) */

function qrCodeScanner(){
	console.debug("[DEBUG] scanning qr");
	
	var scanner = cordova.require("cordova/plugin/BarcodeScanner");
	
	 scanner.scan( qrCodeCallBack, function (error) { 
            console.debug("[DEBUG] scanning error")
        } );
	
}

/* qr code scanner callback (phonegap only) */

function qrCodeCallBack(result){   
   settings = jQuery.parseJSON(result.text);
   
   if(!result.cancelled && typeof(settings.ip) !== "undefined"){ //check if it is a correct bar code
	      window.localStorage.setItem("ip", settings.ip);
		  window.localStorage.setItem("port", settings.port);
		  window.localStorage.setItem("username", settings.user);
		  window.localStorage.setItem("password", settings.pass);
   }
	 
   getRemoteSettings();
   
}

/* Click handler helper */

function clickHelper(selector, apiMethod, refreshViewstack){

	$(selector).click(function(){
		callPopcornApi(apiMethod);
	});
		
	if(typeof(refreshViewstack) !== "undefined" && refreshViewstack){
		$(selector).click(function(){
			callPopcornApi("getviewstack");
		});
	}
	
}

function closeSettings() {
	$("#wrapper > .section").hide();
	$("#settingsback").hide();
	$("#settingscog").show();
	window.view = ""; 
	callPopcornApi("getviewstack"); 
}

function getRemoteSettings() {
	console.debug("[DEBUG] Port: "+window.localStorage.getItem("port"));
	
	//check port
	if(window.localStorage.getItem("port") == null) {
		window.localStorage.setItem("port", "8008");
	}
	
	//check username
	if(window.localStorage.getItem("username") == null) {
		window.localStorage.setItem("username", "popcorn");
	}
	
	//check password
	if(window.localStorage.getItem("password") == null) {
		window.localStorage.setItem("password", "popcorn");
	}
	
	if(window.localStorage.getItem("theme") == null) {
		window.localStorage.setItem("theme", "white")
	}
	
	theme = window.localStorage.getItem("theme");
	
	$("#" + theme).prop('checked', true);
	setTheme(theme);
	
	$("#ip").val(window.localStorage.getItem("ip"));
	
	$("#port").val(window.localStorage.getItem("port"));
	
	$("#username").val(window.localStorage.getItem("username"));
	
	$("#password").val(window.localStorage.getItem("password"));
	
	refreshSettings();
}

function refreshSettings() {

	window.ip = window.localStorage.getItem("ip");
	window.port = window.localStorage.getItem("port");
	window.username = window.localStorage.getItem("username");
	window.password = window.localStorage.getItem("password");
	checkConnected(false);
	console.debug("[DEBUG] Settings refreshed.");
}

function checkConnected(warning) {
  var request = {};
  	
	request.params = [];
	request.id = 10;
	request.method = 'ping';
	request.jsonrpc = "2.0";
	
	$.ajax({
    type: 'POST',
    url: 'http://' + window.ip + ':' + window.port,
    data: JSON.stringify(request),
    //dataType: 'json', 
    beforeSend: function (xhr){ 
			xhr.setRequestHeader('Authorization', window.btoa(window.username + ":" + window.password)); 
		},
	  success: function(data, textStatus) {
	    if(typeof data.error == "undefined") { //check if there are no errors
				console.info("[INFO] Connection established.");
				closeSettings();
				window.connected = true;
	    }
	    else { //there are errors
		    if(warning){
					console.error("[ERROR] Invalid login credentials.");
		    	alert("Invalid login credetials provided.");
		    }
		    window.connected = false;
	    }
		},
		error: function() {
			if(warning) {
				console.error("[ERROR] Could not connect to given client.");
				alert("Could not connect to Popcorn Time. Please check your settings.");
			}
			window.connected = false;
		}
  });
}

function setTheme(theme) {
	$("body").removeClass();
	$("body").addClass(theme); 
}
