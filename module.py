#!/opt/csw/bin/python2.7
# -*- coding: utf8 -*-
'''
Copyright 2018 University Of Helsinki (The National Library Of Finland)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
'''

##!/bin/csh
#source /exlibris/aleph/a23_3/alephm/.cshrc
#
#setenv LIB FIN01
#setenv CAT_USER artturi
#setenv INPUT_FILE arlehiko_test2.seq
#setenv REJ_FILE arlehiko_test2.rej
#setenv LOG_FILE arlehiko_test2.log
#
#csh -f /exlibris/aleph/a23_3/aleph/proc/p_manage_18 $LIB,$INPUT_FILE,$REJ_FILE,$LOG_FILE,NEW,FOO,,FULL,REP,M,,,$CAT_USER,, >log.txt
#csh -f /exlibris/aleph/a23_3/aleph/proc/p_manage_18 $LIB,$INPUT_FILE,$REJ_FILE,$LOG_FILE,OLD,,,FULL,REP,M,,,$CAT_USER,, >log.txt

#<Directory "/exlibris/aleph/u23_3/alephe/apache/htdocs/aleph-change-password-api/cgi-bin">
#  Options ExecCGI
#  AddHandler cgi-script .cgi
#  DirectoryIndex index.cgi
#  AddDefaultCharset UTF-8
#  Order allow,deny
#  Allow from 128.214
#</Directory>

import os
import subprocess
import re
from uuid import uuid4
from base64 import b64decode

main()

def authenticate(): 
  encoded = re.sub('^Basic ', '', os.getenv('HTTP_AUTHORIZATION'))
  api_key = re.split(':', b64decode(encoded), 1)
  print api_key
#my @api_keys = split(/,/, $ENV{API_KEYS});
#my $auth = $cgi->http('HTTP_AUTHORIZATION');
#$auth =~ s/^Basic //;
#my $api_key = decode_base64($auth);
#$api_key =~ s/:.*$//;
#if (!grep { $api_key eq $_ } @api_keys) {
#  error('Unauthorized');
#}

def main():
  API_KEYS = re.split(',', os.getenv('API_KEYS'))

  authenticate()

'''

import cgi
import sys
import json
import os
import urllib2
import xml.etree.ElementTree as ElementTree
import cx_Oracle
from uuid import uuid4
import subprocess
import datetime
import re
from base64 import b64decode


if os.environ['REQUEST_METHOD'] != 'POST':
  return_error(404, 'Not Found')
try:
  data = json.loads(sys.stdin.read())
  username = data['username'].encode('utf-8')
  password = data['password'].encode('utf-8')
  new_password = data['new_password'].encode('utf-8')
  if username == '' or password == '' or new_password == '':
    raise
except:
  return_error(400, 'Bad Request')
(password_valid, error_message) = validate_password(new_password)
if not password_valid:
  return_error(400, 'Bad Request: %s' % error_message)
try:
  user_valid = validate_user(username, password)
except:
  return_error(500, 'Internal Server Error')
  if not user_valid:
    return_error(401, 'Unauthorized')

  db_user = fetch_user_from_db(username)

  formatted_row_clean = format_row(db_user)

  db_user[2]['value'] = new_password

  formatted_row = format_row(db_user)

  file_id = write_input_file(formatted_row)

  output, error = execute_program(file_id)

  os.remove('%s%s%s' % (FILES_DIR, FILE_PREFIX, file_id))

  write_log_file(username, formatted_row_clean, output, error)

  failure = False

  for pattern in ['Param Errors Found:', 'Param Initialization Failure, Exiting !!!']:
    if (re.search(pattern, output, flags=re.MULTILINE)):
      failure = True
      break

  if failure:
    return_error(500, 'Internal Server Error')

  start_http('text/plain', {'Status': 200})

  print "ok"

def start_http(mimetype=None, headers={}):
  if mimetype:
    print 'Content-Type: %s' % mimetype
  for name, value in headers.items():
    print '%s: %s' % (name, value)
  print 'Cache-Control: no-cache, no-store, max-age=0'
  print  # end of headers

def return_error(code, message):
    start_http('text/plain', {'Status': code})
    print code, message
    sys.exit()

def validate_password(password):
  if (len(password) < MIN_LENGTH):
    return (False, 'Password must be atleast %s characters long' % MIN_LENGTH)

  if (len(password) > MAX_LENGTH):
    return (False, 'Password can not be longer than %s characters' % MAX_LENGTH)

  if (not re.search(PASSWORD_VALIDATION, password)):
    return (False, 'Password contains illegal characters')

  return (True, None)

def validate_user(username, password):
  xml = urllib2.urlopen('%s/X?op=user-auth&library=%s&staff_user=%s&staff_pass=%s' % (ALEPH_URL, ALEPH_USER_LIBRARY, username, password)).read()

  xml = ElementTree.fromstring(xml)

  errorOccurred = xml.find('./error') != None

  if errorOccurred:
    return False

  credentialsValid = xml.find('./reply').text == 'ok'

  if not credentialsValid:
    return False

  return True

def fetch_user_from_db(username):
  dsn = cx_Oracle.makedsn(DB_HOST, DB_PORT, sid=DB_SID)
  db = cx_Oracle.connect(user=DB_USERNAME, password=DB_PASSWORD, dsn=dsn)

  cursor = db.cursor()

  cursor.execute("SELECT * FROM %s.z66 WHERE Z66_REC_KEY = '%s'" % (ALEPH_USER_DB, username.upper()))

  result = []

  for col, description in zip(cursor.fetchone(), cursor.description):
    result.append({
      'value': col,
      'desc': description
    })

  return result

def format_row(row):
  result = []
  for col in row:
    val = col['value']
    desc = col['desc']

    if desc[1] == cx_Oracle.NUMBER:
      size = desc[4]
    else:
      size = desc[2]

    if val is None:
      val = ' ' * size
    elif type(val) != str:
      val = str(val).ljust(size)
    else:
      val = val.ljust(size)

    result.append(val)

  return ''.join(result)

def write_input_file(formatted_row):
  file_id = str(uuid4())[:7]

  f = open('%s%s%s' % (FILES_DIR, FILE_PREFIX, file_id), 'w')

  f.write(formatted_row)

  f.close()

  return file_id

def execute_program(file_id):
  p = subprocess.Popen(['/usr/bin/env', 'csh'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
  p.stdin.write('source %salephm/.cshrc\n' % ALEPH_DIR)
  p.stdin.write('%saleph/proc/p_file_06 %s,%s%s,z66,UPDATE,NO-FIX,Y,Y,\n' % (ALEPH_DIR, ALEPH_USER_DB.upper(), FILE_PREFIX, file_id))
  p.stdin.write('exit\n')

  (output, error) = p.communicate()

  return output, error

def write_log_file(username, formatted_row, output, error):
  f = open('%s%s-%s.log' % (LOG_DIR, username, datetime.datetime.now()), 'w')

  obj = {
    'username': username,
    'formatted_row': formatted_row,
    'output': output,
    'error': error,
  }

  f.write(json.dumps(obj))

  f.close()
  '''