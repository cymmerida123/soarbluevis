<script setup lang="ts">
import { toRaw, computed, ref, onMounted, watchEffect, defineProps } from 'vue'
import { ElTree } from 'element-plus'
import { ParamTreeNode } from './types'
import type Node from 'element-plus/es/components/tree/src/model/node'
// import ParamDialog from './ParamDialog.vue'
import { useDesign } from '@/hooks/web/useDesign'
import Dialog from '@/components/Dialog/src/Dialog.vue'
import router from '@/router'
import { useStore } from 'vuex'
const stores = useStore()
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('dialog')
const props = defineProps(['manager'])
const manager = computed(() => props.manager)
const show = () => {
    console.log('11tree:', treeData.value.value)
    console.log('treeRef:', treeRef.value, target.value)
}
const treeRef = ref()
const defaultProps = {
    children: 'children',
    label: 'label',
    value: 'id',
    multiple: true
}

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
const target = ref('')
const optimTarget = [
    { value: 'winning_rate', label: '我方胜率' },
    { value: 'finish_time', label: '任务完成时间' }
]

function pruneTreesWithoutActions(trees: ParamTreeNode[]): number[] {
    let idx = []
    for (let i = trees.length - 1; i >= 0; i--) {
        const tree = trees[i]
        let hasActionNode = false

        // 检查树中是否有行为节点
        function checkForAction(node: ParamTreeNode) {
            if (node.data.type === 'action') {
                node.children = node.data.params.map((param) => {
                    return { children: [], label: param.key, id: param.key }
                })
                node.isPenultimate = true
                hasActionNode = true
            } else {
                node.children.forEach((child) => {
                    checkForAction(child)
                })
            }
        }

        checkForAction(tree)
        // 如果没有行为节点，则从数组中删除该树
        if (hasActionNode) {
            idx.push(i)
        }
    }
    return idx
}

const gotoRecord = () => {
    router.push({
        path: `/${stores.state.type}/${stores.state.graph_id}/optim_records/${manager.value.optim_id}`
    }) // 跳转到优化记录页面
}

const treeData = ref([])
const treeDisply = ref([])
onMounted(async () => {
    treeData.value = computed(() => manager.value.tree_util.tree)
    watchEffect(() => {
        if (treeData.value && treeData.value.value) {
            // treeData.value.value.forEach((root) => addPropertyToLeaves(root))
            const idx = pruneTreesWithoutActions(treeData.value.value)
            treeDisply.value = treeData.value.value.filter((_, i) => idx.includes(i))
        }
    })
})
</script>

<template>
    <div class="optim_content">
        <el-space wrap direction="vertical" :size="20" style="width: 100%" fill="true">
            <div>
                <p>步骤一：请选择优化目标</p>
                <el-select v-model="target" clearable placeholder="Select" style="width: 100%">
                    <el-option
                        v-for="item in optimTarget"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </div>

            <div>
                <p>步骤二：请选择需要优化的参数</p>
                <el-cascader
                    :options="treeDisply"
                    :props="defaultProps"
                    collapse-tags
                    collapse-tags-tooltip
                    :max-collapse-tags="3"
                    clearable
                    class="custom-cascader"
                    v-model="treeRef"
                    style="width: 100%"
                />
            </div>

            <div class="button-container">
                <el-button @click="manager.onCreateOptim(toRaw(treeRef), target)" type="primary"
                    >创建优化</el-button
                >
            </div>
            <!-- <div class="button-container">
                <el-button @click="show" type="primary">点我</el-button>
            </div> -->
        </el-space>
    </div>
    <Dialog
        v-model="manager.open_param_dialog_visible"
        width="500px"
        max-height="170px"
        :class="prefixCls"
        title="参数优化运行中"
    >
        <div class="flex flex-col items-center flex-wrap">
            <el-space direction="vertical" alignment="start" :size="20" style="padding-top: 10px">
                <el-text>
                    <el-icon><Folder /></el-icon>
                    项目路径：{{ manager.project_filepath }}
                </el-text>
                <el-text>
                    <el-icon><Document /></el-icon>
                    优化记录：{{ manager.paramfile_name }}
                </el-text>
            </el-space>
        </div>
        <template #footer>
            <!-- <el-button type="primary" @click="manager.openProject('')">默认程序打开</el-button>
                <el-button type="primary" @click="manager.openProject('vscode')"
                    >VsCode打开</el-button
                > -->
            <el-button type="primary" @click="gotoRecord">查看实时效果</el-button>
            <el-button @click="manager.open_param_dialog_visible = false">取 消</el-button>
        </template>
    </Dialog>
</template>

<style lang="less" scoped>
.optim_content {
    padding-left: 20px;
    padding-right: 20px;
    top: 0;
    .button-container {
        display: flex;
        justify-content: center;
        align-items: center;
        .el-button {
            width: 120px;
        }
        padding-top: 10px;
    }
    // .cascader {
    //     display: flex;
    //     flex-direction: column;
    //     gap: 20px;
    //     .button-container {
    //         display: flex;
    //         justify-content: center;
    //         align-items: center;
    //         .el-button {
    //             width: 120px;
    //         }
    //     }
    // }
}
.list-container {
    width: 50;
    word-wrap: break-word; /* Allows long words to break and wrap to the next line */
    white-space: normal; /* Ensures that the text wraps normally */
}
</style>
