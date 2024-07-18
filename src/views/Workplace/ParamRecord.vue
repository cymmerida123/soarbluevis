<script setup lang="ts">
import {
    reactive,
    nextTick,
    computed,
    ref,
    onMounted,
    watchEffect,
    defineProps,
    getCurrentInstance
} from 'vue'
import type { OptimDetailItem } from '@/api/types'
import { ParamManager } from './src/paramManager'
import * as echarts from 'echarts'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const props = defineProps(['manager', 'sidebar'])
const manager = computed(() => props.manager)
const tagsViewStore = useTagsViewStore()
const route = useRoute()
const paramManager = reactive(new ParamManager(proxy.$route.params.optim_id)) // 优化记录管理器
function show() {
    console.log('show', manager.value)
}
const fillRatio = ref(30)
const optim_data = ref<OptimDetailItem[]>([])
const target_names = computed(() => optim_data.value.map((val) => val.target_name))

const color_bar = ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80', '#8d98b3']
const seriesData = ref([]) // 用于存储每个目标的数据
const echartsList = ref([]) // 用于存储echarts实例
const isTerminal = ref(false)
const flag = ref(0)
const getChartData = async () => {
    optim_data.value = await paramManager.getOptimDetail()
    if (document.title != paramManager.optim_name) {
        document.title = paramManager.optim_name
        tagsViewStore.setTitle(paramManager.optim_name, route.path)
    }
    console.log('manager-optim', optim_data.value, target_names.value)
    await nextTick()
    optim_data.value.forEach((data, index) => {
        seriesData.value.push(
            data.targets.map((val, idx) => ({
                value: [data.steps[idx], val],
                extraInfo: Object.entries(data.params[idx])
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('<br/>')
            }))
        )
        var chartRef = proxy.$refs[data.target_name][0]
        var targetEchart = echarts.init(chartRef)
        targetEchart.setOption({
            // 图例文字颜色
            textStyle: {
                color: '#333'
            },
            grid: {
                left: '20%'
            },
            // 提示框
            tooltip: {
                // trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    animation: false
                },
                formatter: function (params) {
                    try {
                        // var param = params[0]
                        if (Array.isArray(params)) {
                            params = params[0]
                        }
                        return (
                            '时间: ' +
                            params.value[0] +
                            '<br/>' +
                            '数值: ' +
                            params.value[1] +
                            '<br/>' +
                            params.data.extraInfo
                        )
                    } catch (error) {
                        console.error('error', error)
                        return error.message
                    }
                }
            },
            xAxis: {
                type: 'value', // 类目轴
                min: 0,
                // max: 12,
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    }
                },
                axisLabel: {
                    interval: 0,
                    color: '#333',
                    fontSize: 15
                },
                name: '时间步', // 添加X轴标签
                nameLocation: 'middle',
                nameTextStyle: {
                    padding: 20,
                    fontSize: 16
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    }
                },
                axisLabel: {
                    interval: 0,
                    color: '#333',
                    fontSize: 15
                },
                name: data.target_name.split('').join('\n'), // 添加Y轴标签
                nameLocation: 'middle',
                nameRotate: 0, // 旋转Y轴标签
                nameTextStyle: {
                    padding: 20,
                    fontSize: 16
                }
            },
            color: color_bar[index],
            series: {
                data: seriesData.value[index],
                type: 'line',
                smooth: true,
                id: 'a'
            }
        })
        echartsList.value.push(targetEchart)
    })
}

const updataChart = async (ack: number) => {
    let tmp = await paramManager.getOptimRealtimeData(ack)
    let newOptim = tmp.optim_data
    isTerminal.value = tmp.is_terminal
    console.log('newOptim', newOptim, seriesData.value, isTerminal.value)
    if (newOptim[0].steps.length === 0) return
    flag.value = newOptim[0].steps[newOptim[0].steps.length - 1]
    seriesData.value.forEach((data, index) => {
        let newItem = newOptim[index]
        let len = data.length
        let newSeries = newItem.targets.map((val, idx) => ({
            value: [len + 1 + idx, val],
            extraInfo: Object.entries(newItem.params[idx])
                .map(([key, value]) => `${key}: ${value}`)
                .join('<br/>')
        }))
        data.push(...newSeries)
        echartsList.value[index].setOption({
            xAxis: {
                max: len + 2
            },
            series: [
                {
                    id: 'a',
                    data: data
                }
            ]
        })
    })
}
if (!paramManager.isTerminal && !isTerminal.value) {
    setInterval(() => {
        updataChart(flag.value)
    }, 10000)
}
const param_names = ref([])
onMounted(async () => {
    console.log('ParamRecord:onMounted')
    await getChartData()
    param_names.value = computed(() => Object.keys(optim_data.value[0].params[0]))
})
</script>

<template>
    <div class="optim_his">
        <div style="margin-bottom: 5px; width: 90%">
            <!-- 手动调整图片大小：<el-slider v-model="fillRatio" /> -->
            <span style="font-size: larger">优化目标：</span>
            <el-tag
                class="custom-tag"
                type="primary"
                v-for="name in target_names"
                :key="name"
                effect="light"
                >{{ name }}</el-tag
            >
        </div>
        <div style="margin-bottom: 15px; width: 90%">
            <!-- 手动调整图片大小：<el-slider v-model="fillRatio" /> -->
            <span style="font-size: larger">优化参数：</span>
            <el-tag
                class="custom-tag"
                type="success"
                v-for="name in param_names.value"
                :key="name"
                effect="light"
                >{{ name }}</el-tag
            >
        </div>
        <el-scrollbar class="custom-scrollbar">
            <el-space direction="horizontal" :size="50">
                <el-card v-for="name in target_names" :key="name" class="box-card">
                    <div :ref="name" style="height: 500px; width: 500px"></div>
                </el-card>
            </el-space>
        </el-scrollbar>
    </div>
</template>

<style lang="less" scoped>
@sidebar-width: 250px;
@infobar-width: 320px;
@toolbar-height: 50px;
@toolbar-height: 30px;
@mapbar-width: 30px;
.optim_his {
    position: absolute;
    left: @sidebar-width;
    height: 100%;
    width: calc(100% - @sidebar-width);
    padding: 20px;
    margin: 20px;
}
.custom-tag {
    margin-right: 10px;
    margin-bottom: 10px;
}
.custom-scrollbar {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
    border-radius: 8px; /* 可选：添加圆角 */
    // overflow: hidden; /* 确保阴影效果应用于整个滚动框 */
    height: 600px; /* 设置滚动框的高度 */
    width: 95%;
    .el-space {
        width: 96%;
        padding: 20px;
    }
}
</style>
