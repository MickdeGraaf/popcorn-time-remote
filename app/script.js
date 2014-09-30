//var ip = prompt("Please enter popcorn time ip adress", "");


var ip;
var port;
var username;
var password;
var connected = false;


var view = "";

$(document).ready(function(){
	
	getRemoteSettings();
	
	console.log("remote started");
	
	listeners();	
	checkConnected(true);
	
	setInterval(function(){
		callPopcornApi("getviewstack");
	}, 1000);
	
	
	
});




function callPopcornApi(method, params) {	//popcorn api wrapper
	
	
	if (!window.connected) {
		return false;
	}
	
	if(typeof params === "undefined"){
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
            //dataType: 'json', 
            beforeSend: function (xhr){ 
	        	xhr.setRequestHeader('Authorization', window.btoa(window.username + ":" + window.password)); 
			},
	    	success: function(data, textStatus) {
              	
              if(request.method == 'getviewstack'){
	               console.log("getting viewstack");
	               viewstackhandler(data);
               }
			   else{
				   console.log(data); 
			   }
                     
               
			},    
        });
		
}


function viewstackhandler(data){

	currentview = data.result[0][data.result[0].length - 1];
		
	if(window.view != currentview &&  $("#settings").is(":visible") == false ) { //check if view is switched
		
		console.log("view switched");
		console.log(currentview);
		
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
		        console.log("view is " + currentview);
		}
		
				
		view = currentview;
	}
	
	
}

function showsContainer() {
	console.log("now in shows container");
	
	$("#wrapper > .section").hide();
	$("#arrows").show();
	$("#showdet").show();
	$("#seasons").show();	
}


function mainBrowser() {
	console.log("now in main browser"); 
	
	$("#wrapper > .section").hide();
	$("#arrows").show();
	$("#favseen").show();
	$("#movshows").show();
		
}

function movieDetail() {
	console.log("now in movie detail");
	
	$("#wrapper > .section").hide();
	//$("#arrows").show();
	$("#movdet").show();
	
}

function player() {
	console.log("now in player");
	
	$("#wrapper > .section").hide();
	$("#player").show();
}

function listeners(){ //all events on the remote
	
	$("#arrowsbutton").click(function(){
		console.log("enter pressed");
		callPopcornApi('enter');
		callPopcornApi("getviewstack");
	});
	
	$("#arrowup").click(function(){
		console.log("up pressed");
		callPopcornApi('up');
	});
	
	$("#arrowleft").click(function(){
		console.log("left pressed");
		callPopcornApi('left');
	});
	
	$("#arrowdown").click(function(){
		console.log("down pressed");
		callPopcornApi('down');
	});
	
	$("#arrowright").click(function(){
		console.log("right pressed");
		callPopcornApi('right');
	});
	
	$("#pause").click(function(){
		console.log("toggle playing");
		callPopcornApi("toggleplaying");
	});
	
	$("#volume").change(function() {
		console.log("volume now: " + $(this).val() / 1000);
		callPopcornApi("setvolume", [ $(this).val() / 1000 + 0.001 ]);	
	});
	
	
	$(".back").click(function(){
		console.log("back");
		callPopcornApi("back");
		callPopcornApi("getviewstack");
	});
	
	$(".quality").click(function(){
		console.log("quality");
		callPopcornApi("quality");
	});
	
	$(".favourite").click(function(){
		console.log("favourite");
		callPopcornApi("togglefavourite");
	});
	
	$(".seen").click(function(){
		console.log("toggle watched");
		callPopcornApi("togglewatched");
	});
	
	$("#mute").click(function(){
		console.log("toggle mute");
		callPopcornApi("togglemute");
	});
	
	$("#fullscreen").click(function(){
		console.log("toggle full screen");
		callPopcornApi("togglefullscreen");
	});
	
	$(".play").click(function(){
		console.log("toggle playing");
		callPopcornApi("toggleplaying");
	});
	
	$("#movies").click(function(){
		console.log("show movies");
		callPopcornApi("movieslist");
		callPopcornApi("getviewstack");
	});
	
	$("#shows").click(function(){
		console.log("show shows");
		callPopcornApi("showslist");
		callPopcornApi("getviewstack");
	});
	
	$("#nextseason").click(function(){
		console.log("next season");
		callPopcornApi("nextseason");
	});
	
	$("#prevseason").click(function(){
		console.log("previous season");
		callPopcornApi("previousseason");
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
	
	$("#ip").change(function(){
		window.localStorage.setItem("ip", $(this).val());
		refreshSettings();
	});
	$("#port").change(function(){
		window.localStorage.setItem("port", $(this).val());
		refreshSettings();
	});
	$("#username").change(function(){
		window.localStorage.setItem("username", $(this).val());
		refreshSettings();
	});
	$("#password").change(function(){
		window.localStorage.setItem("password", $(this).val());
		refreshSettings();
	});
	
	$("#black").click(function(){
		window.localStorage.setItem("theme", "black");
		console.log("once you go black....");
		setTheme("black");
	});
	
	$("#white").click(function(){
		window.localStorage.setItem("theme", "white");
		setTheme("white");
	});
		
}

function closeSettings() {
	$("#wrapper > .section").hide();
	$("#settingsback").hide();
	$("#settingscog").show();
	window.view = "";
	callPopcornApi("getviewstack");
}

function getRemoteSettings() {

	console.log(window.localStorage.getItem("port"));
	
	
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
	console.log("settings refreshed");
}

function checkConnected(warning) {
	
	var request = {};
	
	request.params = [];
	request.id = 10;
	request.method = "ping";
	request.jsonrpc = "2.0";
	
	 
        
        
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
		    			console.log('we have connection');
		    			closeSettings();
		    			window.connected = true;
	    			}
	    			else { //there are errors
		    			if(warning){
		    				alert('password or username is wrong');
		    			}
		    			window.connected = false;
	    			}
	    	
				   
			   },
			error: function() {
					if(warning) {
						alert("No connection check Popcorn Time client or IP and Port settings");
					}
					window.connected = false;
			}
                     
                   
        });
        	
}

function setTheme(theme) {
	$("body").removeClass();
	$("body").addClass(theme); 
}
