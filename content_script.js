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
var port = chrome.extension.connect();
var links = document.getElementsByTagName("link");
var images = document.getElementsByTagName("img");
var image = null;

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

  $('#myModal').remove();

  var html = '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
                <div class="modal-header">\
                  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                </div>\
                <div class="modal-body">\
                  <ul class="thumbnails">\
                  </ul>\
                </div>\
              </div>';

  $("body").append(html);

  for (var i=0; i<images.length; i++){

    min = Math.min(images[i].width, images[i].height);
    max = Math.max(images[i].width, images[i].height);
    console.log(max);
    if (min/max > 0.3 && max >= 100 && min >= 100){
      if(images[i].getAttribute('data-original'))
       var imgSrc = images[i].getAttribute('data-original');
      else
       var imgSrc = images[i].src;
     elems += '<li class="span2"><a href="#"><img src="'+ imgSrc +'"></a></li>';
     c++;
    }    
  }

  if (c > 0){
    $('.thumbnails').html(elems);
    $('#myModal').modal('show');
  }
  else{
    sendMess(false);
    return;
  }
  var thumbs = $('#dthumbs td');

  $('#myModal').on('hidden', function () {
    $('#myModal').remove();
    sendMess(false);
  });

  for (var i=0;i<thumbs.length;i++){
    thumbs[i].addEventListener('click', function() {
      var imgSrc = this.getElementsByTagName("img")[0].getAttribute("src");
      sendMess(false, encodeURIComponent(imgSrc));
      $('#myModal').remove();
    }, false);
  }
}
