import os
import re
import sys
import math
from PIL import Image
import shutil
import pyratemp
from configobj import ConfigObj
from operator import itemgetter

settings = ConfigObj("./settings.ini")

def stripspace(value):
    "Return the given HTML with spaces between tags removed."
    value = re.sub(r'\n\s+', '\n', value)
    
    return re.sub(r'>\s+<', '><', value)


def numsort(l):
    convert = lambda text: int(text) if text.isdigit() else text
    alphanum = lambda key: [ convert(c) for c in re.split('([0-9]+)', key) ]
    l.sort( key=alphanum )

#image_types = ('bmp', 'png', 'gif', 'jpg', 'jpeg', 'tif', 'tiff')

def resize_image(im,new_width=9999,new_height=70):
    cur_width, cur_height = im.size
    orig = float(cur_width)/float(cur_height)
    if ((orig < 0.6 or orig > 1.75) and new_width == 9999 and new_height == 70):
        if orig > 1.75:
            new_width = 122
        elif orig < 0.6:
            new_width = 42
        ratio = max(float(new_width)/cur_width,float(new_height)/cur_height)
        x = (cur_width * ratio)
        y = (cur_height * ratio)
        xd = abs(new_width - x)
        yd = abs(new_height - y)
        x_diff = int(xd / 2)
        y_diff = int(yd / 2)
        midtop_diff = int(yd / 4)
        
        if orig > 1.6:
            box = (int(x_diff),int(y_diff),int(x_diff+new_width),int(y_diff+new_height))
        elif orig < 0.6:
            box = (int(x_diff),int(midtop_diff),int(x_diff+new_width),int(midtop_diff+new_height))
        
        im = im.resize((int(x), int(y)), Image.ANTIALIAS).crop(box)
    else:
        ratio = min(float(new_width)/cur_width,float(new_height)/cur_height)
        new_dimensions = (int(round(cur_width*ratio)),
                          int(round(cur_height*ratio)))
        im = im.resize(new_dimensions, Image.ANTIALIAS)
    
    return im

