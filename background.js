/*
 * Diaspora* Publisher extension.
 * Copyright (C) 2012  Vittorio Cuculo <vittorio.cuculo@gmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

var podUrl;
var minutes = getMinutes();
var t;

getPod();

if (podUrl == null){
  alert(chrome.i18n.getMessage("setPodUrl"));
  chrome.tabs.create({url : "options.html"});
}
else if (getOpt("notify") == "true")
  checkNotifications();

function checkNotifications(){
  if (getOpt("notify") == "true"){
    minutes = getMinutes();
    t = setTimeout(function(){checkNotifications()}, minutes);
    getNotifications();
  }
  else
    resetNotifications();
}

function getNotifications(){
  getPod();
  
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: podUrl + "/notifications.json",
    success: function (result) {
      showNotifications(result);
    },
    error: function() {
      resetNotifications();
    }
  });
}

function resetNotifications(){
  chrome.browserAction.setBadgeText({text: ''});
}

function showNotifications(result){
  var n = 0;
  for(var x = 0; result.length > x; x++) {
    var unread =  result[x][Object.keys(result[x])[0]].unread;
    if (unread == true)
      n++;
  }
  if (n > 0)
    chrome.browserAction.setBadgeText({text: n.toString()});
  else
    resetNotifications();
}

function googlurl(url, cb) {
  $.ajax({
    type: 'POST',
    url: "https://www.googleapis.com/urlshortener/v1/url",
    contentType: 'application/json',
    data: JSON.stringify({longUrl: url}),
    success: function (m) {
      var result = null;
      try {
        result = m.id;
        if (typeof result != 'string') result = null;
      } catch (e) {
        result = null;
      }
      cb(result);
    }
  });
}

function tinyurl(url, cb) {
  $.ajax({
    type: 'GET',
    url: "http://tinyurl.com/api-create.php",
    data: {url: url},
    success: function (result) {
      cb(result);
    }
  });
}

function getPod(){
  podUrl = (window.localStorage != null && window.localStorage.podUrl != null) ? window.localStorage.podUrl : null;
}

function getMinutes(){
  return (window.localStorage != null && window.localStorage.minutes != null) ? window.localStorage.minutes : "300000";
}

function getOpt(opt){
  return (window.localStorage != null && window.localStorage.getItem(opt) != null) ? window.localStorage.getItem(opt) : "true";
}

function postMessage(tab_id, subject, url, selection, image) {
  var action_url = podUrl + "/bookmarklet?title=";

  if (getOpt("msg") == "true"){
    var msg = prompt(chrome.i18n.getMessage("addMsg"), chrome.i18n.getMessage("addMsgText"));
    if (msg && msg !== "") {
      action_url += encodeURIComponent(msg) + "<br><br>";
    }
  }

  if (subject.length > 0 && getOpt("title") == "true")
    if(getOpt("markdown") == "true")
      action_url += "**" + encodeURIComponent(subject) + "**";
    else
      action_url += encodeURIComponent(subject);

  if (url.length > 0 && getOpt("url") == "true")
    action_url += " • " + encodeURIComponent(url);

  // Append the current selection & image to the end of the text message.
  if (selection.length > 0)
    action_url += " • " + encodeURIComponent(selection);

  if (image != null && getOpt("images") == "true")
    action_url += " <br> [ ![Image](" + image + ") ](" + encodeURIComponent(url) + ")";

  if (getOpt("tags") == "true"){
    var tags = prompt(chrome.i18n.getMessage("addTags"), chrome.i18n.getMessage("addTagsText"));
    if (tags && tags !== "") {
      action_url += " <br>" + encodeURIComponent(tags);
    }
  }
  action_url += " <br><sub>&url=[via Diaspora* Publisher](" + encodeURIComponent("http://goo.gl/tmeFB") + ") -</sub>&v=1&";

  if (!window.open(action_url+'noui=1&jump=doclose','diasporav1','location=yes,links=no,scrollbars=no,toolbar=no,width=590,height=250'))
    location.href = action_url+'jump=yes';
}

chrome.extension.onConnect.addListener(function(port) {
  var tab = port.sender.tab;
    
  // This will get called by the content script we execute in
  // the tab as a result of the user pressing the browser action.
  port.onMessage.addListener(function(info) {
    if (info.type == "sendText"){
      var max_length = 1024;
      var max_url_length = 25;
      if (info.selection.length > max_length)
        info.selection = info.selection.substring(0, max_length);

      // If is video keep original url, otherwise embedding doesnt work
      if (tab.url.length > max_url_length && info.video == false)
        if (getOpt("short") == "tiny")
          tinyurl(tab.url, function(shorturl) { postMessage(tab.id, info.title, shorturl, info.selection, info.image); });
        else
          googlurl(tab.url, function(shorturl) { postMessage(tab.id, info.title, shorturl, info.selection, info.image); });

      else if (info.video == true && getOpt("ytimg") == "false")
        postMessage(tab.id, info.title, tab.url, info.selection, null);
      
      else if (info.video == true && getOpt("vmimg") == "false")
        postMessage(tab.id, info.title, tab.url, info.selection, null);

      else
        postMessage(tab.id, info.title, tab.url, info.selection, info.image);
    }
    else if (info.type == "getImg")
      port.postMessage({img: getOpt("images")});
  });
});

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {

  // Inject needed scripts and css
  chrome.tabs.executeScript(null, {file: "js/jquery.min.js"});
  chrome.tabs.executeScript(null, {file: "js/bootstrap.min.js"});
  chrome.tabs.insertCSS(null, {file: "css/bootstrap.css"});


  getPod();

  if (podUrl.indexOf("http") == -1)
    podUrl = "http://".concat(podUrl);

  // We can only inject scripts to find the title on pages loaded with http
  // and https so for all other pages, we don't ask for the title.
  if (tab.url.indexOf("http:") != 0 && tab.url.indexOf("https:") != 0)
    postMessage(tab.id, "", tab.url, "");
  else
    chrome.tabs.executeScript(null, {file: "content_script.js"});
});

