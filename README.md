# node-red-contrib-arnr

A <a href="https://nodered.org" target="mapinfo">Node-RED</a> node to add data to an augmented reality web page. Uses the AR.js library.

## Install

Either use the Manage Palette option in the Node-RED Editor menu, or run the following command in your Node-RED user directory - typically `~/.node-red`

        npm i node-red-contrib-arnr

**Note**: This does seem to kill my phone battery fairly quickly - As it uses GPS and is doing 3d rendering - but I do have an older phone.

## Usage

Plots "things" in augmented reality. Only really works on a phone. The AR.js library is quite picky about levels of browser and phone operating system - so you will need to experiment to find ones that work.

Happy to take feedback - but I suspect you will need to dig into AR.js directly and/or Three.js in order to help find the answers you need.

The node tries to fairly compatible with the Worldmap node we already have. So the basic msg required is essentially the same - but of course with added extras.

### Minimum msg.payload

    {"name":"Kings Head","lat":51.025587,"lon":-1.39055}

The default "icon" is a red sphere.

The `msg.payload` can also be an array of objects if required.

#### More

 - **bearing** - can be used to set the direction the object is facing.
 - **icon** - see below.
 - **iconColor** - an hmtl colour name or #rrggbb colour value - opacity is optional.
 - **attributes** - see below.


### msg.payload.icon

Currently the "icon" attribute can be based off the A-Frame primitives, and can be one of **a-sphere, a-box, a-cylinder, a-cone**.

The node can also accept:

 - **male, female** - a cylinder height 4.
 - **car, plane, ship** - a box length 4.

### msg.payload.attributes

`attibutes` is an object that can contain any extra attributes that an A-Frame model can accept. For example width, height, depth, texture (src=), etc.

See the [A-Frame docs](https://aframe.io/docs/1.0.0/primitives/a-box.html) for loads of info and examples.

### models

If you set the icon to be a `a-gltf-model` then in the attributes you can set the "texture" - src to be the *url to a gltf type model*.

(there is one simple model included in the node - in the models directory)

    [{"name":"Kings Head","lat":51.025587,"lon":-1.39055,"bearing":90,"icon":"a-gltf-model","attributes":{"scale":"60 60 60","src":"models/Duck.gltf"}}]