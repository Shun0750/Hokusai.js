//グローバル変数==============================================
var canvas = new fabric.Canvas('canvasspace');
var objectData =new Array();
var caimageview=new Array();
var animationData = new Array();
var animationStatus = new Array(); //0:アニメーションしていない 1:アニメーション中 2:アニメーション終了済み
var elementData = new Array();
var currentPageNum=0;
var clicking=0;
var hit=0;
canvas.selection = false; //グループ選択を解除

setInterval(function(){timer()},20); //タイマー関数の発動
var animationing=0;

$("#ccon").mousemove(function(event){
   canvas.renderAll();
}); 


//JSON読み込み================================================
var url = 'sample.json';

$.getJSON(url, function(data){
	  //objectData = JSON.parse(localStorage.JSON).slice(0);	//オブジェクトデータをグローバル変数に
	  objectData = data.slice(0);
	  makePage();
});
//クラス宣言==================================================
var CAView = fabric.util.createClass(fabric.Rect, {
	initialize: function(options) {
	    options || (options = { });
	
	    this.callSuper('initialize', options);
	    this.set('pageid', options.pageid || -1);
	    this.set('zindex', options.zindex || -1);
	    this.set('href', options.href || '');
		this.set('animation', options.animation || '');
	}
});

var CAImageView = fabric.util.createClass(fabric.Image, {
		initialize: function(element,options){
				this.callSuper('initialize',element,options);
			    this.set('pageid', options.pageid || -1);
			    this.set('zindex', options.zindex || -1);
			    this.set('href', options.href || '');
			    this.set('animation', options.animation || '');
    		}
});

var CALabel = fabric.util.createClass(fabric.Text, {
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

//オブジェクト生成==============================================

function makeObjects(arr){
	canvas.clear();
    caimageview=[];
	//それぞれのオブジェクト配列の生成
	for(var i=0;i<arr.length;i++){
		if(arr[i].type=="CAImageView"){
			caimageview.push(arr[i]);
		}
	}
	makeCAImageView( caimageview, imageLoaded );
	
	//CAViewの描画
	for(var i=0;i<arr.length;i++){
		if(arr[i].type=="CAView"){
			var newview = new CAView({
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
		}// end of arr[i].type=="CAView"
		//CALabelの描画
		if(arr[i].type=="CALabel"){
			var labelwidth=10000;
			if(arr[i].width){
				labelwidth=arr[i].width;
			}
			
			var newlabel = new CALabel(arr[i].text,{
			  id:arr[i].id,
			  left: arr[i].x,
			  top: arr[i].y,
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
		}//end of arr[i].type=="CALabel"
	}//end of for(var i=0;i<arr.length;i++)
	setLayers();
}

//ロード終了まで待ってからCAImageViewを描画
function makeCAImageView(arr, callBack){
var count = 0;
 var img = [];
    
 for(var i in arr ){
  img[i] = new Image();
  img[i].src = arr[i].src;
  img[i].onload = function(){
   count++;
   if(count == arr.length){
    callBack(img,arr);
   }
  }
 }
} 
//ロード終了後のCAImageVIew描画
function imageLoaded(img,arr){

	for(var i=0;i<img.length;i++){
			var newimageview = new CAImageView(img[i],{
			  	  id:arr[i].id,
				  left: arr[i].x+arr[i].width/2,
				  top: arr[i].y+arr[i].height/2,
				  width:arr[i].width,
				  height:arr[i].height,
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
//====================================

//イベント===========================================================================================
//イベントキャッチ==========================================================================
//追加時
canvas.on('object:added', function(e) {
  //アニメーション
  var obj = e.target;
  if(getAniidByAddedId(obj.id)!=null){
	  startAnimation(getAniidByAddedId(obj.id));
  }
});

//タッチ
$("#EventCatcher").mousedown(function(event){
console.log("eventcatch");
			var objarr=canvas._objects;
		  	for(var i=0;i<objarr.length;i++){
			  	if(event.pageX>objarr[i].left-objarr[i].width/2 && event.pageX<objarr[i].left+objarr[i].width/2 && event.pageY>objarr[i].top-objarr[i].height/2 && event.pageY<objarr[i].top+objarr[i].height/2){   
			  		SelectedEvent(objarr[i]);
				}
					  	
			}
});

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

//アニメーションツール=================================================================================================
//アニメーションの実行
function startAnimation(aniid){
	//アニメーション
	var check2=0;
	var ani=getAnimationById(aniid);
	var targetstr=ani.target;
	var obj=getObjectById(targetstr);
	obj.animate(ani.element, ani.value, {
  		onChange: function(value) {
  			if(animationing==0){animationing=1;}
  			animationStatus[ani.aniid]=1;
		},
		onComplete: function() {
			animationing=0;
			animationStatus[ani.aniid]=2;
		},
		easing: fabric.util.ease[ani.easing],
		duration: ani.duration
	});
}
//=============================================================


//タイマー関数===============================================================================================================
function timer()
{
	//アニメーションのレンダリング
	if(animationing==1){
		canvas.renderAll();
	}
	
	//アニメーションチェック
	var arr=animationData;
	for(var i=0;i<arr.length;i++){
		var trigger=arr[i].trigger;
		var trgarr=trigger.split(":");
		if(animationStatus[arr[i].aniid]==0){
			if(trgarr[0]=="ended" && animationStatus[trgarr[1]]==2){
				startAnimation(arr[i].aniid);
			}
			if(trgarr[0]=="sync" && animationStatus[trgarr[1]]==1){
				startAnimation(arr[i].aniid);
			}
			if(trgarr[0]=="hit" && isHitObjectsById(trgarr[1],trgarr[2])==true){
				startAnimation(arr[i].aniid);
			}
		}
	}
	for(var i=0;i<arr.length;i++){
		if(parseInt(arr[i].repeat)>0 && animationStatus[arr[i].aniid]==2){
			animationStatus[arr[i].aniid]=0;
		}
	}
}

//ツール==============================================================================================
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

//aniidからアニメーションを取得 SELECTED
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
	console.log(sobj);
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


function updateElementPropertyById(obj){
	for(var i=0;i<elementData.length;i++){
		if(elementData[i].id==obj.id){
			elementData[i].x=obj.left-obj.width/2;
			elementData[i].y=obj.top-obj.height/2;
			elementData[i].width=obj.width;
			elementData[i].height=obj.height;
		}
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
				var tmptext = new CALabel(tmpstr,{
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
	
	var newlabel = new CALabel(resstr,{
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