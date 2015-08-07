var wo = {
  map: null,
  geocoder: new google.maps.Geocoder(),
  infowindow: new google.maps.InfoWindow(),
  tag: "",
  firstWord: function() {
    var arr = this.infowindow.content.split(/[\s,\d'-]+/);
    for(var i = 0; i < arr.length; i += 1) {
      // return first word that is no an empty string
      if(arr[i] != "") {
        this.tag = arr[i];
        break;
      }
    }
    return this.tag;
  },
  moveMapTimer: null,
  instaTimers: [],
  clearTimers: function() {
    for(var i = 0; i < this.instaTimers.length; i += 1) {
      clearTimeout(this.instaTimers[i]);
    }
    instaTimers = [];
  },
  zoom: 4
  
}

function initialize() {
  var myLatlng = new google.maps.LatLng(55.950978133901685,13.551592951843304);
  var mapOptions = {
    zoom: wo.zoom,
    center: myLatlng
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  wo.map = map;

  var infowindow = new google.maps.InfoWindow({
      content: ""
  });

  var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Uluru (Ayers Rock)'
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });
  $('body').mouseup(startStopInstaFeed);
}

google.maps.event.addDomListener(window, 'load', initialize);


function instagramSettings(){
  return {
    dataType: "jsonp"
  }
}

function showPictures() {
  var tag = wo.firstWord();
  $.ajax("https://api.instagram.com/v1/tags/" + tag + "/media/recent?client_id=d1134d6ed0824fb488780a941ebe773d", instagramSettings()).done(function(response){dealWithResponse(response)})
  function dealWithResponse(response){
    var arr = response.data;
    var container = document.getElementById('img_container');
    for(var i = 0; i < arr.length; i += 1){
      (function(i){
        wo.instaTimers[wo.instaTimers.length] = setTimeout(function(){
          container.style.backgroundImage = "url('" + arr[i].images.standard_resolution.url + "')" || "url()";
        },2000 * i + 1000);
      })(i);
    }
  }
}

function startStopInstaFeed() {
  if(!wo.moveMapTimer) {
    wo.clearTimers();
    codeLatLng(showPictures);
    wo.moveMapTimer = setTimeout(function(){
      clearTimeout(wo.moveMapTimer);
      
      wo.moveMapTimer = null;
    }, 3000);
  }
}

function getMapCenter()
{
  var co = wo.map.getCenter();
  return {longitude: co.G, latitude: co.K}
}
$('body').click(getMapCenter);

function codeLatLng(show) {
  var map = wo.map;
  var infowindow = wo.infowindow;
  var input = getMapCenter();
  var latlng = new google.maps.LatLng(input.longitude, input.latitude);
  wo.geocoder.geocode({'location': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        map.setZoom(wo.zoom);
        marker = new google.maps.Marker({
          position: latlng,
          map: map
        });
        infowindow.setContent(results[1].formatted_address);
        infowindow.open(map, marker);
        show();
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });

}
