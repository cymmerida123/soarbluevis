<script lang="ts">
export default {
    name: 'Count',
    inject: ['getGraph', 'getNode'],
    data() {
        return {
            num: 0
        }
    },
    mounted() {
        const self = this
        // @ts-ignore
        const node: any = this.getNode()
        // 监听数据改变事件
        // @ts-ignore
        node.on('change:data', ({ current }) => {
            self.num = current.num
        })
    },
    methods: {
        add() {
            // @ts-ignore
            const node: any = this.getNode()
            const { num } = node.getData()
            node.setData({
                num: num + 1
            })
        }
    }
}
</script>

<template>
    <div style="color: black">
        <span>你好</span>
        <!-- <el-button @click="add()">内部Add: {{ num }} </el-button> -->
    </div>
</template>
