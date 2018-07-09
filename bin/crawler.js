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
var run_data = [];
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


// get task listing
rp(options)
    .then(function ( taskResponse ) {
        //var tasks = [];
            //tasks.push( [url].map( ({ URL }) => get_tasks( task_options, url ) ) ) ;
            //tasks.push( [ url ].map( get_tasks( task_options, url ) ) );A
        task_urls = taskResponse;
        //console.log("task_urls", taskResponse);
        save_json_file( out_files.task_urls, task_urls );
        //console.log("tasks after pushing", tasks);
        return new Promise( function( resolve, reject ) {
            resolve();
            return taskResponse;            
        });
    })
    .catch(function( err  ) {
        console.log("error retrieve task listing", err);
                // Handle the error here
                //     });
    })
/*
    .then(function( jsonData ) {
       return new Promise(( resolve, reject ) => { 
        //console.log("TASKS", tasks);
        console.log("requesting task listing ...");
        //console.log("jsonData", jsonData);


        console.log("number of tasks", jsonData.length);
        //console.log("tasks values", tasks.values);
        for( var i in jsonData ) {
            const url = jsonData[i];
            task_urls.push( url );
            var task_options = _.extend( global_options, 
                {
                    uri: url
                });
            tasks.push( get_tasks( task_options, url ) ) ;
        }
        resolve();

        return jsonData;
       });
       */

        /*
       return Promise.all( tasks )
            .then((results) => {
                console.log("TASKS", results);
                task_data = results;
                add_pscheduler_info( results, ps_host, ps_url );
                save_json_file( out_files.tasks, results );
                return results;
            }).catch(err => console.log(err));  // First rejected promise
    })
            */

