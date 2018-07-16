#!/bin/bash

curl -XPUT -H 'Content-Type: application/json' localhost:9200/tasks/_settings -d '{
  "index.mapping.total_fields.limit": 2000
}
'

curl -XPUT -H 'Content-Type: application/json' localhost:9200/results/_settings -d '{
  "index.mapping.total_fields.limit": 2000
}
'


cat tasks_perfsonar-dev8.grnoc.iu.edu.json | jq -c '.[] | {"index": {"_index": "tasks", "_type": "task", "_id": .crawler.id}}, .' | curl -H "Content-Type: application/x-ndjson" -XPOST localhost:9200/_bulk --data-binary @-

cat results_perfsonar-dev8.grnoc.iu.edu.json | jq -c '.[] | {"index": {"_index": "results", "_type": "result", "_id": .crawler.id}}, .' | curl -H "Content-Type: application/x-ndjson" -XPOST localhost:9200/_bulk --data-binary @-

cat tasks_perfsonar-dev.grnoc.iu.edu.json | jq -c '.[] | {"index": {"_index": "tasks", "_type": "task", "_id": .crawler.id}}, .' | curl -H "Content-Type: application/x-ndjson" -XPOST localhost:9200/_bulk --data-binary @-

cat results_perfsonar-dev.grnoc.iu.edu.json | jq -c '.[] | {"index": {"_index": "results", "_type": "result", "_id": .crawler.id}}, .' | curl -H "Content-Type: application/x-ndjson" -XPOST localhost:9200/_bulk --data-binary @-
