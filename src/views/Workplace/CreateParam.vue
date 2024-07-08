<script setup lang="ts">
import { watch, computed, ref, onMounted, watchEffect, onUpdated, nextTick, h } from 'vue'
import { ElTree } from 'element-plus'
const props = defineProps(['manager'])
import { ParamTreeNode } from './src/types'
import type Node from 'element-plus/es/components/tree/src/model/node'
// import { nextTick } from 'process'
const manager = computed(() => props.manager)
const show = () => {
    console.log('11tree:', treeData.value.value)
}
const treeRef = ref<InstanceType<typeof ElTree>>()
const defaultProps = {
    children: 'children',
    label: 'label'
}
const treeData = ref(null)
function addPropertyToLeaves(node: ParamTreeNode) {
    if (node.data.type === 'action') {
        node.children = node.data.params.map((param) => {
            return { children: [], label: param.key, id: param.key }
        })
        node.isPenultimate = true
    } else {
        // If the current node is not a leaf, recursively process its children
        node.children.forEach((child) => addPropertyToLeaves(child))
    }
}

const customNodeClass = (data: ParamTreeNode, node: Node) => {
    if (data.isPenultimate) {
        return 'is-penultimate'
    }
    return null
}

onMounted(async () => {
    treeData.value = computed(() => manager.value.tree_util.tree)
    watchEffect(() => {
        if (treeData.value && treeData.value.value) {
            treeData.value.value.forEach((root) => addPropertyToLeaves(root))
        }
    })
    console.log('treeData:', treeData.value)
})
</script>

<template>
    <div>
        <h1>参数选择</h1>
        <el-button @click="show">点击我</el-button>
        <el-tree
            ref="treeRef"
            style="max-width: 800px"
            :height="1"
            :data="treeData"
            show-checkbox
            default-expand-all
            node-key="id"
            highlight-current
            :props="{ class: customNodeClass }"
        />
    </div>
</template>

<style lang="less" scoped>
:deep .is-penultimate > .el-tree-node__children {
    display: flex;
    flex-direction: row;
}
:deep .is-penultimate > .el-tree-node__children > div {
    width: 100%;
}
</style>
