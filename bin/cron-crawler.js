#!/usr/bin/node -max_old_space_size=5120

const pscheduler_hosts = [
    'perfsonar-dev.grnoc.iu.edu',
    //'perfsonar-dev5.grnoc.iu.edu', // removed, does not run pscheduler
    'perfsonar-dev8.grnoc.iu.edu',
    'perfsonar-liva.lbl.gov',
    'perfsonardev0.internet2.edu',
    'ps-4-0-xenial.qalab.geant.net',
    'ps-4-0.qalab.geant.net',
    'ps-bionic.qalab.geant.net',
    'ps-dev-deb8-1.es.net',
    'ps-dev-deb8-2.es.net',
    'ps-dev-el6-1.es.net',
    'ps-dev-el7-1.es.net',
    'pstest2.geant.carnet.hr',
    't2-psdev.rrze.uni-erlangen.de',
];

const rp = require('request-promise-native');
const request = require('request');
const async = require('async');
//require('request-promise-native').debug = true;
const _ = require('underscore');
const argv = require('optimist').argv;

const eachOfLimit = require('async/eachOfLimit');

const max_parallel = 10;

const fs = require('fs');

const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);
const fs_readFile = util.promisify(fs.readFile);

const out_path = '/ps_data/live/';

const out_format = 'jsonl';

const statusFile = 'status.json';

const jsonltools = require('./jsonltools');

const startTime = new Date();

// below, set flag to 'a' for append or 'w' for write
const data_write_options = {
    'encoding': 'utf8',
    'flag': 'a'
};

var poll_status = {};


function get_json_filenames( name, ps_host, object ) {
    var ret = object;
    ret[ name ] = out_path + name + "_" + ps_host + "." + out_format;
    return ret;
}

