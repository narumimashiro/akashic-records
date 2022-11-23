from http.server import HTTPServer, CGIHTTPRequestHandler

class Handler(CGIHTTPRequestHandler):
    # CGIを設置するディレクトリ
    cgi_directories = ["/cgi-bin"]

# ポート番号
PORT = 9696

# IPアドレス
HOST = "127.0.0.1"

# サーバの起動
httpd = HTTPServer((HOST, PORT), Handler)
httpd.serve_forever()