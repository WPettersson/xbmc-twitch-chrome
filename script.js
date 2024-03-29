// Based on:
// http://greasefire.userscripts.org/scripts/review/101305 (by Frz)
// http://userscripts.org/scripts/show/92945 (by deepseth)
// http://userscripts.org/scripts/show/62064 (by Wolph)

xbmc_path = ""
xbmc_url = ""
xbmc_host = ""
xbmc_user = ""
xbmc_pass = ""
xbmc_autoplay = false


// Base64 encoding taken from http://stackoverflow.com/questions/246801/how-can-you-encode-to-base64-using-javascript/247261#247261
var Base64 = {
// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
        Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

    }
    return output;
},
// private method for UTF-8 encoding
_utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
},
}


function insertafter(newChild, refChild) { 
    refChild.parentNode.insertBefore(newChild, refChild.nextSibling); 
} 

function extractVideoId(id) {
    if (id.id) {
	return id.id;
    } else {
	return getVideoId();
    }
}

function playVideo(id){
    id = extractVideoId(id);
    if ( id ) {
        callJSONRpc("Player.Open", { item: { file: "/?url=&mode=2&name=" + id } } )
    }
}


function GM_xmlhttpRequest(details) {
    if (typeof(chrome) != "undefined") {
	chrome.extension.sendRequest({ type: "httpRequest", "details": details});
    } else {
	self.postMessage({ "type": "httpRequest", "details": details}); 
    }
}

function callJSONRpc(method, params, id) {
    if (!xbmc_url) {
	if (typeof(chrome) != "undefined") {
	    window.open(chrome.extension.getURL("options.html"));
            return false;
	}
    }
    var mid = id | 1;
    var data = {
      jsonrpc : "2.0",
      method : method,
      id : mid
    }
    if (params) {
	params.item.file = "plugin://" + xbmc_path + params.item.file;
      data.params = params;
    }
    var strData = JSON.stringify(data);
    console.log("Calling " + xbmc_host + " with " + strData);
    var xhr = new XMLHttpRequest();
    xhr.open( 'POST', xbmc_url);
    var auth_header = "Basic " + Base64.encode(xbmc_user + ":" + xbmc_pass);
    xhr.setRequestHeader("Authorization", auth_header);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(strData);
}

function getVideoId(querystring) {
    return window.location.pathname.toString().split("/")[1];
}

// Play icon
var xbmc_play_image = new Image();
xbmc_play_image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAABcBJREFUeNrsV1loXUUY/mbOmbPcc5ObvW2WmrUkdSlWK6Vu2KrFBasoaBUh+qLUovZBtG8timJRMFZ9EHFBqNCHUtwqWOqCiMtLajUJpklvk9gmMbnr2e6ZOWd8SFJvrk3VaoRKB34YZv71nP//5v+JlBLn8qI4x9f5AP6XAfQePiJ7Dx/ZQQjBX6WzXaSnp+dspKWUskmlOOi43mOGGfukWOe1162PZvdJAA9+8dmhz0vlAfwdu6X8svQPyAUIC9wjCkUTJXRFenpqW6kxSigooSAgzQTk0HXrr9+3fsMNiRK9p9svZJ8scA51Vn55eurXFzTdmDsfZkzbpxnGdwBACMCDYJ3v+zdEYXghADk1NdXS0dGOurq61U4+9+GskSgMo2PZbAaVVVXFdm638/kNifLyr0ZHjguAeKrGPrAsa6+UCADAc5yboijcFIZhA0CSTNfeNc3Yd3POE0JirmPfEYXhLQASYRhSANOkp6cHhKBGFApHDMNYqqrq3CeRmXTmcT0We3P8l9Hdra1t3UIIqKqKSEYQQrhBIYhpug5alMNz943LW9Da1g4AGDo6iBNjxxGK8PfiUygG+gcOLG9u2T46cuyZjvYVt84rToVG2Uxum2FZL4eCX4wo3GMY5kXFPLl8fsdcDUhCUBuKsAOA5rnOXdXVVY9wzu2gUBiy4mWrJibGD5mm9ZrK2DilNHvyl9Gnm1tabs9kctt1wzgIgEgZab7n319dXfkQAKxesxaT4+M4fmwIKmNoXH4Bqmtqkctl0X/ksEcV1WRMDaSU2kD/wMcNjU27VcZyruvcV1NdtYVz7ucdt1tXlRcNw2yYTqXesuLxtwmhHlVoCiBDxUU8L7eOHR3c397RvokxhpMnTrxXVVN3bzFDcniwt7Nz5SrX81dRRfmhWLayokJ6ro2YFYedz4FSisuvWAcrHj/FMz5+Ej/3/wgpJSYnp/YmKiruLtafnpr8YFl9/am/kk5nnjKt+PNnglFSRFhaX3+QMQ2O7UxW1S7ZKn/nASEk0dTY1Mh5MK2oarJEHlU1NZBSIptJg1KK6tolUJgKv+CforLychR8H5RSbLhxY0KW6DCt+AEpJTjnmJiYGI7F4y+cxk9CF4AsZFLT10gZYXRsZERKmSpmiKKoLBaPVwDIAXBKFaSmp+dhu26Y8P3CPMrn8tB0HZlsllOq7PqDE1HUQAgBYwyu40xIifBMD9k8iPI9d2NLa+udQgi0tbU3A7KhODhKiOfatsMYqxecry7WEQqxpuC5EEKAKspsQSrwPG8eZTJphCKEa9vffPvN14dK3wXBxWUAwDlHY1NTGyBrTgO/oAAkpGwQPLja89wNnmPvqkiUf8w5dySQZIzVZNOp9z3P3eR77jVRGHZJYDqXy30IEB2R2Bv4/mbBg3WeYz+qMeXTKAphxMoQ+AWIMEQURXBdt5h6x0ZHdxcKPnTD/L4oNeYcZJEMmznnAWMsxRirSw4f3R/4/s2h4GtDwbvmglB9z+1OlJe9oWuqMpPfFI6dHyIK2zyTIvyzurq61QD2zzxgERzXvbuqdsnWgYG+1s7OrrVSyj0AQCwLUkY+VXUYMQsi8GG7LlzXK4bZnWMjyR2e53brqgJCabIURMjMnqdSqcA0rTsUinc6O7uulFJ+NOdDLm9vNS3rVbUiUb6Uc/46AAHAtW3nh1i87ICUMj2T73JtJpO9rbKyopVzrjLGKOdcaIZMt7St2OjY9mZN1y9hjLH+vr7Blrb2j+Km9pPjOOAiQqKyFrbtgFDSqyrKg+MnxnoBENOM7U0ODy5rbLrg29L2RgJCN8zugu9t1AzjS0h5VV9f/z0rV3at4Jxrsz4o5gx2//sDzcuvvDZPqaIoO7dueXjHnzRXZ2VLXYxuNJ/Pn2pMFUV5YPuTT/QuVju9SAHYGUVRdj77zM6XFnseWJQAOA8uff65Xcn/YqAh54f68wH8s/XbAH2V+4PRp2UKAAAAAElFTkSuQmCC'; // set source path

