 //Hokusai.js-1.2.0
//アップロード前にjsonの呼び元を変更すること

//2013 HITOKUSE Inc. All Rights Reserved.

//グローバル変数==============================================
var canvas = new fabric.Canvas('canvasspace');
var objectData =new Array();
var caimageview=new Array();
var animationData = new Array();
var animationStatus = new Array(); //0:アニメーションしていない 1:アニメーション中 2:アニメーション終了済み
var preloadedImages = new Array();
var currentpid=0;
var clicking=0;
var hit=0;
var ratio = 1;
var retina = window.devicePixelRatio > 1;  //Retinaのときにtrue Retinaでないときにfalse
var didLaunch = 0;
var animationing=0;

//初期化メソッド============================================================================================================================================

url = 'dev.json';

function preloadImage(){
//console.log(preloadedImages);

	for(var i=0;i<objectData.length;i++){
	  var data=objectData[i].data;
//	  console.log("preloaded1");
	  for(var j=0;j<data.length;j++){
		  if(data[j].type=="SCImageView"){
	//	    console.log("preloaded2");
		    var count=0;
			  	for(var k=0;k<preloadedImages.length;k++){
				  	if(preloadedImages[k]==data[j].src){
				  		count++;
				  	}
				  }
				if(count==0){
		//		console.log("preloaded3");
					var img = new Image();
					img.src = data[j].src;
					var dsrc = data[j].src;
					preloadedImages.push(dsrc);
    	    img.onload = function(){
    	//    console.log("preloaded");
//    	      preloadedImages.push(dsrc);  
  	   		}
	  	  }

					
				}
		 }
	}
}


// getパラメータ取得
function getRequest(){
    var url = window.location;
    var get = new Object();
    var ret = String(url.pathname).split("/");
    for(var i = 0; i < ret.length; i++) {
        get[i] = ret[i];
    }
    return get;
}
var get = getRequest();

//JSON読み込み
$.getJSON(url, function(data){
	initApp();
//	var tmpobjectData = data.slice(0); //arrayをクローン
  if(isArray(data)) {
  	objectData = data.slice(0); //arrayをクローン
	  currentpid=getMinPid();
  }else{
    var tmpobjectData = JSON.parse(JSON.stringify(data)); //arrayをクローン
    
	  objectData = tmpobjectData['objectData'];
	  currentpid = tmpobjectData['startPage'];
	}
	makePage();
});

function initApp(){
	canvas.selection = false; //グループ選択を解除
	setInterval(function(){timer()},10); //タイマー関数の発動

	//Retinaの設定
	if (retina)
	{
	    ratio = 2;
	    if (navigator.userAgent.indexOf('iPhone') <= 0 && navigator.userAgent.indexOf('Android') <= 0 ) {
		    document.body.style.zoom="50%";
		}
	    var viewportmeta = document.querySelector('meta[name="viewport"]');
	    if (viewportmeta) {
	        viewportmeta.content = 'width=device-width, minimum-scale=0.5, maximum-scale=0.5, initial-scale=0.5';
	    }
	}
}

//ページを描画
function makePage(){
	animationStatus = new Array();
	animationData = new Array();
	for(var i=0;i<objectData.length;i++){
		if(objectData[i].pid==currentpid){
		  	if(objectData[i].animation.length>0){
		  		animationData=objectData[i].animation.slice(0);
		  	}
		  	canvas.setHeight(objectData[i].height*ratio);
		  	canvas.setWidth(objectData[i].width*ratio);
		  	$("#EventCatcher").css( "width", objectData[i].width*ratio);
		  	$("#EventCatcher").css( "height", objectData[i].height*ratio);
		  	$("#EventCatcher").css( "-webkit-tap-highlight-color", "transparent");
		  	console.log(randomFilter(objectData[i]));
		  	makeObjects(randomFilter(objectData[i]).data.slice(0));
		}
    }
	for(var i=0;i<animationData.length;i++){
		animationStatus[animationData[i].aniid]=0;
    }
}

