from BeautifulSoup import BeautifulSoup as bs
import urlparse
from urllib2 import urlopen
from urllib import urlretrieve
import os
import sys
import re

url = "http://drunkenstepfather.com/forum/showthread.php?t=16900&page=2"
soup = bs(urlopen(url))
x = 299

for image in soup.findAll('a', href=re.compile('^http://www\.imagebam\.com/image/.*')):
    imgpage = bs(urlopen(image["href"]))
    x += 1
    urlretrieve(imgpage.find("img", id="the_image")["src"],"./test/"+str(x)+".jpg")
    print x