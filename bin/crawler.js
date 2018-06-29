const pscheduler_hosts = [
    'https://perfsonar-dev9.grnoc.iu.edu/pscheduler/tasks'
];

const rp = require('request-promise-native');
const request = require('request');
//require('request-promise-native').debug = true;
const _ = require('underscore');

const async = require('async');

var task_count = 0;
var run_count = 0;
var result_count = 0;
var tasks = [];
var task_urls = [];
var runs = [];
var run_data = [];
var run_urls = [];
var result_urls = [];
var result_data = [];

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
        console.log("jsonData", jsonData);
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
                console.log("task results", results);
                return results;
                //var url = results.url;
                //var runs = [];
                /*
                var runs = [];
                for(var m in task_results ) {
                    var run_row = task_results[m];
                    console.log("run_row", run_row);
                    runs.push( get_tasks( run_options, url ) );

                }
*/
                    

                /*
                var tasks = [];
                for( var j in task_results ) {
                    var task = task_results[j];
                    tasks.push( task );

                }
                */
            }).catch(err => console.log(err));  // First rejected promise
    })
    .then(function( jsonData ) {
        console.log("retrieving run urls ...");
        //console.log("jsonData", jsonData);
           // var results = jsonData;
                for(var k in task_urls ) {
                    task_count++;
                    var url = task_urls[ k ];
                    console.log("task URL to generate run url", url);
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
                    runs.push( get_tasks( run_options, run_url ) );
                }

                return Promise.all( runs )
                    .then((run_results) => {
                            console.log("run_results", run_results); // This is an array of arrays (one per task)
                            for(var p in run_results) {
                                var res = run_results[p];
                                for(var q in res) {
                                    var url = res[q];
                                    result_urls.push( url );
                                    

                                }

                            }
                            console.log("run_results runs", run_results.length);
                            console.log("run_results urls", result_urls);
                            console.log("run_results count urls", result_urls.length);
                            //return run_results;
                            return result_urls;

                        }).catch(err => console.log(err));
                console.log("task_count", task_count);
                console.log("run_count", run_count);

    })
    .then(function( jsonData ) {
        var result_urls = jsonData;
        console.log("result_urls results", result_urls);
                        for(var n in result_urls ) {
                            var run = result_urls[ n ];
                            var result_url = run;
                            //console.log("result URL", result_url);
                    var result_options = _.extend( global_options,
                        {
                            uri: result_url
                        });
                            //console.log("result_options", result_options);
                            //console.log("result", result.values);
                            //console.log("result values", result.values);
                            //console.log("result count", result.values.length);
                            result_count++;
                            result_data.push( get_tasks( result_options, result_url ) ) ;
                        }
                return Promise.all( result_data )
                    .then((run_results) => {
                            console.log("run_data_results", run_results);
                            return run_results;
                            console.log("run_data_ count runs", run_count);

                        }).catch(err => console.log(err));

    })
   /* 
    .then(function( jsonData ) {
        var run_results = jsonData;
        console.log("run results", run_results);
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