#walks the root directory and all subs
for rootdirname, subdir, files in os.walk('./images'):   
    if len(subdir) is 0:
        section = os.path.join("./output",os.path.split(rootdirname)[1])
        config = ConfigObj(os.path.join(section,"config.ini"))
        meta = ConfigObj(os.path.join(section,"meta.ini"))
        output_count = 1
        for img in meta.keys():
            if not os.path.isfile(os.path.join(rootdirname, img)):
                print "Deleted " + img
                shutil.rmtree(section+"/"+meta[img]["id"])
                del meta[img]
                #del os.path.join(section,output_count) #delete all resized
        #config["Category Settings"] = {}            
        config["Category Settings"]["title"] = rootdirname[2:]
        # Main Image Loop
        count = 1
        newimgcount = 1
        strip_count = 0
        numsort(files);
        for img in files:
            '''
            blankfav = Image.new("RGBA",[16,16],(0,0,0,0))
            img_dir = os.path.join(section+"/"+str(count))
            fav = Image.open(os.path.join(img_dir, "thumb.png"))
            fav = resize_image(fav,16,16)
            fav = fav.convert('RGBA')
            leftpos = (16 - fav.size[0]) / 2
            toppos = (16 - fav.size[1]) / 2
            blankfav.paste(fav,(leftpos,toppos))
            blankfav.save(os.path.join(img_dir, "f.png"))
            '''
            
            if not meta.has_key(img): #new image
                path = os.path.join(rootdirname,img) #Path to image
                im = Image.open(path) #Loads image object into the 'im' variable                
                if im.palette is not None: #Fix gif pallette
                    im = im.convert('RGB')
                img_dir = section+"/"+str(count)
                if os.path.isdir(img_dir) and config["Category Settings"]["generate"] != "thumbs":
                    img_dir = section+"/"+str(count-1)+"."+str(newimgcount)
                    newimgcount += 1
                else:
                    newimgcount = 1
                
                meta[img] = {}
                meta[img]["title"] = os.path.splitext(img)[0].replace('_', ' ').replace('-', ' ').title() 
                meta[img]["size"] = im.size
                meta[img]['filesize'] = os.path.getsize(path)
                
                if not os.path.isdir(img_dir):
                    os.makedirs(img_dir)
                
                if config["Category Settings"]["generate"] != "thumbs": #skip img-gen
                    for w in [760,984,1112,1240]:
                        if im.size[0] > w:
                            resize_image(im,w,99999).save(os.path.join(img_dir, str(w) + ".jpg"), quality=60)
                        else:
                            break
                    for h in range(110,1011,45):
                        if im.size[1] > h:
                            resize_image(im,99999,h).save(os.path.join(img_dir, str(h) + ".jpg"), quality=60)
                        else:
                            break
                    shutil.copy2(path, os.path.join(img_dir,"0.jpg"))
                
                im = resize_image(im)
                resize_image(im).save(os.path.join(img_dir, "thumb.png"))
                meta[img]['thumb_width'] = im.size[0]-2
                print meta[img]["title"]
            if "sort_by" is "added":
                meta[img]["id"] = len(meta)+1
            else:
                meta[img]["id"] = count
            count += 1            
            
        meta_thumb = []
        for key, value in meta.items():
            value["file"] = key
            meta_thumb.append(value)
         
        meta_thumb.sort(key=itemgetter('id'))

        #print meta_thumb
                  
        #rename folders sequentially  
        for rootdirname, subdir, sized_files in os.walk(section):
            subdir = [float(i) for i in subdir]
            subdir.sort()
            subdir = [str(i).rstrip('0').rstrip('.') for i in subdir]
            strip_count = 0
            for i,subdirname in enumerate(subdir):
                orig = os.path.join(rootdirname,subdirname)
                repl = os.path.join(rootdirname,str(i+1))
                if orig != repl:
                    print orig + " >>> " + repl
                    redo_thumbstrip = 1
                    os.rename(orig,repl+"_")
                if (i+1)%50 is 0 or i == len(subdir)-1:
                    print i
                    #print str(math.floor(float(i)/50)*50) + " xx " + str(i+1)
                    strip_offset = 0
                    imgstrip = Image.new("RGB",[6100,70])
                    #print int(math.floor(float(i)/50)*50)
                    #print i
                    #print "xx" + str(len(subdir)-1)
                    for x in range(int(math.floor(float(i)/50)*50), i+1):
                        try:
                            th_path = os.path.join(rootdirname,str(x+1)+"_/thumb.png") #Path to image
                            th_im = Image.open(th_path)
                        except:
                            th_path = os.path.join(rootdirname,str(x+1)+"/thumb.png") #Path to image
                            th_im = Image.open(th_path)
                         #Loads image object into the 'im' variable 
                        img = meta[meta_thumb[x]["file"]]
                        img['thumb_url'] = strip_count
                        img['thumb_offset'] = str(strip_offset + int(img["thumb_width"])/2)
                        #print str(img['id']) + "  " + str(img['thumb_offset'])
                        imgstrip.paste(th_im,(strip_offset,0))
                        strip_offset += int(img["thumb_width"])
                    imgstrip = imgstrip.crop(imgstrip.getbbox())
                    imgstrip.save(os.path.join(section, str(strip_count) + ".jpg"), quality=45)
                    imgstrip = Image.new("RGB",[6100,100])
                    strip_offset = 0
                    strip_count += 1
                    #print "xx"
                #print "a " + str(i)
                #print str(i) + " == " + str(len(subdir)-1)
        for rootdirname, subdir, files in os.walk(section):
            for subdirname in subdir:
                orig = os.path.join(rootdirname,subdirname)
                os.rename(orig,orig.rstrip('_'))
                
        if "sort_by" is "added":#add in config.ini
            meta_thumb.reverse()    
        
        '''for img in meta_thumb:

            im = resize_image(im)
            imgstrip.paste(im,(strip_offset,0)) #Paste the thumbnail into the strip

            meta[img]['thumb_offset'] = str(strip_offset + int(im.size[0]/2) + 1) #Calculate the image centepoint on strip
            meta[img]['thumb_width'] = im.size[0]-2
            strip_offset += im.size[0] #Add width of current thumb to strip_offset
            print str(count) + "  " + config[image]["title"]

            if count%50 == 0:
                imgstrip = imgstrip.crop(imgstrip.getbbox())
                imgstrip.save(os.path.join(section, str(strip_count) + ".jpg"), quality=45)
                imgstrip = Image.new("RGB",[6100,100])
                strip_offset = 0
                strip_count += 1
            count += 1
        
        #Make last strip
        imgstrip = imgstrip.crop(imgstrip.getbbox())
        imgstrip.save(os.path.join(section, str(strip_count) + ".jpg"), quality=45)'''

        #config.write()
        meta.write()
        t = pyratemp.Template(filename="gallery.html")
        #
        fout = open(os.path.join(section,"index.html"), "w")
        fout.write(stripspace(t(meta=meta_thumb,assets="remote")))
        fout.close()
        lout = open(os.path.join(section,"local.html"), "w")
        lout.write(stripspace(t(meta=meta_thumb,assets="local")))
        lout.close()
        #print t(meta=meta_thumb)