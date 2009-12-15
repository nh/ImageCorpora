from BeautifulSoup import BeautifulSoup as bs
import urlparse
from urllib2 import urlopen
from urllib import urlretrieve
import os
import sys
import re

#http://lcweb2.loc.gov/ammem/daghtml/dagsubjindex1.html

	#imgpage = bs(urlopen(image["href"]))
	#x += 1
	#urlretrieve(imgpage.find("img", id="the_image")["src"],"./test/"+str(x)+".jpg")
	
root = "http://lcweb2.loc.gov"

for pg in range(1,2):

	pg = bs(urlopen("http://lcweb2.loc.gov/ammem/daghtml/dagSubjects0"+str(pg)+".html"))
	for items in pg.findAll('p')[1].findAll('a'):
		try:
			itemname = items.contents[0].split('--')[0]
			pagemeta = [
				itemname.partition(',')[2].lstrip() + " " + itemname.partition(',')[0], #name
				items.contents[0].partition('--')[2], #lifespan
				root + items['href']
				]
			#pagemeta[2] = items['href']
			page = bs(urlopen(pagemeta[2]))
			if (len(page.findAll('table')) < 3):
				#pagemeta[3] = page.find(text=re.compile("CREATED/PUBLISHED")).parent
				tifpage = bs(urlopen(root + page.findAll('img')[1].parent['href']))
				print tifpage.find(href=re.compile("\.tif"))['href'] 
				pagemeta.append(str(page.find(text=re.compile("CREATED")).parent.parent).split('<br />')[1].replace(']</p>','').replace(' [','').replace('<b>','').replace('</b>',''))
			else:
				for subpage in page.findAll('table')[2].findAll('a'):
					print root + subpage['href']
				#print pagemeta
		except:
			print "Error:", sys.exc_info()[0]

    	