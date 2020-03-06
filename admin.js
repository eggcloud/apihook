//
// This 'server' variable we use to contact the Admin/Monitor backend is
// constructed in this example pretty much as we do in all the demos, so
// refer to the guidelines there with respect to absolute vs. relative
// paths and the like.
//
var server = null;
if(window.location.protocol === 'http:')
	server = "http://" + window.location.hostname + ":8889/api/v1";
else
	server = "https://" + window.location.hostname + ":8889/api/v1";

var serverArray = [
    "stfp1",
    "stfp2",
    "stfp3",
    "stfp4",
    "stfp5",
    "stfp6",
    "stfp7",
    "stfp8",
    "fpjp1",
    "fpjp2",
    "fpjp3",
];
var serverApiArray = [
    "stat",
    "info",
    //"stat&groups=cdn_stats",
];
var cdnApiArray = [
    "cdn__show_nodes",
    "cdn__show_state",
    "cdn__show_routes",
    "cdn__profile__print",
    "stream__find_all",
    "connection__find_all",
    "push__find_all",
    "pull__find_all",
    "recorder__find_all",
    "transcoder__find_all",
    "vod__find_all",
    //"cdn__show_redundant_transcodings",
];
var currentCDNServer = null;
var currentCDNApi = null;
var currentRouteServer = null;
var currentRouteSession = null;
var currentStreamServer = null;
var currentStreamSession = null;
var currentServer = null;
var currentServerApi = null;

$(document).ready(function() {
	if(typeof console == "undefined" || typeof console.log == "undefined")
		console = { log: function() {} };
    initialize();
});

var prompting = false;
var alerted = false;
function promptAccessDetails() {
}

// Init
function initialize() {
    console.log("initialize");

    // Unlock tabs
    $('#admintabs li').removeClass('disabled');

    $('#cdnapi').hide();
    $('#cdnmsg').hide();
    $('#update-cdnserver').click(updateCDNServer);
    $('#update-cdnapi').click(updateCDNApi);
    $('#update-cdnmsg').click(updateCDNMsg);
    updateCDNServer();
    $("#cdnmsg-autorefresh").change(function() {
        if(this.checked) {
            updateCDNMsg(true);
        }
    });

    $('#routesession').hide();
    $('#routemsg').hide();
    $('#update-routeserver').click(updateRouteServer);
    $('#update-routesession').click(updateRouteSession);
    $('#update-routemsg').click(updateRouteMsg);
    updateRouteServer();
    $("#routemsg-autorefresh").change(function() {
        if(this.checked) {
            updateRouteMsg(true);
        }
    });

    $('#streamsession').hide();
    $('#streammsg').hide();
    $('#update-streamserver').click(updateStreamServer);
    $('#update-streamsession').click(updateStreamSession);
    $('#update-streammsg').click(updateStreamMsg);
    updateStreamServer();
    $("#streammsg-autorefresh").change(function() {
        if(this.checked) {
            updateStreamMsg(true);
        }
    });

    $('#serverapi').hide();
    $('#servermsg').hide();
    $('#update-server').click(updateServer);
    $('#update-serverapi').click(updateServerApi);
    $('#update-servermsg').click(updateServerMsg);
    updateServer();
    $("#servermsg-autorefresh").change(function() {
        if(this.checked) {
            updateServerMsg(true);
        }
    });
}

// CDN_TAB ------------------------------------------------------------------------------------------------------

function updateCDNServer() {
	//$('#update-cdnserver').unbind('click').addClass('fa-spin');
	$('#update-cdnapi').unbind('click');
	$('#update-cdnmsg').unbind('click');

    console.log("Got servers:");
    console.log(serverArray);
    $('#cdnserver-list').empty();
    $('#cdnserver-num').text(serverArray.length);
    for(var i=0; i<serverArray.length; i++) {
        var n = serverArray[i];
        $('#cdnserver-list').append(
            '<a id="cdnserver-'+n+'" href="#" class="list-group-item">'+n+'</a>'
        );
        $('#cdnserver-'+n).click(function() {
            var sh = $(this).text();
            //var sh = $(this).attr('id').substring(5);
            if(currentCDNServer === sh)
                return;	// The self-refresh takes care of that
            console.log("Getting server " + sh);
            $('#cdnserver-list a').removeClass('active');
            $('#cdnserver-'+sh).addClass('active');
            currentCDNApi = null;
            currentCDNServer = sh;
            $('#cdnapi-list').empty();
            $('#cdnapi').show();
            $('#cdnmsg-info').empty();
            $('#cdnmsg-options').hide();
            $('#cdnmsg').hide();
            updateCDNApi();
        });
    }
    if(currentCDNServer !== null && currentCDNServer !== undefined) {
        if($('#cdnserver-'+currentCDNServer).length) {
            $('#cdnserver-'+currentCDNServer).addClass('active');
        } else {
            // The server that was selected has disappeared
            currentCDNApi = null;
            currentCDNServer = null;
            $('#cdnapi-list').empty();
            $('#cdnapi').hide();
            $('#cdnmsg-info').empty();
            $('#cdnmsg-options').hide();
            $('#cdnmsg').hide();
        }
    }
}

