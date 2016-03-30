var LIDS = ['000001011111', '000101010111', '010101010101', '110101010100', '111101010000', '111111000000', '111110100000', '111010101000', '101010101010', '001010101011', '000010101111', '000000111111'];
var TIDS = ['001010101011', '000010101111', '000000111111', '000001011111', '000101010111', '010101010101', '110101010100', '111101010000', '111111000000', '111110100000', '111010101000', '101010101010'];
var WORDS = [
    'negro', 'desegregate', 'sergeant', 'crooked', 'cripple', 'cunning', 'appliance', 'gospel', 'luscious', 'imbecile', 'platoon', 'dictatorship', 'sneak', 'spook', 'hassle', 'titanium', 'nape', 'jabber', 'beatnik', 'stinging', 'onslaught', 'tuck', 'broil', 'autograph', 'stew', 'saute', 'candid', 'raccoon', 'escalation', 'a crock of', 'vet', 'ambush', 'retread', 'porch', 'gimp', 'panther'
];
var DEFINITIONS = [
    '黑人；黑人的', '废止种族隔离', '军士；中士', '弯曲的；扭曲的', '跛子；残废的人', '狡猾的；伶俐的', '（家用）电器；器具', '（圣经）福音', '（人）肉感的；多汁的', '低能；弱智；废柴', '（军队的）排', '独裁；专政', '偷偷溜；偷偷地做', '鬼；幽灵（同ghost）', '争执；争吵', '钛（金属元素）', '用凝固汽油弹攻击', '叽里咕噜地说；BB', '奇装异服言行乖僻的人；“垮了的一代”', '激烈的；刺人的', '猛攻；突击', '...in    把…塞进；藏入', '烤；炙（肉等）', '亲笔签名', '炖菜', '炒；炒菜', '坦白的（说）；直言不讳的', '浣熊', '(战争)逐步升级；扩大', '一坛子的；一堆（废话）', '兽医', '埋伏；伏击', '翻新修补（轮胎）', '门廊；门厅', '瘸子', '黑豹；美洲豹',
];

