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

const ls_types = [ 'service', 'host', 'interface', 'psmetadata' ];

const global_options = {
    headers: {
        'User-Agent': 'sLS-Crawler'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response

};

activeHosts.forEach( async function( url ) {
    rest_crawler.getHostStatusAndData( url ).then(results => {
        console.log("results returned to foreach loop\n", JSON.stringify(results));
        getDataFromLSes(results);

    });

});

async function getDataFromLSes( results ) {
    return new Promise ( function( resolve, reject ) {
        var hosts = results.data.hosts;
        // for each host in activehosts, generate urls and retrieve data
        async.each(hosts, function(host, cb) {
            if( host.status != 'alive' ) return;
            console.log("host", host);
            var url = { type: "all", url: host.locator };
            console.log("url", url);
            var type_urls = ls_types.map(function(item) { 
                return { type: item, url: url.url + "?type=" + item };
            });
            type_urls.push( url );
            console.log("type_urls", type_urls);
            getDataFromLS( type_urls );


        }, function(err) {
            if( err ) {
                console.log('A url failed to process');
                reject( err );
            } else {
                console.log('All urls have been processed successfully');
                resolve( results );
            }

        });
    });
}

async function getDataFromLS( urls ) {
    var ls_results = {};
    return async.eachSeries( urls, function( urlObj, cb) {
        var url = urlObj.url;
        var type = urlObj.type;
        console.log("url getting data", url);
        rest_crawler.getRESTData( url ).then(results => {
            console.log( type + "results in getting data from LS: " + url + "\n", results.data.length);
            results.num_records = results.data.length;
            delete results.data;

            console.log("results in getting data from LS\n", JSON.stringify(results));
            //getDataFromLSes(results);
            //rest_crawler.getHostStatusAndData( url ).then(results => {

        }).catch((err) => {
            console.error("no data from url", err);
            results.error = err;
            return;
            
        });
        
        cb();
    });

}
