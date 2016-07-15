var socket = io();

socket.on('geo', function(msg){
  console.log(msg);
});

console.log('here');
