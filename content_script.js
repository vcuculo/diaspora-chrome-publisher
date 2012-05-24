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

var links = document.getElementsByTagName("link");
var images = document.getElementsByTagName("img");
var image = null;
var port = chrome.extension.connect();

port.postMessage({type : "getImg"});

port.onMessage.addListener(function(msg) {

  if (msg.img == "false" || (images.length == 0 && image == null))
    sendMess(false);
  
  else if (msg.img == "true"){
    for (var i=0; i<links.length; i++) {
      if (links[i].getAttribute("rel") == "image_src"){
        image = links[i].getAttribute("href");
        break;
      }
    }

    if (isYoutube() == true){
      sendMess(true, getYTimg(window.location.href));
    }
    else if (isVimeo() == true){
      getVMimg(window.location.href);
    }
    else if (images.length == 0 && image != null)
      chooseImage(image);
    else if (images.length > 0)
      chooseImage(images);
  }
});

function isYoutube(){
  return (window.location.hostname == "www.youtube.com");
}

function isVimeo(){
  return (window.location.hostname == "vimeo.com");
}

function getYTimg( url )
{
  if(url === null){ return ""; }

  var id;
  var results;

  results = url.match("[\\?&]v=([^&#]*)");
  id = ( results === null ) ? url : results[1];

  return "http://img.youtube.com/vi/" + id + "/0.jpg";
}

function getVMimg( url )
{
  if(url === null){ return ""; }
  
  var id = url.split('/')[3];
  $.ajax({
    type:'GET',
    url: 'http://vimeo.com/api/v2/video/' + id + '.json',
    jsonp: 'callback',
    dataType: 'jsonp',
    success: function(data){
      sendMess(true, data[0].thumbnail_large);
    }
  });
}

function sendMess(video, img){
  var additionalInfo = {
    type: "sendText",
    title: document.title,
    selection: window.getSelection().toString().replace(/[\r\n]/g, ""),
    image: img,
    video: video
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
     var imgSrc = images[i].src;
     if (c % cols == 0 && c > 0)
       elems += '</tr><tr>';
     elems += '<td class="dthumb"><li><a href="#"><img src="'+ imgSrc +'"></a></li></td>';
     c++;
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
    $("body").append(html);
    $("body").animate({scrollTop:0}, 'slow');
  }
  else{
    sendMess(false);
    return;
  }
  var thumbs = $('#dthumbs td');

  document.getElementById("ui-overlay").addEventListener('click', function() {
    $('#dp-imageselect').remove();
    sendMess(false);
  }, false);

  for (var i=0;i<thumbs.length;i++){
    thumbs[i].addEventListener('click', function() {
      var imgSrc = this.getElementsByTagName("img")[0].getAttribute("src");
      sendMess(false, encodeURIComponent(imgSrc));
      $('#dp-imageselect').remove();
    }, false);
  }
}
