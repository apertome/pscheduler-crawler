#!/usr/bin/node 
// -max_old_space_size=5120

const ping = require('ping');
const rp = require('request-promise-native');
const request = require('request');
const async = require('async');
const util = require('util');
const fs = require('fs');
const fs_writeFile = util.promisify(fs.writeFile);
const fs_readFile = util.promisify(fs.readFile);
const urllib = require('url');
const _ = require('underscore');


const activeHosts = ['http://ps1.es.net:8096/lookup/activehosts.json'];

const global_options = {
    headers: {
        'User-Agent': 'sLS-Crawler'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response

};

activeHosts.forEach( function( url ) {
    var result = getHostStatusAndData( url );
    //console.log("url", url);



});

async function getHostStatusAndData( url ) {
    var result = {};
    result.url = url;
    var urlObj = new urllib.URL( url );
    var hostname = urlObj.hostname;
    var pingTime;
    var host = {};
    host.stats = {};
    var alive = false;
    var stats = {};
    console.log("pinging hostname " + hostname + " ...");
    const pingOptions = {
        extra: ["-c 5"]

    };

    // TODO: create a promise for when the host has been pinged and active hosts retrieved
    var pingPromise = ping.promise.probe( hostname, pingOptions )
    .then( function(res) {
        console.log("res", res);
        alive = res.alive;
        if ( res.avg ) {
            var decimal = parseFloat( res.avg );
            if ( !isNaN( decimal ) ) {
                stats.rtt = parseFloat( res.avg );
            } else {
                console.error("Non-numeric rtt returned; ignoring; value: ", res.avg);

            }
        }
        return res;

    }).catch((err) => {
        console.error('error pinging host ' + hostname + '; ' + err);
        alive = false;
        //error.logged = true
        //throw err
        return new Promise((resolve,reject) => { resolve() });
    })
    .then( function( ) {
        host.alive = alive;
        host.stats = _.extend(host.stats, stats);
        console.log("alive", alive);
        console.log("stats", stats);
        console.log("host", host);
        result.host_status = host;

    });

    const options = _.extend( global_options,
            {
                uri: url
            });

    console.log("options", options);
    var startReqTime = new Date();
    var activehostsPromise = rp( options )
        .then((res) => {
            console.log("output", res);
            var endReqTime = new Date();
            var elapsed = endReqTime - startReqTime;
            _.extend(host.stats, { request_time: elapsed } );
            result.data = res;


            return res;
    });
    /*
    .then(() => {

    });
    */

    Promise.all( [ pingPromise, activehostsPromise ] )
        .then(values => {
            console.log("result\n", JSON.stringify(result));
            return result;


        });


}