function updateCDNApi() {
	if(currentCDNServer === null || currentCDNServer === undefined)
		return;

	$('#update-cdnserver').unbind('click');
	//$('#update-cdnapi').unbind('click').addClass('fa-spin');
	$('#update-cdnmsg').unbind('click');

    console.log("Got cdn api:");
    console.log(cdnApiArray);
    $('#cdnapi-list').empty();
    $('#cdnapi-num').text(cdnApiArray.length);
    for(var i=0; i<cdnApiArray.length; i++) {
        var h = cdnApiArray[i];
        $('#cdnapi-list').append(
            '<a id="cdnapi-'+h+'" href="#" class="list-group-item">'+h+'</a>'
        );
        $('#cdnapi-'+h).click(function() {
            var hi = $(this).text();
            if(hi === currentCDNApi)
                return;	// The self-refresh takes care of that
            console.log("Getting cdn api " + hi);
            currentCDNApi = hi;
            $('#cdnapi-list a').removeClass('active');
            $('#cdnapi-'+hi).addClass('active');
            $('#cdnmsg-info').empty();
            $('#cdnmsg-options').hide();
            $('#cdnmsg').show();
            updateCDNMsg();
        });
    }
    if(currentCDNApi !== null && currentCDNApi !== undefined) {
        if($('#cdnapi-'+currentCDNApi).length) {
            $('#cdnapi-'+currentCDNApi).addClass('active');
        } else {
            // The server api that was selected has disappeared
            currentCDNServer = null;
            $('#cdnmsg-info').empty();
            $('#cdnmsg-options').hide();
            $('#cdnmsg').hide();
        }
    }
}

