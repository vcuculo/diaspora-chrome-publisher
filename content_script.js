/*
 * Copyright (c) 2009 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

var links = document.getElementsByTagName("link");
var images = document.getElementsByTagName("img");
var image = null;
var port = chrome.extension.connect();

port.postMessage({type : "getImg"});

port.onMessage.addListener(function(msg) {
  if(msg.img == "false")
    sendPlain();
  else{
    for (var i=0; i<links.length; i++) {
      if (links[i].getAttribute("rel") == "image_src"){
        image = links[i].getAttribute("href");
        break;
      }
    }
    if (image == null && images.length == 1)
      sendPlain(images[0].getAttribute("src"));
    else if (images.length > 0)
      chooseImage(images);
  }
});

function sendPlain(img){
  var additionalInfo = {
    type: "send",
    title: document.title,
    selection: window.getSelection().toString().replace(/[\r\n]/g, ""),
    image: img
  };
  port.postMessage(additionalInfo);
}

function chooseImage(images){

  var c = 0;
  var elems = '';
  var cols = 7;

  $('#dp-imageselect').remove();

  var html = '<div id="dp-imageselect"><div id="ui-overlay" class="ui-overlay"><div class="ui-widget-overlay"></div>';

  for (var i=0; i<images.length; i++){

    min = Math.min(images[i].width, images[i].height);
    max = Math.max(images[i].width, images[i].height);
    
    if (min/max > 0.3 && max >= 100 && min >= 100){
     var imgSrc = images[i].getAttribute("src");
     if (c % cols == 0 && c > 0)
       //elems += '<br>';
       elems += '</tr><tr>';
     //elems += '<td onclick="getImage(\''+ encodeURIComponent(imgSrc) +'\')"><li><a href="#"><img src="'+ imgSrc +'"></a></li></td>';
     elems += '<td class="dthumb"><li><a href="#"><img src="'+ imgSrc +'"></a></li></td>';
     c++;
     //elems += '<li><a href="#"><img src="'+ images[i].getAttribute("src") +'"></a></li>';
    }    
  }

  if (c > 0){
    width = ((c < cols) ? c : cols ) * 114;
    height = Math.ceil(c / cols) * 114;
    html += '<div class="ui-widget-shadow ui-corner-all" style="width: '+ (width + 20) +'px;';
    html += ' height: '+ (height + 20) +'px; position: absolute; left: 50px; top: 30px; z-index:9999"></div></div>';
    html += '<div style="position: absolute; width: '+ width +'px; height: '+ height +'px;left: 50px;';
    html += ' top: 30px; padding: 10px; overflow: block; z-index:9999" class="ui-widget ui-widget-content ui-corner-all">';
    html += '<ul id="thumbs"><table id="dthumbs"><tr>';

    html += elems;

    html += '</table></ul></div></div>';
    //html += '</ul></div>'; 
    $("body").append(html);
    $("body").animate({scrollTop:0}, 'slow');
  }
  else{
    sendPlain();
    return;
  }
  var thumbs = $('#dthumbs td');

  document.getElementById("ui-overlay").addEventListener('click', function() {
    $('#dp-imageselect').remove();
    sendPlain();
  }, false);

  for (var i=0;i<thumbs.length;i++){
    thumbs[i].addEventListener('click', function() {
      var imgSrc = this.getElementsByTagName("img")[0].getAttribute("src");
      sendPlain(encodeURIComponent(imgSrc));
      $('#dp-imageselect').remove();
    }, false);
  }
}
