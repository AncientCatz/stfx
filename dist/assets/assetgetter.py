import json
from lxml.html import fromstring
import requests
import os


with open('../data/data.json') as f:
    data = json.load(f)


componentnames = list(set(d['img'] for d in data['components'].values()))
craftnames = list(set(d['img'] for d in data['crafts'].values()))
talentnames = list(set(d['icon'] for d in data['talents'].values()))
shipnames = list(set(d['skin_name'] for d in data['ships'].values()))
compmodnames = list(set(d['imgmod'] for d in data['components'].values() if 'imgmod' in d))
print(shipnames)


def get_jobs():
    page = requests.get('https://startraders.gamepedia.com/Star_Traders_Wiki')
    tree = fromstring(page.text)
    jobs = tree.xpath('//*[@id="job-links"]//div[@class="mpimages"]')

    for job in jobs:
        name = job[-1].get('title').lower().replace(' ', '_') + '.png'
        img_src = job[0][0].get('src')

        if os.path.exists(f'jobs/{name}'):
            print('exists')
            continue
        img = requests.get(img_src)
        with open(f'jobs/{name}', 'wb') as f:
            f.write(img.content)
        print(name, img)


def get_components():
    magic_getter(componentnames, 'components')

def get_component_mods():
    magic_getter(compmodnames, 'component_mods')


def get_crafts():
    magic_getter(craftnames, 'crafts')
    magic_getter(craftnames, 'crafts_top', lambda s: f"{s}_top")


def get_ships():
    magic_getter(shipnames, 'ships')
    magic_getter(shipnames, 'ships_top', lambda s: f"{s}_top")


def get_talents():
    magic_getter(talentnames, 'talents', lambda n: n +'_normal')

def magic_getter(png_list, directory, func=lambda n: n):
    if not os.path.exists(f'{directory}'):
        os.mkdir(directory)
    for p in png_list:
        print(p)
        if os.path.exists(f'{directory}/{p}.png'):
            print('exists')
            continue
        url = f"https://startraders.gamepedia.com/File:{func(p)}.png"
        req = requests.get(url)
        tree = fromstring(req.text)
        links = tree.xpath('*//a[@class="internal"]')
        if not links:
            print("ERROR")
            continue
        img = requests.get(links[0].get('href'))
        with open(f'{directory}/{p}.png', 'wb') as f:
            f.write(img.content)



def main():
    get_talents()
    get_jobs()
    get_talents()
    get_ships()
    get_components()
    get_component_mods()
    get_crafts()

if __name__ == '__main__':
    main()