//オブジェクト生成==========================================================================================================================================



function makeObjects(arr){
	canvas.clear();
    SCimageview=[];
	//それぞれのオブジェクト配列の生成
	for(var i=0;i<arr.length;i++){
		if(arr[i].type=="SCImageView"){
			SCimageview.push(arr[i]);
		}
	}
		makeSCImageView( arr,SCimageview, imageLoaded );
		makeSCView(arr);
		makeSCLabel(arr);
		//makeSCNumber(arr);
		setLayers();
}

function makeSCView(arr){
	for(var i=0;i<arr.length;i++){
		if(arr[i].type=="SCView"){
			var newview = new SCView({
			  id:arr[i].id,
			  left: calcLeft(arr[i].x,arr[i].width),
			  top: calcTop(arr[i].y,arr[i].height),
			  rx:arr[i].rx*ratio,
			  ry:arr[i].ry*ratio,
			  width:arr[i].width*ratio,
			  height:arr[i].height*ratio,
			  opacity:parseFloat(arr[i].opacity),
			  fill: arr[i].backgroundColor,
			  angle: arr[i].angle,
			  href: arr[i].href,
			  zindex:arr[i].zindex
			});	
			newview.hasControls=false;
			newview.lockMovementX = true;
			newview.lockMovementY = true;
			canvas.add(newview);
		}// end of arr[i].type=="SCView"		
	}
}


function makeSCTimer(arr){
	for(var i=0;i<arr.length;i++){
		if(arr[i].type=="SCTimer"){
			var newtimer = new SCTimer({
			  id:arr[i].id,
			  left: calcLeft(arr[i].x,arr[i].width),
			  top: calcTop(arr[i].y,arr[i].height),
			  rx:arr[i].rx*ratio,
			  ry:arr[i].ry*ratio,
			  width:arr[i].width*ratio,
			  height:arr[i].height*ratio,
			  opacity:parseFloat(arr[i].opacity),
			  fill: arr[i].backgroundColor,
			  angle: arr[i].angle,
			  href: arr[i].href,
			  zindex:arr[i].zindex
			});	
			newview.hasControls=false;
			newview.lockMovementX = true;
			newview.lockMovementY = true;
			canvas.add(newview);
		}// end of arr[i].type=="SCView"		
	}
}

function makeSCLabel(arr){
	for(var i=0;i<arr.length;i++){
		//SCLabelの描画
		var newtext = arr[i].text;
		if(arr[i].textwithline!=null){
			newtext = arr[i].textwithline;
		}
		
		if(arr[i].type=="SCLabel"){			
			var newlabel = new SCLabel(newtext,{
			  id:arr[i].id,
			  left: calcLeft(arr[i].x,arr[i].width),
			  top: calcTop(arr[i].y,arr[i].height)-arr[i].fontSize*ratio+5,
			  opacity:parseFloat(arr[i].opacity),
			  fontSize: arr[i].fontSize*ratio,
			  fontFamily: arr[i].fontFamily,
			  fontStyle: arr[i].fontStyle,
			  fill: arr[i].fontColor,
			  textShadow:arr[i].textShadow,
			  textAlign:arr[i].textAlign,
			  textBackgroundColor:arr[i].backgroundColor,
			  strokeWidth:arr[i].strokeWidth,
			  strokeStyle: arr[i].strokeStyle,
			  angle: arr[i].angle,
			  href: arr[i].href,
			  zindex:arr[i].zindex
			});	
			newlabel.hasControls=false;
			newlabel.lockMovementX = true;
			newlabel.lockMovementY = true;
			newlabel.set('top',newlabel.top+(arr[i].fontSize-5)*ratio);
			canvas.add(newlabel);
		}//end of arr[i].type=="SCLabel"
	}
}

