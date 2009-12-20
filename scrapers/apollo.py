from BeautifulSoup import BeautifulSoup as bs
import urlparse
from urllib2 import urlopen
from urllib import urlretrieve
from funcs import baseconv
from PIL import Image as im
import os
import sys
import re
import web

db = web.database(dbn='sqlite',db='../gal.db')
url = "http://www.apolloarchive.com/apg_subject_index.php?gallery=AS11-36/N"
#soup = bs(urlopen(url))
f = open("apollo.html", "r")
soup = bs(f)
x = 0

rows = soup.findAll('tr')[1:]

for row in rows:
    text = row.findAll(text=True)
    title = text[0]
    if text[2] != "(description not yet available)":
        desc = text[2]
    else:
        desc = ""        
    db.insert('imgs',title=title,desc=desc,filetype="jpg",added=web.SQLLiteral("datetime('now')"))
    img_id = str(db.query("SELECT MAX(id) as id FROM imgs")[0].id)
    base_id = baseconv(img_id,False)
    url = "http://www.hq.nasa.gov/office/pao/History/alsj/a11/" + title + ".jpg"
    dest_path = "./i/"+base_id+"/"
    os.makedirs(dest_path)
    dest = dest_path+img_id+".jpg"
    urlretrieve(url,dest)
    w, h = im.open(dest).size
    db.update('imgs',where="id = " + img_id,base_id=base_id, w=w, h=h,filesize = os.path.getsize(dest))