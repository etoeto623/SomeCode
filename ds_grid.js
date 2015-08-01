/**
 * Created by ds on 2015/7/29.
 */
;(function($){

    /**
     * data:
     *    |--fieldArr : 每一列值对应的字段
     *    |--gridCode : 表格的标识符
     *    |--gridData : loadData时的rows数据
     *    |--isDblClick : 是否为双击事件
     *    |--options : 表格的设置信息
     *          |--checkbox : 行复选框
     *          |--columns : 行设置
     *          |     |--field : 对应loadData中的数据的字段名
     *          |     |--title : 列头名称
     *          |     |--formatter : cell格式化函数 fn(value,row,index)
     *          |--onClickRow : 单击行事件fn(index,data)
     *          |--onDblClickRow : 双击行事件fn(index,data)
     *          |--rowIndex : 是否显示行号 default:false
     *          |--onClickRow : 单击行事件 fn(index,data)
     *          |--onDblClickRow : 双击行事件 fn(index,data)
     *          |--loadData : 表格加载数据 {rows:rows,total:number}
     *          |--getSelected : 获取选中行的数据
     *          |--dataSource : 数据源行数
     *
     *
     * $("").dsdatagrid("loadData",{rows:[{key:value}],total:number});
     * $("").dsdatagrid("getSelected");
     */



    // 保存常量数据
    var Constants = {
        gridDataKey : "gridOptions",
        dblClickInterval : 400, //双击的时间间隔
        rowSelectedClass : "ds_grid_row_selected",
        defaultOptions : { //datagrid的默认参数

        },
        gridTemplate : "<table class='ds_grid_table' id='ds_grid_table_#id#'>"+
                         "<tr id='thead_#id#' class='ds_grid_thead_tr'>#thead#</tr>"+
                       "</table>",

        gridTemplateHead : "<th class='ds_grid_th ds_grid_th'>#title#</th>",

        gridTemplateHeadCkb : "<th class='ds_grid_th_ckb'>"+
                                "<input type='checkbox' gcode='#id#' id='ds_grid_th_ckb_#id#' class='ds_grid_th_ckb'/>"+
                              "</th>",

        gridTemplateRowCkb : "<td class='ds_grid_td_ckb'>"+
                                "<input type='checkbox' class='ds_grid_td_ckb_#id#' id='ds_grid_td_ckb_#id#_#index#'/>"+
                             "</td>"
    };

    var Util = {
        randStr : function( len ){
            len = len || 5;
            var result = "";
            for(var i = 0; i < len; i++){
                result += Math.floor(Math.random()*16 -0.0001).toString(16);
            }
            return result;
        },
        toggleSelect : function( code, index ){
            var target = $("#ds_grid_row_"+code+"_"+index);
            var sl = $(target).attr('sl');
            sl = parseInt(sl,10);
            sl *= -1;
            var ckb = $("#ds_grid_td_ckb_"+code+"_"+index);
            if( sl == 1 ){ //转化为选中
                $(target).addClass(Constants.rowSelectedClass);
                if( ckb.length > 0 && !ckb.prop("checked") ){
                    ckb.click();
                }
            }else{
                $(target).removeClass(Constants.rowSelectedClass);
                if( ckb.length > 0 && ckb.prop("checked") ){
                    ckb.click();
                }
            }
            $(target).attr('sl',sl);
        },
        isPropSwitchOn : function( data,property ){
            var options = data.options;
            if( options[property] ){
                return true;
            }
            return false;
        }
    };

    var Plugin = {
        Checkbox : {
            init : function( gridCode ){
                var thCkb = $("#ds_grid_th_ckb_"+gridCode);
                var tdCkbs = $(".ds_grid_td_ckb_"+gridCode);
                thCkb.unbind('click').on('click',function(){
                    tdCkbs.prop('checked',thCkb.prop('checked'));
                    //改变行的选中状态
                    if( thCkb.prop('checked') ){
                        $(".ds_grid_row_tr_"+gridCode).addClass(Constants.rowSelectedClass).attr('sl','1');
                    }else{
                        $(".ds_grid_row_tr_"+gridCode).removeClass(Constants.rowSelectedClass).attr('sl','-1');
                    }
                });
                tdCkbs.unbind('click').on('click',function(e){
                    var hasUnChecked = false;
                    for(var i = 0; i < tdCkbs.length; i++){
                        if( !$(tdCkbs[i]).prop('checked') ){
                            hasUnChecked = true;
                            break;
                        }
                    }
                    $(thCkb).prop('checked',!hasUnChecked);
                });
            }
        }
    };

    var Common = {
        // 初始化表格
        buildGrid : function( target ){
            var gridCfgData = $.data(target,Constants.gridDataKey);
            var gridCode = gridCfgData.gridCode;
            var columns = gridCfgData.options.columns;
            var tablestr = Constants.gridTemplate;
            var theadTmpl = Constants.gridTemplateHead;
            var theadstr = "";
            var fieldArr = [];
            if( gridCfgData.options.rowIndex ){ //行号
                theadstr += "<th></th>";
            }
            if( gridCfgData.options.checkbox ){ //复选框
                theadstr += Constants.gridTemplateHeadCkb.replace(/#id#/g,gridCode);
            }
            for(var i = 0; i < columns.length; i++){
                theadstr += theadTmpl.replace(/#title#/,columns[i].title);
                if( !columns[i].field ){
                    alert("columns未包含field信息，初始化失败！");
                    return;
                }
                fieldArr.push( columns[i].field );
            }
            $.data(target,Constants.gridDataKey).fieldArr = fieldArr;
            tablestr = tablestr.replace(/#thead#/,theadstr).replace(/#id#/g,gridCode);
            $(target).empty().append($(tablestr));
        },
        loadData : function( target, data, reload ){
            var total = data.total || 0;
            var rows = data.rows;
            var rowstr = "";
            var gridData = $(target).data(Constants.gridDataKey);
            gridData.gridData = data.rows;
            gridData.isDblClick = false;
            var fieldArr = gridData.fieldArr;
            var gridCode = gridData.gridCode;
            var columns = gridData.options.columns;
            var oddOrEven;
            if( reload ){ //重新加载
                $(".ds_grid_row_tr_"+gridCode).remove();
            }

            //组装列表数据
            for(var i = 0; i < rows.length; i++){
                oddOrEven = i%2==0?"even":"odd";
                var tmp = "<tr class='ds_grid_row_tr ds_grid_row_tr_"+gridCode+" ds_grid_row_tr_"+oddOrEven+"' sl='-1' idx='"+i+"' id='ds_grid_row_"+gridCode+"_"+i+"'>";
                if( gridData.options.rowIndex ){ //添加行号
                    tmp += "<td class='ds_grid_td_idx'>"+(i+1)+"</td>";
                }
                if( gridData.options.checkbox ){
                    tmp += Constants.gridTemplateRowCkb.replace(/#id#/g,gridCode).replace(/#index#/g,i);
                }
                for(var j = 0; j < fieldArr.length ; j++){
                    var titleValue = rows[i][fieldArr[j]];
                    if( columns[j].formatter && typeof columns[j].formatter == "function" ){// formatter函数
                        titleValue = columns[j].formatter( titleValue, rows[i], i );
                    }
                    tmp += "<td class='ds_grid_row_td'>"+titleValue+"</td>";
                }
                tmp += "</tr>";
                rowstr += tmp;
            }
            $(rowstr).insertAfter($("#thead_"+gridCode));
            if( gridData.options.checkbox ){
                Plugin.Checkbox.init( gridCode );
            }

            //绑定点击事件
            $(".ds_grid_row_tr_"+gridCode).unbind('click').on('click',function(){
                var idx = $(this).attr('idx');
                Util.toggleSelect( gridCode, idx );
                if( gridData.options.onClickRow && typeof gridData.options.onClickRow == "function" ){
                    var rowData = gridData.gridData[idx];
                    setTimeout(function(){
                        if( gridData.isDblClick ) return;
                        gridData.options.onClickRow( idx, rowData );
                    },Constants.dblClickInterval);
                }
            });
            if( gridData.options.onDblClickRow && typeof gridData.options.onDblClickRow == "function" ){
                $(".ds_grid_row_tr_"+gridCode).unbind('dblclick').on('dblclick',function(){
                    gridData.isDblClick = true;
                    var idx = $(this).attr('idx');
                    var rowData = gridData.gridData[idx];
                    gridData.options.onDblClickRow( idx, rowData );
                    setTimeout(function(){
                        gridData.isDblClick = false;
                    },Constants.dblClickInterval);
                });
            }
        },
        getSelectedRow : function( gridCode ){
            var ctn = $("#ds_grid_table_"+gridCode).closest("div");
            var columns = ctn.data(Constants.gridDataKey).gridData;
            var trs = $(".ds_grid_row_tr_"+gridCode+"[sl='1']");
            var result = [];
            for(var i = 0; i < trs.length; i++){
                var idx = parseInt($(trs[i]).attr('idx'),10);
                result.push( columns[idx] );
            }
            return result;
        }
    };


    $.fn.dsdatagrid = function( param1, param2 ){
        if( typeof param1 == "string" ){
            return $.fn.dsdatagrid.methods[param1]( this, param2 );
        }
        param1 = param1 || {};
        return this.each(function(){
            var state = $.data(this, Constants.gridDataKey);
            var opts;
            if( state ){ //已经初始化过
                opts = $.extend( state.options, param1 );
                state.options = opts;
            } else { //首次初始化
                opts = $.extend( {}, param1 );
                if( !opts.columns || opts.columns.length == 0 ){
                    alert("未指定列信息，初始化失败！");
                    return;
                }
                $.data(this,Constants.gridDataKey,{
                    options : opts,
                    gridCode : Util.randStr()
                });
            }

            // 根据初始化参数生成表格
            Common.buildGrid( this );
        });
    };

    $.fn.dsdatagrid.methods = {
        loadData : function( jq, data ){
            return jq.each(function(){
                Common.loadData( this, data );
            });
        },
        getSelected : function( jq ){
            return Common.getSelectedRow( $(jq[0]).data(Constants.gridDataKey).gridCode );
        }
    };
})(jQuery);