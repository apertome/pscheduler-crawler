#!/bin/bash

curl -XDELETE http://localhost:9200/tasks

curl -XDELETE http://localhost:9200/results