function updateCDNMsg(refresh) {
	if(currentCDNApi === null || currentCDNApi === undefined)
		return;
	//if(refresh !== true) {
		//if(channel === currentChannel && $('#cinfo-autorefresh')[0].checked)
			//return;	// The self-refresh takes care of that
		//currentChannel = channel;
	//}
	$('#update-cdnserver').unbind('click');
	$('#update-cdnapi').unbind('click');
	$('#update-cdnmsg').unbind('click').addClass('fa-spin');

	$.ajax({
		type: 'GET',
		url: "http://" + currentCDNServer + ".remoteseminar.com:8081/rest-api/" + currentCDNApi.replace(/__/gi,"/"),
		//url: "https://" + currentCDNServer + ".remoteseminar.com:8444/rest-api/" + currentCDNApi.replace(/__/gi,"/"),
		cache: false,
		contentType: "application/json",
		success: function(text) {
			console.log("Got cdn message:");
			console.log(text);
            rawCDNMsg(text);
			setTimeout(function() {
				$('#update-cdnserver').click(updateCDNServer);
				$('#update-cdnapi').click(updateCDNApi);
				$('#update-cdnmsg').removeClass('fa-spin').click(updateCDNMsg);
			}, 1000);
			// Show checkboxes
			$('#cdnmsg-options').removeClass('hide').show();
			// If the related box is checked, autorefresh this channel info every tot seconds
			if($('#cdnmsg-autorefresh')[0].checked) {
				setTimeout(function() {
					//if(updateChannel !== currentChannel) {
						// The channel changed in the meanwhile, don't autorefresh
						//return;
					//}
					if(!$('#cdnmsg-autorefresh')[0].checked) {
						// Unchecked in the meantime
						return;
					}
					updateCDNMsg(true);
				}, 5000);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
            $('#update-cdnserver').click(updateCDNServer);
            $('#update-cdnapi').click(updateCDNApi);
            $('#update-cdnmsg').removeClass('fa-spin').click(updateCDNMsg);
			if(!prompting && !alerted && errorThrown !== "Not Found") {
				alerted = true;
				bootbox.alert("Couldn't contact the backend: is Server down, or is the Admin/Monitor interface disabled?", function() {
					promptAccessDetails();
					alerted = false;
				});
			}
		},
		dataType: "text" // parsererror: SyntaxError: Unexpected token N in JSON at position 0
	});
}

function rawCDNMsg(data) {
	if(currentCDNApi === "cdn__show_state") {
        $('#cdnmsg-info').html('<pre>' + data + '</pre>');
    } else if(currentCDNApi.indexOf("find_all") != -1 ) {
        $('#cdnmsg-info').html('<pre>' + JSON.parse(data).length + '<br>' + JSON.stringify(JSON.parse(data), null, 4) + '</pre>');
    } else if(currentCDNApi === "cdn__show_routes") {
        var json = JSON.parse(data);
        var jstr = '<pre>' + Object.keys(json).length;
        for(key in json) {
            const videoIdx =  key.indexOf("VIDEO");
            const audioIdx =  key.indexOf("AUDIO");
            if(audioIdx != -1 && videoIdx != -1) {
                jstr += '<br>"' + json[key] + '"<br>    ' + key.slice(0, audioIdx) + '<br>    ' + key.slice(audioIdx, videoIdx) + '<br>    ' + key.slice(videoIdx);
            } else {
                jstr += '<br>"' + json[key] + '"<br>    ' + key;
            }
        }
        jstr += '</pre>';
        $('#cdnmsg-info').html(jstr); 
    } else {
        $('#cdnmsg-info').html('<pre>' + JSON.stringify(JSON.parse(data), null, 4) + '</pre>');
    }
}

// ROUTE_TAB ------------------------------------------------------------------------------------------------------

function updateRouteServer() {
	//$('#update-routeserver').unbind('click').addClass('fa-spin');
	$('#update-routesession').unbind('click');
	$('#update-routemsg').unbind('click');

    console.log("Got servers:");
    console.log(serverArray);
    $('#routeserver-list').empty();
    $('#routeserver-num').text(serverArray.length);
    for(var i=0; i<serverArray.length; i++) {
        var n = serverArray[i];
        $('#routeserver-list').append(
            '<a id="routeserver-'+n+'" href="#" class="list-group-item">'+n+'</a>'
        );
        $('#routeserver-'+n).click(function() {
            var sh = $(this).text();
            if(currentRouteServer === sh)
                return;	// The self-refresh takes care of that
            console.log("Getting server " + sh);
            $('#routeserver-list a').removeClass('active');
            $('#routeserver-'+sh).addClass('active');
            currentRouteSession = null;
            currentRouteServer = sh;
            $('#routesession-list').empty();
            $('#routesession').hide();
            $('#routemsg-info').empty();
            $('#routemsg-options').hide();
            $('#routemsg').hide();
            updateRouteSession();
        });
    }
    if(currentRouteServer !== null && currentRouteServer !== undefined) {
        if($('#routeserver-'+currentRouteServer).length) {
            $('#routeserver-'+currentRouteServer).addClass('active');
        } else {
            // The server that was selected has disappeared
            currentRouteSession = null;
            currentRouteServer = null;
            $('#routesession-list').empty();
            $('#routesession').hide();
            $('#routemsg-info').empty();
            $('#routemsg-options').hide();
            $('#routemsg').hide();
        }
    }
}

function updateRouteSession() {
	if(currentRouteServer === null || currentRouteServer === undefined)
		return;

	$('#update-routeserver').unbind('click');
	$('#update-routesession').unbind('click').addClass('fa-spin');
	$('#update-routemsg').unbind('click');

	$.ajax({
		type: 'GET',
		url: "http://" + currentRouteServer + ".remoteseminar.com:8081/rest-api/cdn/show_routes",
		//url: "https://" + currentRouteServer + ".remoteseminar.com:8444/rest-api/cdn/show_routes",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got route session:");
			console.log(json);
            $('#routesession').show();
			$('#routesession-list').empty();
			$('#routesession-num').text(Object.keys(json).length);
            for(key in json) {
                $('#routesession-list').append(
                    '<a id="routesession-'+json[key]+'" href="#" class="list-group-item">'+json[key]+'</a>'
                );
                $('#routesession-'+json[key]).click(function() {
                    var sh = $(this).text();
                    if(currentRouteSession === sh)
                        return;	// The self-refresh takes care of that
                    console.log("Getting session " + sh);
                    $('#routesession-list a').removeClass('active');
                    $('#routesession-'+sh).addClass('active');
                    currentRouteSession = sh;
                    //$('#routesession-list').empty();
                    //$('#routesession').show();
                    $('#routemsg-info').empty();
                    $('#routemsg-options').hide();
                    $('#routemsg').show();
                    updateRouteMsg();
                }); 
            }
			if(currentRouteSession !== null && currentRouteSession !== undefined) {
                if($('#routesession-'+currentRouteSession).length) {
                    $('#routesession-'+currentRouteSession).addClass('active');
				} else {
                    currentRouteSession = null;
                    currentRouteServer = null;
                    $('#routesession-list').empty();
                    $('#routesession').hide();
                    $('#routemsg-info').empty();
                    $('#routemsg-options').hide();
                    $('#routemsg').hide();
				}
			}
			setTimeout(function() {
				$('#update-routeserver').click(updateRouteServer);
				$('#update-routesession').removeClass('fa-spin').click(updateRouteSession);
				$('#update-routemsg').click(updateRouteMsg);
			}, 1000);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
			setTimeout(function() {
				$('#update-routeserver').click(updateRouteServer);
				$('#update-routesession').removeClass('fa-spin').click(updateRouteSession);
				$('#update-routemsg').click(updateRouteMsg);
			}, 1000);
            currentRouteSession = null;
            currentRouteServer = null;
            $('#routesession-list').empty();
            $('#routesession').hide();
            $('#routemsg-info').empty();
            $('#routemsg-options').hide();
            $('#routemsg').hide();
			if(!prompting && !alerted && errorThrown !== "Not Found") {
				alerted = true;
				bootbox.alert("Couldn't contact the backend: is Server down, or is the Admin/Monitor interface disabled?", function() {
					promptAccessDetails();
					alerted = false;
				});
			}
		},
		dataType: "json"
	});
}

