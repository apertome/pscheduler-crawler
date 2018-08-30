#!/usr/bin/node

const fs = require('fs');
const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);
const fs_readFile = util.promisify(fs.readFile);
const jsonltools = require('./jsonltools');
const argv = require('optimist').argv;

const DEFAULT_PATH = '/ps_data/pscheduler-runner-debug/perfsonar-dev8/pscheduler.log-20180819';

const out_path = getpath();

read_file( out_path ).then( function( data ) {
    parse_log_data( data );
})
.catch( function( err ) {
    console.log("FILE LOAD FAILED", err);

});

function parse_log_data( input_data ) {
    var data = input_data.split("\n");
    for(let i in data ) {
        let row = data[i];
        // EXAMPLE LINE
        // Aug 14 15:45:31 perfsonar-dev8.grnoc.iu.edu journal: runner DEBUG    4846060: Retrieved {u'result-href': u'https://139.102.1.250/pscheduler/tasks/7c05
        let pattern = /runner DEBUG\s+\d+: Retrieved\s+(\{.+\})$/;
        let stripupattern = /(?<=\W)u'/g;
        let parsed = pattern.exec( row );
        if ( parsed !== null ) {
            console.log("parsed");
            let rowdata = parsed[1];
            rowdata = rowdata.replace(stripupattern, "'");
            rowdata = rowdata.replace(/'/g, '"');
            rowdata = rowdata.replace(/ None,/g, '"None",');
            console.log(rowdata);

            let jsonrow = JSON.parse(rowdata);
        }
    }


    }

async function read_file( out_path ) {
    return new Promise ( function( resolve, reject ) {
        let filename = out_path;
        fs_readFile(filename, 'utf8', function(err, data) {
            if (err) {
                console.log("Error reading file: " + filename + "; error: " + err);
                return reject(err);
            }
            console.log('completed loading DATA'); // data);
            //poll_status = JSON.parse( data );
            resolve(data);


        });

    });
}

function getpath() {
    var path = DEFAULT_PATH;
    if( argv.datapath ) {
       path = argv.datapath; 
    }
    return path;
}