function browserCheck() {
    var isChromium = window.chrome,
        isGoogle = window.navigator.vendor === "Google Inc.",
        isOpera = window.navigator.userAgent.indexOf("OPR") > -1,
        isIEedge = window.navigator.userAgent.indexOf("Edge") > -1,
        isWindows = window.navigator.userAgent.indexOf("Win") > -1;
    if(isChromium && isGoogle && !isOpera && !isIEedge && isWindows) {
       // is Google chrome
    } else { 
       // not Google chrome
       alert('Please use Chrome on Windows to view this page.');
       $('*').hide();
       window.close();
    }
}
function deparam(querystring) {
    // remove any preceding url and split
    querystring = querystring.substring(querystring.indexOf('?')+1).split('&');
    var params = {}, pair, d = decodeURIComponent, i;
    // march and parse
    for (i = querystring.length; i > 0;) {
        pair = querystring[--i].split('=');
        params[d(pair[0])] = d(pair[1]);
    }
    return params;
};
Array.prototype.shuffle = function shuffle(){
    o = this.slice();
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function Test(type, text, learn) {
    this.type = type;   // For learning: 0 is standard, 1 is movie. For testing: 0 is en -> ch, 1 is ch -> en
    this.text = text;
    this.learn = learn;
    this.events = [];
    if (learn) {
        if (type) {
            this.url = 'http://166.111.139.15:8003/votube/?word=' + text[0];
            // this.url = 'http://localhost:8000/votube/?word=' + text[0];
        } else {
            // this.url = (text[0] === 'nape') ?
            //     'http://pi.cs.tsinghua.edu.cn/lab/moviedict/study/nape.html' : 
            //     'http://cn.bing.com/dict/clientsearch?q=' + text[0];
            this.url = 'http://166.111.139.15:8002/proxy/?youdao=&url=http://dict.youdao.com/w/' + text[0];
        }
    } else {
        this.element = $('<tr>');
        this.element.append($('<td>').append($('<label>').html(text[type])));
        this.element.append($('<td>').append($('<textarea rows="5" cols="30"></textarea>')));
        if (type)
            this.element.find('textarea').attr('placeholder', '写出实验中学到的精确含义的1个单词\n回忆不起请留空');
        else
            this.element.find('textarea').attr('placeholder', '对于多义词请列出尽可能多个含义\n一行写一个意思');
    }
}
Test.prototype.start = function(index) {
    this.beginTime = Date.now();
    $('span.cur').text(index + 1);
    $('div.surveydescription').hide();
    
    if (this.learn) {
        $('label.word').text(this.text[0]);
        $('label.hint').text(this.text[1]).hide();
        $('iframe').attr('src', this.url);
    } else {
        this.element.show();
        this.element.find('textarea').focus();
    }
};
Test.prototype.stop = function() {
    this.endTime = Date.now();

    if (this.learn) {
        $('iframe').attr('src', '');
        $('label.word').text('');
        $('label.hint').text('');
    } else {
        this.element.hide();
    }    
};
Test.prototype.validate = function() {
    var r = this.element.find('textarea').val();
    if (!(r.trim()))
        r = 0;
    else if (r.toLowerCase() === this.text[1 - this.type].toLowerCase())
        r = 1;
    return r;
};

function getTests(learn) {
    var url = window.location.href,
        params = deparam(url.substring(url.indexOf('?') + 1)),
        start = Number(params.start || 0),
        end = Number(params.end || 36);
    if (start < 0 || start >= WORDS.length || end <= 0 || end > WORDS.length || !params.id || params.id.length != end - start) {
        alert('invalid parameters: ' + JSON.stringify(params) + '\n试验结果将不会被保存，如果继续后果自负！\n请与主试联系。');
        return;
    }
    var ids = $.map(params.id.split(''), function(n, index) { return Number(n); }),
        en = WORDS.slice(start, end),
        ch = DEFINITIONS.slice(start, end);

    return $.map(Array(ids.length), function(none, index) { return new Test(ids[index], [en[index], ch[index]], learn); });
}


/**
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */
shortcut = {
    'all_shortcuts':{},//All the shortcuts are stored in this array
    'add': function(shortcut_combination,callback,opt) {
        //Provide a set of default options
        var default_options = {
            'type':'keydown',
            'propagate':false,
            'disable_in_input':false,
            'target':document,
            'keycode':false
        }
        if(!opt) opt = default_options;
        else {
            for(var dfo in default_options) {
                if(typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
            }
        }

        var ele = opt.target;
        if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
        var ths = this;
        shortcut_combination = shortcut_combination.toLowerCase();

        //The function to be called at keypress
        var func = function(e) {
            e = e || window.event;
            
            if(opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
                var element;
                if(e.target) element=e.target;
                else if(e.srcElement) element=e.srcElement;
                if(element.nodeType==3) element=element.parentNode;

                if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
            }
    
            //Find Which key is pressed
            if (e.keyCode) code = e.keyCode;
            else if (e.which) code = e.which;
            var character = String.fromCharCode(code).toLowerCase();
            
            if(code == 188) character=","; //If the user presses , when the type is onkeydown
            if(code == 190) character="."; //If the user presses , when the type is onkeydown

            var keys = shortcut_combination.split("+");
            //Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
            var kp = 0;
            
            //Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
            var shift_nums = {
                "`":"~",
                "1":"!",
                "2":"@",
                "3":"#",
                "4":"$",
                "5":"%",
                "6":"^",
                "7":"&",
                "8":"*",
                "9":"(",
                "0":")",
                "-":"_",
                "=":"+",
                ";":":",
                "'":"\"",
                ",":"<",
                ".":">",
                "/":"?",
                "\\":"|"
            }
            //Special Keys - and their codes
            var special_keys = {
                'esc':27,
                'escape':27,
                'tab':9,
                'space':32,
                'return':13,
                'enter':13,
                'backspace':8,
    
                'scrolllock':145,
                'scroll_lock':145,
                'scroll':145,
                'capslock':20,
                'caps_lock':20,
                'caps':20,
                'numlock':144,
                'num_lock':144,
                'num':144,
                
                'pause':19,
                'break':19,
                
                'insert':45,
                'home':36,
                'delete':46,
                'end':35,
                
                'pageup':33,
                'page_up':33,
                'pu':33,
    
                'pagedown':34,
                'page_down':34,
                'pd':34,
    
                'left':37,
                'up':38,
                'right':39,
                'down':40,
    
                'f1':112,
                'f2':113,
                'f3':114,
                'f4':115,
                'f5':116,
                'f6':117,
                'f7':118,
                'f8':119,
                'f9':120,
                'f10':121,
                'f11':122,
                'f12':123
            }
    
            var modifiers = { 
                shift: { wanted:false, pressed:false},
                ctrl : { wanted:false, pressed:false},
                alt  : { wanted:false, pressed:false},
                meta : { wanted:false, pressed:false}   //Meta is Mac specific
            };
                        
            if(e.ctrlKey)   modifiers.ctrl.pressed = true;
            if(e.shiftKey)  modifiers.shift.pressed = true;
            if(e.altKey)    modifiers.alt.pressed = true;
            if(e.metaKey)   modifiers.meta.pressed = true;
                        
            for(var i=0; k=keys[i],i<keys.length; i++) {
                //Modifiers
                if(k == 'ctrl' || k == 'control') {
                    kp++;
                    modifiers.ctrl.wanted = true;

                } else if(k == 'shift') {
                    kp++;
                    modifiers.shift.wanted = true;

                } else if(k == 'alt') {
                    kp++;
                    modifiers.alt.wanted = true;
                } else if(k == 'meta') {
                    kp++;
                    modifiers.meta.wanted = true;
                } else if(k.length > 1) { //If it is a special key
                    if(special_keys[k] == code) kp++;
                    
                } else if(opt['keycode']) {
                    if(opt['keycode'] == code) kp++;

                } else { //The special keys did not match
                    if(character == k) kp++;
                    else {
                        if(shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
                            character = shift_nums[character]; 
                            if(character == k) kp++;
                        }
                    }
                }
            }
            
            if(kp == keys.length && 
                        modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
                        modifiers.shift.pressed == modifiers.shift.wanted &&
                        modifiers.alt.pressed == modifiers.alt.wanted &&
                        modifiers.meta.pressed == modifiers.meta.wanted) {
                callback(e);
    
                if(!opt['propagate']) { //Stop the event
                    //e.cancelBubble is supported by IE - this will kill the bubbling process.
                    e.cancelBubble = true;
                    e.returnValue = false;
    
                    //e.stopPropagation works in Firefox.
                    if (e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    return false;
                }
            }
        }
        this.all_shortcuts[shortcut_combination] = {
            'callback':func, 
            'target':ele, 
            'event': opt['type']
        };
        //Attach the function with the event
        if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
        else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
        else ele['on'+opt['type']] = func;
    },

    //Remove the shortcut - just specify the shortcut and I will remove the binding
    'remove':function(shortcut_combination) {
        shortcut_combination = shortcut_combination.toLowerCase();
        var binding = this.all_shortcuts[shortcut_combination];
        delete(this.all_shortcuts[shortcut_combination])
        if(!binding) return;
        var type = binding['event'];
        var ele = binding['target'];
        var callback = binding['callback'];

        if(ele.detachEvent) ele.detachEvent('on'+type, callback);
        else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
        else ele['on'+type] = false;
    }
}
