;
(function(win, doc, undefined) {
	var validation = { //验证对象
		blockCount: 16,
		rowc: 4,
		index: 0, //随机显示的div的索引
		divs: [], //存储生成的所有div的数组
		valid_main: valid_main,
		valid_button: valid_button,
		validBlock: null,
		createDivs: function() { //生成所有div
			var divW = parseInt(getComputedStyle(this.valid_main)["width"]) / (this.blockCount / this.rowc);
			var divH = parseInt(getComputedStyle(this.valid_main)["height"]) / this.rowc;
			var left = 0;
			var top = 0;
			for(var i = 0; i < this.blockCount; i += 1) {
				var div = doc.createElement('div');
				div.className = "block";
				div.style.width = divW + "px";
				div.style.height = divH + "px";

				if(i > 0 && i % (this.blockCount / this.rowc) == 0) { //每隔this.blockCount/this.rowc个div就换行
					left = 0;
					top += divH; //top偏移量加上div的高度
				} else if(i == 0) {
					left = 0; //第一个div的left偏移量为0，top偏移量也为0
				} else {
					left += divW; //未换行时left偏移量加上div宽度
				}
				div.style.top = top + "px";
				div.style.left = left + "px";
				//设置每个div的背景图片与主背景图片一致
				div.style.backgroundImage = getComputedStyle(this.valid_main)["backgroundImage"];
				//每一个div背景图片的position
				div.style.backgroundPosition = -left + "px " + (-top) + "px";
				this.valid_main.appendChild(div);
				//添加到divs数组中
				this.divs.push(div);
			}
			//设置完毕把主图片块背景设为纯白，防止div透明时漏出主图片背后的内容
			this.valid_main.style.background = "#fff";
		},
		showRandBlock: function() { //显示随机的div，validBlock需滑动到此
			var blockIndexArr = [];
			for(var i = 0, len = this.divs.length; i < len; i += 1) {
				if(i % (this.blockCount / this.rowc) !== 0) {
					blockIndexArr.push(i);
				}
			}
			//随机获取索引值
			this.index = blockIndexArr[parseInt(Math.floor(Math.random() * blockIndexArr.length))];
			//设定随机到的div的样式
			this.divs[this.index].className = "block active";
		},
		getValidBlock: function() { //生成随button滑动的div
			var div = doc.createElement('div');
			div.className = "block validBlock";
			div.style.width = this.divs[this.index].style.width; //保持与被验证的div的宽度一致
			div.style.height = this.divs[this.index].style.height; //保持与被验证的div的高度一致
			div.style.top = this.divs[this.index].style.top;
			div.style.left = parseInt(getComputedStyle(this.valid_button)["left"]) + parseInt(getComputedStyle(this.valid_button)["width"]) / 2 - parseInt(div.style.width) / 2 + "px";
			div.style.backgroundImage = this.divs[this.index].style.backgroundImage;
			div.style.backgroundPosition = this.divs[this.index].style.backgroundPosition;
			div.id = "validBlock";
			this.valid_main.appendChild(div);
			this.validBlock = div;
		},
		addListener: function() { //添加拖动事件监听
			var mouseDown = false; //判断鼠标是否按下
			var self = this; //预存this
			var startx, endx, movex = 0;
			var srcLeft = parseInt(getComputedStyle(self.valid_button)["left"]); //button最开始的left偏移量
			var validBlockSrcLeft = parseInt(getComputedStyle(this.validBlock)["left"]);
			var maxLeft = parseInt(getComputedStyle(self.valid_main)["width"]) - parseInt(self.divs[self.index].style.width); //validBlock移动的最大left,保证不超出主图片区域
			var maxMove = maxLeft - validBlockSrcLeft; //validBlock的最大移动量
			var left, blockleft, span;
			this.valid_button.onmousedown = function(e) {
				var e = e || win.event;
				mouseDown = true;
				self.valid_button.style.transition = "none";
				self.validBlock.style.transition = "none";
				left = parseInt(getComputedStyle(self.valid_button)["left"]);
				blockleft = parseInt(getComputedStyle(self.validBlock)["left"]);
				startx = e.clientX;
				span = doc.querySelector('#valid_box>b'); //显示文字的span,样式会动态改变
				span.style.transition = "opacity .1s";
				span.style.opacity = 0;
			}

			doc.onmousemove = function(e) { //document监听mousemove可防止鼠标不在valid_button上时产生bug
				if(!mouseDown) return; //鼠标没点击valid_button则不执行以下操作
				var e = e || win.event;
				endx = e.clientX;
				movex = endx - startx; //鼠标滑动的距离

				if(movex + left < srcLeft) { //向左移动超出
					movex = srcLeft - left;
				}

				if(movex + left > srcLeft + maxMove) { //向右移动超出
					movex = srcLeft + maxMove - left;
				}
				self.valid_button.style.left = left + movex + "px";
				self.validBlock.style.left = blockleft + movex + "px";
			}

			doc.onmouseup = function(e) {
				if(!mouseDown) return;
				mouseDown = false; //重设mouseDown为false
				if(self.valid()) {
					//验证图片通过显示的图片反馈
					valid_img.style.backgroundPosition = "0 -304px";
				} else {
					valid_img.style.backgroundPosition = "0 -414px";
				}
				if(valid_img.style.backgroundPositionY == "-304px"){
					window.location.href="http://www.baidu.com";
				}
				//鼠标放开后valid_button和validBlock缓慢滑动到初始位置
				self.valid_button.style.transition = "left .6s linear";
				self.validBlock.style.transition = "left .6s linear";
				self.valid_button.style.left = srcLeft + "px";
				self.validBlock.style.left = validBlockSrcLeft + "px";
				setTimeout(function() {
					span.style.opacity = 1;
				}, 600);

			}

		},
		valid: function() {
			var dis = Math.abs(parseInt(this.divs[this.index].style.left) - parseInt(this.validBlock.style.left)); //计算validBlock和激活后的待验证div之间的left值
			var minDis = parseInt(this.validBlock.style.width) * 0.2; //要求的最小差距
			if(dis > minDis) { //left差距过大
				return false;
			} else {
				return true;
			}
		},
		init: function() {
			this.createDivs();
			this.showRandBlock();
			this.getValidBlock();
			this.addListener();
		}
	};
	win.validation = validation;
	
})(window, document);
