#!/usr/bin/node -max_old_space_size=5120


const fs = require('fs');
//const fs_writeFile = util.promisify(fs.writeFile);
//const fs_readFile = util.promisify(fs.readFile);

var minimist = require('minimist');

var args = minimist(process.argv.slice(2));

var infile = args._[0]

fs.readFile(infile, 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);

    var rows = "";

    obj.forEach( function( row ) {
        //rows += row + "\n";
        console.log( JSON.stringify( row ) );

    });

    //fs.writeFile( rows )

});
