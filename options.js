// Saves options to localStorage.
function save_options() {
  window.localStorage["xbmc_twitch_host"] = document.getElementById("xbmc_twitch_host").value;
  window.localStorage["xbmc_twitch_path"] = document.getElementById("xbmc_twitch_path").value;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Saved.";
  setTimeout(function() {status.innerHTML = "";}, 1500);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    if (window.localStorage["xbmc_twitch_host"]) {
		document.getElementById("xbmc_twitch_host").value = window.localStorage["xbmc_twitch_host"];
    } else {
                document.getElementById("xbmc_twitch_host").value = "username:password@localhost:8080";
    }
    if (window.localStorage["xbmc_twitch_path"]) {
		document.getElementById("xbmc_twitch_path").value = window.localStorage["xbmc_twitch_path"];
    } else {
                document.getElementById("xbmc_twitch_path").value = "plugin.video.jtv.archives";
    }
}

document.addEventListener('DOMContentLoaded', restore_options );