/*
    .then(function( data ) {
        console.log("task_data", task_data);
        console.log("out_files.tasks", out_files.tasks);
        save_json_file( out_files.tasks, task_data );
    })
  */  
    .then(function( jsonData ) {
        console.log("generating run listing urls ...");
        //console.log("jsonData", jsonData);
           // var results = jsonData;
           return new Promise(function(resolve, reject) {
                for(var k in task_urls ) {
                    task_count++;
                    var url = task_urls[ k ];
                    var run_url = url + "/runs";
                    var run_options = _.extend( global_options,
                        {
                            uri: run_url
                        });
                    run_urls.push( run_url );
                }
                resolve();
                console.log("task_count", task_count);
                console.log("run_count", run_count);

           });

    })
    .catch( function(err ) {
        console.log("Error generating run urls", err);

    })
    .then(function( ) {
        console.log("retrieving run URLS ... trying async ...");


        var cbGetResultUrls = function( results_arr ) {
            return async function( value, key, callback ) {
                var url = value;
                var run_results = await getProcessedData( url );
                //console.log("run_results", run_results);
                results_arr.push( run_results );
                //result_url_data.push( run_results );
                //return callback();
                //callback();
            }

        };

        var cbGetResults = function( results_arr ) {
            return async function( value, key, callback ) {

            //console.log("RESULT key, value ", key, value);
            //console.log("run_ruls", run_urls);
            var url = value;
            //console.log("retrieving RESULT url", url);
            //try {
                var run_data = await getProcessedData( url );
                results_arr.push( run_data );
                /*
                if ( datatype == "tasks" ) {
                    tasks.push( run_data );

                } else if ( datatype == "results" ) {
                result_data.push( run_data );
                }
                */
            //} catch( err ) {
                //console.log("cbGetResults ERR: ", err.StatusCodeError);

            //}
            //return callback(null, run_data);
            //return run_data;
            }

        };

        var getTasks = function( callback ) {
            var urls = task_urls;
            console.log("now in getTasks!!!", urls[0]);
            console.log("task_urls", task_urls);
            getResultsFromURLs( urls, tasks, out_files.tasks, "tasks", callback );
            return new Promise ( function( resolve, reject ) {
                resolve();
                //return callback();
            });

        };

        var getResultUrls = function( callback ) {
            var urls = run_urls;
            console.log("now in getResultURLs!!!", urls[0]);
            retrieveResultUrls( urls, result_url_data, out_files.result_urls, "result_urls", callback );
            console.log("result_urls", result_urls);
            console.log("result_url_data", result_url_data);
            return new Promise ( function( resolve, reject ) {
                resolve();
                //return callback();
            });

        };

        var getResults = function( callback ) {
            console.log('now in getResults!!!');
            var urls = result_urls;
            console.log("result urls!!!", urls);
            getResultsFromURLs( urls, result_data, out_files.results, "results", callback );
            return new Promise ( function( resolve, reject ) {
                resolve();
                //return callback();
            });
        };


        var getResultsFromURLs = async function( urls, result_arr, filename, datatype, cb ) {
            console.log("GETTING RESULTS! Count, url ex:", urls.length, urls[0]);
            //max_parallel = 1; // TODO: REMOVE
            var num_results = urls.length;
            console.log("Starting to retrieve " + num_results + " results");
            var startTime = new Date();
            async.eachOfLimit( urls, max_parallel, cbGetResults(result_arr), function( err ) {
                console.log("DONE!? result_arr", result_arr.length);
                //console.log("DONE!? result_data", result_data.length);
                //console.log("RESULT_DATA", result_arr);
                //if (err) return next(err);
                if (err) {
                    if ( err.StatusCode == 404 ) {
                        console.log("Result not found:", err.options.uri);

                    } else {
                        console.log("!!!RESULT ERR:", err);
                        return err;
                    }
                }
                console.log('Result data returned!');
                var endTime = new Date();
                var elapsedTime = (endTime - startTime) / 1000;
                var rate = num_results / elapsedTime;
                console.log("Retrieved " + num_results + " results in " + elapsedTime + "seconds ( " + rate + " results per second); parallel limit ", max_parallel);
                console.log("saving result data ..");
                add_pscheduler_info( result_arr, ps_host, ps_url );
                save_json_file( filename, result_arr );
                console.log("saved");
                cb();
                //console.log('Result data', result_results);
        
                return new Promise( function( resolve, reject ) {
                    resolve();
                });


            });
        };

        var retrieveResultUrls = function( urls, result_arr, filename) {
            console.log("Retrieving runs; run urls:", run_urls);
            async.eachOfLimit(urls, max_parallel, cbGetResultUrls(result_arr), 
                    function( err ) {
                        console.log("err", err);
                        if (err) {
                            console.log("result_url ERR:", err);
                            return err;
                            //return next(err);
                        } else {
                            console.log("result_url NO ERROR!!!");

                        }


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

                            result_arr = result_urls;

                            //console.log("'tmparr'!!!", tmparr);
                            console.log("'RESULT_URLS'!!!", result_urls);

                        return new Promise( function( resolve, reject ) {
                            save_json_file( filename, result_urls );

                            resolve();
                            return result_urls;
                        });

            });
        }

        var gencb = function( err, results ) {
                console.log('It came back with this ' + results);
                console.log("err", err);

        }
        async.series([ getTasks, getResultUrls, getResults], function( url, outcb) {
        //async.series([ getTasks, getResultUrls ], function( url, outcb) {
            //outcb();
            
        }, function (asdfcb) {
                console.log('All Result URLS and Results Done');
                asdfcb();
    
        }); 
        //async.eachSeries([ "getResultUrls", "getResults" ], gencb); 


    })
    .catch(function (err) {
        // Crawling failed...
        console.log("Crawling failed; err ", err );
    })
    .then(function( data ) {
        //big_next();

    });


}, function( err ) {
    console.log("END error", err);

});
/*
function pass_options_to_promises( promises, options ) {
    Promise.all( promises.map(callback => callback(val) )
            .then(values => { 
                // executed when all promises resolved, 
                // values is the array of values resolved by the promises
            })
            .catch(err => {  
                // catch if single promise fails to resolve
            });
            }

*/

function save_json_file( filename, data ) {
    var json = JSON.stringify(data);
    fs_writeFile(filename, json, 'utf8', function(err) {
        if (err) {
            console.log("Error saving file: " + filename + "; error: " + err);
            throw err;
        }
        console.log('completed saving', filename);
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

function get_data( url ) {
    return new Promise (( resolve, reject) => {
        //console.log("GET url", url);        

        /*var res = { url: url, 
                 values: rp( task_options ) 
        };
        */

        //console.log("task_options", task_options);

        var task_options = _.extend( global_options, 
            {
                    
                uri: url
                });

        var res = rp( task_options );
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
