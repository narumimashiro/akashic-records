require 'socket'

# IPアドレスとポートを指定して接続
socket = TCPSocket.open('127.0.0.1', 7777)

# 標準入力を1行読み込む
message = gets
# メッセージを送信する
socket.send(message, 0)

# 応答メッセージを待ち、届いたら1行読み込む
response = socket.gets
# 受け取ったメッセージを表示する
puts "received: #{response}"

# 接続を閉じる
socket.close
