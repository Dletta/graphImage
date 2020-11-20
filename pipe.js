var Gun = require("gun");
var url = require("url");
var http = require("http");

Gun.on('opt', context);


function context (context) {
  context.on('in', handleMessage);
  this.to.next(context);
  var opt = context.opt || {};
  var ws = opt.ws || (opt.ws = {}), batch;
  if(opt.web){
		ws.server = ws.server || opt.web;
		ws.path = ws.path || '/gun';

		if (!ws.web) ws.web = new WebSocket.Server(ws);

		ws.web.on('connection', function(wire){
			wire.upgradeReq = wire.upgradeReq || {};
			wire.url = url.parse(wire.upgradeReq.url||'', true);
			wire.id = wire.id || Gun.text.random(6);
			var peer = opt.peers[wire.id] = {wire: wire};
			wire.peer = function(){ return peer };
			context.on('hi', peer);

			wire.on('message', async function(msg){
				console.log("MESSAGE", msg);
        console.log("type", msg.length);
        if(Buffer.isBuffer(msg)){
          console.log(msg.includes("metadata"));
          console.log(msg.toString('utf8', 0, 50));
        }
        var peerList = Object.keys(context.opt.peers);
        for(let i=0;i<peerList.length;i++) {
      		gun._.opt.peers[peerList[i]].wire.send(msg);
          console.log(`sent to ${peerList[i]}`);
      		}
			});

			wire.on('close', function(){
				context.on('bye', peer);
				Gun.obj.del(opt.peers, wire.id);
			});

			wire.on('error', function(e){});

      opt.open= function (peer, as){
    		if(!peer || !peer.url){ return }
    		var url = peer.url.replace('http', 'ws');
    		var wire = peer.wire = new WebSocket(url);
    		wire.on('close', function(){
    			reconnect(peer, as);
    		});
    		wire.on('error', function(error){
    			if(!error){ return }
    			if(error.code === 'ECONNREFUSED'){
    				reconnect(peer, as); // placement?
    			}
    		});
    		wire.on('open', function(){
    			var queue = peer.queue;
    			peer.queue = [];
    			Gun.obj.map(queue, function(msg){
    				batch = msg;
    				send.call(as, peer);
    			});
    		});
    		wire.on('message', function(msg){
    			receive(msg, wire, as); // diff: wire not peer!
    		});
    		return wire;
    	}


		});
  }
}





function handleMessage (msg) {
  console.log('received', msg)
  gun.on('out', msg)
}

var server = http.createServer();
server.listen(8080);

var gun = Gun({web:server});
