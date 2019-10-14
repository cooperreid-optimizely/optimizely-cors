/**
* This util is responsible for pushing optimizely data (oeuid and visitor data)
* To external origins via an iFrame
* The iFrame will receive postMessages and write these entities as first-party entries
*/
var OptimizelyDataForwarder = (function() {

  var iFramePendingLoad, // will be a Promise, sendData functions won't have to worry about loading state
      frameURL = 'https://second-origin.com/sync.html';

  var getOptData = function() {
    /**
    * Build object of all optimizely visitor data in localStorage
    */
      var buildOptData = {};
      for (var i = 0; i < localStorage.length; i++){    
          if(!localStorage.key(i).match('optimizely_data')) continue;
          buildOptData[ localStorage.key(i) ] = localStorage.getItem(localStorage.key(i));
      }
      return buildOptData;
  }

  var getFrameOrigin = function() {
    /**
    * Get the iFrame origin in this format "protocol//hostname"
    */
    var dummyAnchor = document.createElement('a');
    dummyAnchor.href = frameURL;
    return dummyAnchor.protocol + '//' + dummyAnchor.hostname;
  }

  var sendVisitorData = function() {
    iFramePendingLoad.then(function(frame) {
      frame.contentWindow.postMessage(
        JSON.stringify({visitor: getOptData()}), 
        getFrameOrigin()
      );
    });
  }

  var sendOEUID = function(oeuid) {
    /**
    * This will send the supplied value
    * or automatically parse out the optimizelyEndUserId cookie and send that
    */
    oeuid = oeuid || document.cookie.split(/\s*;\s*/).reduce(function(all, current, idx) {
        all[current.split(/\=/)[0]] = current.split(/\=/)[1]
        return all;
    }, {}).optimizelyEndUserId;

    if(!oeuid) throw 'No optimizelyEndUserId cookie available';

    iFramePendingLoad.then(function(frame) {
      frame.contentWindow.postMessage(
        JSON.stringify({optimizelyEndUserId: oeuid}), 
        getFrameOrigin()
      );
    });
  }

  var init = function() {
    /**
    * Write the iFrame to the page (await body tag)
    * Send both oeuid and visitor data on first-load
    */
    var iFrameElt = document.createElement('iframe');   
    iFrameElt.style.display = 'none';       
    iFrameElt.src = frameURL;
    var observer = new MutationObserver(function() {
      if (document.body) {
        document.body.appendChild(iFrameElt);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, {childList: true});

    iFramePendingLoad = new Promise(function(res, rej) {
      iFrameElt.addEventListener('load', function() { res(iFrameElt); });
      iFrameElt.addEventListener('error', rej);   
    });
    sendVisitorData(); 
    sendOEUID();
  }

  init();

  return {
    sendVisitorData: sendVisitorData,
    sendOEUID: sendOEUID
  }

})();