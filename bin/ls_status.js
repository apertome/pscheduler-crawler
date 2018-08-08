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

// mine
const rest_crawler = require('./rest_crawler.js');

const activeHosts = ['http://ps1.es.net:8096/lookup/activehosts.json'];

const global_options = {
    headers: {
        'User-Agent': 'sLS-Crawler'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response

};


activeHosts.forEach( async function( url ) {
    rest_crawler.getHostStatusAndData( url ).then(result => {
        console.log("result returned to foreach loop\n", JSON.stringify(result));
    });

});

