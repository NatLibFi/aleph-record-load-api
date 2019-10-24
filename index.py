#!/usr/bin/env python
# -*- coding: utf8 -*-
'''
Copyright 2018-2019 University Of Helsinki (The National Library Of Finland)

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

import cgi
import os
import sys
import json
import subprocess
import re
from datetime import datetime, timedelta, time
from os import unlink
from os.path import exists as file_exists
from uuid import uuid4
from base64 import b64decode

LOCKFILE_PATH = os.getenv('LOCKFILE_PATH')
(OFFLINE_START_HOUR, OFFLINE_LENGTH_HOURS) = os.getenv('OFFLINE_PERIOD', ',').split(',')
API_KEYS = re.split(',', os.getenv('API_KEYS'))
LOAD_COMMAND = os.getenv('LOAD_COMMAND')
ALEPH_VERSION = os.getenv('ALEPH_VERSION')
PARAMETERS = [
  'library',
  'method',
  'cataloger',
  'fixRoutine',
  'indexing',
  'updateAction',
  'mode',
  'charConversion',
  'mergeRoutine',
  'catalogerLevel',
  'indexingPriority'
]

def main():
  if os.getenv('REQUEST_METHOD') != 'POST':
    error(405)  

  sys.stderr.write('Aleph test log works! FOO!')

  check_offline_hours()

  authenticate()
  params = parse_params()
  check_params(set_default_params(params))
  [stdout, stderr] = execute(params, sys.stdin.read())

  if stderr:
    error(500, stderr)
    remove_files(params)
  
  errors = get_errors(params['library'], params['rejectedFile'])

  if errors:
    remove_files(params)
    error(400, errors)

  id_list = get_id_list(params['logFile'])
  remove_files(params)

  if id_list:
    print 'Content-Type: application/json'
    print 'Status: 200'
    print
    print json.dumps(id_list)
  else:
    error(500, stdout)    

def check_offline_hours():
  if OFFLINE_START_HOUR and OFFLINE_LENGTH_HOURS:
    start_hour = int(OFFLINE_START_HOUR)
    length_hours = int(OFFLINE_LENGTH_HOURS)  
    now = datetime.now()

    if int(now.hour) < start_hour:
      start = datetime.combine(now - timedelta(days=1), time(start_hour))
    else:
      start = datetime.combine(now, time(start_hour))
  
    end = start + timedelta(hours=length_hours)
  
    if now >= start and now < end: 
      error(503)

def authenticate(): 
  if 'HTTP_AUTHORIZATION' in os.environ and os.getenv('HTTP_AUTHORIZATION'):
    encoded = re.sub('^Basic ', '', os.getenv('HTTP_AUTHORIZATION'))
    api_key = re.split(':', b64decode(encoded))[0]

    if (api_key not in API_KEYS):
      error(401)
  else:
    error(401)

def parse_params():
  params = {}

  if os.getenv('QUERY_STRING'):
    str = os.getenv('QUERY_STRING').split('?')[0]
  
    for param in str.split('&'):
      [key, value] = param.split('=')
      params[key] = value

  return params

def set_default_params(p):
  id = str(uuid4()).replace('-', '')
  
  p['inputFile'] = '{}.seq'.format(id)
  p['rejectedFile'] = '{}.rej'.format(id)
  p['logFile'] = '{}.log'.format(id)

  p['fixRoutine'] = p['fixRoutine'] if 'fixRoutine' in p else ''
  p['indexing'] = p['indexing'] if 'indexing' in p else 'FULL'
  p['updateAction'] = p['updateAction'] if 'updateAction' in p else 'APP'
  p['mode'] = p['mode'] if 'mode' in p else 'M'
  p['charConversion'] = p['charConversion'] if 'charConversion' in p else ''
  p['mergeRoutine'] = p['mergeRoutine'] if 'mergeRoutine' in p else ''
  p['catalogerLevel'] = p['catalogerLevel'] if 'catalogerLevel' in p else ''
  p['indexingPriority'] = p['indexingPriority'] if 'indexingPriority' in p else ''

  return p

def check_params(params):
  for param in PARAMETERS:
    if param not in params:
      error(400, 'Parameter {} is missing'.format(param))

def execute(params, payload):
  input_file = '/exlibris/aleph/u{}/{}/scratch/{}'.format(ALEPH_VERSION, params['library'], params['inputFile'])
  values = [
    params['library'],
    params['inputFile'],
    params['rejectedFile'],
    params['logFile'],
    params['method'],
    params['fixRoutine'],
    '',
    params['indexing'],
    params['updateAction'],
    params['mode'],
    params['charConversion'],
    params['mergeRoutine'],
    params['cataloger'],
    params['catalogerLevel'],
    params['indexingPriority']
  ]

  handle_lock(payload, params['mode'])

  f = open(input_file, 'w')
  f.write(payload)
  f.close()

  p = subprocess.Popen(['/usr/bin/env', 'csh'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
  p.stdin.write('source /exlibris/aleph/a{}/alephm/.cshrc\n'.format(ALEPH_VERSION))
  p.stdin.write('{} {}\n'.format(LOAD_COMMAND, ','.join(values)))
  p.stdin.write('exit\n')
 
  (stdout, stderr) = p.communicate()
  remove_lock()

  return (stdout, stderr)

def handle_lock(data, mode):
  def get_record_id():
    return data[0:9] if mode == 'OLD' else '0'

  def get_lock_id():
    file = open(LOCKFILE_PATH)
    id = file.read()
    file.close()
    return id
    
  id = get_record_id()

  if file_exists(LOCKFILE_PATH) and get_lock_id() == id:    
    error(409, 'Lockfile exists')

  file = open(LOCKFILE_PATH, mode='w')
  file.write(id)
  file.close()

def remove_lock():
  if file_exists(LOCKFILE_PATH):
    unlink(LOCKFILE_PATH)

def get_errors(library, filename):
  f = open('/exlibris/aleph/u{}/{}/scratch/{}'.format(ALEPH_VERSION, library, filename), 'r')
  errors = f.read()
  f.close()
  return errors

def get_id_list(filename):
  f = open('/exlibris/aleph/u{}/alephe/scratch/{}'.format(ALEPH_VERSION, filename), 'r')
  id_list = f.read().splitlines()
  f.close()   
  return id_list

def remove_files(p):
  os.unlink('/exlibris/aleph/u{}/alephe/scratch/{}'.format(ALEPH_VERSION, p['logFile']))
  os.unlink('/exlibris/aleph/u{}/{}/scratch/{}'.format(ALEPH_VERSION, p['library'], p['rejectedFile']))
  os.unlink('/exlibris/aleph/u{}/{}/scratch/{}'.format(ALEPH_VERSION, p['library'], p['inputFile']))

def error(code, message=''):
  print 'Status: {}'.format(str(code))

  if message:
    print 'Content-Type: text/plain'
    print
    print message
  else:
    print

  sys.exit()

if __name__ == '__main__':
  main()
