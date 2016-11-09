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
    // var $btn_config = $('#btn_config');
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

        ////双击事件，拓展分析
        network.on("doubleClick", function (params) {
            params.event = "[original event]";
            //document.getElementById('eventSpan').innerHTML = '<h2>doubleClick event:</h2>' + JSON.stringify(params, null, 4);

            selected_node_id = params.nodes[0];
            if (selected_node_id !== null && selected_node_id !== undefined) {
                analysis_node(params.nodes[0], params.pointer.canvas.x, params.pointer.canvas.y);//传入当前点击位置
            }
        });

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

            ///从后台读取
            $.ajax({
                url: './test/data/first.json', //TODO 调整为真正的地址！！
                type: 'GET',
                //contentType:'application/x-www-form-urlencoded',
                data: '&type='+type + '&id=' + id,
                dataType: 'json',
                success: function (return_data) {
                    if(return_data.isFound) {
                        var newNode = return_data.obj;

                        //TODO 模拟代码。改正式地址后删除-----v
                        newNode.label = id + '#';
                        newNode.image = './test/img/qqjiamo' + (Math.floor(Math.random() * 60) + 10) + '.jpg';
                        //TODO 模拟代码。改正式地址后删除-----^

                        data.nodes.clear();
                        data.edges.clear();
                        data.nodes.add(newNode);
                    }else{
                        alert('没有找到对象');
                    }
                },
                error: function () {
                    alert('出现错误。');
                }
            });
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

        if (cur_node.analysised) {
            return; //已经分析过了
        }

        ///从后台读取关联数据
        $.ajax({
            url: './test/data/getRelated.json', //TODO 调整为真正的地址！！
            type: 'GET',
            //contentType:'application/x-www-form-urlencoded',
            data: '&type='+cur_node.type + '&id=' + cur_node.id,
            dataType: 'json',
            success: function (return_data) {
                if(return_data.isFound) {

                    for( var i in return_data.list ) {
                        var new_node = return_data.list[i];

                        //TODO 模拟代码。改正式地址后删除-----v
                        var random_num =  Math.floor(Math.random() * 60) + 10;
                        new_node.id = random_num + '号';
                        new_node.label = new_node.id + '号';
                        new_node.image = './test/img/qqjiamo' + random_num + '.jpg';
                        //TODO 模拟代码。改正式地址后删除-----^

                        if (data.nodes.get(new_node.id) === null || data.nodes.get(new_node.id) === undefined) {
                            //设定位置
                            new_node.x = curr_x + 150 * Math.cos( 2 * Math.PI * i / return_data.list.length );
                            new_node.y = curr_y + 150 * Math.sin( 2 * Math.PI * i / return_data.list.length );
                            data.nodes.add(new_node);
                        }

                        data.edges.add({
                            from: selected_node_id,
                            to: new_node.id
                        });
                    }
                }else{
                    alert('没有找到对象');
                }
            },
            error: function () {
                alert('出现错误。');
            }
        });

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
                $oder_type.val(0);
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