//ロード終了まで待ってからSCImageViewを描画
function makeSCImageView(oriarr,arr, callBack){
	var count = 0;
 	var img = [];
 	for(var i in arr ){
	    img[i] = new Image();
	    img[i].src = arr[i].src;
	    img[i].id=i;
	    img[i].onload = function(){
	    count++;
	    arr[this.id].aspect = this.height/this.width;
	    	if(count == arr.length){
	    		callBack(img,arr,oriarr);
	   		}
	  	}
	}
} 
//ロード終了後のSCImageVIew描画
function imageLoaded(img,arr,oriarr){
	for(var i=0;i<img.length;i++){
		var newimageview = new SCImageView(img[i],{
		 	id:arr[i].id,
			left: calcLeft(arr[i].x,arr[i].width),
			top: calcTop(arr[i].y,arr[i].height),
			width:calcWidthByAspect(arr[i].isaspect,arr[i].aspect,arr[i].width,arr[i].height),
			height:calcHeightByAspect(arr[i].isaspect,arr[i].aspect,arr[i].width,arr[i].height),
			opacity:parseFloat(arr[i].opacity),
			angle: arr[i].angle,
			href: arr[i].href,
			zindex:arr[i].zindex,
			shadow:arr[i].shadow,
			rx:arr[i].rx*ratio,
			ry:arr[i].ry*ratio,
			isaspect:arr[i].isaspect
		});	
		newimageview.hasControls=false;
		newimageview.lockMovementX = true;
		newimageview.lockMovementY = true;
		canvas.add(newimageview);
	}
	setLayers();
	preloadImage();
}

//イベント=========================================================================================================================================
//イベントキャッチ========================================================================================================================
//追加時
canvas.on('object:added', function(e) {
  //アニメーション
  var obj = e.target;
  if(getAniidByAddedId(obj.id)!=null){
	  startAnimation(getAniidByAddedId(obj.id));
  }
});

//タッチイベントのキャッチ
$(document).ready(function(){
$("#EventCatcher").bind('touchstart', function(e){
		var objarr=canvas._objects;
		didLaunch=0;
	  	for(var i=objarr.length-1;i>-1;i--){
		  	if(event.pageX>objarr[i].left-objarr[i].width/2 && event.pageX<objarr[i].left+objarr[i].width/2 && event.pageY>objarr[i].top-objarr[i].height/2 && event.pageY<objarr[i].top+objarr[i].height/2 && didLaunch==0){   
		  		SelectedEvent(objarr[i]);
			}				  	
		}
});


$("#EventCatcher").bind('click', function(e){
   if (navigator.userAgent.indexOf('Android') > 0) {
		var objarr=canvas._objects;
		didLaunch=0;
	  	for(var i=objarr.length-1;i>-1;i--){
		  	if(event.pageX>objarr[i].left-objarr[i].width/2 && event.pageX<objarr[i].left+objarr[i].width/2 && event.pageY>objarr[i].top-objarr[i].height/2 && event.pageY<objarr[i].top+objarr[i].height/2 && didLaunch==0){   
		  		SelectedEvent(objarr[i]);
			}				  	
		}
	}
});

$("#EventCatcher").mousedown(function(event){
   if (navigator.userAgent.indexOf('iPhone') <= 0 && navigator.userAgent.indexOf('Android') <= 0 ) {
		var objarr=canvas._objects;
		didLaunch=0;
	  	for(var i=objarr.length-1;i>-1;i--){
		  	if(event.pageX*ratio>objarr[i].left-objarr[i].width/2 && event.pageX*ratio<objarr[i].left+objarr[i].width/2 && event.pageY*ratio>objarr[i].top-objarr[i].height/2 && event.pageY*ratio<objarr[i].top+objarr[i].height/2 && didLaunch==0){   
		  		SelectedEvent(objarr[i]);
			}				  	
			console.log(event.pageX+"+"+objarr[i].left+"+"+objarr[i].width);
		}
		
	}
});
});

