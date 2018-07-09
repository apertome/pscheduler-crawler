const pscheduler_hosts = [
    'perfsonar-dev8.grnoc.iu.edu',
    'perfsonar-dev9.grnoc.iu.edu'
];

const rp = require('request-promise-native');
const request = require('request');
const async = require('async');
//require('request-promise-native').debug = true;
const _ = require('underscore');

const eachOfLimit = require('async/eachOfLimit');

const max_parallel = 10;

const fs = require('fs');

const util = require('util')
const fs_writeFile = util.promisify(fs.writeFile)

function get_json_filenames( name, ps_host, object ) {
    var ret = object;
    ret[ name ] = name + "_" + ps_host + ".json";
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



async function getData() {
    console.log("Getting task URLs");
    var task_urls  = await rp(options);
    console.log("task urls", task_urls[0]);
    await save_json_file( out_files.task_urls, task_urls );

    console.log("Getting tasks");
    await getResultsFromURLs( task_urls, tasks, out_files.tasks ); 

    console.log("Generating run URLs");
    run_urls = await generateRunUrls( task_urls );
    console.log("run urls", run_urls[0]);
    await save_json_file( out_files.run_urls, run_urls );

    console.log("Getting run results");
    var urls = run_urls;
    console.log("RUN URLS", urls);
    //await getResults(urls, result_url_data, out_files.result_url_data, "result_url_data")

    //console.log("Getting result URLs");
    await getResultUrls(run_urls, result_urls);

    console.log("Formatting result URLs", result_urls);
    //result_urls = await formatResultUrls(result_url_data);
    //await save_json_file( out_files.result_urls, result_urls );

    console.log("MAIN result_urls", result_urls);


    console.log("Getting results");
    urls = result_urls;
    var ret = await getResultsFromURLs( result_urls, result_data, out_files.results );

}
getData();


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
        
async function getResultsFromURLs( urls, result_arr, filename, datatype ) {
            console.log("GETTING RESULTS! " + datatype + " Count, url ex:", urls.length, urls[0]);
            //max_parallel = 1; // TODO: REMOVE
            var num_results = urls.length;
            console.log("Starting to retrieve " + num_results + " results");
            var startTime = new Date();
            async.eachOfLimit( urls, max_parallel, 
                    async function( value, key ) {
                        var url = value;
                        var run_data = await getProcessedData( url );
                        //console.log("run_data", run_data);
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
                            if ( err.StatusCode == 404 ) {
                                console.log("Result not found:", err.options.uri);

                            } else {
                                console.log("!!!RESULT ERR:", err);
                                //return err;
                            }
                        }
                        console.log('Result data returned!');
                        var endTime = new Date();
                        var elapsedTime = (endTime - startTime) / 1000;
                        var rate = num_results / elapsedTime;
                        console.log("Retrieved " + num_results + " results in " + elapsedTime + "seconds ( " + rate + " results per second); parallel limit ", max_parallel);
                        await add_pscheduler_info( result_arr, ps_host, ps_url );
                        console.log("saving result data ..", datatype);
                        await save_json_file( filename, result_arr );
                        console.log("saved");
                        //return result_arr;
                        //getrescb();
                        //console.log('Result data', result_results);
                        //
                        //




                    });
            return new Promise ( function( resolve, reject ) {
                resolve();
                //return callback();
            });
        };

        async function getResultUrls ( urls, result_arr ) {
            //var urls = run_urls;
            console.log("now in getResultURLs!!!", urls);
            console.log("result_urls", result_urls);
            console.log("result_url_data", result_url_data);
            /*
            return new Promise ( function( resolve, reject ) {
                callback();
                resolve();
            });
            */
            await retrieveResultUrls( urls, result_arr, out_files.result_urls );

            return new Promise ( function( resolve, reject ) {
                resolve();
                //return callback();
            });

        };
        

    async function formatResultUrls( result_arr ) {
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
            return new Promise ( function( resolve, reject ) {
                resolve();
                //return callback();
            });

    }


        async function retrieveResultUrls( urls, result_arr, filename ) {
            console.log("Retrieving result urls ...", urls);
            async.eachOfLimit(urls, max_parallel, async function( value, key ) {
                var url = value;
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
                result_urls = result_arr;
                await save_json_file( out_files.result_urls, result_urls );
                console.log("RESULT_URRLS ARY", result_urls);
                //result_urls = result_arr;
                if (err) {
                    console.log("result_url ERR:", err);
                    //return err;
                    //return next(err);
                } else {
                    console.log("result_url NO ERROR!!!");

                }


                //urlcb();
                   return new Promise( async function( resolve, reject ) {

                   resolve();
                //urlcb();
                //return result_urls;
                });

            });

        }
        
        async function getResults( result_urls, result_arr, filename, datatype ) {
            console.log('now in getResults!!!');
            var urls = result_urls; 
            console.log(datatype, "result urls!!!", urls);
            var output = await getResultsFromURLs( urls, result_arr, filename, datatype );
            //callback();
            return new Promise ( function( resolve, reject ) {
                resolve();
            });
        };
});



function save_json_file( filename, data ) {
    var json = JSON.stringify(data);
    fs_writeFile(filename, json, 'utf8', function(err) {
        if (err) {
            console.log("Error saving file: " + filename + "; error: " + err);
            throw err;
        }
        console.log('completed saving', filename);
        return new Promise( function( resolve, reject ) {
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
    let v;
    try {
        //console.log("getProcessedData getting runs ..");
        //console.log("url", url);
        var task_options = _.extend( global_options,
            {
                    uri: url
                });
        //console.log("options", task_options);
        v = rp( task_options )
            .catch((err) => {
                console.log("ERR RETRIEVING", err.StatusCodeError);
                
            });

        /*
        request( task_options, function( error, response, body) {
            console.log("error", error);
            //console.log("response", response);
            //console.log("body", body);
            v = body;

        });
*/

        //console.log("results", results);

        var cb = function(item) {
         //   console.log("cb item", item);

        }
/*
        async.eachSeries(results, function(result, next) {
            console.log("ASYNC result", result);
            getProcessedData


        }, cb);
        */
        //v = "success";

    } catch(e) {
        console.log("ERROR", e);
        //v = await downloadFallbackData(url);
    }
    //console.log("v", v);
    return v;
}

function get_pscheduler_url( hostname ) {
    var ret = 'https://' + hostname + '/pscheduler/tasks';
    return ret;
}

// adds pscheduler info to an existing object
function add_pscheduler_info( objArray, host, url ) {
    if ( ! _.isArray( objArray ) || objArray.length == 0 ) {
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

    }

}
