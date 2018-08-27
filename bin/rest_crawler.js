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


//const activeHosts = ['http://ps1.es.net:8096/lookup/activehosts.json'];

const global_options = {
    headers: {
        'User-Agent': 'sLS-Crawler'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response

};

/*
activeHosts.forEach( async function( url ) {
    getHostStatusAndData( url ).then(result => {
        console.log("result returned to foreach loop\n", JSON.stringify(result));
    });

});
*/

exports.getHostStatus = async function( url ) {
    return new Promise ( function( resolve, reject ) {
        var ts = new Date();
        var result = {};
        result.url = url;
        result.ts = ts;
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

        var pingPromise = ping.promise.probe( hostname, pingOptions )
            .then( function(res ) {
                alive = res.alive;
                if ( res.avg ) {
                    var decimal = parseFloat( res.avg );
                    if ( !isNaN( decimal ) ) {
                        stats.rtt = parseFloat( res.avg );
                    } else {
                        console.error("Non-numeric rtt returned; ignoring; value: ", res.avg);

                    }
                }
                //return new Promise((resolve3,reject3) => { resolve3(res)});
                //resolve( result );
            host.stats = _.extend(host.stats, stats);
            host.reachable = true;
            host.ts = ts;
            /*
            console.log("alive", alive);
            console.log("stats", stats);
            */
            //console.log("host", host);
            result.host_status = host;
            resolve( host );

            }).catch((err) => {
                console.error('error pinging host ' + hostname + '; ' + err);
                alive = false;
                host.reachable = false;
                //error.logged = true
                //throw err
                //return new Promise((resolve2,reject2) => { resolve2() });
                resolve(host);
            })

    });
};

exports.getHostStatusAndData = async function ( url ) {

    return new Promise ( function( resolve, reject ) {


        var activehostsPromise = exports.getRESTData( url );
        
        var healthPromise = exports.getHostStatus( url );


        Promise.all( [ activehostsPromise, healthPromise ] )
            .then(values => {
                var result = {};
                //host.data = result.data
                var value = values[0];
                //console.log("values", values);
                //console.log("VALUE", value);
                //console.log("host", host);
                result.request_time = value.request_time;
                result.data =  value.data;
                result.ts = value.ts;
                result.stats = value.stats;
                result.reachable = value.reachable;
                //console.log("result\n", JSON.stringify(result));
                resolve(result);
            }).catch(err => {
                console.log("ERROR in promise all", err);
            });

    });


}

exports.getRESTData = async function( url ) {
    return new Promise ( function( resolve, reject ) {
        const options = _.extend( global_options,
        {
            uri: url
        });

        //console.log("options", options);
        var startReqTime = new Date();
        rp( options )
            .then((res) => {
                //console.log("output", res);
                var endReqTime = new Date();
                var elapsed = endReqTime - startReqTime;
                //_.extend(host.stats, { request_time: elapsed } );
                var ret = {};
                ret.request_time = elapsed;
                ret.ts = startReqTime;
                ret.data = res;
                ret.reachable = true;

                resolve(ret);

            }).catch((err) => {
                console.log("Error reaching url", url);
                //console.log("Error reaching url", url, err);
                var out = {};
                var ret = {};
                ret.ts = startReqTime;
                ret.url = url;
                ret.data = [];
                ret.reachable = false;
                out.res = ret;
                delete err.options;
                delete err.error;
                out.err = err;
                reject(out);
                //resolve(out);
                //throw err;
                
            });
    });
    
};

