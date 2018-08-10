'use strict';

const _ = require('underscore');

var arrayToJsonLines = function ( arr ) {
   var out = "";
   if ( typeof arr == "undefined" ) { 
       return out;
   } else {
       if ( !_.isArray( arr ) ) {
           arr = [arr];
       }
       arr.forEach( function( row ) {
           if ( typeof row == "undefined" ) return;
           out += JSON.stringify( row ) + "\n";
       });
   }
    return out;

};

exports.arrayToJsonLines = arrayToJsonLines;
