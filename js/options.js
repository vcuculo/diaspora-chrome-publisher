
var remoteList		= "http://podupti.me/api.php?key=4r45tg";
var localList		= "podlist.txt";
var defaultPlaceholder	= "joindiaspora.com";
var pods = new Array();

function localize() {
  document.title = chrome.i18n.getMessage("optionsTitle");

  $("h1#optionsTitle").html(chrome.i18n.getMessage("optionsTitle"));

  $("legend#podOptionsTitle").html(chrome.i18n.getMessage("podOptionsTitle"));
  $("label[id='podOpt']").append(chrome.i18n.getMessage("podOpt"));
  $("input[id='savepod']").attr('value', chrome.i18n.getMessage("savePodOptions"));

  $("legend#postOptionsTitle").html(chrome.i18n.getMessage("postOptionsTitle"));
  $("p#choosePod").html(chrome.i18n.getMessage("choosePod"));

  $("label[id='addMarkup']").append(chrome.i18n.getMessage("addMarkup"));
  $("p#addMarkupHelp").html(chrome.i18n.getMessage("addMarkupHelp"));
  $("label[id='addMarkdownOpt']").append(chrome.i18n.getMessage("addMarkdownOpt"));

  $("label[id='addComment']").append(chrome.i18n.getMessage("addComment"));
  $("p#addCommentHelp").html(chrome.i18n.getMessage("addCommentHelp"));
  $("label[id='addMsgOpt']").append(chrome.i18n.getMessage("addMsgOpt"));
  $("label[id='addTagsOpt']").append(chrome.i18n.getMessage("addTagsOpt"));

  $("label[id='addPageLink']").append(chrome.i18n.getMessage("addPageLink"));
  $("p#addPageLinkHelp").append(chrome.i18n.getMessage("addPageLinkHelp"));
  $("label[id='addUrlOpt']").append(chrome.i18n.getMessage("addUrlOpt"));
  $("label[id='addTitleOpt']").append(chrome.i18n.getMessage("addTitleOpt"));

  $("label[id='addPreview']").append(chrome.i18n.getMessage("addPreview"));
  $("p#addPreviewHelp").append(chrome.i18n.getMessage("addPreviewHelp"));
  $("label[id='addImageOpt']").append(chrome.i18n.getMessage("addImageOpt"));
  $("label[id='addYTOpt']").append(chrome.i18n.getMessage("addYTOpt"));
  $("label[id='addVMOpt']").append(chrome.i18n.getMessage("addVMOpt"));

  $("label[id='shortOpt']").append(chrome.i18n.getMessage("shortOpt"));
  $("p#shortOptHelp").append(chrome.i18n.getMessage("shortOptHelp"));

  $("legend#notificationOptionsTitle").html(chrome.i18n.getMessage("notificationOptionsTitle"));
  $("label[id='enableNotify']").append(chrome.i18n.getMessage("enableNotify"));
  $("label[id='checkEvery']").append(chrome.i18n.getMessage("checkEvery"));
  $("span[id='minutes']").html(chrome.i18n.getMessage("minutes"));
  $("label[id='checkNow']").append(chrome.i18n.getMessage("checkNow"));

  $("a[id='githubLink']").html(chrome.i18n.getMessage("githubLink"));
  $("a[id='githubLink']").parent().prepend(chrome.i18n.getMessage("extProjectAbout"));
  $("a[id='githubLink']").parent().append('.');

}

function submit() {
  if (document.getElementById('pod').value != ""){
    window.localStorage.podUrl = document.getElementById('pod').value;
    document.getElementById('pod').placeholder = document.getElementById('pod').value;
  }
  else
    window.localStorage.podUrl = document.getElementById('pod').placeholder;

  saveOption();

  var notification = webkitNotifications.createNotification(
  'icon.png',  // icon url
  chrome.i18n.getMessage("urlSaved"),  // notification title
  ''  // notification body text
  );

  notification.ondisplay = function() {
  setTimeout(function() {
    notification.cancel();
  }, 1000);
  };

  notification.show();
}

function saveOption(){
  window.localStorage.images = document.getElementById('images').checked;
  window.localStorage.msg = document.getElementById('msg').checked;
  window.localStorage.tags = document.getElementById('tags').checked;
  window.localStorage.markdown = document.getElementById('markdown').checked;
  window.localStorage.title = document.getElementById('title').checked;
  window.localStorage.url = document.getElementById('url').checked;
  window.localStorage.ytimg = document.getElementById('ytimg').checked;
  window.localStorage.vmimg = document.getElementById('vmimg').checked;
  window.localStorage.notify = document.getElementById('notify').checked;
  window.localStorage.minutes = document.getElementById('minutes').value;

  var short = document.getElementsByName('short');
  window.localStorage.short = (short[0].checked) ? short[0].value : short[1].value;

  if (window.localStorage.notify == "true"){
    chrome.runtime.getBackgroundPage(function(background) {
      background.checkNotifications()}
    );
  }
}

function updatePodsRemotely() {
  var i = 0;
  $.get(remoteList, function(data) {
        var remotefilePod = data.split(",");
        $.each(remotefilePod, function() {
           start = this.indexOf("/") + 2;
           end = this.indexOf(" ");
	   podValue = this.substring(0 , end);
           podName = this.substring(start , end);
           pods[i++] = podValue;
	}); // if remote podlist is unreachable, load local podlist
        $("input#pod").typeahead({source: pods});
  }).error(function() { updatePodsLocally();});
}

function updatePodsLocally(){
  var i = 0;
  $.get(localList, function(data) {
    var filePod = data.split("\n");
    $.each(filePod, function() {
      start = this.indexOf("/") + 2;
      podName = this.substring(0);
      pods[i++] = podName;
    });
    $("input#pod").typeahead({source: pods}); 
  });
}

function main() {
  localize();

  if (window.localStorage == null) {
    alert(chrome.i18n.getMessage("localStorage"));
    return;
  }

  updatePodsRemotely();

  document.getElementById('pod').placeholder = (window.localStorage.podUrl != null) ? window.localStorage.podUrl : defaultPlaceholder;

  document.getElementById('images').checked = (window.localStorage.images != null) ? (window.localStorage.images == "true") : true;
  document.getElementById('markdown').checked = (window.localStorage.markdown != null) ? (window.localStorage.markdown == "true") : true;
  document.getElementById('msg').checked = (window.localStorage.msg != null) ? (window.localStorage.msg == "true") : true;
  document.getElementById('tags').checked = (window.localStorage.tags != null) ? (window.localStorage.tags == "true") : true;
  document.getElementById('title').checked = (window.localStorage.title != null) ? (window.localStorage.title == "true") : true;
  document.getElementById('url').checked = (window.localStorage.url != null) ? (window.localStorage.url == "true") : true;
  document.getElementById('ytimg').checked = (window.localStorage.ytimg != null) ? (window.localStorage.ytimg == "true") : true;
  document.getElementById('vmimg').checked = (window.localStorage.vmimg != null) ? (window.localStorage.vmimg == "true") : true;
  document.getElementById('notify').checked = (window.localStorage.notify != null) ? (window.localStorage.notify == "true") : true;
  document.getElementById('minutes').value = (window.localStorage.minutes != null) ? window.localStorage.minutes : "300000";

  var short = window.localStorage.short;
  if (short == "tiny")
    document.getElementsByName('short')[1].checked = true;
  else
    document.getElementsByName('short')[0].checked = true;

  $('input').click(function() {saveOption();});
  $('#savepod').click(function() {submit();});
  $('#minutes').change(function() {saveOption();});

  $("input#pod").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        submit();
    }
  });
}

window.addEventListener('load', main);
