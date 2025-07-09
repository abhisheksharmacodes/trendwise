import json
import re

json_path = 'test.articles.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

def replace_unsplash(obj, seed, counter):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, str) and 'images.unsplash.com' in v:
                # Replace all Unsplash URLs in the string
                def url_replacer(match):
                    url_counter = counter[0]
                    picsum_url = f'https://picsum.photos/seed/{seed}-any-{url_counter}/800/400'
                    counter[0] += 1
                    return match.group(0).replace(match.group(0), picsum_url)
                obj[k] = re.sub(r'https://images.unsplash.com/[^"\s>]+', url_replacer, v)
            else:
                replace_unsplash(v, seed, counter)
    elif isinstance(obj, list):
        for item in obj:
            replace_unsplash(item, seed, counter)

for article in data:
    title = article.get('title', '')
    seed = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    counter = [1]
    replace_unsplash(article, seed, counter)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Replaced all Unsplash links in test.articles.json with Picsum links.') 