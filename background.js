var xbmc_path = "plugin.video.jtv.archives";
var xbmc_url = false;
var xbmc_host = false
var xbmc_user = "xbmc"
var xbmc_pass = ""
var xbmc_autoplay = false

if (window.localStorage["xbmc_twitch_host"]) {
  xbmc_host = window.localStorage["xbmc_twitch_host"];
  xbmc_url = 'http://' + xbmc_host + '/jsonrpc';
}

if (window.localStorage["xbmc_twitch_path"]) {
  xbmc_path = window.localStorage["xbmc_twitch_path"];
}

if (window.localStorage["xbmc_twitch_pass"]) {
  xbmc_pass = window.localStorage["xbmc_twitch_pass"];
}
if (window.localStorage["xbmc_twitch_user"]) {
  xbmc_user = window.localStorage["xbmc_twitch_user"];
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
if ( request.type == "Player.Open" ) {
    callJSONRpc(request.type, { item: { file: "plugin://" + xbmc_path + request.path } } )
} else if ( request.type == "Files.GetDirectory" ) {
    callJSONRpc(request.type, { directory: "plugin://" + xbmc_path + request.path })
} else if ( request.type == "configure" ) {
  chrome.tabs.create({'url': chrome.extension.getURL("options.html")},function(){});
} else if ( request.type == "settings" ) {
  sendResponse(JSON.stringify([xbmc_path, xbmc_url, xbmc_host, xbmc_user, xbmc_pass]));
} else if ( request.type == "httpRequest" ) {
  GM_xmlhttpRequest(request.details)
} else {
  sendResponse("ERROR");
}

function GM_xmlhttpRequest(details) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        var responseState = {
            responseXML:(xmlhttp.readyState==4 ? xmlhttp.responseXML : ''),
            responseText:(xmlhttp.readyState==4 ? xmlhttp.responseText : ''),
            readyState:xmlhttp.readyState,
            responseHeaders:(xmlhttp.readyState==4 ? xmlhttp.getAllResponseHeaders() : ''),
            status:(xmlhttp.readyState==4 ? xmlhttp.status : 0),
            statusText:(xmlhttp.readyState==4 ? xmlhttp.statusText : '')
        }
        if (details["onreadystatechange"]) {
            details["onreadystatechange"](responseState);
        }
        if (xmlhttp.readyState==4) {
            if (details["onload"] && xmlhttp.status>=200 && xmlhttp.status<300) {
                details["onload"](responseState);
            }
            if (details["onerror"] && (xmlhttp.status<200 || xmlhttp.status>=300)) {
                details["onerror"](responseState);
            }
        }
    }
    try {
      xmlhttp.open(details.method, details.url);
    } catch(e) {
      if( details["onerror"] ) {
        details["onerror"]({responseXML:'',responseText:'',readyState:4,responseHeaders:'',status:403,statusText:'Forbidden'});
      }
      return;
    }
    if (details.headers) {
        for (var prop in details.headers) {
            xmlhttp.setRequestHeader(prop, details.headers[prop]);
        }
    }
    xmlhttp.send((typeof(details.data)!='undefined')?details.data:null);
   } 
});
