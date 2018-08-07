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


const activeHosts = ['http://ps1.es.net:8096/lookup/activehosts.json'];

activeHosts.forEach( function( url ) {
    var alive = false;
    var stats = {};
    console.log("url", url);
    var urlObj = new urllib.URL( url );
    var hostname = urlObj.hostname;
    console.log("pinging hostname " + hostname + " ...");
    const pingOptions = {
        extra: ["-c 5"]

    };
    ping.promise.probe( hostname, pingOptions )
    .then( function(res) {
        console.log("res", res);
        alive = res.alive;
        if ( res.avg ) stats.rtt = res.avg;

    }).catch((err) => {
        console.error('error pinging host ' + hostname + '; ' + err);
        alive = false;
        //error.logged = true
        //throw err
    })
    .then( function( ) {
        console.log("alive", alive);
        console.log("stats", stats);

    });


});