function updateRouteMsg(refresh) {
	if(currentRouteSession === null || currentRouteSession === undefined)
		return;
	//if(refresh !== true) {
		//if(channel === currentChannel && $('#cinfo-autorefresh')[0].checked)
			//return;	// The self-refresh takes care of that
		//currentChannel = channel;
	//}
	$('#update-routeserver').unbind('click');
	$('#update-routesession').unbind('click');
	$('#update-routemsg').unbind('click').addClass('fa-spin');

    var request = { "name": currentRouteSession };
	$.ajax({
		type: 'POST',
		url: "http://" + currentRouteServer + ".remoteseminar.com:8081/rest-api/stream/find",
		//url: "https://" + currentRouteServer + ".remoteseminar.com:8444/rest-api/stream/find",
		cache: false,
		contentType: "application/json",
        data: JSON.stringify(request),
		success: function(json) {
			console.log("Got route message:");
			console.log(json);
            $('#routemsg-info').html('<pre>' + JSON.stringify(json, null, 4) + '</pre>');
			setTimeout(function() {
				$('#update-routeserver').click(updateRouteServer);
				$('#update-routesession').click(updateRouteSession);
				$('#update-routemsg').removeClass('fa-spin').click(updateRouteMsg);
			}, 1000);
			// Show checkboxes
			$('#routemsg-options').removeClass('hide').show();
			// If the related box is checked, autorefresh this channel info every tot seconds
			if($('#routemsg-autorefresh')[0].checked) {
				setTimeout(function() {
					//if(updateChannel !== currentChannel) {
						// The channel changed in the meanwhile, don't autorefresh
						//return;
					//}
					if(!$('#routemsg-autorefresh')[0].checked) {
						// Unchecked in the meantime
						return;
					}
					updateRouteMsg(true);
				}, 5000);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
            $('#update-routeserver').click(updateRouteServer);
            $('#update-routesession').click(updateRouteSession);
            $('#update-routemsg').removeClass('fa-spin').click(updateRouteMsg);
			if(!prompting && !alerted && errorThrown !== "Not Found") {
				alerted = true;
				bootbox.alert("Couldn't contact the backend: is Server down, or is the Admin/Monitor interface disabled?", function() {
					promptAccessDetails();
					alerted = false;
				});
			}
		},
		dataType: "json"
	});
}

// STREAM_TAB ------------------------------------------------------------------------------------------------------

function updateStreamServer() {
	//$('#update-streamserver').unbind('click').addClass('fa-spin');
	$('#update-streamsession').unbind('click');
	$('#update-streammsg').unbind('click');

    console.log("Got servers:");
    console.log(serverArray);
    $('#streamserver-list').empty();
    $('#streamserver-num').text(serverArray.length);
    for(var i=0; i<serverArray.length; i++) {
        var n = serverArray[i];
        $('#streamserver-list').append(
            '<a id="streamserver-'+n+'" href="#" class="list-group-item">'+n+'</a>'
        );
        $('#streamserver-'+n).click(function() {
            var sh = $(this).text();
            if(currentStreamServer === sh)
                return;	// The self-refresh takes care of that
            console.log("Getting server " + sh);
            $('#streamserver-list a').removeClass('active');
            $('#streamserver-'+sh).addClass('active');
            currentStreamSession = null;
            currentStreamServer = sh;
            $('#streamsession-list').empty();
            $('#streamsession').hide();
            $('#streammsg-info').empty();
            $('#streammsg-options').hide();
            $('#streammsg').hide();
            updateStreamSession();
        });
    }
    if(currentStreamServer !== null && currentStreamServer !== undefined) {
        if($('#streamserver-'+currentStreamServer).length) {
            $('#streamserver-'+currentStreamServer).addClass('active');
        } else {
            // The server that was selected has disappeared
            currentStreamSession = null;
            currentStreamServer = null;
            $('#streamsession-list').empty();
            $('#streamsession').hide();
            $('#streammsg-info').empty();
            $('#streammsg-options').hide();
            $('#streammsg').hide();
        }
    }
}

function updateStreamSession() {
	if(currentStreamServer === null || currentStreamServer === undefined)
		return;

	$('#update-streamserver').unbind('click');
	$('#update-streamsession').unbind('click').addClass('fa-spin');
	$('#update-streammsg').unbind('click');

	$.ajax({
		type: 'GET',
		url: "http://" + currentStreamServer + ".remoteseminar.com:8081/rest-api/stream/find_all",
		//url: "https://" + currentStreamServer + ".remoteseminar.com:8444/rest-api/stream/find_all",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got stream session:");
			console.log(json);
            $('#streamsession').show();
			$('#streamsession-list').empty();
			$('#streamsession-num').text(json.length);
            for(var i=0; i<json.length; i++) {
                var n = json[i];
                $('#streamsession-list').append(
                    '<a id="streamsession-'+n.mediaSessionId+'" href="#" class="list-group-item">'+n.mediaSessionId+'</a>'
                );
                $('#streamsession-'+n.mediaSessionId).click(function() {
                    var sh = $(this).text();
                    if(currentStreamSession === sh)
                        return;	// The self-refresh takes care of that
                    console.log("Getting session " + sh);
                    $('#streamsession-list a').removeClass('active');
                    $('#streamsession-'+sh).addClass('active');
                    currentStreamSession = sh;
                    //$('#streamsession-list').empty();
                    //$('#streamsession').show();
                    $('#streammsg-info').empty();
                    $('#streammsg-options').hide();
                    $('#streammsg').show();
                    updateStreamMsg();
                }); 
            }
			if(currentStreamSession !== null && currentStreamSession !== undefined) {
                if($('#streamsession-'+currentStreamSession).length) {
                    $('#streamsession-'+currentStreamSession).addClass('active');
				} else {
                    currentStreamSession = null;
                    currentStreamServer = null;
                    $('#streamsession-list').empty();
                    $('#streamsession').hide();
                    $('#streammsg-info').empty();
                    $('#streammsg-options').hide();
                    $('#streammsg').hide();
				}
			}
			setTimeout(function() {
				$('#update-streamserver').click(updateStreamServer);
				$('#update-streamsession').removeClass('fa-spin').click(updateStreamSession);
				$('#update-streammsg').click(updateStreamMsg);
			}, 1000);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
			setTimeout(function() {
				$('#update-streamserver').click(updateStreamServer);
				$('#update-streamsession').removeClass('fa-spin').click(updateStreamSession);
				$('#update-streammsg').click(updateStreamMsg);
			}, 1000);
            currentStreamSession = null;
            currentStreamServer = null;
            $('#streamsession-list').empty();
            $('#streamsession').hide();
            $('#streammsg-info').empty();
            $('#streammsg-options').hide();
            $('#streammsg').hide();
			if(!prompting && !alerted && errorThrown !== "Not Found") {
				alerted = true;
				bootbox.alert("Couldn't contact the backend: is Server down, or is the Admin/Monitor interface disabled?", function() {
					promptAccessDetails();
					alerted = false;
				});
			}
		},
		dataType: "json"
	});
}

