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

var user = null;		// Selected user
var channel = null;		// Selected channel
var currentChannel = null;

var serverArray = [
    "stfp1",
    "stfp2",
    "stfp3",
    "stfp4",
    "stfp5",
];
var serverApiArray = [
    "stat",
    "info",
];
var cdnApiArray = [
    "show_nodes",
    "show_state",
    //"show_routes",
    "profile__print",
];
var currentServer = null;
var currentServerApi = null;
var currentCDNServer = null;
var currentCDNApi = null;

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

    /*
    $('#connmsg').hide();
    $('#update-connserver').click(updateConnServer);
    $('#update-connmsg').click(updateConnMsg);
    updateConnServer();
    $("#connmsg-autorefresh").change(function() {
        if(this.checked) {
            updateConnMsg(true);
        }
    });
    */
}

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
		url: "https://" + currentServer + ".remoteseminar.com:8444/?action=" + currentServerApi,
		//url: "http://" + currentServer + ".remoteseminar.com:8081/?action=" + currentServerApi,
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
		url: "https://" + currentCDNServer + ".remoteseminar.com:8444/rest-api/cdn/" + currentCDNApi.replace("__","/"),
		//url: "http://" + currentCDNServer + ".remoteseminar.com:8081/rest-api/cdn/" + currentCDNApi,
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
			if(!prompting && !alerted) {
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
	if(currentCDNApi == "show_state") {
        $('#cdnmsg-info').html('<pre>' + data + '</pre>');
    } else {
        $('#cdnmsg-info').html('<pre>' + JSON.stringify(JSON.parse(data), null, 4) + '</pre>');
    }
}
//---------------------------------------------------------------------------------------------------------------

