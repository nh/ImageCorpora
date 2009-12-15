var t;
(function () {

var galwidth,
hashnav,
hashint,
border = 0,
spacing = 6,
pageoffset = 118,
view_offset = 23,
cur = 0,
end = 0,
fixpos = 0,
tally = 0,
view_height,
view_width,
zoom = "fitpage",
thumbs = [undefined],
c = readCookie("theme"),
navcount = readCookie("navcount"),
resizeTimer = null,
iconTimer = null,
loop = null,
backto = null,
pageheight = $(window).height(),
pagewidth = $(window).width(),
fullrow = [],
row = [];

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

if (c !== null) {
	$('html').addClass(c);
	spacing = parseInt(c.slice(-2),10);
	cookie_border = parseInt(c.slice(-4,-2),10);
	if (!isNaN(cookie_border)) border = cookie_border;
} else {
	$('html').addClass("default");
}

$("#n").mousedown(function(e){
	var e = $(e.target);
	e.addClass("active");
	if (e.parent().is("span")) {
	    themepicker(e.attr("id").replace("-"," "));
    } else if (e.is("#hiderows")) {
		e.attr("id","showrows").text("Show Row");
		$("#g tt").empty();
		pageoffset = 28;
		view_height = view_height + 90;
		view_offset = -47;
		imgnav(cur,"noclose");
    } else if (e.is("#showrows")) {
        e.attr("id","hiderows").text("Hide Row");
        $("#g tt").empty();
        pageoffset = 118;
        view_height = view_height - 90;
        view_offset = 23;
        imgnav(cur,"noclose");
    } else if (e.is("#nav a.next")) {
    	
		imgnav("n");	
		return false;
    } else if (e.is("#nav a.prev")) {
    	
		imgnav("p");
		return false;
    } else {
    	var setscroll;
    	zoom = e.attr("id");
    	$("body").attr("class",zoom);
    	addtt([0]);
    	if (zoom == "fullsize") setscroll = -81;
    	else setscroll = view_offset;
    	$('html,body').scrollTop($('#t' + cur).offset().top-setscroll);
    }
	return false;
}).mouseup(function(e){
	$(e.target).removeClass("active");
});


$("#n").click(function(){return false;});

function themepicker(theme) {
	$('html').removeClass();
	$('html').addClass(theme);
	theme_spacing = parseInt(theme.slice(-2),10);
	theme_border = parseInt(theme.slice(-4,-2),10);
	if (theme_spacing !== spacing || (!isNaN(theme_border) && theme_border !== border)) {
		spacing = theme_spacing;
		if (!isNaN(theme_border)) border = theme_border;
		else border = 0;	
		t(2);
	}
	document.cookie = 'theme=' + theme + '; expires=Wed, 1 Jan 2020 00:00:00 UTC; path=/';
}

t = function(mode) {
	clearTimeout(loop);
	clearTimeout(resizeTimer);
	clearInterval(hashint);
	var a,b,r,i,expand,tempimg,imgsdiv,
	x = 1,
	end = 430,
	hashid = parseInt(window.location.hash.slice(1),10),
	looper = function() { // Iterate through all thumbnails adjusting sizes
		while (true) {
		    var thisid = '#t'+x;
			if (mode !== 2) {
				thumbs.push([
					x,                                // 0
					thisid,                           // 1
					parseInt($(thisid).css("width"))  // 2
				]);
			} else {
				$(thisid).css({
					width:thumbs[x][2],
					marginLeft:spacing
				});
			}
			tally = tally + thumbs[x][2] + spacing + border;
			tempimg = thumbs[x].slice();
			fullrow.push(tempimg);			
			if (thumbs[x][2] > 45) row.push(tempimg);
			//$(thisid).css("outline","2px solid blue");
			if ( tally + ((fullrow.length-1)*spacing/4) > galwidth || (x === end-1 && mode !== 0)) {
				if (tally + ((fullrow.length-1)*spacing/4) > galwidth || mode === 0) { // <-- skip aligning for last row		    
				if (tally > galwidth) {
					r = 0;
					i = 0;
					rowlength = row.length;
					for(a = 0 ; a <= tally - galwidth; a++) {
						row[r][2]--;
						r++;
						if (r === rowlength) r = 0;
					}					
					while (i < rowlength) {
						$(row[i][1]).css('width',row[i][2]);
						i++;
					}
					//$(thisid).css("outline","2px solid red");
				} else {
					expand = [];
					r = 0;
					i = 1;
					fullrowlength = fullrow.length;
					for(b = 0 ; b < galwidth - tally ; b++) {
						if (expand[r] === undefined) expand[r] = spacing + 1;
						else expand[r]++;
						r++;
						if (r === fullrowlength) r = 0;
					}
					while (i < fullrowlength) {
						if (expand[i] !== undefined) $(fullrow[i][1]).css("margin-left", expand[i-1]);
						i++;
					}
					//$(thisid).css("outline","2px solid green");
				}
			    }
				imgsdiv = [];
				imgsdiv[0] = '<div><a class="prev" href="#Previous"></a><a href="#Next" class="next"></a>';
				jQuery.each(fullrow, function(t, val) {
					imgsdiv.push('<tt id="i');
					imgsdiv.push(val[0]);
					imgsdiv.push('"></tt>');
				});
				imgsdiv.push('</div>');
				
				$(thisid).after(imgsdiv.join(""));
				
				if (x > hashid || (x===end-1 && hashid <= end)) {
					imgnav(hashid,"noclose");
					hashid = 99999;
				}
												
				tally = 0;
				row = [];
				fullrow = [];
			}
			x++;
			if(x===end) {
			    if (mode === 2) hashint = setInterval(hashnav,500);
			    break;
			}
			if (x%100 === 0) {
				clearTimeout(resizeTimer);
				loop = setTimeout(looper, 5);
				break;
			}
		}
	};
	
	if (mode === 0) {
	    end = 100;
	 }
	else if (mode === 1) {
	    x = 100;
    }
	else if (mode === 2) {
		$("#g div").remove(); // Reset styles on resize
		tally = 0;
		row = [];
		fullrow = [];
	}

	galwidth = $('#g').width() - spacing + 1;
	looper();
};

function imgnav(imgid_direction, mode) {
	if (navcount === null) navcount=0;
	if (navcount == 12) {
		$('#g').addClass("nohint");
		navcount = 13;
	} else if (navcount < 12) {
		navcount++;
  		document.cookie = 'navcount=' + navcount + '; expires=Tue, 31 Dec 2020 00:00:00 UTC; path=/';	
	}
	
	zoom = "fitpage";
	$("body").attr("class",zoom);
	var th,tt;
	if (mode !== "fix") fixpos = 0;
	$('#t' + cur).removeClass();
	$('#i' + cur).hide();
	$('#i' + cur).parent().hide();

	if (typeof imgid_direction === "number") {
		if (cur === imgid_direction && mode !== "noclose") {
			//cur = 0;
			window.location.hash = cur = 0;
            return false;
		}
		cur = imgid_direction;	
	    addtt([0,1,-1,2,3,-2,4,5,-3,6,7,-7]);
	} else if (imgid_direction === "n" && cur !== end) {
		cur++;
		addtt([0,1,-1,2,3,-2,4,5,-3,6,7,-7]);
	} else if (imgid_direction === "p" && cur !== 1) {
		cur--;
		addtt([0,1,-1,2,3,-2,4,5,-3,6,7,-7]);
	}
	
    if (thumbs[cur] !== undefined) {	
	    tt = $('#i' + cur);
	    th = $('#t' + cur);
		th.addClass("cur");
    	$("#cur").text(thumbs[cur][3]);    	
	    tt.show();
	    tt.parent().show();
    	$('html,body').scrollTop(th.offset().top-view_offset);
    	document.title = "IC:/Sports Logos/A to F/" + thumbs[cur][3];
    	window.location.hash = cur;
    	
    	clearTimeout(iconTimer);
    	iconTimer = setTimeout(function(){
            $("#fav").attr("href",cur + "/f.png").remove().appendTo("head");//preload these?
        }, 500);
    }
}

function addtt(imgs) {
    $.each(imgs,function(i,x){
        var current = cur + x;
        if (thumbs[current] !== undefined) {
            var tt = [],
            thisimg_height = view_height + 20;
    	    if (!$("#i" + current).children().is("img")) {
        		var imghref = $(thumbs[current][1]).attr("href");
        		thumbs[current][3] = $("img",thumbs[current][1]).attr("alt");
        		thumbs[current][4] = $("img",thumbs[current][1]).attr("longdesc");
        		thumbs[current][5] = parseInt(imghref.slice(-8,-4),10);  // width
        		thumbs[current][6] = parseInt(imghref.slice(-4),10);  // height

        		if (typeof thumbs[current][4] !== "undefined") {
        			tt[18] = '<p>Sample description for an image.</p>';
    			}
        	}

    		if (!$("#i" + current).children().hasClass(zoom)) {
        		tt[5] = '<img src="';
        		tt[6] = thumbs[current][0];
        		tt[7] = '/';
         		tt[8] = "0"; // size url
    		    tt[9] = '.jpg" height="';
    		    //[10]= image height
            	tt[11]= '" style="margin:';
            	//[12]= vertical margins
        		tt[13]= 'px 0';
    		    tt[14]= '" class="'
    		    //[15]= zoom classes
    		    tt[16]= '"/>';//'<span style="margin-top:'+ ((pageheight*0.6)-pageoffset+23) +'px;height:' + (view_height - (pageheight*0.4)) + 'px"></span>';
    		    tt[17]= "";
    		    var img_ratio = thumbs[current][5]/thumbs[current][6];
    		    var page_ratio = view_width/view_height;
// lest than or equal to!!!!!!!!!
    		    if (zoom === "fullsize") {
		            tt[10] = thumbs[current][6];
		            if (thumbs[current][6] <= view_height && thumbs[current][5] <= view_width) {
		                tt[15] = "fitpage fitwidth fullsize";
		            } else if (thumbs[current][5] <= view_width) {
		                tt[11] = '" style="margin:6px 0 4px';
    		            tt[12] = tt[13] = "";
		                tt[15] = "fitwidth fullsize";
		            } else if (thumbs[current][6] > view_height) {
		                tt[11] = '" style="margin:6px -' + Math.floor(thumbs[current][5]/2) + 'px 4px';
    		            tt[12] = tt[13] = "";
		                tt[15] = "fullsize";
		                    var loading = [];
		                    loading[0] = '<h5 class="fullsize" style="width:';
			        	    loading[1] = thumbs[current][2];
			        		loading[2] = 'px"><span style="width:"';
			        	    loading[3] = thumbs[current][2]-2;
			        		loading[4] = 'px">';
			        		loading[5] = $(thumbs[current][1]).html();
			        		loading[6] = '</span></h5>';
		                tt[17] = loading.join("");
		            } else {
		                tt[15] = "fullsize";
		            }	            
		        } else {
        		    if (img_ratio < page_ratio) { // constrain height
        		        if (thumbs[current][6] <= view_height) {
    		                    tt[10] = thumbs[current][6];
            		            tt[15] = "fitpage fitwidth fullsize";
    	                } else { 
        		            if (zoom === "fitpage") {
    	                        tt[8] = tt[10] = view_height;
        		                tt[15] = "fitpage";
        	                } else if (zoom === "fitwidth") {
        		                if (thumbs[current][5] <= view_width) {
        		                    tt[10] = thumbs[current][6];
    		                        tt[11] = '" style="margin:6px 0 4px';
    		                        tt[12] = tt[13] = "";
        		                    tt[15] = "fitwidth fullsize";                    
        		                } else {
        		                    var this_height = img_ratio*tt[10];
        		                    tt[9] = '.jpg" width="';
        		                    tt[8] = tt[10] = view_width;
        		                    tt[15] = "fitwidth";
        		                    if (this_height < view_height) {
        		                        tt[12] = (pageheight - pageoffset - this_height) / 2;
        		                        tt[15] = "fitpage fitwidth";
    		                        } else {
    		                            tt[11] = '" style="margin:6px 0 4px';
    		                            tt[12] = tt[13] = "";
    		                            //tt[15] = "fitwidth";
    		                        }
        		                }
        		            }
        		        }
        		    } else { // constrain width
        		        if (thumbs[current][5] <= view_width) {
    		                tt[10] = thumbs[current][6];		                
            		        tt[15] = "fitpage fitwidth fullsize";
        		        } else {
        		            tt[9] = '.jpg" width="';
                            tt[8] = tt[10] = view_width;
                            tt[12] = parseInt((pageheight - pageoffset - (tt[10]/img_ratio)) / 2);
    		                tt[15] = "fitpage fitwidth";
    	                }
		            }
		        }
		        if (typeof tt[12] === "undefined") tt[12] = (pageheight - pageoffset - tt[10]) / 2;
		        
        		$("#i" + current).prepend(tt.join(""));
        	}
	    }
    });
}

function changesize() {
    pageheight = $(window).height();
    var z = 1010,
    v,
    w = [1240,1112,984,760];
	while (z > 0) {
        if (pageheight - pageoffset > z) {
            view_height = z;
            break;
        }
        z -= 45;
    }
    view_width = 760;
    pagewidth = $(window).width();
	for (v=0;v<4;v++) {
        if (pagewidth > w[v]) {
            view_width = w[v];
            break;
        }
    }
}

$("#g").bind("mousedown", function(e) { // Onclicks over gallery
	var f = $(e.target);
	var up = f.parent();
	f.get(0).focus();
	if (f.is("#g a.prev")) {
		imgnav("p");
		return false;
	} else if (f.is("#g a.next")) {
		imgnav("n");
		return false;
	} else if (up.is("a")){ // Thumbnail Click 
		imgnav(parseInt(up.attr("id").slice(1),10));
	} else { // Image drag
		var initmarginleft = parseInt(f.css("margin-left")),
		initmarginright = parseInt(f.css("margin-right")),
		initoffsetx = e.pageX,
		initoffsety = $(document).scrollTop() + e.clientY,
		limit = Math.floor(pagewidth/-2),
		oldoffset = 0;
		f.css("cursor","url(http://www.google.com/intl/en_ALL/mapfiles/closedhand.cur), -moz-grabbing");
		$(document).mousemove(function(e){
	        $(document).scrollTop(initoffsety - e.clientY);
	        
			var offsetx = initoffsetx - e.pageX;
	
			if ((initmarginleft-offsetx<limit && oldoffset>offsetx)	|| (initmarginright+offsetx<limit && oldoffset<offsetx)) {
				if (initmarginleft - offsetx>limit||initmarginright + offsetx>limit) {
					initoffsetx = e.pageX;
					offsetx = 0;
				}
				var marginright = parseInt(initmarginright + offsetx),
				marginleft = parseInt(initmarginleft - offsetx);
				f.css("margin", "6px " + marginright + "px 4px " + marginleft + "px");
			}
			oldoffset = offsetx;
			return false;
		});
	}
	return false;
}).mouseup(function(e){
	if ($(e.target).is("tt img")){
	$(document).unbind("mousemove");
	$(e.target).css("cursor","url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur), -moz-grab");}
}).mouseout(function(e){
	if ($(e.target).is("tt img")){
	$(document).unbind("mousemove");
	$(e.target).css("cursor","url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur), -moz-grab");}
});

	/*$("#skus img").mousedown(function(e){
		var initmarginleft = parseInt($(this).css("margin-left"));
		var initmarginright = parseInt($(this).css("margin-right"));
		var initoffsetx = e.pageX;
		$("#skus").css("cursor","-moz-grabbing");

		$(this).mousemove(function(e){
			var offsetx = initoffsetx - e.pageX;
			marginright = parseInt(initmarginright + offsetx);
			marginleft = parseInt(initmarginleft - offsetx);
			$(this).css("margin", "0 " + marginright + "px -2px " + marginleft + "px");
		});
		
	}).mouseout(ungrab).mouseup(ungrab);*/
	
$("#g, #cur, #g a.next, #g a.prev, #g tt img").bind("click", function(){$("#g").focus();return false;});
changesize();
$(function(){
    $(document).keydown(function(event){ // Keycodes - http://unixpapa.com/js/key.html 
    	//console.log("xxx");
        switch (event.keyCode) {
	  	case 37: // LEFT
	  		imgnav("p");
	  		break;
	  	case 39: // RIGHT
	  		imgnav("n");
	  		break;
	  	case 32: // BACKSPACE
	  		imgnav("n");
	  		return false;
	  		break;
	  	case 38: // UP
	  		if (fixpos === 0) {
	  			fixpos = $("#t" + cur).offset().left + ($("#t" + cur).width() / 2);
  			}
  			$("#t" + cur).prevAll("div").eq(1).nextAll("a").each(function (i) {
	  			var rightpoint = $(this).offset().left + parseInt($(this).css("width"),10);
	  			if (rightpoint > fixpos) {
	  				imgnav(parseInt($(this).attr("id").slice(1)),"fix");
	  				return false;
  				}
			});
  			return false;
  			break;
	  	case 40: // DOWN
	  		if (fixpos === 0) {
	  			fixpos = $("#t" + cur).offset().left + ($("#t" + cur).width() / 2);
  			}
	  		$("#t" + cur).nextAll("div").eq(0).nextAll("a").each(function (i) {
	  			var rightpoint = $(this).offset().left + parseInt($(this).css("width"),10);
	  			if (rightpoint > fixpos) {
	  				imgnav(parseInt($(this).attr("id").slice(1)),"fix");
	  				return false;
  				}
  			});
  			return false;
  			break;
  		case 8:
    	    history.go(-1);
    	    imgnav(parseInt(window.location.hash.slice(1),10),"noclose");
    	    return false;
            break;
        }
	});

	$(window).resize( function() {
	    clearTimeout(resizeTimer);
    	resizeTimer = setTimeout(function(){
    	    changesize();
    	    t(2);
    	}, 500);
	});
	
	end = $("#g > a").length;
	if (end > 100) t(1);
	else t();
	
	hashnav = function(){
	    var cur_hash = parseInt(window.location.hash.slice(1),10);
	    if (cur_hash !== cur && cur !== 0 && !isNaN(cur_hash)) imgnav(parseInt(window.location.hash.slice(1),10));
    }
	
	hashint = setInterval(hashnav,500);

});
				    
})();

