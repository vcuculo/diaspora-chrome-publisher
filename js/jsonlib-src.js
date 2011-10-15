// jsonlib.js
//
// Creates a global jsonlib object with several functions:
//
// jsonlib.ip(cb) -     Calls back cb with your current ip address (as a
//                      string) from the point of view of the server,
//                      e.g., cb("10.123.123.12").  cb is called with null
//                      if there is a failure.
// jsonlib.time(cb) -   Calls back cb with the current number of seconds
//                      since epoch (as a float) from the point of view of
//                      the server, e.g., cb(1276427503.73405).  cb is
//                      called with null if there is a failure.
// jsonlib.scrape("div[class=story] h2 a", "http://www.nytimes.com/", cb) -
//                      Calls back cb with an array of text contents of the
//                      elements selected by the given css selector,
//                      taken from the webpage fetched from the given url.
//                      cb is called with null if there is a failure.
// jsonlib.scrapeattr("href", "div[class=story] h2 a",
//                    "http://www.nytimes.com/", cb) -
//                      Calls back cb with an array containing the given
//                      attribute value for each element selected by the
//                      the css selector, taken from the webpage fetched
//                      from the given url.  cb is called with null if
//                      there is a failure.
// jsonlib.fetch(url, cb) -
// jsonlib.fetch({ url: url, select: selector, extract: name, ... } ,cb) -
//                      Raw interface to the jsonlib /fetch call.  Fetches
//                      the raw html at the given url as well as all HTTP
//                      headers, optionally applying a css selector and
//                      an extract option.  Calls back cb with an object
//                      containing a 'headers' field, and a 'content' field
//                      and other fields, as returned from the jsonlib server.
//                      cb is called with an object containing an 'error'
//                      field if there is a failure.
// jsonlib.urandom(cb) -
// jsonlib.urandom({ bytes: count, format: "array" }, cb) -
//                      Provides access to the server's secure RNG urandom.
//                      The two-argument form can specify any number of bytes
//                      and a format of either "array" or "string", which
//                      will be passed to the callback function.  The default
//                      number of bytes is 256 and the default format is
//                      string.  cb is called with null if there is a failure.
  
if (typeof(jsonlib) != 'object') {
  jsonlib = {};
}

(function(lib) {

var counter = (new Date).getTime(),
    head,
    window = this,
    domain = 'http://call.jsonlib.com/',
    securedomain = 'https://jsonlib.appspot.com/',
    timeout = 6000,
    nul = null;

// Use a <script> tag to load a json url

function loadscript(url) {
  var script = document.createElement('script'),
      done = false;
  script.src = url;
  script.async = true;
  script.onload = script.onreadystatechange = function() {
    if (!done && (!this.readyState || this.readyState === "loaded" ||
        this.readyState === "complete")) {
      done = true;
      script.onload = script.onreadystatechange = nul;
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }
  };
  if (!head) {
    head = document.getElementsByTagName('head')[0];
  }
  head.appendChild(script);
}

// Set up a jsonp call with a temporary global callback function

function invoke(url, params, callback, field, def) {
  var query = "?",
      jsonp = "jsonlib_cb_" + (++counter),
      timer;
  params = params || {};
  for (key in params) {
    if (params.hasOwnProperty(key)) {
      query += encodeURIComponent(key) + "=" +
               encodeURIComponent(params[key]) + "&";
    }
  }
  window[jsonp] = function(data) {
    clearTimeout(timer)
    window[jsonp] = nul;
    if (callback) {
      if (field) {
        if (data.hasOwnProperty(field)) { data = data[field]; }
        else { data = def; }
      }
      callback(data);
    }
    try {
      delete window[jsonp];
    } catch (e) {}
  };
  timer = setTimeout(function() {
    window[jsonp] = nul;
    callback(def);
    try {
      delete window[jsonp];
    } catch (e) {}
  }, timeout);
  loadscript(url + query + "callback=" + jsonp);
  return jsonp;
}

// Choose an api domain to use.  If the underlying url is https,
// then use an https domain for the jsonlib call.

function pickdomain(arg) {
  if (typeof arg.url == 'string' && arg.url.indexOf('https:') == 0) {
    return securedomain;
  } else {
    return domain;
  }
}

// Exported functions below.

function ip(ondone) {
  invoke(domain + 'ip', { }, ondone, 'ip', nul);
}

function time(ondone) {
  invoke(domain + 'time', { }, ondone, 'time', nul);
}

function echo(arg, ondone) {
  invoke(domain + 'echo', arg, ondone, nul, nul);
}

function urandom(arg, ondone) {
  if (arguments.length == 1) { ondone = arg; arg = {}; }
  invoke(securedomain + 'urandom', arg, ondone, 'urandom', nul);
}

function fetch(arg, ondone) {
  if (typeof arg == 'string') {
    arg = { url: arg };
  }
  invoke(pickdomain(arg) + 'fetch', arg, ondone, nul, { 'error': 'timeout' });
}

function scrape(select, url, ondone) {
  var arg;
  if (typeof select == 'string') {
    arg = { url: url, select: select, extract: 'text' };
  } else {
    arg = { url: url, extract: 'text' };
    for (var k in select) {
      if (select.hasOwnProperty(k)) {
        arg[k] = select[k];
      }
    }
  }
  invoke(pickdomain(arg) + 'fetch', arg, ondone, 'content', nul);
}

function scrapeattr(attr, select, url, ondone) {
  scrape({ select: select, extract: 'attr_' + attr }, url, ondone);
}

lib['ip'] = ip;
lib['time'] = time;
lib['fetch'] = fetch;
lib['scrape'] = scrape;
lib['scrapeattr'] = scrapeattr;
lib['urandom'] = urandom;

}(jsonlib));
