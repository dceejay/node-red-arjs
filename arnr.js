/**
 * Copyright 2019 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var path = require("path");
    var express = require("express");
    //var compression = require("compression");
    var sockjs = require('sockjs');
    var sockets = {};
    RED.log.info("ARNR version " + require('./package.json').version );

    var arnrNode = function(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        node.path = n.path || "/arnr";
        if (node.path.charAt(0) != "/") { node.path = "/" + node.path; }
        //node.log("Serving "+__dirname+" as "+node.path);
        if (!sockets[node.path]) {
            var libPath = path.posix.join(RED.settings.httpNodeRoot, node.path, 'js', 'sockjs.min.js');
            var sockPath = path.posix.join(RED.settings.httpNodeRoot,node.path,'socket');
            sockets[node.path] = sockjs.createServer({prefix:sockPath, sockjs_url:libPath, log:function() { return; }});
            sockets[node.path].installHandlers(RED.server);
        }
        node.log("started at "+node.path);
        var clients = {};
        //RED.httpNode.use(compression());
        RED.httpNode.use(node.path, express.static(__dirname + '/ar'));

        var callback = function(client) {
            client.setMaxListeners(0);
            clients[client.id] = client;
            client.on('data', function(message) {
                message = JSON.parse(message);
                //console.log("GOT",message);
            });
            client.on('close', function() {
                delete clients[client.id];
                node.status({fill:"green",shape:"ring",text:"connected "+Object.keys(clients).length,_sessionid:client.id});
            });
            node.status({fill:"green",shape:"dot",text:"connected "+Object.keys(clients).length,_sessionid:client.id});
        }
        node.on('input', function(msg) {
            if (msg.hasOwnProperty("_sessionid")) {
                if (clients.hasOwnProperty(msg._sessionid)) {
                    clients[msg._sessionid].write(JSON.stringify(msg.payload));
                }
            }
            else {
                for (var c in clients) {
                    if (clients.hasOwnProperty(c)) {
                        clients[c].write(JSON.stringify(msg.payload));
                    }
                }
            }
        });
        node.on("close", function() {
            for (var c in clients) {
                if (clients.hasOwnProperty(c)) {
                    clients[c].end();
                }
            }
            clients = {};
            sockets[node.path].removeListener('connection', callback);
            for (var i=0; i < RED.httpNode._router.stack.length; i++) {
                var r = RED.httpNode._router.stack[i];
                if ((r.name === "serveStatic") && (r.regexp.test(node.path))) {
                    RED.httpNode._router.stack.splice(i, 1)
                }
            }
            node.status({});
        });
        sockets[node.path].on('connection', callback);
    }
    RED.nodes.registerType("arnr",arnrNode);
}
