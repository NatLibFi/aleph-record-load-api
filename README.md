# HTTP API to load records in to Aleph

## Usage
### Example request
```
$ curl -L -XPOST \
-u "$API_KEY:" \
-H 'Content-Type: text/plain' \
--data-binary @records.seq \
"https://foo.bar/aleph-load-record-api/?library=FOO&method=NEW&fixRoutine=BAR&cataloger=$CATALOGER"
["000000001FOO", "000000001FOO"]
```
### Environment variables
|Name|Mandatory|Description|
| --- | --- | --- |
|ALEPH_VERSION|Yes|Version of the Aleph instance, i.e. *23_3*|
|LOAD_COMMAND|Yes|Path of the record load command, i.e. */exlibris/aleph/a23_3/proc/p_manage_18*|
|API_KEYS|Yes|A comma-separated list of API keys which are authorized to use the API|
### Query parameters
|Name|Mandatory|Default value|Description|
| --- | --- | --- | --- |
|library|Yes||Library to use|
|method|Yes||Method of operation. Either *NEW* or *OLD*|
|cataloger|Yes||Value which is written to *CAT* fields|
|fixRoutine|No||Fix routine to use|
|indexing|No|FULL|Indexing action|
|updateAction|No|APP|Update action|
|mode|No|M|User mode. Either *M* (Multi-user) or *S* (Single-user)|
|charConversion|No||Character conversion to apply|
|mergeRoutine|No||Merge/Preferred routine|
|catalogerLevel|No||Cataloger lever|
|indexingPriority|No||Override indexing priority|
### Example Apache configuration block
```
<Directory "/exlibris/aleph/u23_3/alephe/apache/htdocs/aleph-load-record-api">
  Options ExecCGI FollowSymLinks  
  AddHandler cgi-script .cgi
  DirectoryIndex index.cgi
  AddDefaultCharset UTF-8  
  
  RewriteEngine on
  RewriteCond %{HTTP:Authorization} ^(.*)   
  RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

  SetEnv ALEPH_VERSION 23_3
  SetEnv LOAD_COMMAND /exlibris/aleph/a23_3/aleph/proc/p_manage_18
  SetEnv API_KEYS <API_KEYS>
</Directory>
```
### Using a different Python parser (index.cgi)
```
#!/bin/bash
export LD_LIBRARY_PATH=''
/opt/python/bin/python2.7 index.py
```
## License and copyright

Copyright (c) 2018 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **Apache License 2.0**.
