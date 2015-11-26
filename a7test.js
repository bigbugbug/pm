var a7Parser = require('./A7Parser');

var payload = 'd a7 2 0 27 1f 13 2 10 0 0 0 43 a7 a 23';
var msg;
a7Parser.parseA7Status(String(payload), function(msg1) { msg = msg1} );
console.log(msg);

