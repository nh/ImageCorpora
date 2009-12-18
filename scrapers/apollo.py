from BeautifulSoup import BeautifulSoup as bs
import urlparse
from urllib2 import urlopen
from urllib import urlretrieve
from funcs import baseconv
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
    db.insert('imgs',title=title,desc=desc,added=web.SQLLiteral("datetime('now')"))
    img_id = str(db.query("SELECT MAX(id) as id FROM imgs")[0].id)
    img_id = baseconv(img_id,False)
    print title + " -- " + img_id
    url = "http://www.hq.nasa.gov/office/pao/History/alsj/a11/" + title + ".jpg"
    #urlretrieve(url,"./"+img_id+".jpg")