var OptimizelyDataReceiever = (function() {

  var trustedOrigins = ['https://first-origin.com'];

  var oeuidSetter = function(oeuid) {
    var existingOEUID = getCookie('optimizelyEndUserId')
        cookieParts = [],
        cookieDate = new Date; cookieDate.setFullYear(cookieDate.getFullYear()+1);
    cookieParts.push('optimizelyEndUserId=' + oeuid);
    cookieParts.push('path=/');
    cookieParts.push('expires=' + cookieDate.toGMTString());

    // Attempt to set cookie at eTLD+1
    cookieParts.push('domain=' + ('.' + (window.location.hostname.split('.').splice(window.location.hostname.split('.').length - 2,2)).join('.')));
    console.log('+++ Attempt', cookieParts.join(';'));
    document.cookie = cookieParts.join(';');

    // Attempt . + current host
    if(getCookie('optimizelyEndUserId') !== oeuid) {
      cookieParts.pop(); // remove the domain piece
      cookieParts.push('domain=.' + window.location.hostname);
      document.cookie = cookieParts.join(';');
      console.log('+++ First cookie set didnt work, try:', cookieParts.join(';'));
    }

    // Attempt omitting domain from cookie options
    if(getCookie('optimizelyEndUserId') !== oeuid) {
      cookieParts.pop(); // remove the domain piece
      document.cookie = cookieParts.join(';');
      console.log('+++ Second cookie set didnt work, try:', cookieParts.join(';'));
    }

    console.log('+++ Existing OEUID', existingOEUID, 'Set to', oeuid, 'Result', getCookie('optimizelyEndUserId'));
  } 

  var getCookie = function(cookieKey) {
    return document.cookie.split(/\s*;\s*/).reduce(function(all, current, idx) {
          all[current.split(/\=/)[0]] = current.split(/\=/)[1]
          return all;
    }, {})[cookieKey];
  }

  var receiveMessage = function(event) {
    //throw 'Frame receiver: Not a trusted parent origin (' + event.origin + ')';
    if(trustedOrigins.indexOf(event.origin) < 0) return;

    // receive and parse JSON
    var jsonMessage = {};
    try {
      jsonMessage = JSON.parse(event.data);
    } catch(err) { }

    // frame receieved visitor data (localStorage)
    if(jsonMessage.visitor) {
      // set LS keys
      for(var key in jsonMessage.visitor) {
        localStorage.setItem(key, jsonMessage.visitor[key]);
      }
    } 
    // frame receieved optimizelyEndUserId
    else if(jsonMessage.optimizelyEndUserId) {
      localStorage.setItem('pending.optimizelyEndUserId', jsonMessage.optimizelyEndUserId);
      /**
      * This next line won't work within the iFrame context because
      * you can't set a cookie via an iFrame without having visited iFrame origin (ITP)
      * [ But try it anyway :) ]
      *
      * This will set the oeuid in localStorage, which will then get read and written as a proper 1st party cookie
      * on the next visit to the iFrame origin
      */
      oeuidSetter(localStorage.getItem('pending.optimizelyEndUserId'));
    } 
  }

  var init = function() {
    // set the optimizelyEndUserId cookie on the iFrame'd origin 
    // if there is a value staged within localStorage (pending.optimizelyEndUserId)
    if(localStorage.getItem('pending.optimizelyEndUserId')) {
      oeuidSetter(localStorage.getItem('pending.optimizelyEndUserId'));
    }
    window.addEventListener("message", receiveMessage, false);
  }  

  init();

})();