#!/usr/bin/node -max_old_space_size=5120


const fs = require('fs');
//const fs_writeFile = util.promisify(fs.writeFile);
//const fs_readFile = util.promisify(fs.readFile);

var minimist = require('minimist');

const jsonltools = require('./jsonltools');

var args = minimist(process.argv.slice(2));

var infile = args._[0]

fs.readFile(infile, 'utf8', function (err, data) {
    if (err) throw err;
    var arr = JSON.parse(data);

    var rows = jsonltools.arrayToJsonLines( arr );

    /*
    arr.forEach( function( row ) {
        //rows += row + "\n";
        console.log( JSON.stringify( row ) );

    });
    */

    console.log( rows );

    //fs.writeFile( rows )

});
