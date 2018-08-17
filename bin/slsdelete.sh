#!/bin/bash

curl -XPOST -H 'Content-Type: application/json' 'http://localhost:9200/sls-stats-2018.08.16,sls-stats-2018.08.17/_delete_by_query' -d '
{
    "query" : { 
        "match_all" : {}
    }
}'

echo "\n"



exit



curl -XDELETE 'http://localhost:9200/sls-stats-*'
