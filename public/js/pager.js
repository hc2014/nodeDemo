(function($){
	$.fn.extend({ 
		"pager":function(options,callback){
			if(!options) throw new Error("pager()参数不正确!");
			var option={
				pageIndex:options.data.pageIndex||1,//页码
				pageCount:options.data.pageCount||10,//显示数目
				url:options.url,//要访问的页面
				data:options.data//参数
			};
			
			var elementID=$(this).attr("id");
			var pageIndex=option.pageIndex;
			var pageCount=option.pageCount;
			var allCount=0;//总数
			var dataSource;//数据

			//生成html
			var html='<button  title="首页" id="'+elementID+'_first">\<\<</button><button title="上一页" id="'+elementID+'_pre">\<</button><button title="下一页"';
				html+=' id="'+elementID+'_next">\></button><button title="末页" id="'+elementID+'_last">\>\></button>';
				html+='<span style="margin-left:50px"><label id="'+elementID+'_now">1</label>\/<label id="'+elementID+'_all">100</label></span>';
			$(this).append(html);

			pagerAjax(pageIndex,pageCount,callback);
			$("#"+elementID+"_first").on("click",function(){
				pageIndex=1;
				pagerAjax(pageIndex,pageCount,callback);
			})

			$("#"+elementID+"_pre").on("click",function(){
				pageIndex==1?1:pageIndex--;
				pagerAjax(pageIndex,pageCount,callback);
			})

			$("#"+elementID+"_next").on("click",function(){
				var yu=allCount%pageCount;//取模
				var i=yu==0?0:1;
				pageIndex==parseInt(allCount/pageCount)+i?parseInt(allCount/pageCount)+i:pageIndex++;
				pagerAjax(pageIndex,pageCount,callback);
			})

			$("#"+elementID+"_last").on("click",function(){
				pageIndex=parseInt(allCount/pageCount)+(allCount%pageCount==0?0:1);
				pagerAjax(pageIndex,pageCount,callback);
			})

			function pagerAjax(pageIndex,pageCount,callback){
				options.data.pageIndex=pageIndex;
				options.data.pageCount=pageCount;
				$.ajax({
				  type: 'POST',
				 url: option.url,
				  data:options.data,
				  success: function(data){//返回的数据是包含了 根据当前分页后的数据和所有数据的总数两部分组成的 	
				  	 allCount=data.count;
				  	 dataSource=data.data;
				  	 $("#"+elementID+"_now").text(pageIndex);
				  	 $("#"+elementID+"_all").text(parseInt(allCount/pageCount)+(allCount%pageCount==0?0:1));
				  	 callback(dataSource);
				  },
				  error:function(err)
					{
						console.log(err);
					},
				  dataType: 'json'
				});
			}
		}
	})
})(jQuery)