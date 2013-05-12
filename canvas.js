//グローバル変数==============================================
var canvas = new fabric.Canvas('canvasspace');
var objectData =new Array();
var caimageview=new Array();
var currentPageNum=0;

//JSON読み込み================================================
var url = 'sample.json';

$.getJSON(url, function(data){
	
	  //objectData = JSON.parse(localStorage.JSON).slice(0);	//オブジェクトデータをグローバル変数に
	  objectData = data.slice(0);
	  
	  	for(var i=0;i<objectData.length;i++){
		  	if(objectData[i].pageNum==currentPageNum){
		  		canvas.setHeight(objectData[i].height);
		  		canvas.setWidth(objectData[i].width);
			  	makeObjects(objectData[i].data);
		  	}
	  	}
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
			  opacity:arr[i].opacity,
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
		console.log(arr[i].text);
		//CALabelの描画
		if(arr[i].type=="CALabel"){
			var newlabel = new CALabel(arr[i].text,{
			  id:arr[i].id,
			  left: arr[i].x,
			  top: arr[i].y,
			  opacity:arr[i].opacity,
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
			newlabel.set('left',newlabel.left+newlabel.width/2);
			newlabel.set('top',newlabel.top+newlabel.height/2);
			newlabel.hasControls=false;
			newlabel.lockMovementX = true;
			newlabel.lockMovementY = true;		
			canvas.add(newlabel);
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
				  opacity:arr[i].opacity,
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
		//	canvas.sendBackwards(newimageview); //trash
			setLayers();
	}
}
//====================================

//イベント==============================================
//イベントキャッチ==========================
//追加時
canvas.on('object:added', function(e) {
  //アニメーション
  var obj = e.target;
  console.log("selected");
console.log(obj);
  	if(obj.animation){
  		var ani=obj.animation;
  		startAnimation(obj,"added");
  	}
});

//タッチ
canvas.on('object:selected', function(e) {
  //リンク処理
  var obj = e.target;
  var link=obj.href;
  if(link!=''){
  	if(link.indexOf("http")==0){
  		var w=window.open();
		w.location.href=obj.href;
  	}else{
	  	currentPageNum=parseInt(obj.href);
	  	for(var i=0;i<objectData.length;i++){
		  	if(objectData[i].pageNum==currentPageNum){
		  		canvas.setHeight(objectData[i].height);
		  		canvas.setWidth(objectData[i].width);
			  	makeObjects(objectData[i].data);
		  	}
	  	}
	  	
  	}
  }

  //アニメーション
console.log("selected");
console.log(obj);
  	if(obj.animation){
  		var ani=obj.animation;
  		  console.log("selected");
  		startAnimation(obj,"selected");
  	}

});

//マウスオーバー
canvas.on('object:over', function(e) {
  //アニメーション
  var obj = e.target;
  obj.animate('angle', 90, {
				onChange: canvas.renderAll.bind(canvas)
  });
});

//アニメーションツール=================================================
//アニメーションの実行
function startAnimation(obj,str){
	  	//アニメーション
  	if(obj.animation){
  	var ani=obj.animation;
  	  	if(ani.triggar==str){
	  		if(ani.target=='self' || ani.target=='' || ani.target==null){
			  	obj.animate(ani.element, ani.value, {
							onChange: canvas.renderAll.bind(canvas),
							duration: ani.duration,
					//		easing: fabric.util.ease.easeOutBounce
				});
			}else{
				var arr=canvas._objects;
				
				for(var i=0;i<arr.length;i++){
					if(arr[i].id==ani.target){
					  	arr[i].animate(ani.element, ani.value, {
									onChange: canvas.renderAll.bind(canvas),
									duration: ani.duration,
							//		easing: fabric.util.ease.easeOutBounce
						});						
							  	console.log('>>>>>>>>>');
	  	console.log(obj.animation);
	  	console.log(str);
	  	console.log('>>>>>>>>>');

					}//end of arr[i].id==ani.target
				}//end of for(var i=0;i<arr.length;i++){
			}//end of ani.target=='self' || ani.target=='' || ani.target==null
		}//end of ani.triggar==str
	 }//end of if(obj.animation)
}
//=============================================================

//ツール==============================================
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