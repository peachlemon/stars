/*
 * Flexigrid for jQuery -  v1.1
 *
 * Copyright (c) 2008 Paulo P. Marinas (code.google.com/p/flexigrid/)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * 做了很多扩展 by hongda.wu@huaat.net
 */
(function ($) {
	$.addFlex = function (t, p) {
		if (t.grid) return false; //return if already exist
		p = $.extend({ //apply default properties
			height: 'auto', //默认高度是屏幕的高度
			width: 'auto', //auto width
			striped: true, //apply odd even stripes
			novstripe: false,
			minwidth: 30, //min width of columns
			minheight: 80, //min height of columns
			resizable: true, //allow table resizing
			resizableCol: true, //是否可以调整每列的位置
			url: false, //URL if using data from AJAX
			method: 'POST', //data sending method
			dataType: 'json', //type of data for AJAX, either xml or json
			errormsg: 'Connection Error',
			usepager: false,
			nowrap: true,
			page: 1, //current page
			total: 1, //total pages
			useRp: true, //use the results per page select box
			rp: 15, //results per page
			rpOptions: [10, 15, 20, 30, 50], //allowed per-page values
			title: false,
			pagestat: 'Displaying {from} to {to} of {total} items',
			pagetext: '跳至',
			outof: '页',
			findtext: 'Find',
			procmsg: 'Processing, please wait ...',
			query: '',
			qtype: '',
			nomsg: 'No items',
			minColToggle: 1, //minimum allowed column to be hidden
			showToggleBtn: false, //show or hide column toggle popup 修改后有bug，先修改为默认不显示
			hideOnSubmit: true,
			autoload: true,
			blockOpacity: 0.5,
			preProcess: false,
			onDragCol: false,
			onToggleCol: false,
			onChangeSort: false,
			onSuccess: false,
			onError: false,
			onSubmit: false, //using a custom populate function
			params:[],
			cache:false,//默认没有缓存，跟$.ajax默认相反
			sortorder:'asc',//默认排序方式
			checkbox:false, //为每列增加checkbox
			relationBtn:'', //为增加的checkbox增加关联按钮，条件大于1，值为 '#test'
			singleRelation:'', //为增加的checkbox增加关联按钮，条件等于1
			customRelation:[],//自定义关联条件，格式为[{"id":"#test","condition":true},{"id":"#test1","condition":true}]; ps：自定义关联条件，只支持单选模式
			colAutoWidth:false, //列宽度按设定的宽度的百分比来排列，自适应
			rowDblClick:'', //为每行增加双击事件
			singleSelect:true, //单选，默认为单选
			jsonStore:{ //数据格式
				k_page:'page',
				k_total:'total',
				k_data:'data'
			}
		}, p);
		$(t).show() //show if hidden
			.attr({
				cellPadding: 0,
				cellSpacing: 0,
				border: 0
			}) //remove padding and spacing
			.removeAttr('width'); //remove width properties
		//create grid class
		var g = {
			hset: {},
			rePosDrag: function () {
				var cdleft = 0 - this.hDiv.scrollLeft;
				if (this.hDiv.scrollLeft > 0) cdleft -= Math.floor(p.cgwidth / 2);
				$(g.cDrag).css({
					top: g.hDiv.offsetTop + 1
				});
				var cdpad = this.cdpad;
				$('div', g.cDrag).hide();
				$('thead tr:first th:visible', this.hDiv).each(function () {
					var n = $('thead tr:first th:visible', g.hDiv).index(this);
					var cdpos = parseInt($('div', this).width());
					if (cdleft == 0) cdleft -= Math.floor(p.cgwidth / 2);
					cdpos = cdpos + cdleft + cdpad;
					if (isNaN(cdpos)) {
						cdpos = 0;
					}
					$('div:eq(' + n + ')', g.cDrag).css({
						'left': cdpos + 'px'
					}).show();
					cdleft = cdpos;
				});
			},
			fixHeight: function (newH) {
				newH = false;
				if (!newH) newH = $(g.bDiv).height();
				var hdHeight = $(this.hDiv).height();
				$('div', this.cDrag).each(
					function () {
						$(this).height(newH + hdHeight);
					}
				);
				var nd = parseInt($(g.nDiv).height());
				if (nd > newH) $(g.nDiv).height(newH).width(200);
				else $(g.nDiv).height('auto').width('auto');
				$(g.block).css({
					height: newH,
					marginBottom: (newH * -1)
				});
				var hrH = g.bDiv.offsetTop + newH;
				if (p.height != 'auto' && p.resizable) hrH = g.vDiv.offsetTop;
				$(g.rDiv).css({
					height: hrH
				});
			},
			dragStart: function (dragtype, e, obj) { //default drag function start
				if (dragtype == 'colresize') {//column resize
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					var n = $('div', this.cDrag).index(obj);
					var ow = $('th:visible div:eq(' + n + ')', this.hDiv).width();
					$(obj).addClass('dragging').siblings().hide();
					$(obj).prev().addClass('dragging').show();
					this.colresize = {
						startX: e.pageX,
						ol: parseInt(obj.style.left),
						ow: ow,
						n: n
					};
					$('body').css('cursor', 'col-resize');
				} else if (dragtype == 'vresize') {//table resize
					var hgo = false;
					$('body').css('cursor', 'row-resize');
					if (obj) {
						hgo = true;
						$('body').css('cursor', 'col-resize');
					}
					this.vresize = {
						h: p.height,
						sy: e.pageY,
						w: p.width,
						sx: e.pageX,
						hgo: hgo
					};
				} else if (dragtype == 'colMove') {//column header drag
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					this.hset = $(this.hDiv).offset();
					this.hset.right = this.hset.left + $('table', this.hDiv).width();
					this.hset.bottom = this.hset.top + $('table', this.hDiv).height();
					this.dcol = obj;
					this.dcoln = $('th', this.hDiv).index(obj);
					this.colCopy = document.createElement("div");
					this.colCopy.className = "colCopy";
					this.colCopy.innerHTML = obj.innerHTML;
					if ($.browser.msie) {
						this.colCopy.className = "colCopy ie";
					}
					$(this.colCopy).css({
						position: 'absolute',
						float: 'left',
						display: 'none',
						textAlign: obj.align
					});
					$('body').append(this.colCopy);
					$(this.cDrag).hide();
				}
				$('body').noSelect();
			},
			dragMove: function (e) {
				if (this.colresize) {//column resize
					var n = this.colresize.n;
					var diff = e.pageX - this.colresize.startX;
					var nleft = this.colresize.ol + diff;
					var nw = this.colresize.ow + diff;
					if (nw > p.minwidth) {
						$('div:eq(' + n + ')', this.cDrag).css('left', nleft);
						this.colresize.nw = nw;
					}
				} else if (this.vresize) {//table resize
					var v = this.vresize;
					var y = e.pageY;
					var diff = y - v.sy;
					if (!p.defwidth) p.defwidth = p.width;
					if (p.width != 'auto' && !p.nohresize && v.hgo) {
						var x = e.pageX;
						var xdiff = x - v.sx;
						var newW = v.w + xdiff;
						if (newW > p.defwidth) {
							this.gDiv.style.width = newW + 'px';
							p.width = newW;
						}
					}
					var newH = v.h + diff;
					if ((newH > p.minheight || p.height < p.minheight) && !v.hgo) {
						this.bDiv.style.height = newH + 'px';
						p.height = newH;
						this.fixHeight(newH);
					}
					v = null;
				} else if (this.colCopy) {
					$(this.dcol).addClass('thMove').removeClass('thOver');
					if (e.pageX > this.hset.right || e.pageX < this.hset.left || e.pageY > this.hset.bottom || e.pageY < this.hset.top) {
						//this.dragEnd();
						$('body').css('cursor', 'move');
					} else {
						$('body').css('cursor', 'pointer');
					}
					$(this.colCopy).css({
						top: e.pageY + 10,
						left: e.pageX + 20,
						display: 'block'
					});
				}
			},
			dragEnd: function () {
				if (this.colresize) {
					var n = this.colresize.n;
					var nw = this.colresize.nw;
					$('th:visible div:eq(' + n + ')', this.hDiv).css('width', nw);
					$('tr', this.bDiv).each(
						function () {
							$('td:visible div:eq(' + n + ')', this).css('width', nw);
						}
					);
					this.hDiv.scrollLeft = this.bDiv.scrollLeft;
					$('div:eq(' + n + ')', this.cDrag).siblings().show();
					$('.dragging', this.cDrag).removeClass('dragging');
					this.rePosDrag();
					this.fixHeight();
					this.colresize = false;
				} else if (this.vresize) {
					this.vresize = false;
				} else if (this.colCopy) {
					$(this.colCopy).remove();
					if (this.dcolt != null) {
						if (this.dcoln > this.dcolt) $('th:eq(' + this.dcolt + ')', this.hDiv).before(this.dcol);
						else $('th:eq(' + this.dcolt + ')', this.hDiv).after(this.dcol);
						this.switchCol(this.dcoln, this.dcolt);
						$(this.cdropleft).remove();
						$(this.cdropright).remove();
						this.rePosDrag();
						if (p.onDragCol) {
							p.onDragCol(this.dcoln, this.dcolt);
						}
					}
					this.dcol = null;
					this.hset = null;
					this.dcoln = null;
					this.dcolt = null;
					this.colCopy = null;
					$('.thMove', this.hDiv).removeClass('thMove');
					$(this.cDrag).show();
				}
				$('body').css('cursor', 'default');
				$('body').noSelect(false);
			},
			toggleCol: function (cid, visible) {
				var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
				var n = $('thead th', g.hDiv).index(ncol);
				var cb = $('input[value=' + cid + ']', g.nDiv)[0];
				if (visible == null) {
					visible = ncol.hidden;
				}
				if ($('input:checked', g.nDiv).length < p.minColToggle && !visible) {
					return false;
				}
				if (visible) {
					ncol.hidden = false;
					$(ncol).show();
					cb.checked = true;
				} else {
					ncol.hidden = true;
					$(ncol).hide();
					cb.checked = false;
				}
				$('tbody tr', t).each(
					function () {
						if (visible) {
							$('td:eq(' + n + ')', this).show();
						} else {
							$('td:eq(' + n + ')', this).hide();
						}
					}
				);
				this.rePosDrag();
				if (p.onToggleCol) {
					p.onToggleCol(cid, visible);
				}
				return visible;
			},
			switchCol: function (cdrag, cdrop) { //switch columns
				$('tbody tr', t).each(
					function () {
						if (cdrag > cdrop) $('td:eq(' + cdrop + ')', this).before($('td:eq(' + cdrag + ')', this));
						else $('td:eq(' + cdrop + ')', this).after($('td:eq(' + cdrag + ')', this));
					}
				);
				//switch order in nDiv
				if (cdrag > cdrop) {
					$('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq(' + cdrag + ')', this.nDiv));
				} else {
					$('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq(' + cdrag + ')', this.nDiv));
				}
				if ($.browser.msie && $.browser.version < 7.0) {
					$('tr:eq(' + cdrop + ') input', this.nDiv)[0].checked = true;
				}
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
			},
			scroll: function () {
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				this.rePosDrag();
			},
			addData: function (data) { //parse data
				var responseDataObj=$.extend({},true,data);
				//data = $.extend({rows: [], page: 0, total: 0}, data);
				if (p.preProcess) {
					data = p.preProcess(data);
				}
				$('.pReload', this.pDiv).removeClass('loading');
				this.loading = false;
				if (!data) {
					$('.pPageStat', this.pDiv).html(p.errormsg);
					return false;
				}
				p.total = data[p.jsonStore.k_total];
				if (p.total == 0) {
					$('tr, a, td, div', t).unbind();
					$(t).empty();
					p.pages = 1;
					p.page = 1;
					this.buildpager();
					$('.pPageStat', this.pDiv).html(p.nomsg);
                    if (p.onSuccess) {
                        p.onSuccess(this,responseDataObj);
                    }
					return false;
				}
				
				p.pages = Math.ceil(p.total / p.rp);
				p.page = data[p.jsonStore.k_page];
				this.buildpager();
				//build new body
				var tbody = document.createElement('tbody');
				if (p.dataType == 'json') {
					//重写添加数据
					function getJsonval(key,json){
						var newKey = key.split('.');
						$.each(newKey,function(i,n){
							//在dataindex与数据匹配不上时，抛出错误
							if(json && typeof json[n] != 'undefined'){
								json = json[n];
							}else{
								//console.log 在ie下 会报错
								//if(!$.browser.msie) console.log('error:"dataindex":"'+key+'"在数据中未找到');
								json = '';
							};
						});
						return json;
					}

					function getMappVal(obj,val){
						var mappAry = [];
						var convertFn = obj.data('convert');
						$.each(obj.data('mapping'),function(i,n){
							mappAry.push(getJsonval(n,val));
						});
						return mappAry;
					}
					$.each(data[p.jsonStore.k_data],function(i,n){
						var tr = document.createElement('tr');
						if (i % 2 && p.striped) {
							tr.className = 'erow';
						}
						$(tr).data('rec',n);//为每一行绑定其原始数据
						//var hasCheckbox = false;
						$('thead tr:first th', g.hDiv).each(function(){
							var td = document.createElement('td');
							if($(this).attr('chk_cell')){
								td.innerHTML = '<span class="noborder"><input type="checkbox" /></span>';
							}else{
								var idx = $(this).attr('axis').substr(3);
								var html;
								//自定义单元格
								if(!$(this).attr('dataindex') && $(this).data('customcell')){
									html =  $(this).data('customcell')();
								}else{
									html = getJsonval($(this).attr('dataindex'),n);
								}
								//绑定rennder函数
								if($(this).data('renderer')){
									html = $(this).data('renderer')(html);
								}
								if($(this).data('mapping')){
									/*var mappAry = [];
									var convertFn = $(this).data('convert');
									$.each($(this).data('mapping'),function(mi,mn){
										mappAry.push(convertFn(html,getJsonval(mn,n)));
									});
									*/
									//html = getMappVal(html,$(this),n);
									html = $(this).data('convert')(html,getMappVal($(this),n));
									//html = $(this).data('convert')(html,getJsonval($(this).data('mapping'),n));
								}
								td.innerHTML = html;
							}

							$(td).attr('abbr', $(this).attr('abbr')).attr('idx',idx);
							$(tr).append(td);
							td = null;

						});

						$(tbody).append(tr);
						//每行绑定双击事件
						if(p.rowDblClick && typeof p.rowDblClick == 'function'){
							$(tr).bind('dblclick',p.rowDblClick);
						}
						tr = null;
					});
				}
				//表格重新载入的时候，是否选中之前选中的行
				var selectState = $('tr.trSelected',t).length ? true : false,selectRow = [];
				if(selectState){
					$('tr.trSelected',t).each(function(){
						selectRow.push($('tr', t).index(this));
					});
				}

				$('tr', t).unbind();
				$(t).empty();
				$(t).append(tbody);

				this.addCellProp();
				this.addRowProp();
				this.rePosDrag();

				$.each(selectRow,function(si,sn){
					$('tr',t).eq(sn).trigger('click');
				});

				tbody = null;
				data = null;
				i = null;
				selectRow = null;
				selectState = null;
				if (p.onSuccess) {
					p.onSuccess(this,responseDataObj);
				}
				if (p.hideOnSubmit) {
					$(g.block).remove();
				}
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				if ($.browser.opera) {
					$(t).css('visibility', 'visible');
				}
			},
			changeSort: function (th) { //change sortorder
				if (this.loading) {
					return true;
				}
				$(g.nDiv).hide();
				$(g.nBtn).hide();
				if (p.sortname == $(th).attr('abbr')) {
					if (p.sortorder == 'asc') {
						p.sortorder = 'desc';
					} else {
						p.sortorder = 'asc';
					}
				}
				$(th).addClass('sorted').siblings().removeClass('sorted');
				$('.sdesc', this.hDiv).removeClass('sdesc');
				$('.sasc', this.hDiv).removeClass('sasc');
				$('div', th).addClass('s' + p.sortorder);
				p.sortname = $(th).attr('abbr');
				if (p.onChangeSort) {
					p.onChangeSort(p.sortname, p.sortorder);
				} else {
					this.populate();
				}
			},
			buildpager: function () { //rebuild pager based on new properties
				$('.pcontrol input', this.pDiv).val(p.page);				
				$('.pagetotal', this.pDiv).html(p.page+'/'+p.pages);
				var r1 = (p.page - 1) * p.rp + 1;
				var r2 = r1 + p.rp - 1;
				if (p.total < r2) {
					r2 = p.total;
				}
				var stat = p.pagestat;
				stat = stat.replace(/{from}/, r1);
				stat = stat.replace(/{to}/, r2);
				stat = stat.replace(/{total}/, p.total);
				$('.pPageStat', this.pDiv).html(stat);
			},
			populate: function () { //get latest data
				if (this.loading) {
					return true;
				}
				if (p.onSubmit) {
					var gh = p.onSubmit();
					if (!gh) {
						return false;
					}
				}
				this.loading = true;
				if (!p.url) {
					return false;
				}
				$('.pPageStat', this.pDiv).html(p.procmsg);
				$('.pReload', this.pDiv).addClass('loading');
				$(g.block).css({
					top: g.bDiv.offsetTop
				});
				if (p.hideOnSubmit) {
					$(this.gDiv).prepend(g.block);
				}
				if ($.browser.opera) {
					$(t).css('visibility', 'hidden');
				}
				if (!p.newp) {
					p.newp = 1;
				}
				if (p.page > p.pages) {
					p.page = p.pages;
				}
				var param=[];
				if(p.updateDefaultParam){
					   param = [{
							name: 'page',
							value: p.newp
						}, {
							name: 'pagesize',
							value: p.rp
						}, {
							name: 'sortname',
							value: p.sortname
						}, {
							name: 'sortorder',
							value: p.sortorder
						}, {
							name: 'query',
							value: p.query
						}, {
							name: 'qtype',
							value: p.qtype
						}];
				}else{
					    param = [{
							name: 'page',
							value: p.newp
						}, {
							name: 'rp',
							value: p.rp
						}, {
							name: 'sortname',
							value: p.sortname
						}, {
							name: 'sortorder',
							value: p.sortorder
						}, {
							name: 'query',
							value: p.query
						}, {
							name: 'qtype',
							value: p.qtype
						}];
				}
				
				if (p.params) {
					for (var pi = 0; pi < p.params.length; pi++) {
						param[param.length] = p.params[pi];
					}
				}
				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					cache: p.cache,
					dataType: p.dataType,
					success: function (data) {
						g.addData(data);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) {}
					}
				});
			},
			doSearch: function () {
				p.query = $('.tDiv2 input',g.tDiv).val();
                //去除字符前的空格CCMSQY-2571
                p.query = p.query.replace(/(^\s*|\s*$)/g, '');
				p.qtype = $('.tDiv2 input',g.tDiv).attr('name');
				p.newp = 1;
				this.populate();
			},
			changePage: function (ctype) { //change page
				if (this.loading) {
					return true;
				}
				switch (ctype) {
					case 'first':
						p.newp = 1;
						break;
					case 'prev':
						if (p.page > 1) {
							p.newp = parseInt(p.page) - 1;
						}
						break;
					case 'next':
						if (p.page < p.pages) {
							p.newp = parseInt(p.page) + 1;
						}
						break;
					case 'last':
						p.newp = p.pages;
						break;
					case 'input':
						var nv = parseInt($('.pcontrol input', this.pDiv).val());
						if (isNaN(nv)) {
							nv = 1;
						}
						if (nv < 1) {
							nv = 1;
						} else if (nv > p.pages) {
							nv = p.pages;
						}
						$('.pcontrol input', this.pDiv).val(nv);
						p.newp = nv;
						break;
				}
				if (p.newp == p.page) {
					return false;
				}
				if (p.onChangePage) {
					p.onChangePage(p.newp);
				} else {
					//p.updateDefaultParam[0].value = p.newp;
					this.populate();
				}
			},
			addCellProp: function () {//为每个单元格内包裹div  --翻译
				$('tbody tr td', g.bDiv).each(function () {
					var tdDiv = document.createElement('div');
					var n = $('td', $(this).parent()).index(this);
					var pth = $('th:eq(' + n + ')', g.hDiv).get(0);
					if (pth != null) {
						if (p.sortname == $(pth).attr('abbr') && p.sortname) {
							this.className = 'sorted';
						}
						$(tdDiv).css({
							textAlign: pth.align,
							width: $('div:first', pth)[0].style.width
						});
						if (pth.hidden) {
							$(this).css('display', 'none');
						}
					}
					if (p.nowrap == false) {
						$(tdDiv).css('white-space', 'normal');
					}
					if (this.innerHTML == '') {
						this.innerHTML = '&nbsp;';
					}
					tdDiv.innerHTML = this.innerHTML;
					var prnt = $(this).parent()[0];
					var pid = false;
					if (prnt.id) {
						pid = prnt.id.substr(3);
					}
					if (pth != null) {
						if (pth.process) pth.process(tdDiv, pid);
					}
					$(this).empty().append(tdDiv).removeAttr('width'); //wrap content
					//绑定customFn事件 ，因为在添加数据时没有向单元格内包裹div及一些样式，故再结束后执行
					if($(pth).data('customFn')){
						$(pth).data('customFn')($(this));
					}
				});
			},
			getCellDim: function (obj) {// get cell prop for editable event
				var ht = parseInt($(obj).height());
				var pht = parseInt($(obj).parent().height());
				var wt = parseInt(obj.style.width);
				var pwt = parseInt($(obj).parent().width());
				var top = obj.offsetParent.offsetTop;
				var left = obj.offsetParent.offsetLeft;
				var pdl = parseInt($(obj).css('paddingLeft'));
				var pdt = parseInt($(obj).css('paddingTop'));
				return {
					ht: ht,
					wt: wt,
					top: top,
					left: left,
					pdl: pdl,
					pdt: pdt,
					pht: pht,
					pwt: pwt
				};
			},
			addRowProp: function () {
				$('tbody tr', g.bDiv).each(function () {
					$(this).click(function (e) {
						var obj = (e.target || e.srcElement);
						if (obj.href || obj.type) return true;
						$(this).toggleClass('trSelected');
						if (p.singleSelect){
							$(this).siblings().removeClass('trSelected').find(':checkbox').attr('checked',false);
						}

						if(p.checkbox){
							$(':checkbox',this).attr('checked',$(this).hasClass('trSelected') ? true : false);
						}
						if(p.relationBtn) g.relationBtns();
						if(p.singleRelation) g.singleRelation();
						if(p.customRelation) g.customRelation();
					}).mousedown(function (e) {
						if (e.shiftKey) {
							$(this).toggleClass('trSelected');
							g.multisel = true;
							this.focus();
							$(g.gDiv).noSelect();
						}
					}).mouseup(function () {
						if (g.multisel) {
							g.multisel = false;
							$(g.gDiv).noSelect(false);
						}
					}).hover(function (e) {
						if (g.multisel) {
							$(this).toggleClass('trSelected');
						}
					}, function () {});
					if ($.browser.msie && $.browser.version < 7.0) {
						$(this).hover(function () {
							$(this).addClass('trOver');
						}, function () {
							$(this).removeClass('trOver');
						});
					}
				});
			},
			checkAll:function(){ //为checkbox增加全选功能
				var el = this;
				$('th :checkbox',g.gDiv).change(function(){
					$('td :checkbox',g.gDiv).attr('checked',this.checked).each(function(){
						el.addRowClass(this);
					});
				});
			},
			addRowClass:function(obj){//联动每行选中的样式
				var _parents = $(obj).parents('tr');
				if(obj.checked){
					_parents.addClass('trSelected');
					//当为单选模式，点击checkbox的时候
					if(p.singleSelect){
						$('td :checkbox',g.gDiv).not(obj).attr('checked',false);
						_parents.siblings().removeClass('trSelected');
					}
				}else{
					_parents.removeClass('trSelected');
				}
			},
			relationFun:function(el,condition){
				$(el).each(function(){
					var obj = $(this);
					var _disabled = $('<span id="'+this.id+'_mask" style="width:'+obj.outerWidth()+'px;height:'+obj.outerHeight()+'px;left:'+obj.offset().left+'px;" class="disabled-mask"></span>');
					if(eval(condition)){
						obj.removeClass('btn-disabled');
						$('#'+this.id+'_mask').remove();
					}else{
						obj.addClass('btn-disabled');
						if(!$('#'+this.id+'_mask').length) obj.after(_disabled);
					}
					$(window).resize(function(){
						_disabled.css('left',obj.offset().left);
					});
				});
			},
			relationBtns:function(){
				/*
				$(p.relationBtn).each(function(){
					var obj = $(this);
					var _disabled = $('<span style="width:'+obj.outerWidth()+'px;height:'+obj.outerHeight()+'px;left:'+obj.offset().left+'px;" class="disabled-mask"></span>');
					if($(':checked',g.bDiv).length){
						obj.removeClass('btn-disabled').next('.disabled-mask').remove();
					}else{
						obj.addClass('btn-disabled').after(_disabled);
					}
					$(window).resize(function(){
						_disabled.css('left',obj.offset().left);
					});
				});
				*/
				g.relationFun(p.relationBtn,$('tr.trSelected',g.bDiv).length);
			},
			singleRelation:function(){
				g.relationFun(p.singleRelation,$('tr.trSelected',g.bDiv).length == 1);
			},
			customRelation:function(){
				$.each(p.customRelation,function(i,n){
					g.relationFun(n.id,n.condition);
				});
			},
			setWidth:function(){//宽度自适应 ps:当缩放窗口时宽度自适应还没实现
				var widthTotal = 0;
				for (var i = 0; i < p.colModel.length; i++) {
					if(typeof p.colModel[i].width != 'number'){
						return false;
					}else{
						widthTotal += p.colModel[i].width;
					}
				}

				var gridWidth = p.checkbox ? $(g.gDiv).width()-25 : $(g.gDiv).width();
				return parseInt(gridWidth*cm.width/widthTotal);
			},
            removeParams:function(name){//自定义搜索时增加参数
                var noParam = false,ary = p.params;
                var index;
                //默认向params里面删除参数
                for(var i=0;i<ary.length;i++){
                    if(ary[i].name == name){
                        index=i;
                        noParam = true;
                        break;
                    }
                }
                if(noParam){
                    ary.splice(index,1);
                }
            },
			addParams:function(name,value){//自定义搜索时增加参数
				var noParam = true,ary = p.params;
				//默认向params里面添加参数，当原参数中有name存在时替换value值，当name和value都相等时，则做操作
				for(var i=0;i<ary.length;i++){
					if(ary[i].name == name){
						if(ary[i].value != value){
							ary[i].value = value;	
						}
						noParam = false;
						break;
					}
				}
				if(noParam){
					ary.push({name:name,value:value});
				}
			},
			pager: 0
		};
		//init divs
		g.gDiv = document.createElement('div'); //create global container
		g.mDiv = document.createElement('div'); //create title container
		g.hDiv = document.createElement('div'); //create header container
		g.bDiv = document.createElement('div'); //create body container
		g.vDiv = document.createElement('div'); //create grip
		g.rDiv = document.createElement('div'); //create horizontal resizer
		g.cDrag = document.createElement('div'); //create column drag
		g.block = document.createElement('div'); //creat blocker
		g.nDiv = document.createElement('div'); //create column show/hide popup
		g.nBtn = document.createElement('div'); //create column show/hide button
		g.iDiv = document.createElement('div'); //create editable layer
		g.tDiv = document.createElement('div'); //create toolbar
		g.sDiv = document.createElement('div');
		g.pDiv = document.createElement('div'); //create pager container
		if (!p.usepager) {
			g.pDiv.style.display = 'none';
		}
		g.hTable = document.createElement('table');
		g.gDiv.className = 'flexigrid';
		if (p.width != 'auto') {
			g.gDiv.style.width = p.width + 'px';
		}
		//add conditional classes
		if ($.browser.msie) {
			$(g.gDiv).addClass('ie');
		}
		if (p.novstripe) {
			$(g.gDiv).addClass('novstripe');
		}
		$(t).before(g.gDiv);
		$(g.gDiv).append(t);

		if (p.colModel) { //create model if any
			thead = document.createElement('thead');
			var tr = document.createElement('tr');
			for (var i = 0; i < p.colModel.length; i++) {
				var cm = p.colModel[i];
				var th = document.createElement('th');
				th.innerHTML = cm.display;
				if (cm.name) {
					$(th).attr({'abbr':cm.name,'dataindex':(cm.dataindex || '')});
				}
				if(cm.sortable){
					$(th).attr('sortable',cm.sortable)
				}else{
					$(th).addClass('nosortable');
				}
				$(th).attr('axis', 'col' + i);
				if (cm.align) {
					th.align = cm.align;
				}
				/*添加title add by peach*/
				if(cm.displaytitle){
					th.title=cm.displaytitle;	
				}
				if (cm.width) {
					if(p.colAutoWidth){
						$(th).attr('width',g.setWidth());
					}else{
						$(th).attr('width', cm.width);
					}
				}
				if ($(cm).attr('hide')) {
					th.hidden = true;
				}
				if (cm.process) {
					th.process = cm.process;
				}

				if(cm.renderer){
					$(th).data('renderer',cm.renderer);
				}
				if(cm.mapping && cm.convert){
					$(th).data({'convert':cm.convert,'mapping':cm.mapping});
				}
				if(cm.customcell){
					$(th).data('customcell',cm.customcell);
				}
				if(cm.customFn){
					$(th).data('customFn',cm.customFn);
				}
				$(tr).append(th);
			}
			// 为表头增加checkbox
			if(p.checkbox){
				$(tr).prepend('<th chk_cell="true" abbr=""><span class="noborder"><input type="checkbox" /></span></th>');
			}
			$(thead).append(tr);
			$(t).prepend(thead);
		} // end if p.colmodel
		//set toolbar
		if (p.buttons) {
			g.tDiv.className = 'tDiv';
			var tDiv2 = document.createElement('div');
			tDiv2.className = 'tDiv2';
			for (var i = 0; i < p.buttons.length; i++) {
				var btn = p.buttons[i];
				if(btn.separator){
					$(tDiv2).append("<div class='btnseparator'></div>");
				}else if(btn.text){
					$(tDiv2).append('<div style="'+btn.style+'" class="toolbar-txt">'+btn.text+'</div>');
				}else{
					var btnDiv = document.createElement('div');
					btnDiv.className = btn.align == 'right' ? 'fbutton fbutton-r' : 'fbutton';
					btnDiv.innerHTML = "<span>" + btn.name + "</span>";
					
					if (btn.bclass) $('span', btnDiv).addClass(btn.bclass);
					if(btn.url) $('span', btnDiv).wrap('<a href="'+btn.url+'"/>');
					if(btn.id) btnDiv.id = btn.id;
					btnDiv.onpress = btn.onpress;
					btnDiv.name = btn.name;
					if (btn.onpress) {
						$(btnDiv).click(function () {
							this.onpress(this.name, g.gDiv);
						});
					}
					$(tDiv2).append(btnDiv);
					if ($.browser.msie && $.browser.version < 7.0) {
						$(btnDiv).hover(function () {
							$(this).addClass('fbOver');
						}, function () {
							$(this).removeClass('fbOver');
						});
					}
				}
			}
			$(g.tDiv).append(tDiv2);
			$(g.tDiv).append("<div style='clear:both'></div>");
			$(g.gDiv).prepend(g.tDiv);
		}
		g.hDiv.className = 'hDiv';
		$(t).before(g.hDiv);
		g.hTable.cellPadding = 0;
		g.hTable.cellSpacing = 0;
		$(g.hDiv).append('<div class="hDivBox"></div>');
		$('div', g.hDiv).append(g.hTable);
		var thead = $("thead:first", t).get(0);
		if (thead) $(g.hTable).append(thead);
		thead = null;
		if (!p.colmodel) var ci = 0;
		$('thead tr:first th', g.hDiv).each(function () {
			var thdiv = document.createElement('div');
			if ($(this).attr('abbr')) {
				$(this).click(function (e) {
					if (!$(this).hasClass('thOver')) return false;
					var obj = (e.target || e.srcElement);
					if (obj.href || obj.type) return true;
					g.changeSort(this);
				});
				if ($(this).attr('abbr') == p.sortname) {
					this.className = 'sorted';
					thdiv.className = 's' + p.sortorder;
				}
			}
			if (this.hidden) {
				$(this).hide();
			}
			if (!p.colmodel) {
				$(this).attr('axis', 'col' + ci++);
			}
			$(thdiv).css({
				textAlign: this.align,
				width: this.width + 'px'
			});
			thdiv.innerHTML = this.innerHTML;


			$(this).empty().append(thdiv).removeAttr('width').mousedown(function (e) {
				if(!$(this).attr('chk_cell') && p.resizableCol){
					g.dragStart('colMove', e, this); //阻止有checkbox的单元格拖拽
				}
			}).hover(function () {
				if($(this).attr('chk_cell')) return; //阻止有checkbox的单元格鼠标移入效果

				
				if (!g.colresize && !$(this).hasClass('thMove') && !g.colCopy && $(this).attr('sortable')) {
					$(this).addClass('thOver');
				}
				
				if ($(this).attr('abbr') != p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
					$('div', this).addClass('s' + p.sortorder);
				} else if ($(this).attr('abbr') == p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
					var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
					$('div', this).removeClass('s' + p.sortorder).addClass('s' + no);
				}
				if (g.colCopy) {
					var n = $('th', g.hDiv).index(this);
					if (n == g.dcoln) {
						return false;
					}
					if (n < g.dcoln) {
						$(this).append(g.cdropleft);
					} else {
						$(this).append(g.cdropright);
					}
					g.dcolt = n;
				} else if (!g.colresize) {
					var nv = $('th:visible', g.hDiv).index(this);
					var onl = parseInt($('div:eq(' + nv + ')', g.cDrag).css('left'));
					var nw = jQuery(g.nBtn).outerWidth();
					var nl = onl - nw + Math.floor(p.cgwidth / 2);
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					$(g.nBtn).css({
						'left': nl,
						top: g.hDiv.offsetTop
					}).show();
					var ndw = parseInt($(g.nDiv).width());
					$(g.nDiv).css({
						top: g.bDiv.offsetTop
					});
					if ((nl + ndw) > $(g.gDiv).width()) {
						$(g.nDiv).css('left', onl - ndw + 1);
					} else {
						$(g.nDiv).css('left', nl);
					}
					if ($(this).hasClass('sorted')) {
						$(g.nBtn).addClass('srtd');
					} else {
						$(g.nBtn).removeClass('srtd');
					}
				}
			}, function () {
				$(this).removeClass('thOver');
				if ($(this).attr('abbr') != p.sortname) {
					$('div', this).removeClass('s' + p.sortorder);
				} else if ($(this).attr('abbr') == p.sortname) {
					var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
					$('div', this).addClass('s' + p.sortorder).removeClass('s' + no);
				}
				if (g.colCopy) {
					$(g.cdropleft).remove();
					$(g.cdropright).remove();
					g.dcolt = null;
				}
			}); //wrap content
		});
		//set bDiv
		g.bDiv.className = 'bDiv';
		$(t).before(g.bDiv);
		$(g.bDiv).scroll(function (e) {
			g.scroll();
		}).append(t);
		//add td & row properties
		g.addCellProp();
		g.addRowProp();
		//set cDrag
		var cdcol = $('thead tr:first th:first', g.hDiv).get(0);
		if (cdcol != null) {
			g.cDrag.className = 'cDrag';
			g.cdpad = 0;
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderLeftWidth'))) ? 0 : parseInt($('div', cdcol).css('borderLeftWidth')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderRightWidth'))) ? 0 : parseInt($('div', cdcol).css('borderRightWidth')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingLeft'))) ? 0 : parseInt($('div', cdcol).css('paddingLeft')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingRight'))) ? 0 : parseInt($('div', cdcol).css('paddingRight')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth'))) ? 0 : parseInt($(cdcol).css('borderLeftWidth')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth'))) ? 0 : parseInt($(cdcol).css('borderRightWidth')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft'))) ? 0 : parseInt($(cdcol).css('paddingLeft')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight'))) ? 0 : parseInt($(cdcol).css('paddingRight')));
			$(g.bDiv).before(g.cDrag);
			var cdheight = $(g.bDiv).height();
			var hdheight = $(g.hDiv).height();
			$(g.cDrag).css({
				top: -hdheight + 'px'
			});
			$('thead tr:first th', g.hDiv).each(function () {
				var cgDiv = document.createElement('div');
				$(g.cDrag).append(cgDiv);
				if (!p.cgwidth) {
					p.cgwidth = $(cgDiv).width();
				}
				$(cgDiv).css({
					height: cdheight + hdheight
				}).mousedown(function (e) {
					g.dragStart('colresize', e, this);
				});
				if ($.browser.msie && $.browser.version < 7.0) {
					g.fixHeight($(g.gDiv).height());
					$(cgDiv).hover(function () {
						g.fixHeight();
						$(this).addClass('dragging');
					}, function () {
						if (!g.colresize) $(this).removeClass('dragging');
					});
				}
			});
		}
		//add strip
		if (p.striped) {
			$('tbody tr:odd', g.bDiv).addClass('erow');
		}
		if (p.resizable && p.height != 'auto') {
			g.vDiv.className = 'vGrip';
			$(g.vDiv).mousedown(function (e) {
				g.dragStart('vresize', e);
			}).html('<span></span>');
			$(g.bDiv).after(g.vDiv);
		}
		if (p.resizable && p.width != 'auto' && !p.nohresize) {
			g.rDiv.className = 'hGrip';
			$(g.rDiv).mousedown(function (e) {
				g.dragStart('vresize', e, true);
			}).html('<span></span>').css('height', $(g.gDiv).height());
			if ($.browser.msie && $.browser.version < 7.0) {
				$(g.rDiv).hover(function () {
					$(this).addClass('hgOver');
				}, function () {
					$(this).removeClass('hgOver');
				});
			}
			$(g.gDiv).append(g.rDiv);
		}
		// add pager
		if (p.usepager) {
			g.pDiv.className = 'pDiv';
			g.pDiv.innerHTML = '<div class="pDiv2"></div>';
			$(g.bDiv).after(g.pDiv);
			var html = '<div class="pReload pButton"><span></span></div> <div class="pGroup"></div> <div class="pGroup"> <div class="pFirst pButton"><span></span></div><div class="pPrev pButton"><span></span></div> </div>  <div class="pGroup"><span class="pcontrol">' + p.pagetext + ' <input type="text" size="4" value="1" /> ' + p.outof + '</span></div> <div class="pGroup"> <div class="pNext pButton"><span></span></div><div class="pLast pButton"><span></span></div> <div class="pGroup pagetotal"></div></div> ';
			$('div', g.pDiv).html(html);
			$('.pReload', g.pDiv).click(function () {
				g.populate();
			});
			$('.pFirst', g.pDiv).click(function () {
				g.changePage('first');
			});
			$('.pPrev', g.pDiv).click(function () {
				g.changePage('prev');
			});
			$('.pNext', g.pDiv).click(function () {
				g.changePage('next');
			});
			$('.pLast', g.pDiv).click(function () {
				g.changePage('last');
			});
			$('.pcontrol input', g.pDiv).keydown(function (e) {
				if (e.keyCode == 13) g.changePage('input');
			});
			if ($.browser.msie && $.browser.version < 7) $('.pButton', g.pDiv).hover(function () {
				$(this).addClass('pBtnOver');
			}, function () {
				$(this).removeClass('pBtnOver');
			});
			if (p.useRp) {
				var opt = '',
					sel = '';
				for (var nx = 0; nx < p.rpOptions.length; nx++) {
					if (p.rp == p.rpOptions[nx]) sel = 'selected="selected"';
					else sel = '';
					opt += "<option value='" + p.rpOptions[nx] + "' " + sel + " >" + p.rpOptions[nx] + "&nbsp;&nbsp;</option>";
				}
				$('.pDiv2', g.pDiv).append("<div class='pGroup'><select name='rp'>" + opt + "</select></div>");
				$('select', g.pDiv).change(function () {
					if (p.onRpChange) {
						p.onRpChange(+this.value);
					} else {
						p.newp = 1;
						p.rp = +this.value;
						g.populate();
					}
				});
			}
			//add search button  默认只可添加一搜索项
			if (p.searchitems) {
				/*
				$('.pDiv2', g.pDiv).prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");

				if(p.height == 'auto' || p.searchDirection == 'up'){
					$(g.sDiv).css({'position':'absolute','width':'100%','display':'block'});
				}
				$('.pSearch', g.pDiv).click(function () {
					if(p.height == 'auto' || p.searchDirection == 'up'){//如果高度是自适应的话，搜索栏应该是向上出现
						$(g.sDiv).animate({'margin-top':parseInt($(g.sDiv).css('margin-top')) == 0 ? -30 :0},400,function(){
							$('input:first',this).focus();
						});
					}else{
						$(g.sDiv).slideToggle('fast', function () {
							$('.sDiv:visible input:first', g.gDiv).trigger('focus');
						});
					}
				});
				//add search box
				g.sDiv.className = 'sDiv';
				var sitems = p.searchitems;
				var sopt = '', sel = '';
				for (var s = 0; s < sitems.length; s++) {
					if (p.qtype == '' && sitems[s].isdefault == true) {
						p.qtype = sitems[s].name;
						sel = 'selected="selected"';
					} else {
						sel = '';
					}
					sopt += "<option value='" + sitems[s].name + "' " + sel + " >" + sitems[s].display + "&nbsp;&nbsp;</option>";
				}
				if (p.qtype == '') {
					p.qtype = sitems[0].name;
				}
				$(g.sDiv).append("<div class='sDiv2'>" + p.findtext +
						" <input type='text' value='" + p.query +"' size='30' name='q' class='qsbox' /> "+
						" <select name='qtype'>" + sopt + "</select></div>");
				//Split into separate selectors because of bug in jQuery 1.3.2
				$('input[name=q]', g.sDiv).keydown(function (e) {
					if (e.keyCode == 13) {
						g.doSearch();
					}
				});
				$('select[name=qtype]', g.sDiv).keydown(function (e) {
					if (e.keyCode == 13) {
						g.doSearch();
					}
				});
				$('input[value=Clear]', g.sDiv).click(function () {
					$('input[name=q]', g.sDiv).val('');
					p.query = '';
					g.doSearch();
				});
				$(g.bDiv).after(g.sDiv);
				*/
				//重写搜索栏
				$('.tDiv2', g.tDiv).append('<div class="search_wrap fbutton-r"><label class="default_color" for="flexigird_search" d_txt="'+p.searchitems.display+'">'+p.searchitems.display+'</label><input id="flexigird_search" class="search_txt" type="text" name="'+p.searchitems.name+'" value="" /><button></button></div>');
                //聚焦隐藏默认文字
                $('#flexigird_search').focusin(function(){
                    $('div.search_wrap label.default_color').css('display', 'none');
                });
				$('.tDiv2 input',g.tDiv).bind('keyup keydown',function(e){
					var _prev = $(this).prev();
					this.value.length ? _prev.html('').removeClass('default_color') : _prev.html(_prev.attr('d_txt')).addClass('default_color');
				}).keydown(function(e){
					if (e.keyCode == 13) {
						g.doSearch();
					}
				}).next().click(function(){
					g.doSearch();
				});
			}
		}
		$(g.pDiv, g.sDiv).append("<div style='clear:both'></div>");
		// add title
		if (p.title) {
			g.mDiv.className = 'mDiv';
			g.mDiv.innerHTML = '<div class="ftitle">' + p.title + '</div>';
			$(g.gDiv).prepend(g.mDiv);
			if (p.showTableToggleBtn) {
				$(g.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
				$('div.ptogtitle', g.mDiv).click(function () {
					$(g.gDiv).toggleClass('hideBody');
					$(this).toggleClass('vsble');
				});
			}
		}
		//setup cdrops
		g.cdropleft = document.createElement('span');
		g.cdropleft.className = 'cdropleft';
		g.cdropright = document.createElement('span');
		g.cdropright.className = 'cdropright';
		//add block
		g.block.className = 'gBlock';
		var gh = $(g.bDiv).height();
		var gtop = g.bDiv.offsetTop;
		$(g.block).css({
			width: g.bDiv.style.width,
			height: gh,
			background: 'white',
			position: 'relative',
			marginBottom: (gh * -1),
			zIndex: 1,
			top: gtop,
			left: '0px'
		});
		$(g.block).fadeTo(0, p.blockOpacity);
		// add column control
		if ($('th', g.hDiv).length) {
			g.nDiv.className = 'nDiv';
			g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
			$(g.nDiv).css({
				marginBottom: (gh * -1),
				display: 'none',
				top: gtop
			}).noSelect();
			var cn = 0;
			$('th div', g.hDiv).each(function () {
				var kcol = $("th[axis='col" + cn + "']", g.hDiv)[0];
				var chk = 'checked="checked"';
				if (kcol.style.display == 'none') {
					chk = '';
				}
				$('tbody', g.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" ' + chk + ' class="togCol" value="' + cn + '" /></td><td class="ndcol2">' + this.innerHTML + '</td></tr>');
				cn++;
			});
			if ($.browser.msie && $.browser.version < 7.0) $('tr', g.nDiv).hover(function () {
				$(this).addClass('ndcolover');
			}, function () {
				$(this).removeClass('ndcolover');
			});
			$('td.ndcol2', g.nDiv).click(function () {
				if ($('input:checked', g.nDiv).length <= p.minColToggle && $(this).prev().find('input')[0].checked) return false;
				return g.toggleCol($(this).prev().find('input').val());
			});
			$('input.togCol', g.nDiv).click(function () {
				if ($('input:checked', g.nDiv).length < p.minColToggle && this.checked == false) return false;
				$(this).parent().next().trigger('click');
			});
			$(g.gDiv).prepend(g.nDiv);
			$(g.nBtn).addClass('nBtn')
				.html('<div></div>')
				.attr('title', 'Hide/Show Columns')
				.click(function () {
					$(g.nDiv).toggle();
					return true;
				}
			);
			if (p.showToggleBtn) {
				$(g.gDiv).prepend(g.nBtn);
			}
		}
		// add date edit layer
		$(g.iDiv).addClass('iDiv').css({
			display: 'none'
		});
		$(g.bDiv).append(g.iDiv);
		// add flexigrid events
		$(g.bDiv).hover(function () {
			$(g.nDiv).hide();
			$(g.nBtn).hide();
		}, function () {
			if (g.multisel) {
				g.multisel = false;
			}
		});
		$(g.gDiv).hover(function () {}, function () {
			$(g.nDiv).hide();
			$(g.nBtn).hide();
		});
		//add document events
		$(document).mousemove(function (e) {
			g.dragMove(e);
		}).mouseup(function (e) {
			g.dragEnd();
		}).hover(function () {}, function () {
			g.dragEnd();
		});
		//browser adjustments
		if ($.browser.msie && $.browser.version < 7.0) {
			$('.hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv', g.gDiv).css({
				width: '100%'
			});
			$(g.gDiv).addClass('ie6');
			if (p.width != 'auto') {
				$(g.gDiv).addClass('ie6fullwidthbug');
			}
		}
		g.rePosDrag();
		g.fixHeight();
		//make grid functions accessible
		t.p = p;
		t.grid = g;
		// load data
		if (p.url && p.autoload) {
			g.populate();
		}
		if (p.height == 'auto') {//重写自适应高度
			var totalH = 1;
			$(g.bDiv).siblings(':visible').each(function(){
				if($(this).css('position') != 'absolute'){
					totalH += $(this).outerHeight(true);
				}
			});
			$(g.bDiv).height($(g.gDiv).parent().height() - totalH);
			$('html').css('overflow-y','hidden');
			//去除水平方向滚动条
			var firstWidth = $(g.bDiv).width() - 10;
			$(g.bDiv).addClass('hidden_x');
			$(window).bind('resize',function(){
				if($(g.bDiv).width() < firstWidth) {
					$(g.bDiv).removeClass('hidden_x');
				}else {
					$(g.bDiv).addClass('hidden_x');
				}
				$(g.bDiv).height($(g.gDiv).parent().height()- totalH);
			});
		}else{
			$(g.bDiv).height(p.height);
		}
		if(p.checkbox){
			g.checkAll();
			$('td :checkbox',g.gDiv).live('click',function(){
				g.addRowClass(this);
			});
			if(p.singleSelect){//如果是单选模式，那么隐藏表头的checkbox
				$('th :checkbox',g.gDiv).css('visibility','hidden');
			}
		}
		if(p.relationBtn){
			g.relationBtns();
			$(':checkbox',g.gDiv).live('change',g.relationBtns);
		}
		if(p.singleRelation){
			g.singleRelation();
			$(':checkbox',g.gDiv).live('change',g.singleRelation);
		}
		if(p.customRelation){
			g.customRelation();
			$(':checkbox',g.gDiv).live('change',g.customRelation);
		}
		return t;
	};
	var docloaded = false;
	$(document).ready(function () {
		docloaded = true
	});
	$.fn.flexigrid = function (p) {
		return this.each(function () {
			if (!docloaded) {
				$(this).hide();
				var t = this;
				$(document).ready(function () {
					$.addFlex(t, p);
				});
			} else {
				$.addFlex(this, p);
			}
		});
	}; //end flexigrid
	$.fn.flexReload = function (p) { // function to reload grid
		return this.each(function () {
			if (this.grid && this.p.url) this.grid.populate();
		});
	}; //end flexReload
	$.fn.flexOptions = function (p) { //function to update general options
		return this.each(function () {
			if (this.grid) $.extend(this.p, p);
		});
	}; //end flexOptions
	$.fn.flexToggleCol = function (cid, visible) { // function to reload grid
		return this.each(function () {
			if (this.grid) this.grid.toggleCol(cid, visible);
		});
	}; //end flexToggleCol
	$.fn.flexAddData = function (data) { // function to add data to grid
		return this.each(function () {
			if (this.grid) this.grid.addData(data);
		});
	};
	$.fn.noSelect = function (p) { //no select plugin by me :-)
		var prevent = (p == null) ? true : p;
		if (prevent) {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).bind('selectstart', function () {
					return false;
				});
				else if ($.browser.mozilla) {
					$(this).css('MozUserSelect', 'none');
					$('body').trigger('focus');
				} else if ($.browser.opera) $(this).bind('mousedown', function () {
					return false;
				});
				else $(this).attr('unselectable', 'on');
			});
		} else {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).unbind('selectstart');
				else if ($.browser.mozilla) $(this).css('MozUserSelect', 'inherit');
				else if ($.browser.opera) $(this).unbind('mousedown');
				else $(this).removeAttr('unselectable', 'on');
			});
		}
	}; //end noSelect
})(jQuery);