// Play icon dark
var xbmc_play_image_dark = new Image();
xbmc_play_image_dark.src = 'data:image/png;base64,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';


function addMainXBMCButton() {
    var ins_link = function (src, target) {
	var img_embed = document.createElement('img');
	img_embed.src = xbmc_play_image.src;
	img_embed.setAttribute("videoref", src);
		
	img_embed.addEventListener("click", function(e) {
	    playVideo({id: getVideoId(this.getAttribute("videoref"))});
	}, false);
	
	img_embed.addEventListener("mouseover", function () {
	    this.src = xbmc_play_image_dark.src;
	}, false);
	img_embed.addEventListener("mouseout", function () {
	    this.src = xbmc_play_image.src;
	}, false);
	insertafter(img_embed, target);
    };

    // Elements
    var tags = [ "a" ];
    for ( var j = 0; j < tags.length; j++) {
	var all = document.getElementsByTagName(tags[j]);
	if ( all ) {
	    for (var i = 0; i < all.length; i++) {
		var data = all[i].src;
		if ( !data ) {
		    data = all[i].getAttribute("id");
		}

		if ( data ) {
		    if ( data.indexOf("channel_follow") > -1 ) {
			ins_link(data, all[i]);
		    }
		}

	    }
	}
    }
    // Classes
}




function run() {
    if ( window.location.host.indexOf("twitch.tv") > -1 ) {
        addMainXBMCButton(); 
    }
}


function loadSettings(){
    if (typeof(chrome) != "undefined") {
	chrome.extension.sendRequest({ type: "settings" }, 
				     function(response) {
					 console.log("[XBMC-Twitch] GOT DATA: " + JSON.stringify(response));
                                         if (typeof(response) != "undefined") {
                                            response = JSON.parse(response);
                                            xbmc_path = response[0];
                                            xbmc_url = response[1];
                                            xbmc_host = response[2];
                                            xbmc_user = response[3];
                                            xbmc_pass = response[4];
                                            run(); 
                                         }
				     });
    } else {
	console.log("adding message listener");
	self.on("message", function(response) {
	    console.log("[XBMC-Twitch] GOT DATA: " + JSON.stringify(response));
	    xbmc_path = response[0];
            xbmc_url = response[1];
            xbmc_host = response[2];
            xbmc_user = response[3];
            xbmc_pass = response[4];
	    run();
	});
	console.log("sending load_settings request");
	self.postMessage({ "type": "load_settings"});
    }
}
loadSettings();
