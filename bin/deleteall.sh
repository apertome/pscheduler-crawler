#!/bin/bash

curl -XPOST -H 'Content-Type: application/json' 'http://localhost:9200/tasks/_delete_by_query' -d '{
    "query" : { 
        "match_all" : {}
    }
}'

echo "\n"

curl -XPOST -H 'Content-Type: application/json' 'http://localhost:9200/results/_delete_by_query' -d '{
    "query" : { 
        "match_all" : {}
    }
}'



exit


curl -XDELETE http://localhost:9200/tasks

curl -XDELETE http://localhost:9200/results

curl -XDELETE 'http://localhost:9200/pscheduler-results-*'
