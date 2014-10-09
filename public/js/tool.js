
function bindSelect(url,data,id)
{
	$.ajax({
	  type: 'POST',
	  url: url,
	  data: data,
	  success: function(data){
		var obj = eval(data);
		$(obj).each(function(index) {
			var val = obj[index];
			$("<option value='"+val.id+"'>"+val.name+"</option>").appendTo($("#"+id));
		});
	  },
	  dataType: 'text'
	});
}

function getCookie(c_name){　　　
    if (document.cookie.length>0){　
        //先查询cookie是否为空，为空就return ""　
        c_start=document.cookie.indexOf(c_name + "=")　
        //通过String对象的indexOf()来检查这个cookie是否存在，不存在就为 -1　　　
        if (c_start!=-1){ 　　　　　　
            c_start=c_start + c_name.length+1　　
            //最后这个+1其实就是表示"="号啦，这样就获取到了cookie值的开始位置　　
            c_end=document.cookie.indexOf(";",c_start)　　
            //其实我刚看见indexOf()第二个参数的时候猛然有点晕，后来想起来表示指定的开始索引的位置...
            //这句是为了得到值的结束位置。因为需要考虑是否是最后一项，所以通过";"号是否存在来判断　　　
            if (c_end==-1) c_end=document.cookie.length　　　　　　　　
            return unescape(document.cookie.substring(c_start, c_end));//unespace 解码
        }
    } return ""
}

function setCookie(c_name, value, expiredays){
　　　　var exdate=new Date();
　　　　exdate.setDate(exdate.getDate() + expiredays);
　　　　document.cookie=c_name+ "=" + escape(value) + ((expiredays==null) ? "" : ";path=/;expires="+exdate.toGMTString());
}

function delCookie(name) 
{ 
    var exp = new Date(); 
    exp.setTime(exp.getTime() - 1); 
    var cval=getCookie(name); 
    if(cval!=null) 
        document.cookie= name + "="+cval+";path=/;expires="+exp.toGMTString(); 
} 
function getDateTime(date)
{
	var myDate=new Date();
	if(date){
		myDate=new Date(date);
	}
	var year=myDate.getFullYear();    //获取完整的年份(4位,1970-????)
	var mongth=myDate.getMonth()+1;       //获取当前月份(0-11,0代表1月)
	var day=myDate.getDate();        //获取当前日(1-31)
	var h=myDate.getHours();       //获取当前小时数(0-23)
	var m=myDate.getMinutes();     //获取当前分钟数(0-59)
	var s=myDate.getSeconds();     //获取当前秒数(0-59)

	return year+"/"+mongth+"/"+day+" "+h+":"+m+":"+s;
}
 