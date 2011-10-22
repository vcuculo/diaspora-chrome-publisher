/*
 * Copyright (c) 2009 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

var links = document.getElementsByTagName("link");
var images = document.getElementsByTagName("img");
var image;
for (var i=0; i<links.length; i++) {
 if (links[i].getAttribute("rel") == "image_src"){
   image = links[i].getAttribute("href");
   break;
 }
}
if(image == null && images.length == 1)
   image = images[0].getAttribute("src");

var additionalInfo = {
  "title": document.title,
  "selection": window.getSelection().toString().replace(/[\r\n]/g, ""),
  "image": image
};

chrome.extension.connect().postMessage(additionalInfo);
