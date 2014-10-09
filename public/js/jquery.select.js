var selectname = "";
var alloptions = new Array();
(function ($) {
    $.fn.ajaxSelect = function (source, options) {
        $.fn.extend({     
            selectLoadData:function(res){
                selectLoadData(res);
            },
            selectdata:function(obj){
                selectdata(obj);
            }
         });
        var defaults = {
            showup:false,//是否显示身上
            width:null,//显示宽度
            data:null,//数据集合
            sql: null, //SQL语句
            lengths: null,//每列显示长度
            params:null,//参数值
            type: this.attr("name"), //后台调用参数名
            defaultcallback:false,//默认第一次返回值
            callback: function () {
                return false
            }, //回调方法
            nums: true,//是否显示序号
            page: 1, //当前面码
            rows: 10, //页面行数
            total: 1, //总记录数
            pagecount: 1, //总页面
            source: '', //josn数据地址
            inputname: '', //输入值控件名
            intervalprocess: null, //时间戳
            pretext: '', //输入框值
            field: null, //相关显示字段
            title:null,//列标题
            dbname:null,
            name: null, //名称
            all:false,//显示全部
            selectedItem: 0//选定列
        };
        options = $.extend(defaults, options);
        options.source = source;
        $.ajax({
                type: "POST",
                url: options.source,
                data: "{'_params': '" + options.params + "'}",
                contentType: "application/json; charset=utf-8;",
                dataType: "json",
                async: false,
                success: function (data) {
                    var result = data.d.split('|');
                    if (result.length == 4) {
                        options.sql = escape(result[0]);
                        options.lengths = result[1];
                        options.title = result[2];
                        options.dbname=result[3];
                    }
                }
            });
        options.inputname = this.attr("id");
        selectname = this.attr("id");
        alloptions[selectname] = options;

        $.ajaxSetup({ cache: false }); //设置ajax缓存
        this.attr("title", "点击搜索图标");
         
        $("#" + options.inputname).wrap("<div class='rel' id='" + options.inputname + "_etrackrel' >");
        if( $("#" + options.inputname).attr("disabled")=="disabled")
           $("#" + options.inputname + "_etrackrel").append("<a href='javascript:$(\"" + options.inputname + "\").selectdata(\"" + options.inputname + "\")' selectname='" + options.inputname + "' disabled='disabled' class='search-icon'></a><div id='" + options.inputname + "_etrackcontent'> </div>");
        else
          $("#" + options.inputname + "_etrackrel").append("<a href='javascript:$(\"" + options.inputname + "\").selectdata(\"" + options.inputname + "\")' selectname='" + options.inputname + "' class='search-icon'></a><div id='" + options.inputname + "_etrackcontent'> </div>");

        function selectdata(obj) {
            selectname=obj;
            options = alloptions[selectname];
            options.all=true;
            selectLoadData(options.page); 
            $("#" + selectname).focus();
        }
       $("#" + options.inputname).keydown(function (event) {
          if (event.keyCode == 13) {//enter键 
                if ($("#" + options.inputname + "_etrackselect table").find('tr').eq((options.selectedItem)).find("td").length > 0) {
                    selectedItem((options.selectedItem))
                }
            }
       });
        $("#" + options.inputname).keyup(function (event) {
            if (event.keyCode > 40 || event.keyCode == 8 || event.keyCode == 32) {//字母数字，退格，空格 
                options.all=false;
                options.page=1;
                if ($("#" + options.inputname + "_etrackselect table tr").find("[name='" + (event.keyCode - 48) + "']").length > 0) {
                    selectedItem(event.keyCode - 49);
                } else { 
                    if (($("#" + options.inputname).val() != options.pretext || options.pretext == "") && $("#" + options.inputname).val() != "") {
                        options.intervalprocess = setTimeout('$(\"#"+selectname+"\").selectLoadData(' + options.page + ')', '100');
                    }
                    options.pretext = $("#" + options.inputname).val();
                }
            }
            else if (event.keyCode == 38) { //上 
                if (options.selectedItem == -1) {
                    setSelectedItem($("#" + options.inputname + "_etrackselect table").find('tr').length - 1);
                }
                else { //索引减1 
                    setSelectedItem(options.selectedItem - 1);
                }
                event.preventDefault();
            }
            else if (event.keyCode == 40) {   //下 

                if (options.selectedItem == -1) {
                    setSelectedItem(0);
                }
                else {//索引加1 
                    setSelectedItem(options.selectedItem + 1);
                }
                event.preventDefault();
            }
            else if (event.keyCode == 27) {//esc键 
                $("#" + options.inputname + "_etrackselect").empty().hide();
            }else if (event.keyCode == 33) {//pgUp键 
                $("#"+options.inputname+"").selectLoadData((options.page - 1))
            }else if (event.keyCode == 34) {//pgDn键 
                 $("#"+options.inputname+"").selectLoadData((options.page + 1))
            }
        
        }).blur(function (event) {
            $(this).removeClass("cur");
        }).focus(function (event) {
            $(this).addClass("cur");
            selectname = this.id;
        });

        function selectedItem(item) {
            if ( options.name != null && options.name != "") {
                $("#" + options.inputname).val($("#" + options.inputname + "_etrackselect table tr").eq(item).find("[name='" + options.name + "']").text());
            } else {
                if($("#" + options.inputname + "_etrackselect table tr").eq(item).find("td").length==2)
                    $("#" + options.inputname).val($("#" + options.inputname + "_etrackselect table tr").eq(item).find("td")[1].innerText);
                else
                    $("#" + options.inputname).val($("#" + options.inputname + "_etrackselect table tr").eq(item).find("td")[2].innerText);
            }
            options.selectedItem = 0;
            $("#" + options.inputname + "_etrackselect").empty().hide();
             $("#ifr_" + options.inputname ).hide();
            options.callback(options.data.rows[item]);
        }
        function setSelectedItem(item) {
            options.selectedItem = item;        //更新索引变量 
            if (options.selectedItem < 0) {//按上下键是循环显示的，小于0就置成最大的值，大于最大值就置成0 
                options.selectedItem = $("#" + options.inputname + "_etrackselect table").find('tr').length - 1;
            }
            else if (options.selectedItem > $("#" + options.inputname + "_etrackselect table").find('tr').length - 1) {
                options.selectedItem = 0;
            }
            //首先移除其他列表项的高亮背景，然后再高亮当前索引的背景 
            $("#" + options.inputname + "_etrackselect table").find('tr').removeClass('li-bg').eq(options.selectedItem).addClass('li-bg');
        };

        function selectLoadData(res) {
            var options = options = alloptions[selectname];
            clearInterval(options.intervalprocess);
            if (res < 1 || res == null)
                options.page = 1;
            else if (options.pagecount <= res && options.pagecount > 0)
                options.page = options.pagecount;
            else
                options.page = res;
            var word="";
            if(options.all)
                word="";
            else
                word=escape(trim($("#" + selectname).val()));
            $.getJSON(options.source, {
                    'type': options.type,
                    'page': options.page,
                    'rows': options.rows,
                    'word': word,
                    'field': escape(options.field),
                    'id': escape(options.id),
                    'name': options.name
                },function (data) {
                options.data=data;
                     insertSelect(options)
                });
    
        }
        function trim() {
            if (arguments.length < 1)
                return null;
            if (typeof (arguments[0]) == "string")
                return arguments[0].replace(/(^\s*)|(\s*$)/g, "");
            else
                return "";
        }
        function insertSelect(options) {
            for (var i = 0; i < $(".rel").length; i++) {
                if($(".rel")[i].id.indexOf('etrackrel')>=0){
                    if($(".rel")[i].id!=options.inputname+"_etrackrel")
                        $("#"+$(".rel")[i].id).css("z-index","99990");
                    else
                         $("#"+$(".rel")[i].id).css("z-index","99991");
                }
            }
         
            var data=options.data;
            options.total = data.total;
            options.pagecount = parseInt(options.total / options.rows);
            if ((options.total % options.rows) != 0)
                options.pagecount++;
            var content = "";
            var width = 0;
            if (options.showup==true)
                content += "<iframe id='ifr_" + options.inputname + "' style='z-index:100; position:absolute; bottom:25px;left:0' scrolling='no' frameborder='0' width='100%' height='"+(data.rows.length*20)+"'></iframe><div class='list-up' style='display:none' id='" + options.inputname + "_etrackselect' >  ";
            else
                content += "<iframe id='ifr_" + options.inputname + "' style='z-index:100; position:absolute; top:25px;left:0' scrolling='no' frameborder='0' width='100%' height='"+(data.rows.length*20)+"'></iframe><div class='list-down' style='display:none;' id='" + options.inputname + "_etrackselect' >  ";
            if (options.showup==true) {
                if (options.total > options.rows) {
                    content += "<div class='pg'>";
                    content += getPages();
                    content += " </div>";
                }
            }
            content += "<div class='list-con' >";
            content += "<table>";
            var count = 0;
            var breakstate = false;
            var keyname = "";
            var titlecount=1;
            var titles= "";
            if(options.title!=null)
                titles=options.title.split(',');
            $.each(data.rows, function (entryIndex, entry) {
                if (breakstate == true)
                    return;
                if(options.field == null){
                     for (var key in entry) {
                         if(titles.length>0){
                            if(titles.length>=titlecount){
                                if(titlecount==1)
                                    options.field=key;
                                else
                                    options.field+=","+key;
                                titlecount++;
                             }
                             else 
                                break;
                         }
                         else{
                            options.field+=key+",";
                         }
                     }
                }
                if(options.title==null)
                    options.title = options.field;
                
                if(options.nums==true)
                    content += " <tr> <td width=17 name=" + (count + 1) + ">" + (count + 1) + "</td>";
                else
                    content += " <tr> <td width=17 name=" + (count + 1) + " style='display:none'>" + (count + 1) + "</td>";
                var tempwidth = 0;
          
                var field = options.field.split(',');
                for (var i = 0; i < field.length; i++) {
                    var idname=field[i].toUpperCase();
                    if (entry[idname] == null) {
                        breakstate = true;
                        break;
                    }

                    if (options.lengths != null && options.lengths.split(',').length == field.length)
                        tempwidth = parseInt(options.lengths.split(',')[i]);
                    else {
                        for (var j = 0; j < entry[field[i]].length; j++) {
                            tempwidth += 17;
                        }
                        if (entry[field[i]].length == 0)
                            tempwidth = 17;
                    }

                    if (tempwidth == 0)
                        content += "<td width='" + tempwidth + "' name='" + idname + "' style='display:none' >" + entry[idname] + "</td>";
                    else
                        content += "<td width='" + tempwidth + "' name='" + idname + "' title='" + titles[i] + "：  " + entry[idname] + "' >" + entry[idname] + "</td>";

                }
                if (count == 0&&options.defaultcallback==true)
                    options.callback(entry);
                
                count++;
                content += "</tr>";
            })
            if(options.nums==true)
                width += 17;
           
            content += "</table>";
             if(data.rows==0)
            {
             content += "<div style='width:100px;line-height:30px;' >无数据</div>";
            }
            content += "</div>";
            if (options.showup==false) {
                if (options.total > options.rows) {
                    content += "<div class='pg-down'>";
                    content += getPages();
                    content += " </div>";
                }
            }
            $("#" + options.inputname + "_etrackcontent").empty();
            $("#" + options.inputname + "_etrackcontent").append(content);

            $("#" + options.inputname + "_etrackselect table tr ").hover(function () {
                $(this).addClass("li-bg");
            }, function () {
                $(this).removeClass("li-bg");
            })
            $("#" + options.inputname + "_etrackselect table").find('tr').removeClass('li-bg').eq(0).addClass('li-bg');
            $("#" + options.inputname + "_etrackselect table tr").click(function () {
                if (options.name != null) {
                    $("#" + options.inputname).val($(this).find("[name='" + options.name + "']").text());
                } else {
                    if ($(this).find("td").length == 2)
                        $("#" + options.inputname).val($(this).find("td")[1].innerText);
                    else
                        $("#" + options.inputname).val($(this).find("td")[2].innerText);
                }
                $("#" + options.inputname + "_etrackselect").hide();
                
                options.callback(data.rows[parseInt($(this).find("td")[0].innerText)-1]);
            });
           
            if(options.width!=null&&options.width!=""){
                $(".list-con").css("width", options.width);
                $(".list-con table").css("width", options.width);
                $(".pg-down").css("width", options.width);
            }
            else{
                 if (width > ($("#" + options.inputname).width()))
                    $(".list-con table").css("width", width);
                else
                    $(".list-con table").css("width", $("#" + options.inputname).width());
                $("#" + options.inputname + "_etrackselect").css("width", $("#" + options.inputname).width());
            }
            $("#" + options.inputname + "_etrackselect").show();
            $(".close").click(function () {
            $("#ifr_" + options.inputname ).hide();
                $("#" + options.inputname + "_etrackselect").hide();
            });
            $("#" + options.inputname + "_etrackselect").mouseleave(function () {
                $("#ifr_" + options.inputname ).hide();
                $(this).hide();
            });
             $(document.body).click(function () {
                $("#ifr_" + options.inputname ).hide();
                $("#" + options.inputname + "_etrackselect").hide();
            });
        }
        function getPages() {
            var options = options = alloptions[selectname]; 
            var content = "";
            if(options.page==1)
                content += "<a href='javascript: $(\"#"+selectname+"\").selectLoadData(1)' class='home_dis' disabled='disabled' ></a>";
            else
                content += "<a href='javascript: $(\"#"+selectname+"\").selectLoadData(1)' class='home'></a>";
            content += "    &nbsp;<a href='javascript: $(\"#"+selectname+"\").selectLoadData(" + (options.page - 1) + ")' class='prev'></a>";
            content += "    <a href='javascript: $(\"#"+selectname+"\").selectLoadData(" + (options.page + 1) + ")' class='next'></a>";
            if(options.page==options.pagecount)
                content += "  <a href='javascript: $(\"#"+selectname+"\").selectLoadData(" + options.pagecount + ")' class='last_dis' disabled='disabled' ></a>   ";
            else
                content += "  <a href='javascript: $(\"#"+selectname+"\").selectLoadData(" + options.pagecount + ")' class='last'></a>   ";
            content += " &nbsp; <span class='pages'>第" + options.page + "页 /共" + options.pagecount + "页</span>";
            return content;
        }   

    }
})(jQuery);