//タッチの実行
function SelectedEvent(obj) {
	console.log("selected");
    var link=obj.href;
    if(link!=''){
  		clicking=0;
  		//別URLへのリンク
  	if(link.indexOf("http")==0){
  	  var hrefarr = obj.href.split("*");
  	  if(hrefarr[1]=="new"){
  	  	var w=window.open();
		    w.location.href=hrefarr[0];	  	  
  	  }else{
		    location.href=obj.href;	
		/*var w=window.open();
		    w.location.href=hrefarr[0];	   	*/  
  	  }
		  didLaunch=1;
  	}else{
  	    //別ページへの移動
	  	currentpid=parseInt(obj.href);
	  	makePage(); 
	  	didLaunch=1;
    }
}
  	//アニメーション
    if(getAniidBySelectedId(obj.id)!=null && animationStatus[getAniidBySelectedId(obj.id)]==0){
  		startAnimation(getAniidBySelectedId(obj.id));
  		didLaunch=1;
  	}		
};

//アニメーションツール===============================================================================================================================================
//アニメーションの実行
function startAnimation(aniid){
	//アニメーション
	var ani=getAnimationById(aniid);
	var targetstr=ani.target;
	var obj=getObjectById(targetstr);
	var selem=ani.element;
	var sval=obj[ani.element];
	var tmpvalue=ani.value;

	if(ani.element=="pageNum"){
			currentpid=parseInt(ani.value);
	  	makePage(); 
	} 

	if(ani.element!="angle" && ani.element!="opacity"){
		if(ani.value.substring(0, 1)!='='){
			var inttmpvalue=parseInt(tmpvalue);
			if(ani.element=="left"){inttmpvalue+=obj.width/(2*ratio);}
			if(ani.element=="top"){inttmpvalue+=obj.height/(2*ratio);}
			tmpvalue=(inttmpvalue*ratio).toString();
			console.log(tmpvalue);
		}else{
			var cal=ani.value.substring(2)*ratio;
			tmpvalue=ani.value.substring(0,2)+cal;
		}
	}
	
	obj.animate(ani.element, tmpvalue, {
		//アニメーション中はanimationStatusを1に
  		onChange: function(value) {
  			if(animationing==0){animationing=1;}
  			animationStatus[ani.aniid]=1;
  		},
		//アニメーション終了後はanimationStatusを2に
		onComplete: function() {
			canvas.renderAll();
			animationing=0;
			animationStatus[ani.aniid]=2;
			if(ani.repeat>0){
				var tmpani=JSON.parse(JSON.stringify(ani)); //aniの中身をコピー
				tmpani.repeat=ani.repeat*2-1;
				repeatAnimation(obj,tmpani,selem,sval);
			}
		},
		easing: fabric.util.ease[ani.easing],
		duration: ani.duration
	});
}

function repeatAnimation(obj,ani,selem,sval){
	if(ani.value.substring(0, 1)!='='){
		//値を直接指定のとき
		var ssval=obj[selem];
		if(ani.element=="left"){ssvalue+=obj.width/(2*ratio);}
		if(ani.element=="top"){ssvalue+=obj.height/(2*ratio);}
		if(ani.element!="angle" && ani.element!="opacity"){sval=sval*ratio}
		obj.animate(selem, sval, {
			onChange: function(value) {
  				if(animationing==0)animationing=1;
  			},
			onComplete: function() {
				canvas.renderAll();
				animationing=0;
				ani.value=ssval.toString();
				ani.repeat-=1;
				if(ani.repeat>0)repeatAnimation(obj,ani,selem,ssval);
			},
			easing: fabric.util.ease[ani.easing],
			duration: ani.duration
		});		
	}else{
		//'=+'が入ってた時
		var newval='';
		var nextval='';
		if(ani.value.substring(1, 2)=='-'){
			newval+='=+';
			nextval+='=+';
			var tmpvalue=ani.value.substring(2);
			if(ani.element!="angle" && ani.element!="opacity"){tmpvalue=tmpvalue*ratio;}
			newval+=tmpvalue;
		}else if(ani.value.substring(1, 2)=='+'){
			newval+='=-';
			nextval+='=-';
			var tmpvalue=ani.value.substring(2);
			if(ani.element!="angle" && ani.element!="opacity"){tmpvalue=tmpvalue*ratio;}
			newval+=tmpvalue;		
		}
		nextval+=ani.value.substring(2);
		obj.animate(ani.element, newval, {
			//アニメーション終了後はanimationStatusを2に
			onChange: function(value) {
  				if(animationing==0)animationing=1;
  			},
			onComplete: function() {
				canvas.renderAll();
				animationing=0;
				ani.value=nextval;
				ani.repeat-=1;
				if(ani.repeat>0)repeatAnimation(obj,ani,selem,nextval);
			},
			easing: fabric.util.ease[ani.easing],
			duration: ani.duration
		});
	}
}

