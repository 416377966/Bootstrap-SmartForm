﻿var global = {
    Fn: {}  //公共方法
};
/***=========================
+ Serialize Form to Json
* form: [id,#id,$(#id)], 
* filter: filter string suport RegExp,array,object
* Add By Gary *
=============================*/
global.Fn.serializeJson = function (form, filter) {
    var _filtDisabled = true;
    if (typeof arguments[0] == "boolean") {
        _filtDisabled = arguments[0];
        form = filter;
        filter = arguments[2];
    }
    var $form = global.Fn.$(form);
    if (!$form[0]) return null;
    if (filter) filter = typeof filter == "string" ? new RegExp(filter) : filter;
    var result = {};
    //var array = $form.serializeArray();
    var fields = $form.find(":input");
    if (_filtDisabled) {
        fields = fields.not(":disabled");
    }
    var amountReg = /^[1-9](?:\d*,\d+)+/

    fields.each(function (i) {
        if (!this.name) return true;
        if ((this.type == "checkbox" || this.type == "radio") && !this.checked) return true;
        var name = filter ? this.name.replace(filter, "") : this.name;
        if (result[name]) {
            if ($.isArray(result[name])) {
                result[name].push(this.value);
            } else {
                result[name] = [result[name], this.value];
            }
        } else {
            result[name] = amountReg.test(this.value) ? this.value.replace(/\,/g, "") : this.value;
        }
    });
    return result;
}

/***===============
+ Get Jquery Object
* str: string / dom element / jquer object
* return jquery object
* Add By Gary *
=============================*/
global.Fn.$ = function (str) {
    if (!str) return false;
    if (str.jquery) {
        return str;
    } else if (typeof str == "string" && !/[#\.\*\:\s\+~>\[]/.test(str)) {
        return $("#" + str);
    } else {
        return $(str);
    }
}

/***=========================
+ Format Date
* global.Fn.formatDate([utc,] str [,format])
* utc:[true|false] 
* str: Date string
* format: Support all formats what you want (yyyy MM dd hh:mm:ss)
=============================*/
global.Fn.formatDate = function () {
    var dFormat = "yyyy-MM-dd",//default date format
        utc = true,
		str = arguments[0],
        format = arguments[1] || dFormat;

    if (typeof str === "boolean") {
        utc = str;
        str = arguments[1];
        format = arguments[2] || dFormat;
    }
    if (!str) return;
    //if (!format) format = "dd/MM/yyyy hh:mm:ss";
    var curDate = new Date();
    //base on server's time zone, -480:Beijing,-240:dubai.
    var timeoffset = -480;//curDate.getTimezoneOffset();
    var myDate
    if (str instanceof Date) {
        myDate = str;
    } else if (typeof str == "number") {
        myDate = new Date(str);
    } else if ($.type(str) == "object") {
        var _format = str.format; //str format
        str = str.date;
    } else if (typeof str == "string") {
        if (/Date/.test(str) || !isNaN(str)) {
            str = str.replace(/(^\/Date\()|(\)\/$)/g, "");
            str = parseInt(str);
            //UTC to Local time
            if (utc) str = str - (timeoffset * 60000);
            myDate = new Date(str);
        } else if (/\:/.test(str)) {
            var _reg1 = /(\d{1,2})([\s\/])(\d{1,2})\2(\d{2,4})/;
            var _reg2 = /(\d{2,4})([\s\/\-])(\d{1,2})\2(\d{1,2})/;
            var _format = str.split(":")[1]; //str format
            str = str.split(":")[0];
            if (_format == "dmy") {
                str = str.replace(_reg1, "$3$2$1$2$4");
            } else if (_format == "ydm") {
                str = str.replace(_reg2, "$1$2$4$2$3");
            }
            myDate = new Date(str);
            if (!utc) {
                str = myDate.getTime() + (timeoffset * 60000);
                myDate = new Date(str);
            }
        } else {
            return str;
        }
    } else {
        return;
    }
    var opts = {
        "M+": myDate.getMonth() + 1,                    //Month 
        "d+": myDate.getDate(),                         //Day   
        "h+": myDate.getHours(),                        //Hours   
        "m+": myDate.getMinutes(),                      //Minute   
        "s+": myDate.getSeconds(),                      //Second   
        "q+": Math.floor((myDate.getMonth() + 3) / 3),  //Quarter   
        "S": myDate.getMilliseconds()                   //Millisecond   
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (myDate.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in opts) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (opts[k]) : (("00" + opts[k]).substr(("" + opts[k]).length)));
        }
    }
    return format;
}

