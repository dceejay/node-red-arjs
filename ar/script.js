
var ws;
var allthings = {};
var things = [
    { name: 'Car', lat: 51.027261, lon: -1.395748, bearing: 180 }
    ,{ name: 'Clubhouse', lat: 51.023793, lon: -1.400019, bearing: 30 }
    ,{ name: 'Hole2', lat: 51.05, lon: -1.35 }
    ,{ name: 'Shed', lat: 51.050080, lon: -1.345898 }
];

// [
//     {"ts":1576595747,"modes":"3950ce","lat":51.18223,"lon":-0.482941,"alt":9441.18,"squawk":2245,"name":"AFR23GY","vrate":0,"bearing":137.5,"speed":405,"icon":"plane","iconColor":"#910000"},
//     {"ts":1576595746,"modes":406673,"lat":50.757385,"lon":-1.298688,"alt":6545.58,"squawk":2210,"name":"EZY81FE","vrate":9.103378206756414,"bearing":220.3,"speed":321,"icon":"plane","iconColor":"#910000"},
//     {"ts":1576595746,"modes":"4952c3","lat":50.604983,"lon":-0.554884,"alt":11887.2,"squawk":557,"name":"TAP764","vrate":0,"bearing":27.2,"speed":487,"icon":"plane","iconColor":"#910000"},
//     {"ts":1576595730,"modes":"4b1809","lat":51.139728,"lon":-0.749207,"alt":3398.52,"squawk":2014,"name":"SWR31H","vrate":6.17729235458471,"bearing":200.8,"speed":296,"icon":"plane","iconColor":"#910000"}
// ];

// Create the socket
var connect = function() {
    ws = new SockJS(location.pathname.split("index")[0] + 'socket');
    ws.onopen = function() {
        //console.log("CONNECTED");
        ws.send(JSON.stringify({action:"connected"}));
    };
    ws.onclose = function() {
        //console.log("DISCONNECTED");
        ws.send(JSON.stringify({action:"disconnected"}));
        setTimeout(function() { connect(); }, 2500);
    };
    ws.onmessage = function(e) {
        var data = JSON.parse(e.data);
        //console.log("DATA", typeof data, data);
        if (!Array.isArray(data)) { data = [ data ]; }
        renderPlaces(data);
    };
}
//console.log("CONNECT TO",location.pathname + 'socket');

function renderPlaces(places) {
    var scene = document.querySelector('a-scene');

    places.forEach((place) => {
        // add place icon
        // const icon = document.createElement('a-image');
        let icon;
        
        var sh = place.icon || "a-sphere";
        // icon.setAttribute('geometry', "primitive: "+sh);
        if (sh.indexOf("male") !== -1) { sh = "a-cylinder"; }
        if (sh.indexOf("car") !== -1) { sh = "vehicle"; }
        if (sh.indexOf("plane") !== -1) { sh = "vehicle"; }
        if (sh.indexOf("ship") !== -1) { sh = "vehicle"; }
        
        if (sh === "vehicle") {
            icon = document.createElement('a-box');
            icon.setAttribute('depth', '4');
            icon.setAttribute('material', "color: #910000");
        }
        else if (sh.indexOf("a-") == 0) { icon = document.createElement(sh); }
        else { icon = document.createElement('a-sphere'); }

        if (sh === "a-cone") {
            icon.setAttribute('height', '2');
        }
        else if (sh === "a-cylinder") {
            icon.setAttribute('height', '4');
        }

        if (place.hasOwnProperty("iconColor")) { 
            var co = place.iconColor || "#910000";
            icon.setAttribute('material', "color: "+co);
        }

        if (place.hasOwnProperty("attributes")) {
            var keys = Object.keys(place.attributes);
            for (var k of keys) {
                icon.setAttribute(k, place.attributes[k]);
            }
        }
        else {
            icon.setAttribute('scale', "10 10 10");
            var co = place.iconColor || "#910000";
            icon.setAttribute('material', "color: "+co);
        }

        icon.setAttribute('name', place.name);
        icon.setAttribute('gps-entity-place', `latitude:${place.lat}; longitude:${place.lon}`);
        // icon.setAttribute('light', "type:point; intensity:2.0");
        
        // icon.setAttribute('src', 'up-arrow.png');
        if (place.hasOwnProperty("bearing")) {
            // icon.setAttribute('rotation', '0, '+place.bearing||0+', 0');
            icon.object3D.rotation.y += place.bearing*Math.PI/180;
        }

        // var sc = place.scale || 10;
        // sc = sc + ", "+sc+ ", "+sc;
        // // for debug purposes, just show in a bigger scale
        // icon.setAttribute('scale', sc);
        // // icon.setAttribute('scale', "10, 10, 10");

        icon.addEventListener('loaded', function() { 
            console.log("Place:",place.name); 
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
        });

        // let lab = document.createElement('a-text');
        // lab.setAttribute('value', place.name);
        // lab.setAttribute('color', "white");
        // lab.setAttribute('height', 20);
        // lab.setAttribute('z-offset', 25);
        // scene.appendChild(lab);

        // const clickListener = function(ev) {
        //     console.log("EV",ev.target);
        //     ev.stopPropagation();
        //     ev.preventDefault();

        //     const name = ev.target.getAttribute('name');
        //     console.log("CLICKED:",name);
        //     ws.send(JSON.stringify({click:name})); 

        //     const el = ev.detail.intersection && ev.detail.intersection.object.el;

        //     if (el && el === ev.target) {
        //         const label = document.createElement('span');
        //         const container = document.createElement('div');
        //         container.setAttribute('id', 'place-label');
        //         label.innerText = name;
        //         container.appendChild(label);
        //         document.body.appendChild(container);

        //         setTimeout(() => {
        //             container.parentElement.removeChild(container);
        //         }, 2500);
        //     }
        // }
        // icon.addEventListener('click', clickListener);

        // try { scene.removeChild(allthings[place.name]); }
        // catch(e) {}

        if (allthings[place.name]) { scene.replaceChild(icon, allthings[place.name]); }
        else { scene.appendChild(icon); }
        allthings[place.name] = icon;
    });
}

window.onload = function() {
    connect();
    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {
        //console.log("POS",position.coords)
        renderPlaces(things);
        //var p = {lat:position.coords.latitude, lon:position.coords.longitude, alt:position.coords.altitude};
        //ws.send(JSON.stringify({position:p})); 
    },
    (err) => console.error('Error in retrieving position', err), {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000,
    }); 
};