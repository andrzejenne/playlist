#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
filename="$DIR/dummy.log"

while read -r line
do
    echo "$line"
    sleep .1
done < "$filename"