function updateStreamMsg(refresh) {
	if(currentStreamSession === null || currentStreamSession === undefined)
		return;
	//if(refresh !== true) {
		//if(channel === currentChannel && $('#cinfo-autorefresh')[0].checked)
			//return;	// The self-refresh takes care of that
		//currentChannel = channel;
	//}
	$('#update-streamserver').unbind('click');
	$('#update-streamsession').unbind('click');
	$('#update-streammsg').unbind('click').addClass('fa-spin');

    var request = { "mediaSessionId": currentStreamSession };
	$.ajax({
		type: 'POST',
		url: "http://" + currentStreamServer + ".remoteseminar.com:8081/rest-api/stream/metrics",
		//url: "https://" + currentStreamServer + ".remoteseminar.com:8444/rest-api/stream/metrics",
		cache: false,
		contentType: "application/json",
        data: JSON.stringify(request),
		success: function(json) {
			console.log("Got stream message:");
			console.log(json);
            $('#streammsg-info').html('<pre>' + JSON.stringify(json, null, 4) + '</pre>');
			setTimeout(function() {
				$('#update-streamserver').click(updateStreamServer);
				$('#update-streamsession').click(updateStreamSession);
				$('#update-streammsg').removeClass('fa-spin').click(updateStreamMsg);
			}, 1000);
			// Show checkboxes
			$('#streammsg-options').removeClass('hide').show();
			// If the related box is checked, autorefresh this channel info every tot seconds
			if($('#streammsg-autorefresh')[0].checked) {
				setTimeout(function() {
					//if(updateChannel !== currentChannel) {
						// The channel changed in the meanwhile, don't autorefresh
						//return;
					//}
					if(!$('#streammsg-autorefresh')[0].checked) {
						// Unchecked in the meantime
						return;
					}
					updateStreamMsg(true);
				}, 5000);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
            $('#update-streamserver').click(updateStreamServer);
            $('#update-streamsession').click(updateStreamSession);
            $('#update-streammsg').removeClass('fa-spin').click(updateStreamMsg);
			if(!prompting && !alerted) {
				alerted = true;
				bootbox.alert("Couldn't contact the backend: is Server down, or is the Admin/Monitor interface disabled?", function() {
					promptAccessDetails();
					alerted = false;
				});
			}
		},
		dataType: "json"
	});
}

// SERVER_TAB ------------------------------------------------------------------------------------------------------

function updateServer() {
	//$('#update-server').unbind('click').addClass('fa-spin');
	$('#update-serverapi').unbind('click');
	$('#update-servermsg').unbind('click');

    console.log("Got servers:");
    console.log(serverArray);
    $('#server-list').empty();
    $('#server-num').text(serverArray.length);
    for(var i=0; i<serverArray.length; i++) {
        var n = serverArray[i];
        $('#server-list').append(
            '<a id="server-'+n+'" href="#" class="list-group-item">'+n+'</a>'
        );
        $('#server-'+n).click(function() {
            var sh = $(this).text();
            //var sh = $(this).attr('id').substring(5);
            if(currentServer === sh)
                return;	// The self-refresh takes care of that
            console.log("Getting server " + sh);
            $('#server-list a').removeClass('active');
            $('#server-'+sh).addClass('active');
            currentServerApi = null;
            currentServer = sh;
            $('#serverapi-list').empty();
            $('#serverapi').show();
            $('#servermsg-info').empty();
            $('#servermsg-options').hide();
            $('#servermsg').hide();
            updateServerApi();
        });
    }
    if(currentServer !== null && currentServer !== undefined) {
        if($('#server-'+currentServer).length) {
            $('#server-'+currentServer).addClass('active');
        } else {
            // The server that was selected has disappeared
            currentServerApi = null;
            currentServer = null;
            $('#serverapi-list').empty();
            $('#serverapi').hide();
            $('#servermsg-info').empty();
            $('#servermsg-options').hide();
            $('#servermsg').hide();
        }
    }
}

function updateServerApi() {
	if(currentServer === null || currentServer === undefined)
		return;

	$('#update-server').unbind('click');
	//$('#update-serverapi').unbind('click').addClass('fa-spin');
	$('#update-servermsg').unbind('click');

    console.log("Got server api:");
    console.log(serverApiArray);
    $('#serverapi-list').empty();
    $('#serverapi-num').text(serverApiArray.length);
    for(var i=0; i<serverApiArray.length; i++) {
        var h = serverApiArray[i];
        $('#serverapi-list').append(
            '<a id="serverapi-'+h+'" href="#" class="list-group-item">'+h+'</a>'
        );
        $('#serverapi-'+h).click(function() {
            var hi = $(this).text();
            if(hi === currentServerApi)
                return;	// The self-refresh takes care of that
            console.log("Getting server api " + hi);
            currentServerApi = hi;
            $('#serverapi-list a').removeClass('active');
            $('#serverapi-'+hi).addClass('active');
            $('#servermsg-info').empty();
            $('#servermsg-options').hide();
            $('#servermsg').show();
            updateServerMsg();
        });
    }
    if(currentServerApi !== null && currentServerApi !== undefined) {
        if($('#serverapi-'+currentServerApi).length) {
            $('#serverapi-'+currentServerApi).addClass('active');
        } else {
            // The server api that was selected has disappeared
            currentServer = null;
            $('#servermsg-info').empty();
            $('#servermsg-options').hide();
            $('#servermsg').hide();
        }
    }
}

function updateServerMsg(refresh) {
	if(currentServerApi === null || currentServerApi === undefined)
		return;
	//if(refresh !== true) {
		//if(channel === currentChannel && $('#cinfo-autorefresh')[0].checked)
			//return;	// The self-refresh takes care of that
		//currentChannel = channel;
	//}
	$('#update-server').unbind('click');
	$('#update-serverapi').unbind('click');
	$('#update-servermsg').unbind('click').addClass('fa-spin');

	$.ajax({
		type: 'GET',
        crossOrigin : true,
		url: "http://" + currentServer + ".remoteseminar.com:8081/?action=" + currentServerApi,
		//url: "https://" + currentServer + ".remoteseminar.com:8444/?action=" + currentServerApi,
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got server message:");
			console.log(json);
            rawServerMsg(json);
			setTimeout(function() {
				$('#update-server').click(updateServer);
				$('#update-serverapi').click(updateServerApi);
				$('#update-servermsg').removeClass('fa-spin').click(updateServerMsg);
			}, 1000);
			// Show checkboxes
			$('#servermsg-options').removeClass('hide').show();
			// If the related box is checked, autorefresh this channel info every tot seconds
			if($('#servermsg-autorefresh')[0].checked) {
				setTimeout(function() {
					//if(updateChannel !== currentChannel) {
						// The channel changed in the meanwhile, don't autorefresh
						//return;
					//}
					if(!$('#servermsg-autorefresh')[0].checked) {
						// Unchecked in the meantime
						return;
					}
					updateServerMsg(true);
				}, 5000);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
            $('#update-server').click(updateServer);
            $('#update-serverapi').click(updateServerApi);
            $('#update-servermsg').removeClass('fa-spin').click(updateServerMsg);
			if(!prompting && !alerted) {
				alerted = true;
				bootbox.alert("Couldn't contact the backend: is Server down, or is the Admin/Monitor interface disabled?", function() {
					promptAccessDetails();
					alerted = false;
				});
			}
		},
		dataType: "json"
	});
}

function rawServerMsg(data) {
	if(currentServerApi == "info") {
        var xmlDoc = (new DOMParser()).parseFromString(data, "text/xml")
        var xmlStr = "";
        var fn = xmlDoc.getElementsByTagName("wcs_server_info")[0].firstChild;
        for(idx = 0; idx < xmlDoc.getElementsByTagName("wcs_server_info")[0].childNodes.length; idx++) {
            xmlStr = xmlStr + "# " + fn.nodeName + "\n";
            xmlStr = xmlStr + fn.innerHTML.replace("<![CDATA[", "").replace("]]>", "") + "\n";
            fn = fn.nextSibling;
            xmlStr = xmlStr + "\n";
        }
        $('#servermsg-info').html('<pre>' + xmlStr + '</pre>');
    } else {
        // Just use <pre> and show the channel info as it is
        $('#servermsg-info').html('<pre>' + data + '</pre>');
        //$('#servermsg-info').html('<pre>' + JSON.stringify(json, null, 4) + '</pre>');
    }
}