//タイマー関数=============================================================================================================================================================
function timer()
{
	var arr=animationData.slice(0);

	//アニメーションのレンダリング
	if(animationing==1){
		canvas.renderAll();
	}
		
	//アニメーションチェック
	for(var i=0;i<arr.length;i++){
		var trigger=arr[i].trigger;
		var trgarr=trigger.split(":");
		if(animationStatus[arr[i].aniid]==0){
			//アニメーション終了判定
			if(trgarr[0]=="ended" && animationStatus[trgarr[1]]==2){
				startAnimation(arr[i].aniid);
			}
			//アニメーションスタート判定
			if(trgarr[0]=="sync" && animationStatus[trgarr[1]]==1){
				startAnimation(arr[i].aniid);
			}
			//当たり判定
			if(trgarr[0]=="hit" && isHitObjectsById(trgarr[1],trgarr[2])==true){
				startAnimation(arr[i].aniid);
			}
		}
	}
	for(var i=0;i<arr.length;i++){
		if(animationStatus[arr[i].aniid]==2)animationStatus[arr[i].aniid]=0
	}
}

//ツール============================================================================================================================================
//レイヤーを整列
function setLayers(){
	var arr=canvas._objects;
	for(var i=arr.length-1;i>0;i--){
	  for(var j=0;j<i;j++){
		 if(arr[j].zindex>arr[j+1].zindex){
			canvas.sendToBack(canvas._objects[j+1]);
		 }
	   }
	}
}

//取得系ツール============================================================================================================================================
//idからオブジェクトを取得
function getObjectById(id){
	var arr=canvas._objects;
	for(var i=0;i<arr.length;i++){
		if(arr[i].id==id){
			return arr[i];
		}
	}
	return null;
}

//aniidからアニメーションを取得
function getAnimationById(aniid){
	var arr=animationData;
	for(var i=0;i<arr.length;i++){
		if(arr[i].aniid==aniid){
			return arr[i];
		}
	}
	return null;
}

//idからアニメーションを取得 SELECTED
function getAniidBySelectedId(id){
	var arr=animationData;
	for(var i=0;i<arr.length;i++){
		var trigger=arr[i].trigger;
		var trgarr=trigger.split(":");
		if(trgarr[0]=="selected" && trgarr[1]==id && animationStatus[arr[i].aniid]==trgarr[2]){
			return arr[i].aniid;
		}
	}
	
	for(var i=0;i<arr.length;i++){
		var trigger=arr[i].trigger;
		var trgarr=trigger.split(":");
		if(trgarr[0]=="selected" && trgarr[1]==id){
			return arr[i].aniid;
		}
	}
	return null;
}

//aniidからアニメーションを取得 ADDED
function getAniidByAddedId(id){
	var arr=animationData;
	for(var i=0;i<arr.length;i++){
		var trigger=arr[i].trigger;
		var trgarr=trigger.split(":");
		if(trgarr[0]=="added" && trgarr[1]==id){
			return arr[i].aniid;
		}
	}
	return null;
}

