/*
 * Copyright (c) 2009 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

var links = document.getElementsByTagName("link");
var images = document.getElementsByTagName("img");
var image = null;

for (var i=0; i<links.length; i++) {
 if (links[i].getAttribute("rel") == "image_src"){
   image = links[i].getAttribute("href");
   break;
 }
}
if(image == null && images.length == 1)
   image = images[0].getAttribute("src");
else
  chooseImage(images);

function chooseImages(images){
  var html = '<div class="ui-overlay"><div class="ui-widget-overlay"></div><table><tr>';
  for (var i=0; i<images.length; i++){
    if (i%3 == 0)
      html += '</tr><tr>';
    html += <td><img src="'+ images[i].getAttribute("src") +'"></td>";
  }
  $("body").append(html);
}

var additionalInfo = {
  "title": document.title,
  "selection": window.getSelection().toString().replace(/[\r\n]/g, ""),
  "image": image
};

chrome.extension.connect().postMessage(additionalInfo);
