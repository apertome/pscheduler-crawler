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


rp(options)
    .then(function ( jsonData ) {
        //var tasks = [];
            //tasks.push( [url].map( ({ URL }) => get_tasks( task_options, url ) ) ) ;
            //tasks.push( [ url ].map( get_tasks( task_options, url ) ) );
        //console.log("tasks after pushing", tasks);
        return jsonData;
    })
    .catch(function( err  ) {
        console.log("error retrieve task listing", err);
                // Handle the error here
                //     });
    })
    .then(function( jsonData ) {
        save_json_file( out_files.task_urls, jsonData );
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
       return Promise.all( tasks )
            .then((results) => {
                console.log("TASKS", results);
                task_data = results;
                add_pscheduler_info( results, ps_host, ps_url );
                save_json_file( out_files.tasks, results );
                return results;
            }).catch(err => console.log(err));  // First rejected promise
    })

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

           });


                console.log("task_count", task_count);
                console.log("run_count", run_count);
                

    })
    .catch( function(err ) {
        console.log("Error generating run urls", err);

    })
    .then(function( jsonData ) {
        console.log("retrieving run URLS ... trying async ...");


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
            //console.log("retrieving RESULT url", url);
            try {
            var run_data = await getProcessedData( url );
            result_data.push( run_data );
            } catch( err ) {
                console.log("cbGetResults ERR: ", err.StatusCodeError);

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
                console.log('Result data returned!');
                var endTime = new Date();
                var elapsedTime = (endTime - startTime) / 1000;
                var rate = num_results / elapsedTime;
                console.log("Retrieved " + num_results + " results in " + elapsedTime + "seconds ( " + rate + " results per second); parallel limit ", max_parallel);
                console.log("saving result data ..");
                add_pscheduler_info( result_data, ps_host, ps_url );
                save_json_file( out_files.results, result_data );
                console.log("saved");
                //console.log('Result data', result_results);
                return callback();


            });
        };

        var getResultUrls = function( callback ) {
            console.log("RUN URLS", run_urls);
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
                    save_json_file( out_files.result_urls, result_urls );

                    return callback();
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
            
        }, function (callback) {
                console.log('All Result URLS and Results Done');
                callback();
    
        }); 
        //async.eachSeries([ "getResultUrls", "getResults" ], gencb); 


    })
    .catch(function (err) {
        // Crawling failed...
        console.log("Crawling failed; err ", err );
    })
    .then(function( data ) {
        big_next();

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
                console.log("ERR RETRIEVING", err);
                
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
    for(var i in objArray ) {
        var row = objArray[i];
        if ( ! ( "crawler" in row ) ) {
            row.crawler = {};
        }
        row.crawler["pscheduler-host"] = host;
        row.crawler["pscheduler-url"] = url;

    }

}