/*diff = 1;
r = 0;
n = 0;
zoomscale = [1,2,4,8,16];
marginratiol = -0.5;
marginratior = -0.5;

$(function(){
	
	$(window).trigger('scroll');
	initimgheight = $('#grow').height();
	//$('#grow').removeAttr("width");
	
	$('#skus h6').each(function(){
		aa = "";
		$(this).find("a").each(function(){
				aa += '<img src="' + $(this).attr("href") + '" style="margin:0 -420px;display:none;" class="' + $(this).text().toLowerCase() + '" />';
		});		
		$(this).replaceWith(aa);
	});
	
	$("#zoom > div").slider({
		handle:"#slider",
		steps:2,
		startValue: 0,
		max: 0,
		min: 2,
		start: function (event, ui) {
			newtry = ($(window).height()/2) - $('#currentimg').offset().top;
			ratio = ( $(document).scrollTop() + ($(window).height()/2) - $('#currentimg').offset().top ) / (initimgheight*zoomscale[diff]);
			$("#slider").addClass("on");
		},
		
		stop: function (event, ui) {
			
			newh = zoomscale[ui.value] * initimgheight;
			
			if (ui.value != 0) {
				logmargin = "0 " + ((zoomscale[ui.value]*840*marginratiol) - 1) + "px -2px " + ((zoomscale[ui.value]*840*marginratior) - 1) + "px";
				$('#grow').css({display:"none"});
				$('.full').css({
					display:"inline",
					height: newh,
					margin: logmargin
				});
				console.log(logmargin);
			} else {
				$('.full').css({display:"none"});
				$('#grow').css({
					display:"inline",
					height: newh,
					margin: "0 " + ((zoomscale[ui.value]*1680*marginratiol) - 1) + "px -2px " + ((zoomscale[ui.value]*1680*marginratior) - 1) + "px"
				});
			}

			x=0;
			$(document).scrollTop((ratio * newh) - newtry);
			
			$("#in").unbind().click(function (){
				$("#zoom > div").slider("moveTo", "+=1", 0);
				return false;
			}).removeClass();
			$("#out").unbind().click(function(){
				$("#zoom > div").slider("moveTo", "-=1", 0);
				return false;
			}).removeClass();
			
			if (ui.value == 0) {
				$("#out").unbind().click(function(){ return false; }).addClass("disabled");
			} else if (ui.value == 2) {
				$("#in").unbind().click(function(){ return false; }).addClass("disabled");
			}
				
			try {window.clearTimeout(v)} catch (ex){}
			v = window.setTimeout('$("#slider").removeClass();',500);
			
			diff=ui.value;
		}
	});
	
	$("#zoom > div").slider( "moveTo", 0.1, 0 );
	
	$(document).mousedown(function(e){
		var initoffsety = $(this).scrollTop() + e.clientY;
		$("#skus").css("cursor","-moz-grabbing");
		$(this).mousemove(function(e){
			startscroll();
			$(document).scrollTop(initoffsety - e.clientY);
			return false;
		});
		return false;
	}).mouseup(function(){
		$("#skus").css("cursor","-moz-grab");
		$(this).unbind("mousemove");
	});
	
	$("#skus img").mousedown(function(e){
		var initmarginleft = parseInt($(this).css("margin-left"));
		var initmarginright = parseInt($(this).css("margin-right"));
		var initoffsetx = e.pageX;
		$("#skus").css("cursor","-moz-grabbing");

		$(this).mousemove(function(e){
			var offsetx = initoffsetx - e.pageX;
			marginright = parseInt(initmarginright + offsetx);
			marginleft = parseInt(initmarginleft - offsetx);
			$(this).css("margin", "0 " + marginright + "px -2px " + marginleft + "px");
		});
		
	}).mouseout(ungrab).mouseup(ungrab);
	
});

ungrab = function (){
		//marginratiol = marginright/($(this).width()-2);
		//marginratior = marginleft/($(this).width()-2);
		$(this).unbind("mousemove");
}

startscroll = function (){
	$('tt').hide();
	try {window.clearTimeout(y)} catch (ex){}
	y = window.setTimeout("repos();",999);
	return false;
};

$(window).load(function () {
$('.mini').hide();
});

$(window).scroll(startscroll);

function repos() {
	
	var wintop = $(document).scrollTop();
	var winbottom = wintop + $(window).height();
	
	$('.sku').each(function(){
		
		var imgtop = $(this).offset().top;
		var imgbottom = imgtop + $(this).height();
		var buy = $(this).find("tt");
		
		if (imgbottom - 245 > wintop && imgtop + 220 < winbottom) {
			if (imgbottom < winbottom) {
				buy.css({position:"absolute", bottom:"40px", top:""}); 
			} else {
				buy.css({position:"fixed", bottom:"40px", top:""});
			}
			buy.show();
		} else {
			buy.hide();
		}
	});
}*/