const global_options = {
    headers: {
        'User-Agent': 'pScheduler-Crawler-Request-Promise'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response

};


console.log("pscheduler_hosts", pscheduler_hosts);

async.eachSeries( pscheduler_hosts, function( host, big_next ) {
    const ps_host = host;
    const ps_url = get_pscheduler_url( host );

    console.log("HOST", ps_host);
    console.log("URL", ps_url);

var task_count = 0;
var run_count = 0;
var result_count = 0;
var tasks = [];
var task_data = [];
var task_urls = [];
var runs = [];
var run_urls = [];
var result_url_data = [];
var result_urls = [];
var result_data = [];
var result_errors = [];

    var out_files = {};
    get_json_filenames( 'tasks', ps_host, out_files );
    get_json_filenames( 'task_urls', ps_host, out_files );
    get_json_filenames( 'run_urls', ps_host, out_files );
    get_json_filenames( 'runs', ps_host, out_files );
    get_json_filenames( 'results', ps_host, out_files );
    get_json_filenames( 'result_urls', ps_host, out_files );
    get_json_filenames( 'result_url_data', ps_host, out_files );
    
    console.log("out_files", out_files);



const options = {
    uri: ps_url,
    headers: {
        'User-Agent': 'pScheduler-Crawler-Request-Promise'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response
};

console.log("first options", options);

async function getStatus( collection ) {
    return new Promise ( function( resolve, reject ) {
        let filename = out_path + statusFile;
        fs_readFile(filename, 'utf8', function(err, data) {
            if (err) {
                console.log("Error reading file: " + filename + "; error: " + err);
                // failure to open status file is not an error, just means there is no status data and we need to read data without start/end restrictions
                return resolve();
            }
            console.log('completed loading STATUS', filename);
            poll_status = JSON.parse( data );
            console.log("!!!!STATUS", poll_status);
            resolve();
        });


    });
}

async function updateStatus( collection, ts ) {
    if ( !( "collection" in poll_status) ) poll_status[collection] = {};
    poll_status[collection].lastpoll = ts.toISOString();
    var json = JSON.stringify(poll_status);
    return new Promise ( function( resolve, reject ) {
        let filename = out_path + statusFile;
        fs_writeFile(filename, json, 'utf8', function(err) {
            if (err) {
                console.log("Error saving file: " + filename + "; error: " + err);
                reject( err );
                throw err;
            }
            console.log('completed saving STATUS', filename);
            console.log("!!!!STATUS", poll_status);
            resolve();
        });


    });
}

async function getData() {
    var startQueryTime = new Date();
    var collection = ps_host;

    console.log("Getting status ...");
    await getStatus(ps_host);

    console.log("Getting task URLs");

    var task_urls = await rp(options)
        .catch(err => function(err) {
            console.error("Error retrieving tasks; host unreachable: " + ps_host);
            console.error("Error: ", err);
            return big_next();
        });
    console.log("task urls", task_urls[0]);
    await save_json_file( out_files.task_urls, task_urls );
    /*
    try {
        var task_urls  = await rp(options);
        console.log("task urls", task_urls[0]);
        await save_json_file( out_files.task_urls, task_urls );
        let stat = await updateStatus( collection, startQueryTime );
        console.log("stat", stat);
    } catch( e ) {
        console.log("Error retrieving task urls");

    }
    */

    console.log("Getting tasks");
    await getResultsFromURLs( task_urls, tasks, out_files.tasks, ps_host, "tasks" );

    console.log("Generating run URLs");
    run_urls = await generateRunUrls( task_urls );
    console.log("run urls", run_urls[0]);
    await save_json_file( out_files.run_urls, run_urls );

    console.log("Getting runs");
    var urls = run_urls;
    //console.log("RUN URLS", urls);

    //console.log("Getting result URLs");
    var cb = async function( urls ) {

       await getResultsFromURLs( urls, result_data, out_files.runs, ps_host, "runs" )

    }
    await getResultUrls(run_urls, result_urls, cb, ps_host);


    await updateStatus( collection, startQueryTime );


    tasks = [];
    run_urls = [];
    result_data = [];
    result_urls = [];


    //console.log("Formatting result URLs", result_urls);
    //result_urls = await formatResultUrls(result_url_data);
    //await save_json_file( out_files.result_urls, result_urls );

    //console.log("Getting results");
    //await getResultsFromURLs( result_urls, result_data, out_files.results );
    //console.log("RESULT_DATA", result_data);


    big_next();

}
getData();
console.log("result error messages:", result_errors);


function generateRunUrls( task_urls ) {
    var ret = [];
    for(var k in task_urls ) {
        task_count++;
        var url = task_urls[ k ];
        var run_url = url + "/runs";
        ret.push( run_url );
    }
    return ret;

}

function getTimeLimitedUrl( hostname, url ) {
    var now = new Date().toISOString();

    //console.log("hostname, url, poll_status", hostname, url, poll_status);

    if ( ( hostname in poll_status ) && ( "lastpoll" in poll_status[hostname] ) ) {
        let pollStartTime = poll_status[hostname].lastpoll; //.toISOString();
        //console.log("pollStartTime", pollStartTime);
        url += encodeURI ( "?start=" + pollStartTime + "&end=" + now  );
    }

    //console.log("updated url: ", url);

    return url;

}
        
async function getResultsFromURLs( urls, result_arr, filename, hostname, datatype ) {
    return new Promise ( function( resolve, reject ) {
        if ( typeof urls == "undefined" ) {
            return resolve("URLs undefined");

        }
        console.log("GETTING RESULTS! " + datatype + " Count, url ex:", urls.length, urls[0]);
        var num_results = urls.length;
        console.log("Starting to retrieve " + num_results + " results");
        async.eachOfLimit( urls, max_parallel, 
            async function( baseurl , key ) {
                var url = getTimeLimitedUrl( hostname, baseurl);
                //console.log("getting results from url", url);
                var run_data = await getProcessedData( url );
                if ( datatype == "tasks" ) {
                    //console.log("run_data", run_data);
                        //run_data.crawler["pscheduler-host"] = hostname;
                }
                if ( !( "crawler" in run_data ) ) {
                    run_data.crawler = {};
                    run_data.crawler["pscheduler-host"] = ps_host;
                    run_data.crawler["pscheduler-url"] = ps_url;
                    if ( "href" in run_data ) {
                        run_data.crawler.href = run_data.href;
                    }
                    run_data.crawler.id = baseurl;
                    run_data.crawler["test-type"] = datatype;
                }
                result_arr.push( run_data );


                //cbGetResults(result_arr)
                //callback();
            }
            , async function( err ) {
                //console.log("result_arr", result_arr);
                if ( typeof result_arr == "undefined" ) {
                    console.log("DONE?? no results");
                } else {
                    console.log("DONE!? result_arr", result_arr.length);
                }
                //console.log("DONE!? result_data", result_data.length);
                //console.log("RESULT_DATA", result_arr);
                //if (err) return next(err);
                if (err) {
                    if ( err.statusCode == 404 ) {
                        console.log("Result not found (this is ok):", err.options.uri);

                    } else {
                        console.log("!!!RESULT ERR:", err.statusCode, err.message);
                        //return err;
                        reject( err.message );
                    }
                }
                console.log('Result data returned!');
                var endTime = new Date();
                var elapsedTime = (endTime - startTime) / 1000;
                var rate = num_results / elapsedTime;
                console.log("Retrieved " + num_results + " results in " + elapsedTime + "seconds ( " + rate + " results per second); parallel limit ", max_parallel);
                //await add_pscheduler_info( result_arr, ps_host, ps_url );
                console.log("saving result data ..", datatype);
                await save_json_file( filename, result_arr );
                console.log("saved");
                resolve();
                //return result_arr;
                //getrescb();
                //console.log('Result data', result_results);
                //
                //




            });
                resolve();
                //return callback();
    });
}

async function getResultUrls ( urls, result_arr, cb, hostname ) {
    //var urls = run_urls;
    console.log("now in getResultURLs!!!");
    return new Promise ( async function( resolve, reject ) {
        /*
           console.log("result_urls", result_urls);
           console.log("result_url_data", result_url_data);
           */
        await retrieveResultUrls( urls, result_arr, out_files.result_urls, cb, hostname );

    cb();

        resolve();
        //return callback();
    });

};
        

async function formatResultUrls( result_arr ) {
    return new Promise ( function( resolve, reject ) {
        console.log("result_arr", result_arr);
        for( var s in result_arr ) {
            var row = result_arr[s];
            if ( _.isEmpty( row ) ) {
                continue;
            }
            for( var t in row ) {
                var resurl = row[t];
                result_urls.push(resurl);

            }
        }

        //result_arr = result_urls;
        console.log('result_urls/arr', result_urls);

        //console.log("'tmparr'!!!", tmparr);
        console.log("'RESULT_URLS'!!!", result_urls);

        //await save_json_file( out_files.result_urls, result_urls );
        //    return result_urls;
        resolve();
        //return callback();
    });

}


async function retrieveResultUrls( urls, result_arr, filename, cb, hostname ) {
    return new Promise ( function( resolve, reject ) {
        console.log("Retrieving result urls ...");
        async.eachOfLimit(urls, max_parallel, async function( value, key ) {
            //var url = value;
            var url = getTimeLimitedUrl( hostname, value);
            //console.log("retrieving url ", url);
            var run_results = await getProcessedData( url );
            if ( ! _.isEmpty( run_results ) ) {
                //console.log("run_results", run_results);
                for(var q in run_results) {
                    result_arr.push( run_results[q] );
                }
            }
            //console.log("result_arr", result_arr);


        },
        async function( err ) {
            console.log("err", err);
            cb( result_urls );
            if (err) {
                console.log("result_url ERR:", err.message);
                reject(err);
            } else {
                console.log("result_url NO ERROR!!!");

            }



            resolve();
        });

    });

}


});
//});



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

function get_tasks( task_options, url ) {
    return new Promise (( resolve, reject) => {
        //console.log("GET url", url);        

        /*var res = { url: url, 
                 values: rp( task_options ) 
        };
        */

        //console.log("task_options", task_options);

        var res = rp( task_options );
        res.pwa_url = url;
        resolve(res);
        return res;
    });

}

async function getProcessedData(url) {
    return new Promise ( async function( resolve, reject ) {
        let v;
        try {
            //console.log("getProcessedData getting runs ..");
            //console.log("url", url);
            var task_options = _.extend( global_options,
                {
                    uri: url
                });
            //console.log("options", task_options);
            v = await rp( task_options )
        .catch((err) => {
            console.log("ERR RETRIEVING", url, err.statusCode, err.message);
            //console.log("ERR", err);
            // Assume 404s are just things that have hit the schedule horizon
            // and been dropped; other errors we consider an error
            if ( err.statusCode != 404 ) {
                result_errors.push( err.message );
                reject(err);
            }
        });

        } catch(e) {
            console.log("ERROR", e);
        }
        resolve(v);
        //console.log("v", v);
        //return v;
    });
}

function get_pscheduler_url( hostname ) {
    var ret = 'https://' + hostname + '/pscheduler/tasks';
    return ret;
}

function get_id_from_url( url ) {
    var id = url;
    var re = /\/([^\/]+)$/;
    var arr = re.exec( url );
    if ( arr !== null ) { 
        id = arr[1];
    }
    //console.log("id", id, "url", url);

    return id;


}

// adds pscheduler info to an existing object
async function add_pscheduler_info( objArray, host, url ) {
    return new Promise ( async function( resolve, reject ) {
        if ( ! _.isArray( objArray ) || objArray.length == 0 ) {
            console.log("Failed adding pscheduler metadata; not an array");
            return;
        }
        for(var i in objArray ) {
            var row = objArray[i];
            if ( typeof row == "undefined" ) return;
            if ( ! ( "crawler" in row ) ) {
                row.crawler = {};
            }
            row.crawler["pscheduler-host"] = host;
            row.crawler["pscheduler-url"] = url;
            if ( "href" in row ) {
                row.crawler.id = row.href;
            }

        }
        resolve();
    });

}
