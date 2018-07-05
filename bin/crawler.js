const pscheduler_hosts = [
    'https://perfsonar-dev9.grnoc.iu.edu/pscheduler/tasks'
];

function get_pscheduler_url( hostname ) {
    var ret = 'https://' + hostname + '/pscheduler/tasks';
    return ret;
}

const rp = require('request-promise-native');
const request = require('request');
const async = require('async');
//require('request-promise-native').debug = true;
const _ = require('underscore');

const eachOfLimit = require('async/eachOfLimit');
//import eachOf from 'async/eachOf';

//const max_parallel = 10;
var max_parallel = 20;

const fs = require('fs');

const out_files = {
    'task': 'task_data.json',
    'task_urls': 'task_urls.json',
    'run_urls': 'run_urls.json',
    'run': 'run_data.json',
    'result': 'result_data.json',
};


var task_count = 0;
var run_count = 0;
var result_count = 0;
var tasks = [];
var task_urls = [];
var runs = [];
var run_data = [];
var run_urls = [];
var result_url_data = [];
var result_urls = [];
var result_data = [];
var result_errors = [];

const global_options = {
    headers: {
        'User-Agent': 'pScheduler-Crawler-Request-Promise'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response

};

const options = {
    uri: pscheduler_hosts[0],
    headers: {
        'User-Agent': 'pScheduler-Crawler-Request-Promise'
    },
    strictSSL: false,
    simple: true, //  boolean to set whether status codes other than 2xx should also reject the promise
    json: true // Automatically parses the JSON string in the response
};

function save_json_file( filename, data ) {
    var json = JSON.stringify(data);
    fs.writeFile(filename, json, 'utf8', function(err) {
        if (err) throw err;
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
        v = rp( task_options );

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

rp(options)
    .then(function ( jsonData ) {
        //var tasks = [];
            //tasks.push( [url].map( ({ URL }) => get_tasks( task_options, url ) ) ) ;
            //tasks.push( [ url ].map( get_tasks( task_options, url ) ) );
        //console.log("tasks after pushing", tasks);
        return jsonData;
    })
    .then(function( jsonData ) {
        //console.log("TASKS", tasks);
        console.log("requesting task listing ...");
        //console.log("jsonData", jsonData);
                save_json_file( out_files.task_urls, jsonData );

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
       return Promise.all( tasks )
            .then((results) => {
                console.log("TASKS", results);
                save_json_file( out_files.task, results );
                return results;
            }).catch(err => console.log(err));  // First rejected promise
    })
    .then(function( jsonData ) {
        console.log("generating run listing urls ...");
        //console.log("jsonData", jsonData);
           // var results = jsonData;
                for(var k in task_urls ) {
                    task_count++;
                    var url = task_urls[ k ];
                    //console.log("task URL to generate run url", url);
                    //console.log("TASK RESULT", task_result ); // Result of all resolve as an array
                    //console.log("TASK results", JSON.stringify( task_results, null, '  ' ) ); // Result of all resolve as an array
                    //console.log("TASK results length", task_results.length); // Result of all resolve as an array
                    var run_url = url + "/runs";
                    var run_options = _.extend( global_options,
                        {
                            uri: run_url
                        });
                    //console.log("run_options", run_options);
                    console.log("run_url", run_url);
                    run_urls.push( run_url );
                    //runs.push( get_tasks( run_options, run_url ) );

                }

                return run_urls;



/*

        */
                /*
                return Promise.all( runs )
                    .then((run_results) => {
                            console.log("run_results count", run_results.length); // This is an array of arrays (one per task)
                            for(var p in run_results) {
                                var res = run_results[p];
                                for(var q in res) {
                                    var url = res[q];
                                    result_urls.push( url );
                                    

                                }

                            }
                            console.log("run_results runs", run_results.length);
                            console.log("run_results count urls", result_urls.length);
                            return result_urls;

                        }).catch(err => console.log(err));
                        */
                console.log("task_count", task_count);
                console.log("run_count", run_count);
                

    })
    .then(function( jsonData ) {
        console.log("retrieving run URLS ... trying async ...");

/*
        var result_urls = jsonData;
        for (var i in run_urls ) {
            var url = run_urls[i];
            var res = getProcessedData( url );
            result_urls = _.union( result_urls, res ) ;
            console.log("result_urls async", result_urls);
            if ( i > 10 ) {
                break;

            }
        }
        */

        var cbGetResultUrls = async function( value, key, callback ) {
            var url = value;
            var run_results = getProcessedData( url );
            //console.log("run_results", run_results);
            result_url_data.push( run_results );
            //return callback();
            //callback();

        };

        var cbGetResults = async function( value, key, callback ) {
            //console.log("RESULT key, value ", key, value);
            //console.log("run_ruls", run_urls);
            var url = value;
            console.log("retrieving RESULT url", url);
            try {
            var run_data = await getProcessedData( url );
            result_data.push( run_data );
            } catch( err ) {
                console.log("cbGetResults ERR: ", err);

            }
            //return callback(null, run_data);

        };

        var getResults = function( callback ) {
            //console.log("GETTING RESULTS!", result_urls);
            //max_parallel = 1; // TODO: REMOVE
            var num_results = result_urls.length;
            console.log("Starting to retrieve " + num_results + " results");
            var startTime = new Date();
            async.eachOfLimit( result_urls, max_parallel, cbGetResults, function( err ) {
                //console.log("getResults", result_data);
                        console.log("DONE!? result_data", result_data.length);
                        //console.log("RESULT_DATA", result_data);
                        //if (err) return next(err);
                        if (err) {
                            if ( err.StatusCode == 404 ) {
                                console.log("Result not found:", err.options.uri);

                            } else {
                                console.log("result ERR:", err);
                                return err;
                            }
                            //return next(err);
                        }
                        //return Promise.all( result_data )
                        //return ( result_data )
               // .then((result_results) => {
                    console.log('Result data returned!');
                    var endTime = new Date();
                    var elapsedTime = (endTime - startTime) / 1000;
                    var rate = num_results / elapsedTime;
                    console.log("Retrieved " + num_results + " results in " + elapsedTime + "seconds ( " + rate + " results per second); parallel limit ", max_parallel);
                    save_json_file( out_files.result, result_data );
                    //console.log('Result data', result_results);
                    return callback();

           //}).catch(err => console.log(err));

        });
        }

        var getResultUrls = function( callback ) {
            console.log("RUN URLS", run_urls);
            console.log('callback', callback);
            async.eachOfLimit(run_urls, max_parallel, cbGetResultUrls, 
                    function( err ) {
                        console.log("err", err);
                        if (err) {
                            console.log("result_url ERR:", err);
                            return err;
                            //return next(err);
                        }
                        //callback();
                        //return ( result_url_data )
                        return Promise.all( result_url_data )
                .then((result_results) => {
                    var result_url_data = result_results;
                    //console.log('result_results', result_results);

                    for( var s in result_url_data ) {
                        var row = result_url_data[s];
                        if ( _.isEmpty( row ) ) {
                            continue;
                        }
                        for( var t in row ) {
                            var resurl = row[t];
                            result_urls.push(resurl);

                        }
                    }
                    //console.log("'tmparr'!!!", tmparr);
                    console.log("'RESULT_URLS'!!!", result_urls);
                    save_json_file( out_files.run_urls, result_urls );

                    return callback();
                    //console.log("RESULT RESULTS", result_results);
                    /*
                       for(var r in result_results) {
                       var row = result_results[r];
                       if ( _.isEmpty( row ) ) {
                       continue;
                       } else {
                       console.log("row is NOT empty", row);
                       result_urls.push( row );
                       console.log('result_urls', result_urls);
                       }


                       }
                       */
                    //run_results = result_results;

                    return result_urls;

                }).catch(err => console.log(err));



            });
        }

        var gencb = function( err, results ) {
                console.log('It came back with this ' + results);
                console.log("err", err);

        }
        async.series([ getResultUrls, getResults], function( url, outcb) {
            //getResultUrls( gencb );
            //getResults( gencb );
            //outcb();
            
        }); 
        //async.eachSeries([ "getResultUrls", "getResults" ], gencb); 


    })
/*
    .then(function( jsonData ) {
        //var run_results = jsonData;
        console.log("result_urls jsonData", jsonData);
        console.log("result_urls", result_urls);
    })
    */
    .catch(function (err) {
        // Crawling failed...
        console.log("Crawling failed; err ", err );
    });


function get_runs ( ) {

}
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
