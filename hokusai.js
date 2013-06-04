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

//グローバル変数==============================================
var canvas = new fabric.Canvas('canvasspace');
var objectData =new Array();
var caimageview=new Array();
var animationData = new Array();
var animationStatus = new Array(); //0:アニメーションしていない 1:アニメーション中 2:アニメーション終了済み
var currentPageNum=0;
var clicking=0;
var hit=0;
canvas.selection = false; //グループ選択を解除

setInterval(function(){timer()},10); //タイマー関数の発動
var animationing=0;

//JSON読み込み============================================================================================================================================
var url = 'sample.json';
//var url = "http://smartcanvas.net/appdata/user" + get[2] + "/apps" + get[4] + "/json/dev.json";

$.getJSON(url, function(data){
	  //objectData = JSON.parse(localStorage.JSON).slice(0);	//オブジェクトデータをグローバル変数に
	  objectData = data;
	  console.log(objectData);
	  makePage();
});

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
			    this.set('isaspect', options.animation || 0);
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
			    this.set('fontFamily', options.fontFamily || 'Hoefler Text');
	    		}
});

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
	makeSCImageView( SCimageview, imageLoaded );
	
	//SCViewの描画
	for(var i=0;i<arr.length;i++){
		if(arr[i].type=="SCView"){
			var newview = new SCView({
			  id:arr[i].id,
			  left: arr[i].x+arr[i].width/2,
			  top: arr[i].y+arr[i].height/2,
			  rx:arr[i].rx,
			  ry:arr[i].ry,
			  width:arr[i].width,
			  height:arr[i].height,
			  opacity:parseFloat(arr[i].opacity),
			  fill: arr[i].backgroundColor,
			  angle: arr[i].angle,
			  href: arr[i].href,
			  zindex:arr[i].zindex,
			  animation:arr[i].animation
			});	
			newview.hasControls=false;
			newview.lockMovementX = true;
			newview.lockMovementY = true;
			canvas.add(newview);
		}// end of arr[i].type=="SCView"
		//SCLabelの描画
		if(arr[i].type=="SCLabel"){
			var labelwidth=10000;
			if(arr[i].width){
				labelwidth=arr[i].width;
			}
			
			var newlabel = new SCLabel(arr[i].text,{
			  id:arr[i].id,
			  left: arr[i].x,
			  top: arr[i].y+arr[i].height/2,
			  opacity:parseFloat(arr[i].opacity),
			  fontSize: arr[i].fontSize,
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
			  zindex:arr[i].zindex,
			  animation:arr[i].animation
			 });	
			canvas.add(splitText(newlabel,labelwidth));
		}//end of arr[i].type=="SCLabel"
	}//end of for(var i=0;i<arr.length;i++)
	setLayers();
}

