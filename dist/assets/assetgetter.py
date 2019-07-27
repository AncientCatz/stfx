import json
from lxml.html import fromstring
import requests
import os

def get_jobs():
    page = requests.get('https://startraders.gamepedia.com/Star_Traders_Wiki')
    tree = fromstring(page.text)
    jobs = tree.xpath('//*[@id="job-links"]//div[@class="mpimages"]')

    for job in jobs:
        name = job[-1].get('title').lower().replace(' ', '_') + '.png'
        img_src = job[0][0].get('src')

        img = requests.get(img_src)
        with open(f'jobs/{name}', 'wb') as f:
            f.write(img.content)
        print(name, img)

def get_components():
    with open("./componentnames.json") as f:
        components = json.load(f)
    magic_getter(components, 'components')

def get_crafts():
    with open("./craftnames.json") as f:
        crafts = json.load(f)
    magic_getter(crafts, 'crafts')
    magic_getter(crafts, 'crafts_top', lambda s: f"{s}_top")


def get_talents():
    with open("./talentnames.json") as f:
        talentnames = json.load(f)
    magic_getter(talentnames, 'talents', lambda n: n +'_normal')

def magic_getter(png_list, directory, func=lambda n: n):
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



def get_ships():
    with open("./shipnames.json") as f:
        shipnames = json.load(f)

    magic_getter(shipnames, 'ships')
    magic_getter(shipnames, 'ships_top', lambda s: f"{s}_top")
# get_talents()

# get_jobs()
get_talents()
get_ships()
get_components()
get_crafts()
