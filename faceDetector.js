
self.onmessage = function (event) {
  let data = event.data.data;
  let width = event.data.width;
  let imageMap = new Map();
  for(let i = 0;i < data.length;i += 4) {
    var y = Math.floor((i/4) / width); //rows
    var x = (i/4)-(y*width);
    var key = `${x}:${y}`
    imageMap.set(key,{red:data[i],green:data[i+1],blue:data[i+2],alpha:data[i+3]});
  }
  self.postMessage({image:imageMap});
}
