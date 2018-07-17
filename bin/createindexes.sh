#!/bin/bash

curl -XPUT -H 'Content-Type: application/json' localhost:9200/tasks -d '{
 "settings": {
    "index.mapping.total_fields.limit": 2000,
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
'

curl -XPUT -H 'Content-Type: application/json' localhost:9200/results -d '{
 "settings": {
    "index.mapping.total_fields.limit": 2000,
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
'

