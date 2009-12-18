var t;
(function () {

var galwidth,end,
border = 0,
spacing = 6,
pageoffset = 118,
view_offset = 23,
cur = 0,
fixpos = 0,
tally = 0,
view_height,
zoom = "fitpage",
thumbs = [undefined],
c = document.cookie.split(";")[0].split("=")[1],
resizeTimer = null,
loop = null,
backto = null,
pageheight = $(window).height();

if (typeof c !== "undefined") {
	$('html').addClass(c);
	spacing = parseInt(c.slice(-2),10);
	cookie_border = parseInt(c.slice(-4,-2),10);
	if (!isNaN(cookie_border)) border = cookie_border;
} else {
	$('html').addClass("default");
}

$("ol a").mousedown(function(){
	if ($(this).parent().is("span")) {
	    themepicker($(this).attr("id").replace("-"," "));
    } else if ($(this).is("#hiderows")) {
        $(this).attr("id","showrows").text("Show Row");
        $("#g tt").empty();
        pageoffset = 28;
        view_height = view_height + 90;
        view_offset = -47;
        imgnav(cur,"noclose");
    } else if ($(this).is("#showrows")) {
        $(this).attr("id","hiderows").text("Hide Row");
        $("#g tt").empty();
        pageoffset = 118;
        view_height = view_height - 90;
        view_offset = 23;
        imgnav(cur,"noclose");
    } else {
    	zoom = $(this).attr("id");
    	$("#g").attr("class",zoom);
    	addtt([0,1,-1]);
    }
	return false;
});

$("ol a").click(function(){return false;});

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
	document.cookie =
  'theme=' + theme + '; expires=Tue, 31 Dec 2019 23:59:59 UTC; path=/';
}

t = function(mode) {
	clearTimeout(loop);
	clearTimeout(resizeTimer);
	var a,b,r,i,expand,tempimg,imgsdiv,
	x = 1,
	fullrow = [],
	row = [],
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
			if (thumbs[x][2] > 70) row.push(tempimg);
			if ( tally + ((fullrow.length-1)*spacing/4) > galwidth || (x === end-1 && mode !== 0)) {
				if (x !== end - 1 || mode === 0) { // <-- skip aligning for last row
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
				break;
			}
			if (x%100 === 0) {
				clearTimeout(resizeTimer);
				loop = setTimeout(looper, 5);
				break;
			}
		}
	};
	
	if (mode === 0) { end = 101; }
	else if (mode === 1) { x = 101; }
	else if (mode === 2) {
		$("#g div").remove(); // Reset styles on resize
		tally = 0;
	}

	galwidth = $('#g').width() - spacing + 1;
    //if (hashid && hashid !== "closed") frag = cur = hashid;
	//else frag = 9999;
	looper();
};

function imgnav(imgid_direction, mode) {
	var th,tt;
	if (mode !== "fix") fixpos = 0;
	$('#t' + cur).removeClass();
	$('#i' + cur).hide();
	$('#i' + cur).parent().hide();

	if (typeof imgid_direction === "number") {
		if (cur === imgid_direction && mode !== "noclose") {
			cur = 0;
			window.location.hash = cur;
            return false;
		}
		cur = imgid_direction;		
	    addtt([0,1,-1,2,3,-2,4,5,-3,6,7,-7]);
	} else if (imgid_direction === "n" && cur !== end-1) {
		cur++;
		addtt([0,1,-1,2,3,-2,4,5,-3,6,7,-7]);
	} else if (imgid_direction === "p" && cur !== 1) {
		cur--;
		addtt([0,1,-1,2,3,-2,4,5,-3,6,7,-7]);
	}
	
	tt = $('#i' + cur);
	th = $('#t' + cur);
	
	th.addClass("cur");

	$("#cur").text(thumbs[cur][3]);
	tt.show();
	tt.parent().show();

	$('html,body').scrollTop(th.offset().top-view_offset);

	document.title = "IC:/Sports Logos/A to F/" + thumbs[cur][3];
	window.location.hash = cur;
}

function addtt(imgs) {
    $.each(imgs,function(i,x){
        var current = cur + x;
        if (thumbs[current] !== undefined) {
            var tt = [];
    	    if (!$("#i" + current).children().is("img")) {
        		var imghref = $(thumbs[current][1]).attr("href");
        		thumbs[current][3] = $("img",thumbs[current][1]).attr("alt");
        		thumbs[current][4] = $("img",thumbs[current][1]).attr("longdesc");
        		thumbs[current][5] = parseInt(imghref.slice(-8,-4),10);  // width
        		thumbs[current][6] = parseInt(imghref.slice(-4),10);  // height

        		var loading = [];
        		loading[0] = '<h5 style="margin:';
        	    loading[1] = (pageheight - pageoffset) / 2 - 23;
        		loading[2] = 'px 0 -';
        		loading[3] = (pageheight - pageoffset) / 2;
        		loading[4] = 'px 0">&nbsp;&nbsp;Loading...</h5>';
        		$("#i" + current).append(loading.join(""));
        		
        		tt[17] = '<p>Sample description for an image.</p>';
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
    		    tt[16]= '"/>';
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
		                tt[11] = '" style="margin:6px 0 4px';
    		            tt[12] = tt[13] = "";
		                tt[15] = "fullsize";
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
        		                    tt[10] = view_width;
        		                    tt[15] = "fitwidth";
        		                    if (this_height < view_height) {
        		                        tt[12] = (pageheight - pageoffset - this_height) / 2;
        		                        tt[15] = "fitpage fitwidth";
    		                        } else {
    		                            tt[11] = '" style="margin:6px 0 4px';
    		                            tt[12] = tt[13] = "";
    		                            tt[15] = "fitwidth";
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
		        
		        
        		//console.log(tt.join(""));
        		$("h5", "#i" + current).after(tt.join(""));
        	}
	    }
    });
}

function navexpand() {
	if (backto) clearTimeout(backto);
	backto = setTimeout(function(){
		$("#g h4").css("height","100%");
	},999);
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
    pagewidth = $(window).width();
	for (v=0;v<4;v++) {
        if (pagewidth > w[v]) {
            view_width = w[v];
            break;
        }
    }
    //console.log(view_width);
}

$("#g").bind("mousedown", function(e) { // Onclicks over gallery
	var target = $(e.target).parent();
	if ($(e.target).is("#g a.prev")) {
		$("#g a.prev").css("height","560px");
		navexpand();
		imgnav("p");
		return false;
	}
	else if ($(e.target).is("#g a.next")) {
		$("#g a.next").css("height","560px");
		navexpand();
		imgnav("n");
		return false;
	}
	else if (target.is("a")) { // Thumbnail Click 
		imgnav(parseInt($(target).attr("id").slice(1),10));
	}
	$(document).focus();
});
	
$("#g, #cur, #g a.next, #g a.prev").bind("click", function(){$("#g").focus();return false;});
changesize();

$(function(){
    $(document).keydown(function(event){ // Keycodes - http://unixpapa.com/js/key.html  
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
	
	setInterval(function(){
	    var cur_hash = parseInt(window.location.hash.slice(1),10);
	    if (cur_hash !== cur && cur !== -1 && !isNaN(cur_hash)) imgnav(parseInt(window.location.hash.slice(1),10));
	}, 500);
	
});
				    
})();