function dumpBackup() {
	$.ajax({
		type: 'GET',
		url: server + "/admin/dumps",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got dump info:");
			console.log(json);
            $('#dumpinfo').html(json['dumpLog']);
		},
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(textStatus + ": " + errorThrown);   // FIXME
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

function loadBackup() {
	$.ajax({
		type: 'GET',
		url: server + "/admin/loads",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got load info:");
			console.log(json);
            $('#loadinfo').html(json['loadLog']);
		},
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(textStatus + ": " + errorThrown);   // FIXME
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

function initBackup() {
	$.ajax({
		type: 'GET',
		url: server + "/admin/init",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got init info:");
			console.log(json);
            $('#initinfo').html(json['status']);
		},
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(textStatus + ": " + errorThrown);   // FIXME
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

// Server info
function updateServerInfo() {
	$.ajax({
		type: 'GET',
		url: server + "/admin/serverinfo",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got server info:");
			console.log(json);
            var systemJson = json.system;
            var usageJson = json.usage;
            var archiveJson = json.archive;
            var storageJson = json.storage;
            var emojiJson = json.emoji;
            delete json.system;
            delete json.usage;
            delete json.archive;
            delete json.storage;
            delete json.emoji;
			$('#server-details').empty();
			for(var k in json) {
				$('#server-details').append(
					'<tr>' +
					'	<td style="width:30%"><b>' + k + ':</b></td>' +
					'	<td>' + json[k] + '</td>' +
					'</tr>');
			}
			$('#server-system').empty();
			for(var s in systemJson) {
				$('#server-system').append(
					'<tr>' +
					'	<td style="width:30%;"><b>' + s + ':</b></td>' +
					'	<td>' + systemJson[s] + '</td>' +
					'</tr>');
			}

			$('#server-usage').empty();
			for(var u in usageJson) {
				$('#server-usage').append(
					'<tr>' +
					'	<td style="width:30%;"><b>' + u + ':</b></td>' +
					'	<td>' + usageJson[u] + '</td>' +
					'</tr>');
			}

			// Unlock tabs
			$('#admintabs li').removeClass('disabled');

			$('#channels').hide();
			$('#cinfo').hide();
			$('#update-users').click(updateUsers);
			$('#update-channels').click(updateUserChannels);
			$('#update-channel').click(updateChannelInfo);
			updateUsers();
			$("#cinfo-autorefresh").change(function() {
				if(this.checked) {
					updateChannelInfo(true);
				}
			});
			$("#cinfo-prettify").change(function() {
				if(this.checked) {
					prettyChannelInfo();
				} else {
					rawChannelInfo();
				}
			});

			$('#messages').hide();
			$('#minfo').hide();
			$('#update-msgchannels').click(updateChannels);
			$('#update-messages').click(updateChannelMessages);
			$('#update-message').click(updateMessageInfo);
			updateChannels();
			$("#minfo-autorefresh").change(function() {
				if(this.checked) {
					updateMessageInfo(true);
				}
			});
			$("#minfo-prettify").change(function() {
				if(this.checked) {
					prettyMessageInfo();
				} else {
					rawMessageInfo();
				}
			});

			$('#server-backup').empty();
            $('#server-backup').append(
					'<tr>' +
					'	<td style="width:30%;"><button id="dump-button" type="button" class="btn btn-xs btn-primary">DUMPS</button></td>' +
					'	<td><span id="dumpinfo">'+archiveJson['dumpLog']+'</span></td>' +
					'</tr>' +
					'<tr>' +
					'	<td style="width:30%;"><button id="load-button" type="button" class="btn btn-xs btn-primary">LOADS</button></td>' +
					'	<td><span id="loadinfo">'+archiveJson['loadLog']+'</span></td>' +
					'</tr>' +
					'<tr>' +
					'	<td style="width:30%;"><button id="init-button" type="button" class="btn btn-xs btn-primary">INITIALIZE</button></td>' +
					'	<td><span id="initinfo"></span></td>' +
					'</tr>');
			$('#dump-button').click(dumpBackup);
			$('#load-button').click(loadBackup);
			$('#init-button').click(initBackup);

			$('#server-storage').empty();
			for(var t in storageJson) {
				$('#server-storage').append(
					'<tr>' +
					'	<td style="width:30%;"><b>' + t + ':</b></td>' +
					'	<td>' + storageJson[t] + '</td>' +
					'</tr>');
			}

			$('#server-emoji').empty();
			for(var e in emojiJson) {
				$('#server-emoji').append(
					'<tr>' +
					'	<td style="width:30%;"><b>' + emojiJson[e].emoji_id + ':</b></td>' +
					'	<td><a href="'+emojiJson[e].filelink+'">' + emojiJson[e].filename + '</a></td>' +
					'</tr>');
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
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

// Users
function updateUsers() {
	$('#update-users').unbind('click').addClass('fa-spin');
	$('#update-channels').unbind('click');
	$('#update-channel').unbind('click');
	$.ajax({
		type: 'GET',
		url: server + "/admin/users",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got users:");
			console.log(json);
			$('#users-list').empty();
			var users = json["users"];
			$('#users-num').text(users.length);
			for(var i=0; i<users.length; i++) {
				var s = users[i].user_id;
				var n = users[i].username;
				$('#users-list').append(
					'<a id="user-'+s+'" href="#" class="list-group-item">'+n+'</a>'
				);
				$('#user-'+s).click(function() {
					//var sh = $(this).text();
					var sh = $(this).attr('id').substring(5);
					console.log("Getting user " + sh + " channels");
					user = sh;
					$('#users-list a').removeClass('active');
					$('#user-'+sh).addClass('active');
					channel = null;
					currentChannel = null;
					$('#channels-list').empty();
					$('#channels').show();
					$('#channel-info').empty();
					$('#cinfo-options').hide();
					$('#cinfo').hide();
					updateUserChannels();
				});
			}
			if(user !== null && user !== undefined) {
				if($('#user-'+user).length) {
					$('#user-'+user).addClass('active');
				} else {
					// The user that was selected has disappeared
					user = null;
					channel = null;
					currentChannel = null;
					$('#channels-list').empty();
					$('#channels').hide();
					$('#channel-info').empty();
					$('#cinfo-options').hide();
					$('#cinfo').hide();
				}
			}
			setTimeout(function() {
				$('#update-users').removeClass('fa-spin').click(updateUsers);
				$('#update-channels').click(updateUserChannels);
				$('#update-channel').click(updateChannelInfo);
			}, 1000);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
			setTimeout(function() {
				$('#update-users').removeClass('fa-spin').click(updateUsers);
				$('#update-channels').click(updateUserChannels);
				$('#update-channel').click(updateChannelInfo);
			}, 1000);
			user = null;
			channel = null;
			currentChannel = null;
			$('#channels-list').empty();
			$('#channels').hide();
			$('#channel-info').empty();
			$('#cinfo-options').hide();
			$('#cinfo').hide();
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

// UserChannels
function updateUserChannels() {
	if(user === null || user === undefined)
		return;
	$('#update-users').unbind('click');
	$('#update-channels').unbind('click').addClass('fa-spin');
	$('#update-channel').unbind('click');
	$.ajax({
		type: 'GET',
		url: server + "/admin/users/"+user+"/channels",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got channels:");
			console.log(json);
			$('#channels-list').empty();
			var channels = json["channels"];
			$('#channels-num').text(channels.length);
			for(var i=0; i<channels.length; i++) {
				var h = channels[i];
				$('#channels-list').append(
					'<a id="channel-'+h+'" href="#" class="list-group-item">'+h+'</a>'
				);
				$('#channel-'+h).click(function() {
					var hi = $(this).text();
					console.log("Getting channel " + hi + " info");
					channel = hi;
					if(channel === currentChannel)
						return;	// The self-refresh takes care of that
					$('#channels-list a').removeClass('active');
					$('#channel-'+hi).addClass('active');
					$('#channel-info').empty();
					$('#cinfo-options').hide();
					$('#cinfo').show();
					updateChannelInfo();
				});
			}
			if(channel !== null && channel !== undefined) {
				if($('#channel-'+channel).length) {
					$('#channel-'+channel).addClass('active');
				} else {
					// The channel that was selected has disappeared
					channel = null;
					currentChannel = null;
					$('#channel-info').empty();
					$('#cinfo-options').hide();
					$('#cinfo').hide();
				}
			}
			setTimeout(function() {
				$('#update-channels').removeClass('fa-spin').click(updateUserChannels);
				$('#update-users').click(updateUsers);
				$('#update-channel').click(updateChannelInfo);
			}, 1000);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
			$('#update-channels').removeClass('fa-spin').click(updateUserChannels);
			$('#update-users').click(updateUsers);
			$('#update-channel').click(updateChannelInfo);
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

// Channel Info
function updateChannelInfo(refresh) {
	if(channel === null || channel === undefined)
		return;
	if(refresh !== true) {
		if(channel === currentChannel && $('#cinfo-autorefresh')[0].checked)
			return;	// The self-refresh takes care of that
		currentChannel = channel;
	}
	var updateChannel = currentChannel;
	$('#update-users').unbind('click');
	$('#update-channels').unbind('click');
	$('#update-channel').unbind('click').addClass('fa-spin');
	$.ajax({
		type: 'GET',
		url: server + "/admin/users/"+user+"/channels/"+channel,
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got info:");
			console.log(json);
			channelInfo = json["info"];
			if($('#cinfo-prettify')[0].checked) {
				prettyChannelInfo();
			} else {
				rawChannelInfo();
			}
			setTimeout(function() {
				$('#update-users').click(updateUsers);
				$('#update-channels').click(updateUserChannels);
				$('#update-channel').removeClass('fa-spin').click(updateChannelInfo);
			}, 1000);
			// Show checkboxes
			$('#cinfo-options').removeClass('hide').show();
			// If the related box is checked, autorefresh this channel info every tot seconds
			if($('#cinfo-autorefresh')[0].checked) {
				setTimeout(function() {
					if(updateChannel !== currentChannel) {
						// The channel changed in the meanwhile, don't autorefresh
						return;
					}
					if(!$('#cinfo-autorefresh')[0].checked) {
						// Unchecked in the meantime
						return;
					}
					updateChannelInfo(true);
				}, 5000);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
			$('#update-channels').removeClass('fa-spin').click(updateUserChannels);
			$('#update-users').click(updateUsers);
			$('#update-channel').click(updateChannelInfo);
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

function rawChannelInfo() {
	// Just use <pre> and show the channel info as it is
	$('#channel-info').html('<pre>' + JSON.stringify(channelInfo, null, 4) + '</pre>');
}

function prettyChannelInfo() {
	// Prettify the channel info, processing it and turning it into tables
	$('#channel-info').html('<table class="table table-striped" id="channel-info-table"></table>');
	$('#cinfo-options').hide();
	for(var k in channelInfo) {
		var v = channelInfo[k];
        if(k === "members") {
			$('#channel-info').append(
				'<h4>Members</h4>' +
				'<div id="members"></table>');
			for(var kk in v) {
				$('#members').append(
					'<h5>member #' + (parseInt(kk)+1) + '</h5>' +
					'<table class="table table-striped" id="member' + kk + '">' +
					'</table>');
				var vv = v[kk];
				console.log(vv);
				for(var sk in vv) {
					var sv = vv[sk];
                    if(sk === "users") {
                        $('#member' + kk).append(
                            '<tr>' +
                                '<td colspan="2">' +
                                    '<h6>USER</h6>' +
                                    '<table class="table" id="user' + kk + '">' +
                                    '</table>' +
                                '</td>' +
                            '</tr>');
                        for(var ssk in sv) {
                            var ssv = sv[ssk];
                            $('#user' + kk).append(
                                '<tr>' +
                                '   <td><b>' + ssk + ':</b></td>' +
                                '   <td>' + ssv + '</td>' +
                                '</tr>');
                        }
                    } else {
                        $('#member' + kk).append(
                            '<tr>' +
                            '	<td><b>' + sk + ':</b></td>' +
                            '	<td>' + sv + '</td>' +
                            '</tr>');
                    }
                }
			}
		} else {
			$('#channel-info-table').append(
				'<tr>' +
				'	<td><b>' + k + ':</b></td>' +
				'	<td>' + v + '</td>' +
				'</tr>');
		}
	}
	$('#cinfo-options').show();
}



// Channels
function updateChannels() {
	$('#update-msgchannels').unbind('click').addClass('fa-spin');
	$('#update-messages').unbind('click');
	$('#update-message').unbind('click');
	$.ajax({
		type: 'GET',
		url: server + "/admin/channels",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got channels:");
			console.log(json);
			$('#msgchannels-list').empty();
			var msgchannels = json["channels"];
			$('#msgchannels-num').text(msgchannels.length);
			for(var i=0; i<msgchannels.length; i++) {
				var s = msgchannels[i];
				$('#msgchannels-list').append(
					'<a id="msgchannel-'+s+'" href="#" class="list-group-item">'+s+'</a>'
				);
				$('#msgchannel-'+s).click(function() {
					var sh = $(this).text();
					console.log("Getting channel " + sh + " messages");
					channel = sh;
					$('#msgchannels-list a').removeClass('active');
					$('#msgchannel-'+sh).addClass('active');
					message = null;
					currentMessage = null;
					$('#messages-list').empty();
					$('#messages').show();
					$('#message-info').empty();
					$('#minfo-options').hide();
					$('#minfo').hide();
					updateChannelMessages();
				});
			}
			if(channel !== null && channel !== undefined) {
				if($('#msgchannel-'+channel).length) {
					$('#msgchannel-'+channel).addClass('active');
				} else {
					// The user that was selected has disappeared
					channel = null;
					message = null;
					currentMessage = null;
					$('#messages-list').empty();
					$('#messages').hide();
					$('#message-info').empty();
					$('#minfo-options').hide();
					$('#minfo').hide();
				}
			}
			setTimeout(function() {
				$('#update-msgchannels').removeClass('fa-spin').click(updateChannels);
				$('#update-messages').click(updateChannelMessages);
				$('#update-message').click(updateMessageInfo);
			}, 1000);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
			setTimeout(function() {
				$('#update-msgchannels').removeClass('fa-spin').click(updateChannels);
				$('#update-messages').click(updateChannelMessages);
				$('#update-message').click(updateMessageInfo);
			}, 1000);
			channel = null;
			message = null;
			currentMessage = null;
			$('#messages-list').empty();
			$('#messages').hide();
			$('#message-info').empty();
			$('#minfo-options').hide();
			$('#minfo').hide();
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

// ChannelMessages
function updateChannelMessages() {
	if(channel === null || channel === undefined)
		return;
	$('#update-msgchannels').unbind('click');
	$('#update-messages').unbind('click').addClass('fa-spin');
	$('#update-message').unbind('click');
	$.ajax({
		type: 'GET',
		url: server + "/admin/channels/"+channel+"/messages",
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got messages:");
			console.log(json);
			$('#messages-list').empty();
			var messages = json["messages"];
			$('#messages-num').text(messages.length);
			for(var i=0; i<messages.length; i++) {
				var h = messages[i];
				$('#messages-list').append(
					'<a id="message-'+h+'" href="#" class="list-group-item">'+h+'</a>'
				);
				$('#message-'+h).click(function() {
					var hi = $(this).text();
					console.log("Getting message " + hi + " info");
					message = hi;
					if(message === currentMessage)
						return;	// The self-refresh takes care of that
					$('#messages-list a').removeClass('active');
					$('#message-'+hi).addClass('active');
					$('#message-info').empty();
					$('#minfo-options').hide();
					$('#minfo').show();
					updateMessageInfo();
				});
			}
			if(message !== null && message !== undefined) {
				if($('#message-'+message).length) {
					$('#message-'+message).addClass('active');
				} else {
					// The message that was selected has disappeared
					message = null;
					currentMessage = null;
					$('#message-info').empty();
					$('#minfo-options').hide();
					$('#minfo').hide();
				}
			}
			setTimeout(function() {
				$('#update-messages').removeClass('fa-spin').click(updateChannelMessages);
				$('#update-msgchannels').click(updateChannels);
				$('#update-message').click(updateMessageInfo);
			}, 1000);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
			$('#update-messages').removeClass('fa-spin').click(updateChannelMessages);
			$('#update-msgchannels').click(updateChannels);
			$('#update-message').click(updateMessageInfo);
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

// Message Info
function updateMessageInfo(refresh) {
	if(message === null || message === undefined)
		return;
	if(refresh !== true) {
		if(message === currentMessage && $('#minfo-autorefresh')[0].checked)
			return;	// The self-refresh takes care of that
		currentMessage = message;
	}
	var updateMessage = currentMessage;
	$('#update-msgchannels').unbind('click');
	$('#update-messages').unbind('click');
	$('#update-message').unbind('click').addClass('fa-spin');
	$.ajax({
		type: 'GET',
		url: server + "/admin/channels/"+channel+"/messages/"+message,
		cache: false,
		contentType: "application/json",
		success: function(json) {
			console.log("Got info:");
			console.log(json);
			messageInfo = json["info"];
			if($('#minfo-prettify')[0].checked) {
				prettyMessageInfo();
			} else {
				rawMessageInfo();
			}
			setTimeout(function() {
				$('#update-msgchannels').click(updateChannels);
				$('#update-messages').click(updateChannelMessages);
				$('#update-message').removeClass('fa-spin').click(updateMessageInfo);
			}, 1000);
			// Show checkboxes
			$('#minfo-options').removeClass('hide').show();
			// If the related box is checked, autorefresh this message info every tot seconds
			if($('#minfo-autorefresh')[0].checked) {
				setTimeout(function() {
					if(updateMessage !== currentMessage) {
						// The message changed in the meanwhile, don't autorefresh
						return;
					}
					if(!$('#minfo-autorefresh')[0].checked) {
						// Unchecked in the meantime
						return;
					}
					updateMessageInfo(true);
				}, 5000);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);	// FIXME
			$('#update-messages').removeClass('fa-spin').click(updateChannelMessages);
			$('#update-msgchannels').click(updateChannels);
			$('#update-message').click(updateMessageInfo);
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

function rawMessageInfo() {
	// Just use <pre> and show the message info as it is
	$('#message-info').html('<pre>' + JSON.stringify(messageInfo, null, 4) + '</pre>');
}

function prettyMessageInfo() {
	// Prettify the message info, processing it and turning it into tables
	$('#message-info').html('<table class="table table-striped" id="message-info-table"></table>');
	$('#minfo-options').hide();
	for(var k in messageInfo) {
		var v = messageInfo[k];
        if(k === "metadata") {
            $('#message-info').append(
                '<h4>Metadata</h4>' +
                '<table class="table table-striped" id="metadata">' +
                '</table>');
            for(var kk in v) {
                var vv = v[kk];
                $('#metadata').append(
                    '<tr>' +
                    '   <td><b>' + kk + ':</b></td>' +
                    '   <td>' + vv + '</td>' +
                    '</tr>');
            }
		} else {
			$('#message-info-table').append(
				'<tr>' +
				'	<td><b>' + k + ':</b></td>' +
				'	<td>' + v + '</td>' +
				'</tr>');
		}
	}
	$('#minfo-options').show();
}