/*========判断json数组中指定的列是否全部相同
 * 
 */
global.Fn.FullEqual = function (arr, key) {
    if ($.type(arr) !== 'array') { throw "该方法只接受json数组"; }
    if (!key) { throw "键不能为空"; }

    return arr.every(function (item, index) {
        return item[key] === arr[0][key];
    })
}

/**==============从JSON数组中获取指定key的值
 * return array
 */
global.Fn.GetValuesFromJSON = function (arrJSON, key) {
    if ($.type(arr) !== 'array') { throw "该方法只接受json数组"; }
    if (!key) { throw "键不能为空"; }
    var keyValues = [];
    arrJSON.each(function (item, index) {
        keyValues.push(item[key]);
    });
    return keyValues;
}

/***=========================
+ Set Default Form Validate
* Add By Gary *
=============================*/
global.Fn.setDefaultValidator = function (form) {
    //Form Validate
    var $form = global.Fn.$(form) || $("form");
    var errorHandler1 = $('.errorHandler', $form);
    var successHandler1 = $('.successHandler', $form);

    //$.validator.setDefaults({
    //    errorElement: "span", // contain the error msg in a span tag
    //    errorClass: 'help-block',
    //    errorPlacement: function (error, element) { // render error placement for each input type
    //        var $beforElement = element;
    //        if (element.attr("type") == "radio" || element.attr("type") == "checkbox") { // for chosen elements, need to insert the error after the chosen container
    //            $beforElement = $(element).closest('.form-group').children('div').children().last();
    //        }
    //        else if (element.attr("name") == "dd" || element.attr("name") == "mm" || element.attr("name") == "yyyy") {
    //            $beforElement = $(element).closest('.form-group').children('div');
    //        }
    //        else if (element.closest('.input-group')[0]) {
    //            $beforElement = $(element).closest('.input-group');
    //        }
    //        error.insertAfter($beforElement);
    //    },
    //    ignore: ".ignore",
    //    invalidHandler: function (event, validator) { //display error alert on form submit
    //        successHandler1.hide();
    //        errorHandler1.show();
    //    },
    //    highlight: function (element) {
    //        //$(element).focus();
    //        var $parent = $(element).closest('.form-group');
    //        var $label = $parent.find('.symbol');
    //        // display OK icon
    //        if (($(element).attr("type") == "radio" || $(element).attr("type") == "checkbox") && $parent.children().length > 2) { // for chosen elements, need to insert the error after the chosen container
    //            $parent = $parent.children('div');
    //        }
    //        else if ($(element).closest('.input-group')[0]) {
    //            $parent = $(element).closest('.input-group').parent();
    //            $label = $parent.prev("label").removeClass('has-success').addClass('has-error').find('.symbol');
    //        }
    //        else if ($parent.children().length > 2) {
    //            $parent = $(element).parent();
    //            $label = $parent.prev("label").removeClass('has-success').addClass('has-error').find('.symbol');
    //        }
    //        $parent.removeClass('has-success').addClass('has-error');
    //        $label.removeClass('ok');
    //    },
    //    unhighlight: function (element) { // revert the change done by hightlight
    //        $(element).closest(".has-error").removeClass('has-error').prev().removeClass('has-error');
    //        // set error class to the control group
    //    },
    //    success: function (label, element) {
    //        label.remove()//.addClass('help-block valid');
    //        // mark the current input as valid and display OK icon
    //        var $parent = $(element).closest('.form-group');
    //        var $label = $parent.find('.symbol');
    //        if ($(element).parent().hasClass('input-group')) {
    //            $parent = $(element).closest('.input-group').parent();
    //            $label = $parent.prev("label").removeClass('has-error').addClass('has-success').find('.symbol');
    //        }
    //        else if ($parent.children().length > 2) {
    //            $parent = $(element).parent();
    //            $label = $parent.prev("label").removeClass('has-error').addClass('has-success').find('.symbol');
    //        }
    //        $parent.removeClass('has-error').addClass('has-success');
    //        $label.addClass('ok');
    //    },
    //    submitHandler: function (form) {
    //        successHandler1.show();
    //        errorHandler1.hide();
    //    }
    //});
};


