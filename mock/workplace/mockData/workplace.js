export default {
    getListData: () => {
        return {
            data: {
                list: [
                    { optim_id: '123123', optim_name: '记录1' },
                    { optim_id: '84', optim_name: '记录2' },
                    { optim_id: '80', optim_name: '记录3' }
                ],
                total: 3
            },
            code: 0,
            message: 'success'
        }
    },
    getChartData: () => {
        return {
            data: {
                optim_data: [
                    {
                        steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        targets: [19, 52, 73, 74, 12, 46, 34, 37, 79, 48],
                        params: [
                            {
                                param1: 97,
                                param2: 25,
                                param3: 59
                            },
                            {
                                param1: 97,
                                param2: 79,
                                param3: 21
                            },
                            {
                                param1: 77,
                                param2: 63,
                                param3: 17
                            },
                            {
                                param1: 13,
                                param2: 10,
                                param3: 62
                            },
                            {
                                param1: 12,
                                param2: 52,
                                param3: 80
                            },
                            {
                                param1: 63,
                                param2: 43,
                                param3: 62
                            },
                            {
                                param1: 26,
                                param2: 5,
                                param3: 50
                            },
                            {
                                param1: 99,
                                param2: 91,
                                param3: 12
                            },
                            {
                                param1: 95,
                                param2: 54,
                                param3: 64
                            },
                            {
                                param1: 51,
                                param2: 95,
                                param3: 21
                            }
                        ],
                        target_name: '我方胜率'
                    },
                    {
                        steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        targets: [56, 12, 6, 6, 44, 24, 57, 36, 21, 30],
                        params: [
                            {
                                param1: 38,
                                param2: 85,
                                param3: 48
                            },
                            {
                                param1: 46,
                                param2: 29,
                                param3: 28
                            },
                            {
                                param1: 100,
                                param2: 21,
                                param3: 66
                            },
                            {
                                param1: 59,
                                param2: 38,
                                param3: 50
                            },
                            {
                                param1: 16,
                                param2: 77,
                                param3: 11
                            },
                            {
                                param1: 11,
                                param2: 24,
                                param3: 33
                            },
                            {
                                param1: 9,
                                param2: 6,
                                param3: 89
                            },
                            {
                                param1: 19,
                                param2: 36,
                                param3: 58
                            },
                            {
                                param1: 23,
                                param2: 46,
                                param3: 43
                            },
                            {
                                param1: 41,
                                param2: 70,
                                param3: 46
                            }
                        ],
                        target_name: '任务完成时间'
                    },
                    {
                        steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        targets: [19, 66, 52, 27, 81, 76, 49, 51, 87, 93],
                        params: [
                            {
                                param1: 96,
                                param2: 8,
                                param3: 95
                            },
                            {
                                param1: 25,
                                param2: 14,
                                param3: 56
                            },
                            {
                                param1: 55,
                                param2: 89,
                                param3: 23
                            },
                            {
                                param1: 41,
                                param2: 1,
                                param3: 79
                            },
                            {
                                param1: 18,
                                param2: 78,
                                param3: 96
                            },
                            {
                                param1: 71,
                                param2: 34,
                                param3: 26
                            },
                            {
                                param1: 67,
                                param2: 3,
                                param3: 62
                            },
                            {
                                param1: 99,
                                param2: 45,
                                param3: 48
                            },
                            {
                                param1: 71,
                                param2: 2,
                                param3: 5
                            },
                            {
                                param1: 36,
                                param2: 24,
                                param3: 2
                            }
                        ],
                        target_name: '我方存活率'
                    },
                    {
                        steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        targets: [71, 56, 1, 96, 80, 48, 35, 9, 99, 18],
                        params: [
                            {
                                param1: 38,
                                param2: 63,
                                param3: 55
                            },
                            {
                                param1: 11,
                                param2: 91,
                                param3: 30
                            },
                            {
                                param1: 22,
                                param2: 5,
                                param3: 72
                            },
                            {
                                param1: 2,
                                param2: 57,
                                param3: 31
                            },
                            {
                                param1: 53,
                                param2: 14,
                                param3: 40
                            },
                            {
                                param1: 67,
                                param2: 83,
                                param3: 75
                            },
                            {
                                param1: 32,
                                param2: 23,
                                param3: 28
                            },
                            {
                                param1: 78,
                                param2: 9,
                                param3: 36
                            },
                            {
                                param1: 55,
                                param2: 99,
                                param3: 47
                            },
                            {
                                param1: 14,
                                param2: 65,
                                param3: 39
                            }
                        ],
                        target_name: '我方脆弱性'
                    }
                ],
                graph_data: {
                    id: '97',
                    name: '报被置如志',
                    desc: 'officia nostrud Ut non',
                    content: 'Lorem minim',
                    env: 'tempor incididunt',
                    tree: 'laboris qui exercitation',
                    type: 'elit velit deserunt in',
                    create_time: 703660786415,
                    update_time: 837457965431,
                    deleted: 3,
                    node_count: 55,
                    edge_count: 16
                },
                is_terminal: false,
                optim_name: '记录1'
            },
            code: 0,
            message: 'success'
        }
    },
    getRealtimeData: () => {
        return {
            data: {
                optim_data: [
                    {
                        steps: [11, 12],
                        targets: [88, 13],
                        params: [
                            {
                                param1: 7,
                                param2: 41,
                                param3: 52
                            },
                            {
                                param1: 71,
                                param2: 55,
                                param3: 95
                            }
                        ],
                        target_name: '我方胜率'
                    },
                    {
                        steps: [11, 12],
                        targets: [48, 71],
                        params: [
                            {
                                param1: 13,
                                param2: 16,
                                param3: 30
                            },
                            {
                                param1: 46,
                                param2: 7,
                                param3: 96
                            }
                        ],
                        target_name: '任务完成时间'
                    },
                    {
                        steps: [11, 12],
                        targets: [54, 84],
                        params: [
                            {
                                param1: 74,
                                param2: 59,
                                param3: 83
                            },
                            {
                                param1: 23,
                                param2: 84,
                                param3: 23
                            }
                        ],
                        target_name: '我方存活率'
                    },
                    {
                        steps: [11, 12],
                        targets: [81, 43],
                        params: [
                            {
                                param1: 74,
                                param2: 92,
                                param3: 39
                            },
                            {
                                param1: 26,
                                param2: 95,
                                param3: 24
                            }
                        ],
                        target_name: '我方脆弱性'
                    }
                ],
                is_terminal: false
            },
            code: 0,
            message: 'success'
        }
    },
    postOptimData: () => {
        return {
            data: {
                optim_id: '123123'
            },
            code: 0,
            message: 'success'
        }
    }
}
