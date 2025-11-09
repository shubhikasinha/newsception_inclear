import requests

url = 'https://newsapi.org/v2/everything'
params = {
    'q': 'Israel Palestine',
    'language': 'en',
    'apiKey': 'baf024c72e8a4315a310a2f83a1025c0'
}
res = requests.get(url, params=params)
articles = res.json()['articles']

for a in articles[:5]:
    print(a['source']['name'], ":", a['title'])
