import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
req = urllib.request.Request('https://zenodo.org/records/8346860', headers=headers)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8')
        title = re.findall(r'<title>(.*?)</title>', html)
        files = set(re.findall(r'/records/8346860/files/[^"\'? ]+', html))
        print('Title:', title)
        print('Files:', files)
except Exception as e:
    print('Error:', e)