//ロード終了まで待ってからSCImageViewを描画
function makeSCImageView(arr, callBack){
var count = 0;
 var img = [];
 for(var i in arr ){
  img[i] = new Image();
  img[i].src = arr[i].src;
  arr[i].aspect = img[i].height/img[i].width;
			console.log("aspect"+arr[i].isaspect+"+"+arr[i].aspect);

  img[i].onload = function(){
   count++;
   if(count == arr.length){
    callBack(img,arr);
   }
  }
 }
} 
//ロード終了後のSCImageVIew描画
function imageLoaded(img,arr){

	for(var i=0;i<img.length;i++){
			var iwidth=arr[i].width;
			var iheight=arr[i].height;
			var tmpaspect = iheight/iwidth;
			if(arr[i].isaspect==1 && arr[i].aspect<tmpaspect){
				iheight=iwidth*arr[i].aspect;
			}
			if(arr[i].isaspect==1 && arr[i].aspect>tmpaspect){
				iwidth=iheight/arr[i].aspect;
			}
			console.log("aspect"+arr[i].isaspect+"+"+arr[i].aspect+"+"+iwidth+"+"+iheight);
			
			var newimageview = new SCImageView(img[i],{
			  	  id:arr[i].id,
				  left: arr[i].x+iwidth/2,
				  top: arr[i].y+iheight/2,
				  width:iwidth,
				  height:iheight,
				  opacity:parseFloat(arr[i].opacity),
				  angle: arr[i].angle,
				  href: arr[i].href,
				  zindex:arr[i].zindex,
				  shadow:arr[i].shadow,
				  rx:arr[i].rx,
				  ry:arr[i].ry,
				  animation:arr[i].animation
			});	
			console.log(arr[i].href);
			newimageview.hasControls=false;
			newimageview.lockMovementX = true;
			newimageview.lockMovementY = true;
			canvas.add(newimageview);
			setLayers();
	}
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
$("#EventCatcher").mousedown(function(event){
		var objarr=canvas._objects;
	  	for(var i=0;i<objarr.length;i++){
		  	if(event.pageX>objarr[i].left-objarr[i].width/2 && event.pageX<objarr[i].left+objarr[i].width/2 && event.pageY>objarr[i].top-objarr[i].height/2 && event.pageY<objarr[i].top+objarr[i].height/2){   
		  		SelectedEvent(objarr[i]);
			}				  	
		}
});

//タッチの実行
function SelectedEvent(obj) {
  var link=obj.href;
  if(link!=''){
  clicking=0;
  //別URLへのリンク
  	if(link.indexOf("http")==0){
  		var w=window.open();
		w.location.href=obj.href;
  	}else{
  	    //別ページへの移動
	  	currentPageNum=parseInt(obj.href);
	  	makePage(); //ページの生成
    }
  }

  //アニメーション
  if(getAniidBySelectedId(obj.id)!=null && animationStatus[getAniidBySelectedId(obj.id)]==0){
  	startAnimation(getAniidBySelectedId(obj.id));
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
	
	obj.animate(ani.element, ani.value, {
		//アニメーション中はanimationStatusを1に
  		onChange: function(value) {
  			if(animationing==0){animationing=1;}
  			animationStatus[ani.aniid]=1;
  		},
		//アニメーション終了後はanimationStatusを2に
		onComplete: function() {
			animationing=0;
			animationStatus[ani.aniid]=2;
			if(ani.repeat>0){
				ani.repeat=ani.repeat*2-1;
				repeatAnimation(obj,ani,selem,sval);
			}
		},
		easing: fabric.util.ease[ani.easing],
		duration: ani.duration
	});
}

function repeatAnimation(obj,ani,selem,sval){
console.log(ani.value);
	if(ani.value.substring(0, 1)!='='){
		//値を直接指定のとき
		var ssval=obj[selem];
		obj.animate(selem, sval, {
			onChange: function(value) {
  				if(animationing==0)animationing=1;
  			},
			onComplete: function() {
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
		if(ani.value.substring(1, 2)=='-'){
			newval+='=+';
			newval+=ani.value.substring(2);
		}else if(ani.value.substring(1, 2)=='+'){
			newval+='=-';
			newval+=ani.value.substring(2);		
		}
		console.log(obj.id+ani.element+newval);
		obj.animate(ani.element, newval, {
			//アニメーション終了後はanimationStatusを2に
			onChange: function(value) {
  				if(animationing==0)animationing=1;
  			},
			onComplete: function() {
				animationing=0;
				ani.value=newval;
				ani.repeat-=1;
				if(ani.repeat>0)repeatAnimation(obj,ani,selem,ssval);
			},
			easing: fabric.util.ease[ani.easing],
			duration: ani.duration
		});
	}
}

//タイマー関数=============================================================================================================================================================
function timer()
{
	var arr=animationData;

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
	
	/*
	//繰り返し判定
	for(var i=0;i<arr.length;i++){
		if(parseInt(arr[i].repeat)>0 && animationStatus[arr[i].aniid]==2){
			console.log(arr[i].repeat);
			var tmpaniid=arr[i].aniid;
			animationStatus[arr[i].aniid]=0;
			animationData[i].repeat=arr[i].repeat-1;
		}
	}
	*/
	for(var i=0;i<arr.length;i++){
		if(animationStatus[arr[i].aniid]==2)animationStatus[arr[i].aniid]=0
	}
}

//ツール============================================================================================================================================
//レイヤーを整列
function setLayers(){
	var arr=canvas._objects;
	console.log(arr);
	for(var i=arr.length-1;i>0;i--){
	  for(var j=0;j<i;j++){
		 if(arr[j].zindex>arr[j+1].zindex){
			canvas.sendToBack(canvas._objects[j+1]);
		 }
	   }
	}
}

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

//ページを描画
function makePage(){
	animationStatus = new Array();
	for(var i=0;i<objectData.length;i++){
		if(objectData[i].pageNum==currentPageNum){
		  	if(objectData[i].animation.length>0){animationData=objectData[i].animation;}
		  	canvas.setHeight(objectData[i].height);
		  	canvas.setWidth(objectData[i].width);
		  	$("#EventCatcher").css( "width", objectData[i].width);
		  	$("#EventCatcher").css( "height", objectData[i].height);
		  	makeObjects(objectData[i].data);
		}
    }
	for(var i=0;i<animationData.length;i++){
		animationStatus[animationData[i].aniid]=0;
    }
}

//文字を改行
function splitText(label,width){
	var textarr = new Array();
	var currentnum=0;
	var str=label.text;
	
	if(label.width>width){
		for(var i=0;i<str.length;i++){
			var tmpstr=str.substring(currentnum, i+1);
				var tmptext = new SCLabel(tmpstr,{
					  fontSize: label.fontSize,
					  fontFamily: label.fontFamily,
					  fontStyle: label.fontStyle,
					  textShadow:label.textShadow,
					  strokeWidth:label.strokeWidth,
					  strokeStyle: label.strokeStyle,
					  angle: label.angle,
			   });	

			if(tmptext.width>width){
				var addstr=str.substring(currentnum, i);
				textarr.push(addstr);
				tmpstr=str.substring(i, str.length);
				currentnum=i;
			}
			if(i==str.length-1){
				textarr.push(tmpstr);
			}
		}
	}else{
		textarr.push(str);
	}
	console.log(textarr);
	var resstr="";
	for(var i=0;i<textarr.length;i++){
		resstr+=textarr[i];
		if(i!=textarr.length-1){ resstr+="\n";}
	}
	
	var newlabel = new SCLabel(resstr,{
			  id:label.id,
			  left: label.left,
			  top: label.top,
			  opacity:label.opacity,
			  fontSize: label.fontSize,
			  fontFamily: label.fontFamily,
			  fontStyle: label.fontStyle,
			  fill: label.fill,
			  textShadow:label.textShadow,
			  textAlign:label.textAlign,
			  textBackgroundColor:label.textBackgroundColor,
			  strokeWidth:label.strokeWidth,
			  strokeStyle: label.strokeStyle,
			  angle: label.angle,
			  href: label.href,
			  zindex:label.zindex,
			  animation:label.animation
	});	
	if(newlabel.textAlign=="right" && label.width<width){
		newlabel.set('left',newlabel.left+width-newlabel.width/2);
	}else if(newlabel.textAlign=="center" && label.width<width){
		newlabel.set('left',newlabel.left+width/2);
	}else{
		newlabel.set('left',newlabel.left+newlabel.width/2);
	}
	newlabel.set('top',newlabel.top+newlabel.height/2);
	newlabel.hasControls=false;
	newlabel.lockMovementX = true;
	newlabel.lockMovementY = true;		
	
	 return newlabel;
}