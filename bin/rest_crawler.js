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
    var result = {};
    var alive = false;
    var stats = {};
    console.log("url", url);
    var urlObj = new urllib.URL( url );
    var hostname = urlObj.hostname;
    var pingTime;
    var host = {};
    console.log("pinging hostname " + hostname + " ...");
    const pingOptions = {
        extra: ["-c 5"]

    };

    // TODO: create a promise for when the host has been pinged and active hosts retrieved
    pingTime = new Date();
    ping.promise.probe( hostname, pingOptions )
    .then( function(res) {
        console.log("res", res);
        alive = res.alive;
        if ( res.avg ) stats.rtt = res.avg;
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
        host.stats = stats;
        host.stats.pingTime = pingTime;
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
    rp( options )
        .then((res) => {
            console.log("output", res);
            result.data = res;
            return res;
    })
    .then(() => {
        console.log("result", result);

    });



});
