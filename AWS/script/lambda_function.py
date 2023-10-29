import json
import boto3
import requests
from bs4 import BeautifulSoup
import tweepy
import time
import os

topPage = 'https://store.colorfulpalette.jp'
storePage = 'https://store.colorfulpalette.jp/collections/rp_cpstore'

def getStoreNewLineup():
    res = requests.get(storePage)
    data = []
    if(res.status_code == 200):
        soup = BeautifulSoup(res.text, 'html.parser')
        # 商品一覧の要素取得
        itemList = soup.find('div', class_='grid grid--uniform')
        # 商品名
        itemNames = itemList.find_all('div', class_='grid-product__title')
        # 値段
        itemPrices = itemList.find_all('div', class_='grid-product__price')
        # 個々商品リンク
        itemLinks = itemList.find_all('a', class_='grid-product__link')
        # リストにまとめる
        for n in range(len(itemNames)):
            data.append({'name': itemNames[n].get_text(),
                         'price': itemPrices[n].get_text().replace('\n', ''),
                         'link': topPage + itemLinks[n].get('href')})
        return data
    
def compare_file(pre, cur):
    diff = []
    pre_list = [item['name'] for item in pre]
    cur_list = [item['name'] for item in cur]
    diff_namelist = list(set(cur_list) - set(pre_list))
    
    for el in diff_namelist:
        for item in cur:
            if(item['name'] == el):
                diff.append(item)
    return diff
    
def tweet_post(data_list):
    client = tweepy.Client(
        consumer_key = os.environ['consumer_key'],
        consumer_secret = os.environ['consumer_secret'],
        access_token = os.environ['access_token'],
        access_token_secret = os.environ['access_token_secret']
    )
    for el in data_list:
        name = el['name']
        price = el['price']
        link = el['link']
        text = f'【新着商品】{name} / {price} {link}'
        client.create_tweet(text=text)
        time.sleep(1)

def lambda_handler(event, context):
    # s3の設定
    s3 = boto3.client('s3')
    bucket_name = os.environ['bucket_name']
    file_key='storeinfo.json'
    
    # S3からファイルをダウンロード
    response = s3.get_object(Bucket=bucket_name, Key=file_key)
    content = response['Body'].read().decode('utf-8')
    
    # ダウンロードしたJSONデータを読み込む
    pre_data = json.loads(content)
    cur_data = getStoreNewLineup()
    
    diff_data = compare_file(pre_data, cur_data)
    
    if(diff_data):
        tweet_post(diff_data)
        s3.put_object(Bucket=bucket_name, key=file_key, Body=json.dumps(cur_data))
