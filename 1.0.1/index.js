/**
 * 倒计时组件
 * 只支持简单的倒计时，并没有提供效果组件
 *
 * @version 1.0.1
 * @author yujiang<zhihao.gzh@alibaba-inc.com>
 * @data 2014-01-13
 */

// 动态判断上级时间是否存在，没有的话显示全如：
// 1天11时 -> 没有天 -> 显示为35小时
// by yujiang at 2014-04-23

KISSY.add(function(S) {

    //绑定
    function bind(fn, context) {
        return function() {
            fn.apply(context, arguments);
        }
    }

    /**
     * 时间节点对象-单个的倒计时节点
     *
     * @this { SimpleTime }
     * @var id 每个对象=会有一个唯一一个id便于组织和操作
     * @var node 对应的节点
     * @var tpl 生成时间的模板
     * @var leftTime 剩余时间
     * @var totalTime 总时间
     * @var triggers 到达时间触发的回调
     * @var stop 是否暂停
     * @var extraCal 额外运行的函数，默认每100ms运行
     * @return {this} r 返回实例
     */
    function SimpleTime(config) {
        this.id = config.id || 0;
        this.node = config.node;
        this.tpl = config.tpl;
        this.leftTime = config.leftTime;
        this.totalTime = config.totalTime;
        this.triggers = [];
        this.stop = 0;
        this.extraCal = function() {};
    }
    //添加对应时间的触发回调
    SimpleTime.prototype.addTrigger = function(time, callback) {
        var t = {
            triggerTime: time,
            triggerFlag: false,
            triggerFunc: callback
        }
        this.triggers.push(t);
    }
    //渲染视图
    SimpleTime.prototype.render = function() {
        var ms = Math.floor((this.leftTime % 1000) / 100),
            s = Math.floor(this.leftTime / 1000 % 60),
            m = Math.floor(this.leftTime / 60000 % 60),
            h = Math.floor(this.leftTime / 3600000 % 24),
            d = Math.floor(this.leftTime / 86400000);

        var a_s = Math.floor(this.leftTime / 1000),
            a_m = Math.floor(this.leftTime / 60000),
            a_h = Math.floor(this.leftTime / 3600000);

        var msNode,
            sNode,
            mNode,
            hNode,
            dNode;

        if (this.node[0] && !this.node[0].__cache) {
            this.node[0].__cache = {
                msNode: this.node.all('.scd-digit-ms'),
                sNode: this.node.all('.scd-digit-s'),
                mNode: this.node.all('.scd-digit-m'),
                hNode: this.node.all('.scd-digit-h'),
                dNode: this.node.all('.scd-digit-d')
            };
            msNode = this.node[0].__cache.msNode;
            sNode = this.node[0].__cache.sNode;
            mNode = this.node[0].__cache.mNode;
            hNode = this.node[0].__cache.hNode;
            dNode = this.node[0].__cache.dNode;
        } else {
            msNode = this.node.all('.scd-digit-ms');
            sNode = this.node.all('.scd-digit-s');
            mNode = this.node.all('.scd-digit-m');
            hNode = this.node.all('.scd-digit-h');
            dNode = this.node.all('.scd-digit-d');
        }

        if (msNode) {
            msNode.html(ms);
        }

        //加入判断是否有分钟，如果没有显示全部时间的秒数
        //下面的分钟和小时同
        if (sNode[0]) {
            if (mNode[0]) {
                if (s < 10) {
                    s = '0' + s;
                }
                sNode.html(s);
            } else {
                if (a_s < 10) {
                    a_s = '0' + a_s;
                }
                sNode.html(a_s);
            }
        }
        if (mNode[0]) {
            if (hNode[0]) {
                if (m < 10) {
                    m = '0' + m;
                }
                mNode.html(m);
            } else {
                if (a_m < 10) {
                    a_m = '0' + a_m;
                }
                mNode.html(a_m);
            }
        }
        if (hNode[0]) {
            if (dNode[0]) {
                if (h < 10) {
                    h = '0' + h;
                }
                hNode.html(h);
            } else {
                if (a_h < 10) {
                    a_h = '0' + a_h;
                }
                hNode.html(a_h);
            }
        }
        if (dNode[0]) {
            dNode.html(d);
        }
    }
    //不停的更新函数
    SimpleTime.prototype.update = function() {
        this.render();
        this.extraCal();
    }
    //重置时间，注意如果为stop，那么重置无效
    SimpleTime.prototype.reset = function(time) {
        if (!this.stop) {
            this.leftTime = time;
            for (var i = this.triggers.length; i--;) {
                this.triggers[i].triggerFlag = false;
            }
        }
    }
    /**
     * 倒计时模型
     *
     * @倒计时的生产器 单体对象
     * @this { SimpleCountDown }
     * @param {_precision} 调度间隔
     * @fun add (node, _leftTime, _totalTime) 添加一个新倒计时节点
     * @var _timeStack 时间节点对象集合
     * @var _extraCal 额外执行的函数集合，每个间隔时间
     * @var _count 内部计数，分配id
     * @var _oldtime 用于调整时间，控制精度
     * @return {this} r 返回实例
     */

    function SimpleCountDown(_precision) {
        //单体
        //if (!SimpleCountDown._instance) {
        //  SimpleCountDown._instance = this;
        //} else {
        //  return SimpleCountDown._instance;
        //}

        this._timeStack = [];
        this._extraCal = [];
        this._count = 0;
        this._precision = _precision || 100;
        this._timmer = 0;
        this._oldtime = (new Date()).getTime();
        this.init();
    }
    //递归调用，无限执行
    SimpleCountDown.prototype.init = function() {
        this.exec();
        this._timmer = setTimeout(bind(function() {
            this.init();
        }, this), this._precision);
    }
    //清理
    SimpleCountDown.prototype._clear = function() {
        clearTimeout(this._timmer);
    }
    SimpleCountDown.prototype.clearStack = function() {
        this._timeStack = [];
    }
    //计算时间 更新每个时间节点
    SimpleCountDown.prototype.exec = function() {
        var theTimeNode = {},
            now = (new Date().getTime()),
            step = now - this._oldtime;

        this._oldtime = now;

        for (var i = this._timeStack.length; i--;) {
            theTimeNode = this._timeStack[i];
            if (theTimeNode.stop) {
                theTimeNode.update();
                continue;
            }
            theTimeNode.leftTime -= step;
            if (theTimeNode.leftTime < 0) {
                theTimeNode.leftTime = 0;
            }
            theTimeNode.update();
            for (var j = theTimeNode.triggers.length; j--;) {
                if (theTimeNode.triggers[j].triggerTime >= theTimeNode.leftTime && !theTimeNode.triggers[j].triggerFlag) {
                    theTimeNode.triggers[j].triggerFlag = true;
                    theTimeNode.triggers[j].triggerFunc(theTimeNode);
                }
            }
        }

        //每帧需要额外运行的
        for (var k = 0; k < this._extraCal.length; k++) {
            bind(this._extraCal[k], this)();
        }

    }
    //添加并生成一个新的时间节点，节点和时间对象相关联
    SimpleCountDown.prototype.add = function(node, _leftTime, _totalTime) {
        if (!node[0]) {
            return;
        }
        var tpl = node.html().replace(/\$\{ms\}/ig, '<s class="scd-digit-ms"></s>').
        replace(/\$\{s\}/ig, '<s class="scd-digit-s"></s>').
        replace(/\$\{m\}/ig, '<s class="scd-digit-m"></s>').
        replace(/\$\{h\}/ig, '<s class="scd-digit-h"></s>').
        replace(/\$\{d\}/ig, '<s class="scd-digit-d"></s>');

        var leftTime = _leftTime === undefined ? undefined : _leftTime;
        var attrLeftTime = node.attr('data-lefttime');

        node.html(tpl);

        var o = {
            id: this._count++
        }
        o.node = node;
        o.tpl = tpl;
        o.leftTime = leftTime || attrLeftTime || 0;
        o.totalTime = _totalTime || _leftTime;

        var simpleTime = new SimpleTime(o);
        node[0]._s_countdown = simpleTime;
        this._timeStack.push(simpleTime);
        return simpleTime;
    }
    //获取一个时间节点，通过其id
    SimpleCountDown.prototype.get = function(node) {
        if (node[0]) {
            return undefined;
        }
        var currentIns = node[0]._s_countdown;
        if (!currentIns) {
            return undefined;
        }
        for (var i = this._timeStack.length; i--;) {
            if (currentIns.id == this._timeStack[i].id) {
                return {
                    item: currentIns,
                    index: i
                };
            }
        }
        return undefined;
    }
    //删除一个时间节点，通过id
    SimpleCountDown.prototype.remove = function(node) {
        var theOne = this.get(node);
        if (theOne) {
            this._timeStack.splice(theOne.index, 1);
        }
    }
    //暂停一个时间节点，通过id
    SimpleCountDown.prototype.stop = function(node) {
        var theOne = this.get(node);
        theOne.stop = 1;
    }
    //添加额外的执行，没帧
    SimpleCountDown.prototype.addCal = function(func) {
        this._extraCal.push(func);
    }

    return SimpleCountDown;

}, {
    requires: []
})