#! /bin/bash

# before running this, you need to cat all of the CSV files into one,
# import it into a spreadsheet, sort and eliminate duplicates, then export to
# eqlog_ALL_UNIQUE.txt.csv

export IFS=, 
cat eqlog_ALL_UNIQUE.txt.csv | while read number name ; do
     echo "\"$number\": \"$name\","
done > eqlog_ALL_UNIQUE.txt.tsx
