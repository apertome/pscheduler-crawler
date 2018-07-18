'use strict';

var arrayToJsonLines = function ( arr ) {
   var out = ""; 
    arr.forEach( function( row ) {
        out += JSON.stringify( row ) + "\n";
    });
    return out;

};

exports.arrayToJsonLines = arrayToJsonLines;