/***=========================
+ Show Messege
* Add By Gary *
=============================*/
global.Fn.ShowMsg = function (options) {
    var templates = {
        dialog:
          "<div class='show-msg modal fade' tabindex='-1' role='dialog'>" +
            "<div class='modal-dialog'>" +
              "<div class='show-msg-content modal-content'>" +
                    "<div class='show-msg-head modal-header'>" +
                        '' +//图片
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        "<h4 class='modal-title'></h4>" +
                    "</div>" +
                "<div class='modal-body'></div>" +
              "</div>" +
            "</div>" +
          "</div>",
        footer:
          "<div class='modal-footer'></div>",
        buttons: {
            ok: '<button type="button" class="btn btn-sm" style="margin-left: 10px;"><span><span>是</span></span></button>',
            no: '<button type="button" class="btn btn-sm btn-light-grey" style="margin-left: 10px;"><span>否</span></button>'
        }
    };
    var defaults = {
        type: 'show:success',           //Tips Type, Support[show,alert,confirm,prompt,progress], e.g:'alert:error',default 'show:success'
        title: '',
        msg: '',
        //width: '300px',         //Tips popups width (only for 'show')
        //height: '120px',        //Tips popups height (only for 'show')
        //showType: 'fade',       //Tips popups show type (only for 'show')
        timeout: 3000,          //Tips popups show type (only for 'show')
        callback: null,         //callback (only for 'confirm')
        afterClose: null,       //callback (after click close button)
    };
    var opts = $.extend({}, defaults, options);
    var style = opts.type.split(":"), cssClass, iconClass;
    var title = opts.title ? opts.title : style[1] && style[1].replace(/\w+/, function (word) { return word.substr(0, 1).toUpperCase() + word.substr(1) });
    var msg = '<div class="show-box-content">' + opts.msg + '</div>';
    var _showDialog = /show/.test(opts.type);
    var _alertDialog = /alert/.test(opts.type);
    var _confirmDialog = /confirm/.test(opts.type);
    var _promptDialog = /prompt/.test(opts.type);

    var $dialog = $(templates.dialog);
    var $footer = $(templates.footer);
    var $tipsTitle = $('.show-msg-head>.modal-title', $dialog);
    var $btnOk = $(templates.buttons.ok);
    var $btnCancel = $(templates.buttons.no);
    if ($('.show-msg')[0]) {
        closeDialog();
    }
    $dialog.modal({ show: true, keyboard: true });
    if (_showDialog) {
        $('.modal-backdrop').hide();
        $('.modal-body', $dialog).addClass('text-center');
        setTimeout(function () { $dialog.remove(); $('.modal-backdrop:first').remove(); }, opts.timeout);
    }
    else if (_alertDialog) {
        $footer.append($btnOk);
        $('.show-msg-content', $dialog).append($footer);
    }
    else if (_confirmDialog) {
        $footer.append($btnOk);
        $footer.append($btnCancel);
        $('.show-msg-content', $dialog).append($footer);
    }
    else if (_promptDialog) {
        $footer.append($btnOk);
        $('.show-msg-content', $dialog).append($footer);
    }
    else {
        throw new Error('不支持的类型：' + opts.type);
    }
    $('.modal-content', $dialog).addClass('show-msg-' + style[1]);
    $btnOk.addClass('btn-' + style[1]);
    $('.modal-title', $dialog).html(title);
    $('.modal-body', $dialog).html(opts.msg);

    if (!_showDialog) {
        $(document).bind('keydown.msg', function (e) {
            if (_confirmDialog && e.keyCode === 27) {
                $btnCancel.trigger("click");
            }
            if (e.keyCode === 13) {
                $btnOk.trigger("click");
                return false;
            }
            if (e.keyCode == 9) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                else { e.returnValue = false; }
            }
            return true;
        });
        //$('.show-msg-head', $dialog).addClass('move');
        ////增加拖动操作
        //if (jQuery.fn.draggable) {
        //    $dialog.draggable({ handle: "div.modal-header" });
        //}
    }

    $btnCancel.attr("class", "btn btn-sm btn-light-grey");
    if (!_promptDialog) {
        $tipsTitle.prepend('<i class="fa fa-info-circle"/>');
    } else {
        $btnCancel.attr("class", "btn btn-sm btn-default");
    }
    if (style[1]) {
        if (style[1] == "error") {
            $("i", $tipsTitle).addClass("glyphicon glyphicon-exclamation-sign");
        }
        else if (style[1] == "success") {
            $("i", $tipsTitle).addClass("glyphicon glyphicon-ok-sign");
        }
        else if (style[1] == "warning") {
            $("i", $tipsTitle).addClass("glyphicon glyphicon-exclamation-sign");
        }
        else if (style[1] == "info") {
            $("i", $tipsTitle).addClass("glyphicon glyphicon-info-sign");
        }
    }

    //bind event
    $btnOk.bind('click.msg', function () {
        closeDialog();
        if (opts.callback) {
            opts.callback(true);
        }
    });

    $btnCancel.bind('click.msg', function () {
        closeDialog();
        if (opts.callback) {
            opts.callback(false);
        }
    })

    function closeDialog() {
        $('.show-msg').remove();
        $('.modal-backdrop:first').remove();
        if (opts.afterClose) {
            opts.afterClose();
        }
    }
}