//２つのオブジェクトがぶつかっているかを確認
function isHitObjectsById(sid,did){
	var arr=canvas._objects;
	var sobj=getObjectById(sid);
	var dobj=getObjectById(did);
	if(sobj.left+sobj.width/2>dobj.left-dobj.width/2 && sobj.left-sobj.width/2 < dobj.left+dobj.width/2 &&
	sobj.top+sobj.height/2>dobj.top-dobj.height/2 && sobj.top-sobj.height/2 < dobj.top+dobj.height/2){
		return true;
	}
	return false;
}

//一番小さいページ番号を取得
function getMinPid(){
	var minpid=1000;
	for(var i=0;i<objectData.length;i++){
		if(minpid > objectData[i].pid){
			minpid=objectData[i].pid;
		}
    }
    return minpid;
}

//計算系ツール============================================================================================================================================
function calcLeft(left,width){
	return (left+width/2)*ratio;
}

function calcTop(top,height){
	return (top+height/2)*ratio;
}

function calcWidthByAspect(isaspect,aspect,width,height){
	var iwidth=width;
	var iheight=height;
	var tmpaspect = height/width;
	if(isaspect==1 && aspect<tmpaspect){
		iheight=iwidth*aspect;
	}
	if(isaspect==1 && aspect>tmpaspect){
		iwidth=iheight/aspect;
	}
	return iwidth*ratio;
}

function calcHeightByAspect(isaspect,aspect,width,height){
	var iwidth=width;
	var iheight=height;
	var tmpaspect = height/width;
	if(isaspect==1 && aspect<tmpaspect){
		iheight=iwidth*aspect;
	}
	if(isaspect==1 && aspect>tmpaspect){
		iwidth=iheight/aspect;
	}
	return iheight*ratio;
}

function isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
}

function randomFilter(arr){
	 var arrstr=JSON.stringify(arr);
	 var tmpstr=JSON.stringify(arr);
	 var qualityRegex = /"rand\([0-9,]*\)"/g,matches;
		while (matches = qualityRegex.exec(tmpstr)) {
		console.log(matches[0]);
			var reg = /[0-9]+,[0-9]+,[0-9]+/g
			randstr = reg.exec(matches[0]);
			randarr = randstr[0].split(",");
			value = Math.floor((Math.random()*randarr[1])+randarr[0]);
			arrstr = arrstr.replace(matches[0],value);
		}
	 return JSON.parse(arrstr);
}

//クラス宣言==============================================================================================================================================
var SCView = fabric.util.createClass(fabric.Rect, {
	initialize: function(options) {
	    options || (options = { });
	    this.callSuper('initialize', options);
	    this.set('pageid', options.pageid || -1);
	    this.set('zindex', options.zindex || -1);
	    this.set('href', options.href || '');
		this.set('animation', options.animation || '');
	}
});

var SCImageView = fabric.util.createClass(fabric.Image, {
	initialize: function(element,options){
		this.callSuper('initialize',element,options);
	    this.set('pageid', options.pageid || -1);
	    this.set('zindex', options.zindex || -1);
	    this.set('href', options.href || '');
	    this.set('animation', options.animation || '');
	    this.set('isaspect', options.isaspect || 1);
	    this.set('aspect', options.isaspect || 1);
   　}
});

var SCLabel = fabric.util.createClass(fabric.Text, {
	initialize: function(element,options){
		this.callSuper('initialize',element,options);
	    this.set('pageid', options.pageid || -1);
	    this.set('zindex', options.zindex || -1);
	    this.set('href', options.href || '');
	    this.set('animation', options.animation || '');
	    this.set('textAlign', options.textAlign || 'left');
	    this.set('fontFamily', options.fontFamily || 'times,serif');
	}
});

var SCNumber = fabric.util.createClass({
	 initialize: function(begin,step) {
	    this.begin = begin || 0;
	    this.step = step || 1;
	 },
	 toString: function() {
	    return this.begin + '/' + this.step;
	 }
});

var SCTimer = fabric.util.createClass({
	 initialize: function(begin,step) {
	    this.begin = begin || 0;
	    this.step = step || 1;
	    this.running = running || 0;
	 }
});

