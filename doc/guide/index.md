## 综述

SimpleCountDown是一个倒计时组件，但不仅仅如此

* 版本：2.0.0
* 作者：yujiang(禺疆)
* demo：[http://kg.kissyui.com/simpleCountDown/1.0.0/demo/index.html](http://kg.kissyui.com/simpleCountDown/1.0.0/demo/index.html)

## changelog

### V2.0.0

    [!] 支持跨天小时，以前1天11时可表示为->35时，根据模板自动判断，可参看demo1

## 概要简介
SimpleCountDown是一个倒计时组件
你可能要问了，不是已经有了一个CountDown组件了吗？为什么又来一个SimpleCountDown呢？
原因就是场景不同，需求不同，如下阐述：

### 解决的问题
* 大量倒计时运行的时候保持性能稳定，一个SimpleCountDown是一个工厂，产生多个倒计时统一管理在一个定时器中
* 具有强大的清理方法，可直接操作倒计时队列，随时随地添加删除
* 暴露了倒计时回调，可以在倒计时的一个周期内自定义执行函数
* 体积小巧

### 存在的问题
* 没有切换效果

### 使用场景
* 大量的倒计时提示
* 需要根据数据动态变化商品，清理倒计时又添加新的倒计时的场景

## 引入组件

	//引入kg packages
	KISSY.config({
		packages: [{
			name: 'kg',
			path: 'http://a.tbcdn.cn/s/kissy/',
			ignorePackageNameInUri: false
		}]
	});
	
	//使用，只是伪代码，不可直接运行
    S.use('kg/simpleCountDown/1.0.0/index', function (S, SimpleCountDown) {
    	var $ = Node.all;

    	//实例一个倒计时生产器，precision是间隔时间（可选），默认100ms
    	var simpleCountDown = new SimpleCountDown( precision );

    	//初始化它，这个时候倒计时的主程序已经运行了
		simpleCountDown.init();

		//接下来，你只需要添加倒计时即可
		//timeNode是kissy dom对象，leftTime是剩余时间（单位ms）
		//你可以添加多个，它们都被维护在一个队列里，在同一个定时器中运行
		var myCount1 = simpleCountDown.add(timeNode, leftTime);

		//你也可以设置触发点，倒计时到了那个地方会执行回调(剩余时间小于指定时间触发)
		myCount1.addTrigger(0, function(myCount) {
			//你也可以重置它
			myCount.reset(0);
			//停止倒计时
			myCount.stop = 1;
		});

		//你也可以重置计时器
		myCount1.reset(1000);

		//你还可以直接清理队列，这个时候此管理器上的所有定时器都remove掉了
		//顿时世界安静了
		simpleCountDown.clearStack();

    });

## API说明

管理器对象的方法 SimpleCountDown

* init: 初始化
* clearStack: 清理队列
* add(timeNode, leftTime [, totalTime]): 添加定时器（kissy dom对象，剩余时间，总时间）
* get(timeNode): 从dom对象上获取一个倒计时对象（kissy dom节点）
* remove(timeNode): 参照上条
* stop(timeNode): 参照上条
* addCal(func): 在定时器执行循环执行自定义方法

单个倒计时对象方法

* addTrigger(time, callback): 到点执行
* reset(time): 重置时间

## 模板书写
	//填了哪个就会渲染哪个
	<p>${d}天${h}小时${m}分${s}秒</p>

## 关于精度
采用的方案是在每个执行循环中使用(new Date()).getTime()来计算时间，所以精度保证，跟定时器精度无关


