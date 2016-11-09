/**
 * Created by wind on 2016/10/17.
 */
$(function () {

    var pro_config = {
        ///分析的对象类型.与后台返回有关系
        obj_type: {
            person: 'person',
            info: 'info',
            clue: 'clue',
            other: 'other'
        },
        ///排序的类型
        order_type: {
            type_no: "no", ///
            type_circle: "circle", ///网状排序 ok
            type_layer: "layer",///层次排序    ok
            type_theme: "theme", ///主题排序
            type_center: "center",///中心排序   ok
            type_matrix: "matrix" ///阵列排序   ok
        },
        order_matrix: {
            count: 10,//阵列排序时，每行的数目
            distance: 150 //阵列排序时，元素间的距离 px单位
        },
        order_circle: {
            radius: 250 //网状排序的半径
        },
        order_center: {
            radius: 200 //中心排序的半径
        },
        ///主题排序的时候，确定在第几行
        order_theme_row_value: {
            person: 1,
            info: 2,
            clue: 3,
            other: 4
        },
        ///主题排序的坐标
        order_theme_pos: {
            start_loc: {x: -300, y: -300},///最左上角的位置
            inc: 80///步长
        }
    };

    ////初始化操作对象
    var $obj_type = $("#obj_type");//对象类型
    var $obj_id = $("#obj_id"); ///对象id
    var $query_first = $('#query_first');

    var $i_auto = $('[name = i_auto]:checkbox');

    var $oder_type = $('#order_type');
    var $btn_detail = $('#btn_detail');
    var $btn_config = $('#btn_config');
    var $btn_help = $('#btn_help');

    ///做图版
    var container = document.getElementById('main_panel');

    ///当前节点
    var selected_node_id = '';
    var selected_node_x;
    var selected_node_y;

    var nodes;
    var edges;
    var network;
    var data;

    ///默认配置
    var options = {
        physics: {
            stabilization: true //自动模式
        },
        edges: {
            smooth: {
                type: 'continuous'
            }
        }
        // ,//配置面板
        // configure: {
        //     filter: function (option, path) {
        //         if (path.indexOf('physics') !== -1) {
        //             return true;
        //         }
        //         if (path.indexOf('smooth') !== -1 || option === 'smooth') {
        //             return true;
        //         }
        //         return false;
        //     },
        //     container: document.getElementById('config')
        // }
    };

    ///初始化
    function init() {
        ///包装成dataset
        nodes = new vis.DataSet([]);
        edges = new vis.DataSet([]);
        data = {
            nodes: nodes,
            edges: edges
        };
        network = new vis.Network(container, data, options);

        /*
         下面为可以监听的事件
         目前仅使用了
         */
        ///点击事件
        // network.on("click", function (params) {
        //     params.event = "[original event]";
        //     document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
        //
        //     selected_node_id = params.nodes[0];
        //     if (selected_node_id !== null && selected_node_id !== undefined) {///点击的是点
        //         selected_node_x = params.pointer.canvas.x;
        //         selected_node_y = params.pointer.canvas.y;
        //     }
        // });

        ////双击事件，拓展分析
        network.on("doubleClick", function (params) {
            params.event = "[original event]";
            //document.getElementById('eventSpan').innerHTML = '<h2>doubleClick event:</h2>' + JSON.stringify(params, null, 4);

            selected_node_id = params.nodes[0];
            if (selected_node_id !== null && selected_node_id !== undefined) {
                analysis_node(params.nodes[0], params.pointer.canvas.x, params.pointer.canvas.y);//传入当前点击位置
            }
        });
        // network.on("oncontext", function (params) {
        //     params.event = "[original event]";
        //     document.getElementById('eventSpan').innerHTML = '<h2>oncontext (right click) event:</h2>' + JSON.stringify(params, null, 4);
        // });
        // network.on("dragStart", function (params) {
        //     params.event = "[original event]";
        //     document.getElementById('eventSpan').innerHTML = '<h2>dragStart event:</h2>' + JSON.stringify(params, null, 4);
        // });
        // network.on("dragging", function (params) {
        //     params.event = "[original event]";
        //     document.getElementById('eventSpan').innerHTML = '<h2>dragging event:</h2>' + JSON.stringify(params, null, 4);
        // });
        //拖拽结束事件，确定当前选定的节点
        network.on("dragEnd", function (params) {
            params.event = "[original event]";
            //document.getElementById('eventSpan').innerHTML = '<h2>dragEnd event:</h2>' + JSON.stringify(params, null, 4);

            //捕捉最后选定的点和坐标
            selected_node_id = params.nodes[0];
            if (selected_node_id !== null && selected_node_id !== undefined) {///点击的是点
                selected_node_x = params.pointer.canvas.x;
                selected_node_y = params.pointer.canvas.y;
            }
        });
        // network.on("zoom", function (params) {
        //     document.getElementById('eventSpan').innerHTML = '<h2>zoom event:</h2>' + JSON.stringify(params, null, 4);
        // });
        // network.on("showPopup", function (params) {
        //     document.getElementById('eventSpan').innerHTML = '<h2>showPopup event: </h2>' + JSON.stringify(params, null, 4);
        // });
        // network.on("hidePopup", function () {
        //     console.log('hidePopup Event');
        // });
        // network.on("select", function (params) {
        //     console.log('select Event:', params);
        // });
        //选择节点事件，确定当前选定的节点
        network.on("selectNode", function (params) {
            console.log('selectNode Event:', params);
            //捕捉最后选定的点和坐标
            selected_node_id = params.nodes[0];
            if (selected_node_id !== null && selected_node_id !== undefined) {///点击的是点
                selected_node_x = params.pointer.canvas.x;
                selected_node_y = params.pointer.canvas.y;
            }
        });
        // network.on("selectEdge", function (params) {
        //     console.log('selectEdge Event:', params);
        // });
        // network.on("deselectNode", function (params) {
        //     console.log('deselectNode Event:', params);
        // });
        // network.on("deselectEdge", function (params) {
        //     console.log('deselectEdge Event:', params);
        // });
        // network.on("hoverNode", function (params) {
        //     console.log('hoverNode Event:', params);
        // });
        // network.on("hoverEdge", function (params) {
        //     console.log('hoverEdge Event:', params);
        // });
        // network.on("blurNode", function (params) {
        //     console.log('blurNode Event:', params);
        // });
        // network.on("blurEdge", function (params) {
        //     console.log('blurEdge Event:', params);
        // });
    }

    init();

    ////初始节点选择
    $query_first.on('click', function () {
        if (!$i_auto.is(':checked')) {
            $i_auto.trigger('click');
        }

        var type = $obj_type.val();
        var id = $obj_id.val();

        if (type === '' || id === '') {
            alert('请选择对象种类、id');
        } else {
            console.log('选择对象开始分析 ...');

            ///TODO 提示确认；切换成后台ajax读取    first.json

            ///模拟生成
            data.nodes.clear();
            data.edges.clear();
            data.nodes.add(
                {
                    id: id,
                    type: 'person1',
                    title: '这是title字段！<br>more info is here.1',
                    label: id + '#',
                    image: './test/img/qqjiamo' + (Math.floor(Math.random() * 60) + 10) + '.jpg',
                    shape: 'image',
                    detail_url: 'http:///www.qq.com',
                    x: 0,
                    y: 0,
                    analysised: false
                }
            );
        }
    });

    ///分析当前选定的节点
    ///sel 节点id, (curr_x, curr_y) 当前坐标
    function analysis_node(sel, curr_x, curr_y) {
        selected_node_id = sel;
        console.log('开始分析', sel, curr_x, curr_y);

        if (selected_node_id === '' || selected_node_id === undefined) {
            alert('请选择对象后再进行分析！');
            return;
        }

        var cur_node = data.nodes.get(selected_node_id);
        console.log('analysis ', cur_node, cur_node.analysised)
        if (cur_node.analysised) {
            return; //已经分析过了
        }

        ///TODO read from ajax request.  getRelated.json

        ///模拟产生3个节点
        for (var i = 0; i < 3; i++) {

            var id1 = Math.floor(Math.random() * 60) + 10;
            if (data.nodes.get(id1) === null || data.nodes.get(id1) === undefined) {
                data.nodes.add({
                    id: id1,
                    type: 'person',
                    label: id1 + '号',
                    title: '这是title字段！<br>可以将详细内容<br>放在这里的',
                    image: './test/img/qqjiamo' + id1 + '.jpg',
                    shape: 'image',
                    detail_url: 'http:///www.qq.com',
                    x: curr_x + 150 * Math.cos(i * 120 * Math.PI / 180),
                    y: curr_y + 150 * Math.sin(i * 120 * Math.PI / 180),
                    analysised: false
                });
            } else {
                ///node already exists. donot need to add.
            }


            //TODO 调整线的查找关联方式
            /// var found = false;
            /// data.edges.get({
            ///     from: selected_node_id,
            ///     to: id1
            /// }).forEach(function (e) {
            ///     if (e.to == id1) {
            ///         found = true;
            ///     }
            /// });
            /// if (!found) {
            data.edges.add({
                from: selected_node_id,
                to: id1
            });
            /// } else {
            ///     ///edges already exists
            ///     console.log('edges exists->', selected_node_id, id1);
            /// }
        }

        //设置当前节点为已分析
        data.nodes.update(
            {
                id: selected_node_id,
                analysised: true,
                label: cur_node.label + '*'
            }
        );
    }

    $oder_type.on('change', function () {
        var self = $(this);
        var val = self.children('option:selected').val();

        if (data.nodes.length == 0) {
            return;
        }

        if (val === '0') {
            console.log('nothing ......')
            return;
        }

        if (val === pro_config.order_type.type_circle) {
            ///网状排序 以0为圆心，250px位半径
            var length = data.nodes.get().length;
            for (var i in data.nodes.get()) {
                data.nodes.update({
                    id: data.nodes.get()[i].id,
                    x: pro_config.order_circle.radius * Math.cos((i / length) * Math.PI * 2),
                    y: pro_config.order_circle.radius * Math.sin((i / length) * Math.PI * 2)
                });
            }
        } else if (val === pro_config.order_type.type_layer) {
            //TODO 调整层次排序
            ///层次排序 层次排序以关联最多的点为起点
            network.setOptions({
                layout: {
                    hierarchical: {
                        direction: 'UD' /// up->down. 还可以DU/LR/RL
                    }
                }
            });

            network.setOptions({
                    layout: {
                        hierarchical: {
                            enabled: false
                        }
                    }
                }
            );

            network.setOptions({
                    physics: {
                        enabled: false
                    },
                    edges: {
                        smooth: {
                            type: 'continuous'
                        }
                    }
                }
            );

        } else if (val === pro_config.order_type.type_center) {
            ///中心排序 以选定的点为中心
            if (selected_node_id === '' || selected_node_id === undefined) {
                alert('请选择对象后再进行中心排序！');
                return;
            }

            ///采用遍历的方法。
            var related_nodes = [];
            data.edges.get().forEach(function (e) {
                if (e.from == selected_node_id) {
                    related_nodes.push(e.to);
                } else if (e.to == selected_node_id) {
                    related_nodes.push(e.from)
                } else {
                }
            });

            var length = related_nodes.length;
            for (var i in related_nodes) {
                data.nodes.update({
                    id: related_nodes[i],
                    x: selected_node_x + pro_config.order_center.radius * Math.cos((i / length) * Math.PI * 2),
                    y: selected_node_y + pro_config.order_center.radius * Math.sin((i / length) * Math.PI * 2)
                });
            }
        } else if (val == pro_config.order_type.type_matrix) {
            ///阵列排序
            for (var i in data.nodes.get()) {
                var node = data.nodes.get()[i];

                data.nodes.update({
                    id: node.id,
                    x: (i % pro_config.order_matrix.count) * pro_config.order_matrix.distance,
                    y: Math.floor(i / pro_config.order_matrix.count) * pro_config.order_matrix.distance
                });
            }
        } else if (val == pro_config.order_type.type_theme) {
            ///主题排序

            ///分组
            var person_ids = [];
            var info_ids = [];
            var clue_ids = [];
            var other_ids = [];
            for (var i in data.nodes.get()) {
                var node = data.nodes.get()[i];
                if (node.type == pro_config.obj_type.person) {
                    person_ids.push(node.id);
                } else if (node.type == pro_config.obj_type.info) {
                    info_ids.push(node.id);
                } else if (node.type == pro_config.obj_type.clue) {
                    clue_ids.push(node.id);
                } else {
                    other_ids.push(node.id);
                }
            }
            console.log('person', person_ids.length, 'info', info_ids.length);

            ///重排
            for (var i in person_ids) {
                data.nodes.update({
                    id: person_ids[i],
                    x: pro_config.order_theme_pos.start_loc.x + i * pro_config.order_theme_pos.inc,
                    y: pro_config.order_theme_pos.start_loc.y
                });
            }

            for (var i in info_ids) {
                data.nodes.update({
                    id: info_ids[i],
                    x: pro_config.order_theme_pos.start_loc.x + i * pro_config.order_theme_pos.inc,
                    y: pro_config.order_theme_pos.start_loc.y + pro_config.order_theme_pos.inc
                });
            }

            for (var i in clue_ids) {
                data.nodes.update({
                    id: clue_ids[i],
                    x: pro_config.order_theme_pos.start_loc.x + i * pro_config.order_theme_pos.inc,
                    y: pro_config.order_theme_pos.start_loc.y + pro_config.order_theme_pos.inc * 2
                });
            }

            for (var i in other_ids) {
                data.nodes.update({
                    id: other_ids[i],
                    x: pro_config.order_theme_pos.start_loc.x + i * pro_config.order_theme_pos.inc,
                    y: pro_config.order_theme_pos.start_loc.y + pro_config.order_theme_pos.inc * 3
                });
            }

        } else {
            console.log('never goes here...');
        }

        $oder_type.val(0);
    });

    $btn_detail.on('click', function () {
        console.log('开始查看节点详情：', selected_node_id);
        if (selected_node_id === '' || selected_node_id === undefined) {
            alert('请选择对象后再查看详情！');
            return;
        }

        window.open(data.nodes.get(selected_node_id).detail_url);
    });

    $btn_help.on('click',function () {
        window.open("help.html");
    });

    ///初始化布局、重排控件
    $i_auto.attr('checked', true);
    $oder_type.attr("disabled", "disabled");

    $i_auto.on('click', function () {
        if ($i_auto.is(':checked')) {
            console.log('自动排序。');

            $oder_type.attr("disabled", "disabled");
            network.setOptions({
                    physics: {
                        enabled: true
                    },
                    edges: {
                        smooth: {
                            type: 'continuous'
                        }
                    }
                }
            );
        } else {
            console.log('取消自动排序。');

            $oder_type.removeAttr("disabled");
            network.setOptions({
                    physics: {
                        enabled: false
                    },
                    edges: {
                        smooth: {
                            type: 'continuous'
                        }
                    }
                }
            );
        }
    });
});