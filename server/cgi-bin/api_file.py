#!/usr/local/bin/python3
# -*- coding: UTF-8 -*-
import cgi
import cgitb
import json
import os
import sys

class ApiFile:
# data
    # 返信データ
    res_result = ''
    res_message = ''
    res_json = ''

    # ファイル保管場所
    server_resource = './server-resource/'

# methods
    def __init__(self):
        pass

    def __del__(self):
        pass

    def respond(self):
        data = {
            'result': self.res_result,
            'message': self.res_message,
            'json': self.res_json
        }
        print('Content-Type: application/json')
        print()
        print(json.dumps(data))

    def file_exist(self, file_name):
        return os.path.exists(self.server_resource + file_name)

# REQUEST POST
class ApiFilePost(ApiFile):
# methods
    def __init__(self):
        pass

    def __del__(self):
        pass

    def file_write(self, file_name, json_data):
        with open(self.server_resource + file_name, 'w', encoding='utf-8') as f:
            json.dump(json_data, f)
            # TODO 複数になると直下コードの方が整理されるのかもしれない？
            # https://atmarkit.itmedia.co.jp/ait/articles/2208/30/news032.html
            # json.dump(json_data, f, indent=2, ensure_ascii=False)

# REQUEST GET
class ApiFileGet(ApiFile):
# methods
    def __init__(self):
        pass

    def __del__(self):
        pass

    def file_read(self, file_name):
        with open(self.server_resource + file_name, 'r', encoding='utf-8') as f:
            self.res_json = json.load(f)


# main
ERROR = 'error'
OK = 'ok'

cgitb.enable()  # CGIのデバッグをオン

if os.environ['REQUEST_METHOD'] == 'POST':
    # _が一体なんなのか
    # https://medium.com/lsc-psd/pythonic%E8%89%B2%E3%80%85-python%E3%81%AE%E3%82%A2%E3%83%B3%E3%83%80%E3%83%BC%E3%82%B9%E3%82%B3%E3%82%A2-%E3%82%92%E4%BD%BF%E3%81%84%E3%81%93%E3%81%AA%E3%81%9D%E3%81%86-3c132842eeef
    length, _ = cgi.parse_header(os.environ['CONTENT_LENGTH'])
    data = sys.stdin.buffer.read(int(length))
    json_str = data.decode('utf-8')
    post_data = json.loads(json_str)
    file_name = post_data['file']
    json_data = post_data['json']
else: # os.environ['REQUEST_METHOD'] == 'GET'
    form = cgi.FieldStorage()
    # 受信データ
    file_name = form['file'].value

if os.environ['REQUEST_METHOD'] == 'POST':
    req_method_ = ApiFilePost()
    if not req_method_.file_exist(file_name):
        req_method_.__class__.res_result = ERROR
        req_method_.__class__.res_message = 'No such file ' + file_name + '...'
    else:
        req_method_.file_write(file_name, json_data)
        req_method_.__class__.res_result = OK
        req_method_.__class__.res_message = 'Complete'
else: # os.environ['REQUEST_METHOD'] == 'GET'
    req_method_ = ApiFileGet()
    if not req_method_.file_exist(file_name):
        req_method_.__class__.res_result = ERROR
        req_method_.__class__.res_message = 'No such file ' + file_name + '...'
        # こっちはPOSTと共通化できるけど、__class__ってものがあるって記録残したい
    else:
        req_method_.file_read(file_name)
        req_method_.__class__.res_result = OK
        req_method_.__class__.res_message = 'Complete'

req_method_.respond()  # リクエスト結果を返信