/***=========================
+ Show Popups
* Add By Gary *
=============================*/
global.Fn.ShowPop = function (options) {
    var _randomNum = parseInt(100000 * Math.random());
    var defaults = {
        obj: "#pop_" + _randomNum,              //Popups Object, Support[id,#id,$(#id)]
        title: "Popups Title",  //Popups Title
        overlay: .5,            //Popups Overay Opacity
        callback: null,         //After Pop up Handler 
        drag: true,             //Enable to Drag[not now]
        size: null,             //{width:600,height:300}
        content: "",             //Support [text,html,jquery object,object{type:"view|datagrid",url:"",method:"get",data:{}}]
        buttons: {
            '保存': ["btn-primary btnSave"],
            '取消': ["btn-default btnCancel", function (pop) { pop.close(); }]
        }
    };
    var opts = $.extend(true, {}, defaults, options);
    //if (!opts.obj) return false;
    var $popups = global.Fn.$(opts.obj);
    if (!$popups[0]) {
        var _selector = $popups.selector.match(/#[\w\-]+/)[0];
        var _class = opts.size && opts.size['class'];
        var popupsHTML = '<div class="arpopups' + (_class ? " " + _class : "") + '" id="' + _selector.replace("#", "") + '">\n' +
        '<div class="modal-content">\n' +
            '<div class="modal-header">\n' +
                '<button type="button" class="close" aria-hidden="true">&times; </button>\n' +
                '<h4 class="modal-title">' + opts.title + '</h4>\n' +
            '</div>\n' +
            '<div class="modal-body"></div>\n' +
            '<div class="modal-footer"></div>\n' +
            '</div>\n' +
    '</div>';
        $("body").append(popupsHTML);
        $popups = global.Fn.$(_selector);
        $popups.footer = $("div.modal-footer", $popups);
        if (opts.buttons.Cancel == undefined) opts.buttons.Cancel = defaults.buttons.Cancel;
        $.each(opts.buttons, function (name, value) {
            if (!value || typeof value == "boolean") return true;
            if ($.type(value[1]) === "object") {
                var _$button = $('<div class="btn-group dropup">\n' +
									'<a class="btn dropdown-toggle ' + value[0] + '" data-toggle="dropdown" href="#">' + name + ' <span class="caret"></span></a>\n' +
									'<ul role="menu" class="dropdown-menu"></ul>\n' +
								'</div>\n<i> </i>');
                $.each(value[1], function (text, val) {
                    $('<li role="presentation" class="' + val[0] + '"><a role="menuitem" tabindex="-1" href="#">' + text + '</a></li>').bind("click", function () {
                        if (typeof val[1] === "function") val[1]($popups);
                        return false;
                    }).appendTo(_$button.find("ul.dropdown-menu"));
                });
                $popups.footer.append(_$button);
            } else if (typeof value[1] === "function") {
                $('<button type="button" class="btn ' + value[0] + '">' + name + '</button>').bind("click", function () {
                    value[1]($popups);
                    return false;
                }).appendTo($popups.footer);
            } else {
                $('<button type="button" class="btn ' + value[0] + '">' + name + '</button>').appendTo($popups.footer);
            }
        });
    }
    else if (opts.title) {
        $("h4.modal-title", $popups).text(opts.title);
    }
    if (opts.size) {
        var _popStyle = opts.size.style || {};
        _popStyle.width = opts.size.width;
        _popStyle.height = opts.size.height;
        $popups.css(_popStyle);
    }
    var poplen = $popups.prevAll("div.arpopups:visible").length;
    if (poplen > 0) {
        $popups.css({
            "z-index": 1036 + poplen
        });
    }

    //Popups Attributes
    $popups.id = $popups.attr("id");
    $popups.body = $("div.modal-body", $popups);
    $popups.btnSave = $("button.btnSave,button.btn-primary:eq(0)", $popups);
    $popups.btnCancel = $(".btn-close,button.close", $popups);

    //Set Popups Style
    var $overlay = $('div.bg-overlay[data-for=' + $popups.id + ']');
    if (!$overlay[0]) {
        $overlay = $('<div class="bg-overlay" data-for="' + $popups.id + '"/>').appendTo("body");
        var overlaycss = {
            opacity: opts.overlay / (poplen + 1)
        }
        if (poplen > 0) {
            overlaycss["z-index"] = 1035 + poplen;
        }
        $overlay.css(overlaycss);
    }
    //Popups Methods
    $popups.close = function (remove) {//是否移除html代码
        /*if (opts.content && (opts.content.type == "view" || opts.content.type == "datagrid"))*/ remove = true;
        //if ($("div.arpopups:visible").length <= 1) 
        $overlay[remove ? "remove" : "hide"]();
        $(document).unbind('keydown.' + $popups.attr("id"));
        $popups[remove ? "remove" : "hide"]();
        //global.keyAllow = true; //close the popup reset keyAllow State
        return $popups;
    }
    $popups.setPosition = function (timeout) {
        timeout = timeout || 0;
        var setStyle = function () {
            var shouldScrollTop =
            $popups.css({
                "margin-top": $(window).scrollTop() - $popups.outerHeight() / 2,
                "margin-left": -$popups.outerWidth() / 2
            });
        }
        timeout ? setTimeout(setStyle, timeout) : setStyle();
        return $popups;
    }

    $popups.setContent = function (content) {
        if (content.jquery) {
            if (content[0]) {
                global.temp = content.html();
                content.remove();
            }
            content = global.temp;
        }
        $popups.body.html(content);
        return $popups;
    }

    $popups.data("getPopups", $popups);

    //Show Content
    if (opts.content) {
        //Show Content
        if (opts.content) {
            if (opts.content.type == "datagrid") {
                var _listid = 'datagrid_' + _randomNum;
                var _showSearch = opts.content.search == false ? false : true; //默认显示搜索框
                var _content = '';
                if (_showSearch) {
                    var _searchKey = opts.content.queryParams && opts.content.queryParams.SearchKey || "";
                    _content += '<form id="popSearchForm">\n' +
                        '<div class="row form-group quick-search">\n' +
                            '<div class="input-group col-sm-6">\n' +
                                '<div class=" input-icon"><input type="text" name="sc" value="' + _searchKey + '" class="form-control input-sm" placeholder="please enter searchkey"><i class="clip-search"></i></div>\n' +
                                '<div class=" input-group-btn"><span type="button" id="btnSearch" class="btn btn-warning btn-sm btnSearch">Search</span><span type="button" id="btnReset" class="btn btn-default btn-sm">Reset</span></div>\n' +
                            '</div>' +
                            '</div>\n' +
                    '</form>\n';
                }
                _content += ' <div id="' + _listid + '"></div>\n';
                $popups.body.addClass("no-padding");
                $popups.setContent(_content);
                $("div.modal-footer button:contains(Save)", $popups).text("Select");
                $popups.list = $("#" + _listid);

                var popDatagrid = new PagedDataTable({
                    table: {
                        keyName: opts.content.table.keyName,
                        container: _listid
                    },
                    columns: opts.content.columns,
                    pagination: {
                        rownumber: opts.content.pagination.rownumber, //行号
                        singleSelect: opts.content.pagination.singleSelect,//是否单选
                        url: opts.content.pagination.url,
                        autoLoad: opts.content.pagination.autoLoad,  //是否自动请求数据
                        method: opts.content.pagination.method,
                        pageIndex: opts.content.pagination.pageIndex,
                        pageSize: opts.content.pagination.pageSize,
                        queryParameter: opts.content.pagination.queryParameter, //查询的表单
                        successCallBack: opts.content.pagination.successCallBack// function (data) { return data;} //查询数据成功后的回调，用于对数据的处理
                    },
                    operator: {
                        search: {
                            targetId: 'btnSearch', //查询按钮id
                            form: "popSearchForm", //查询按钮关联的表单id
                            beforeSearch: undefined,
                            resetId: 'btnReset'
                        },
                        del: false,
                        edit: false
                    }
                }).Render();
                //增加获取所选数据方法
                $popups.GetChecked = $.proxy(popDatagrid.GetChecked, popDatagrid);
            }
            else if (opts.content.type == "view") {
                //显示loadding动画
                $popups.setContent('<div class="pd30 loadding"></div>');
                $.ajax({
                    type: opts.content.method || "GET",
                    url: opts.content.url,
                    data: opts.content.data,
                    //async: false,
                    dataType: "html",
                    success: function (result) {
                        $popups.setContent(result).setPosition(1);
                        //$('input[type="checkbox"],input[type="radio"]', $popups).not("[field=Check] input").iCheck({
                        //    checkboxClass: 'icheckbox_minimal-grey',
                        //    radioClass: 'iradio_minimal-grey',
                        //});
                        if (typeof opts.callback === "function") opts.callback($popups);
                    },
                    error: function () {
                        $popups.setContent('<div class="pd30 center">No Info</div>');
                    }
                });
            }
            else {
                $popups.setContent(opts.content);
            }
        }

        $overlay.show();
        $popups.show().setPosition().btnCancel.bind("click", function () {
            $popups.close();
            return false;
        });

        //增加拖动操作
        if (jQuery.fn.draggable && opts.drag) {
            $popups.draggable({ handle: "div.modal-header" });
        }

        $(window).resize(function () {
            $popups.setPosition();
        });

        $(document).bind('keydown.' + $popups.id, function (e) {
            var _lastpopid = $("div.arpopups:visible").last().attr("id");
            var _msg = $("div.messager-window");
            if (e.keyCode === 27 && $popups.id == _lastpopid && !_msg[0]) $popups.close();
            if (e.keyCode === 13 && $popups.id == _lastpopid && e.target.name != "SearchKey" && e.target.tagName.toLowerCase() != "button" && !_msg[0]) {
                $popups.btnSave.triggerHandler("click");
                return false;
            }
            if (e.keyCode == 9 && !$popups.find(":focus")[0]) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
            return true
        });

        if ((opts.content && opts.content.type != "view") && typeof opts.callback === "function") opts.callback($popups);
    }
    $('.modal-header', $popups).addClass('move');
}

/***===============
+ Remove loading layer
* Add By Gary *
=============================*/
global.Fn.removeLoading = function (obj) {
    var $obj = obj || $(".LoadFileLayer");
    $obj.fadeOut(200, function () {
        $obj.remove();
    });
    //global.LoadFileState = false;
}

/*=====================提交表单
 * options:{
 * target:'',
 * method:'',
 * form:'',
 * beforePost:function(){},
 * callback:function(){}
 * }
 */
global.Fn.SaveForm = function (options) {
    var defaultConfig = { method: 'post' };
    var config = $.extend(true, defaultConfig, options);
    global.Fn.$(config.target).attr('disabled', true);
    ValidateConfig(config);
    //验证表单
    if (global.Fn.$(config.form).valid()) {
        var formData = global.Fn.serializeJson(config.form);
        if (config.beforePost) {
            formData = config.beforePost(formData);
        }
        global.Fn.BaseAjax(config);
    }
    else {
        global.Fn.$(config.target).removeAttr('disabled');
        global.Fn.ShowMsg({
            type: 'alert:error',
            msg: '表单验证不通过，请修改！'
        });
    }
    //验证参数
    function ValidateConfig(config) {
        if (!config.form || !config.url || !config.target) {
            throw new Error('表单参数缺省');
        }
    }
}

/*=====================处理全局ajax请求(处理错误消息等)
 * options:{
 * url:'',
 * successShowMsg:true,操作成功是否显示消息
 * method:'post',
 * postData:{},//要发送的数据
 * callback:null,//针对成功后额外的处理
 * target:null,--触发此请求的元素id，用于在请求期间禁用此按钮 防止多次点击的情况
 * }
 */
global.Fn.BaseAjax = function (options) {
    var config = $.extend(true, { successShowMsg: true, method: 'post', dataType: 'json' }, options);
    if (config.target) { global.Fn.$(config.target).attr('disabled', true); }
    $.ajax({
        url: config.url,
        type: config.method,
        data: config.postData,
        dataType: config.dataType,
        success: function (data) {
            if (data['code'] == 200) {
                if (config.successShowMsg) {
                    global.Fn.ShowMsg({
                        type: 'show:success',
                        msg: data['msg'] || data['code']
                    });
                }
                if (config.callback) {
                    config.callback(data['info']);
                }
            }
            else {
                global.Fn.ShowMsg({
                    type: 'alert:error',
                    msg: data['msg'] || data['code']
                });
            }
            if (config.target) { global.Fn.$(config.target).removeAttr('disabled') };
        },
        error: function (data) {
            if (config.target) { global.Fn.$(config.target).removeAttr('disabled') };
            global.Fn.ShowMsg({
                type: 'alert:error',
                msg: '出错啦，请联系管理员!'
            });
        }
    });
}

/*为表单赋值*/
global.Fn.InitFormData = function (model, elesConfig, hidesConfig) {
    if (!model) { return false; }
    //分组form
    if ($.type(elesConfig) === 'object') {
        for (var key in elesConfig) {
            //eles
            elesConfig[key].forEach(function (config, index, arr) {
                if ($.type(config) == 'array') {
                    config.forEach(function (sConfig) {
                        SetDefaultValue(sConfig, model);
                    })
                }
                else {
                    SetDefaultValue(config, model);
                }
            });
        }
    }
    else if ($.type(elesConfig) === 'array') {
        //eles
        elesConfig.forEach(function (config, index, arr) {
            if ($.type(config) == 'array') {
                config.forEach(function (sConfig) {
                    SetDefaultValue(sConfig, model);
                })
            }
            else {
                SetDefaultValue(config, model);
            }
        });
    }
    else {
        throw "表单配置列为空";
    }
    if (hidesConfig && hidesConfig.length > 0) {
        //hides
        hidesConfig.forEach(function (config) {
            if (model[config.id] !== undefined) {
                config['value'] = model[config.id];
            }
        });
    }

    function SetDefaultValue(eleConfig, model) {
        var ele = eleConfig['ele'];
        if (eleConfig && ele && ele['id']) {
            var key = ele['id'];
            if (key !== undefined && model[key] !== undefined) {
                ele['value'] = model[key];
            }
        }
    }

}

/*========================
*初始化插件
* plugins:插件名称单个或者数组['datetime','search']|'datetime'
* container:限定在此id范围内查找
*/
global.Fn.InitPlugin = function (plugins, container) {
    //$("input.date-picker").datetimepicker({ autoclose: true }).next("span.input-group-addon").bind("click", function () { $(this).prev(".date-picker").datepicker("show"); });
}

//返回下拉框数据源中指定value值的text值
global.Fn.DropDownFormatter = function (value, source) {
    var sourceType = $.type(source);
    if (sourceType === 'string') {
        source = global.datasource[source];
    } else if (sourceType === 'array') {

    }
    else {
        console.error('global.Fn.DropDownFormatter 不支持数据源:' + source);
        return;
    }
    var returnData;
    source.some(function (item) {
        if (item.value == value) {
            returnData = item.text;
            return true;
        }
        else {
            return false;
        }
    })
    return returnData;
}