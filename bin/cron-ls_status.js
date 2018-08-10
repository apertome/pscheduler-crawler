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
const jsonltools = require('./jsonltools');

const activeHosts = ['http://ps1.es.net:8096/lookup/activehosts.json'];

const ls_types = [ 'service', 'host', 'interface', 'psmetadata', 'person', 'pstest' ];

const data_path = '/ps_data/sls';


// below, set flag to 'a' for append or 'w' for write
const data_write_options = {
    'encoding': 'utf8',
    'flag': 'a'
};

const global_options = {
    headers: {
        'User-Agent': 'sLS-Crawler'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response

};
const out_format = 'jsonl';

var all_ls_results = [];

async.each(activeHosts, async function( url ) {
    var host_results;
    await rest_crawler.getHostStatusAndData( url ).then((results) => {
        host_results = results;

    })

    getDataFromLSes(host_results)
        .then((results) => {
            //console.log("ALL_LS_RESULTS", JSON.stringify(all_ls_results));
            console.log("health information\n", JSON.stringify(host_results));
            save_json_file( data_path + "/ls_stats_all.jsonl", all_ls_results ); 
            save_json_file( data_path + "/activehosts.jsonl" , host_results ); 
        });

});

async function getDataFromLSes( results ) {
    return new Promise ( function( resolve, reject ) {
        var hosts = results.data.hosts;
        // for each host in activehosts, generate urls and retrieve data
        async.each(hosts, function(host, cb) {
            if( host.status != 'alive' ) return;
            console.log("HOST retrieving data", host.locator);
            getDataFromLS( host.locator ).then((ls_results) => {
                    //ls_results.health = health;
                    //console.log("ls_results with HEALTH", ls_results);

                    all_ls_results.push( ls_results );

                    //resolve2(ls_results);
                    cb(null, ls_results);
                    //return ls_results;
                    //console.log("all_ls_results interim\n", JSON.stringify( all_ls_results ));
            }).catch(err => {
                console.error("Error getting data from LSes!");
                console.error("host, err", host, err);
                cb(err);
                //throw err;
                //reject2( err );
                return;

            });

        }, function(err) {
            if( err ) {
                console.log('A url failed to process');
                reject( err );
            } else {
                console.log('All urls have been processed successfully');
                //console.log("ls_results", ls_results);
                //console.log("results", results);
                //console.log("all_ls_results", all_ls_results);
                return resolve( all_ls_results );
            }

        });
    });
}

async function getDataFromLS( mainURL ) {
    return new Promise ( function( resolve, reject ) {
        var url = { type: "all", url: mainURL };
        console.log("url", url);
        var ls_results = [];
        var ls_result = {};
        ls_result.url = url.url;
        var type_urls = ls_types.map(function(item) { 
            return { type: item, url: url.url + "?type=" + item };
        });
        type_urls.push( url );
        console.log("type_urls", type_urls);
        //var urls = type_urls.map(function(item) { return item.url  });
        //console.log("urls", urls);
        async.eachSeries( type_urls, function( urlObj, cb) {
            if ( ! (  "types" in ls_result) ) ls_result.types = {};
            var url = urlObj.url;
            var type = urlObj.type;
            console.log("url getting data", url);
            rest_crawler.getRESTData( url ).then(results => {
                console.log( type + "results in getting data from LS: " + url + "\n", results.data.length);
                results.num_records = results.data.length;
                results.url = url;
                delete results.data;


                ls_result.url = url;
                //results.type = type;

                if ( type == "all" ) {
                    var health = {};
                    rest_crawler.getHostStatus( url )
                .then((res) => {
                    health = res;
                    //host.health = res;
                    //console.log("HEALTH", health);
                    ls_result.health = health;
                    ls_result.request_time = results.request_time;
                    ls_result.num_records = results.num_records;
                    ls_result.ts = results.ts;
                    ls_results.push( ls_result );
                //console.log("results in getting data from LS\n", JSON.stringify(results));
                //console.log("ls_result", ls_result);
                    return cb(null, ls_result);
                });

                }  else {
                    ls_result.types[ type ] = results;
                console.log("results in getting data from LS\n", JSON.stringify(results));
                console.log("ls_result", ls_result);
                    return cb(null, ls_result);
                }

                //ls_results.push(ls_result);

            }).catch((err) => {
                console.error("no data from url", err);
                results.error = err;
                return cb(null, results);
                //reject(err);

            });

        }, function(err) {
            if ( err ) {
                console.log("Error getting LS data");
                reject(err);
                return cb(err);

            } else {
                //console.log("LS_RESULTS", JSON.stringify(ls_results));
                //return ls_results;
                //cb(ls_results);
                resolve(ls_results);

            }



        });

    });

}

function save_json_file( filename, data ) {
    console.log("save format ... ", out_format);
    var out_data;
    if ( out_format == "json" ) {
        var json = JSON.stringify(data);
        out_data = json;
    } else {
        var jsonl = jsonltools.arrayToJsonLines( data );
        out_data = jsonl;
    }
    return new Promise( function( resolve, reject ) {

        if ( out_data == "" ) return resolve();

        fs_writeFile(filename, out_data, data_write_options, function(err) {
            if (err) {
                console.log("Error saving file: " + filename + "; error: " + err);
                reject( err );
                throw err;
            }
            console.log('completed saving', filename);
            resolve();
        });
    });
}