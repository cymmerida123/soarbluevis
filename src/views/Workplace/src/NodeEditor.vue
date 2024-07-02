<script setup lang="ts">
import { watch, computed, ref, onMounted, onUnmounted } from 'vue'
import { formatExecStatus } from './constants'
import ParamEditor from './ParamEditor.vue'
import LabelValueItem from '@/components/LabelValueItem.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConfigApi, getDefaultNodeConfigApi } from '@/api'
import { downloadText } from '@/utils'

const props = defineProps(['modelValue', 'execStatus', 'graphId', 'manager'])
const emit = defineEmits(['update:modelValue'])

// 记住
const infobarActiveTab = ref('info')
const dev = ref(false)

// activeNames
const activeNames = ref(['__info__', ''])

onMounted(async () => {
    infobarActiveTab.value = localStorage.getItem('node_editor_infobar_active_tab') || 'info'
    const config = (await getConfigApi()).data
    dev.value = config.dev

    activeNames.value = localStorage
        .getItem('node_editor_active_names' + modelValue.value.data.type)
        ?.split(',') || ['__info__', '']
})

onUnmounted(() => {
    localStorage.setItem('node_editor_infobar_active_tab', infobarActiveTab.value)

    localStorage.setItem(
        'node_editor_active_names' + modelValue.value.data.type,
        activeNames.value.join(',')
    )
})

const modelValue = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        onUpdate()
    }
})
const manager = computed(() => {
    return props.manager
})

const execStatus = computed(() => {
    return props.execStatus
})

const param_groups = computed(() => {
    let group_set = new Set()
    let groups = []
    modelValue.value.data.params.forEach((item) => {
        let group = item.group || ''
        if (!group_set.has(group)) {
            groups.push(group)
            group_set.add(group)
        }
    })
    return groups
})

const onSubmit = () => {
    onUpdate()
}

function onUpdate() {
    try {
        emit('update:modelValue', modelValue.value)
        manager.value.onNodeUpdate(modelValue.value)
    } catch (e) {
        console.error(e)
    }
}

const title = computed(() => {
    let name = modelValue.value.label || modelValue.value.data.name
    let groupName = modelValue.value.data.group?.title
    return groupName + ' - ' + name
})

const group_title = computed(() => {
    return ((modelValue.value.data || {}).group || {}).title || ''
})

watch(
    () => modelValue,
    (value) => {
        onUpdate()
    },
    { deep: true }
)

const resetDefault = () => {
    console.log('resetDefault')
    ElMessageBox.confirm('确定要重置默认参数值吗？该操作不可逆！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
    })
        .then(async () => {
            let default_data = (
                await getDefaultNodeConfigApi({
                    graph_id: props.graphId,
                    node_key: modelValue.value.data.key,
                    node_path: modelValue.value.data.path
                })
            ).data

            setNode(default_data)

            ElMessage.success('已将当前节点参数重置为默认值')
        })
        .catch(() => {})
}

const setNode = (node: any) => {
    console.log('setNode', node)
    // modelValue.value.data = {
    //     ...modelValue.value.data,
    //     ...node.data
    // }

    const new_params_value_dict = {}

    node.data.params.forEach((item) => {
        new_params_value_dict[item.group + '-' + item.key] = item.value
    })

    modelValue.value.data.params.forEach((item) => {
        const item_key = item.group + '-' + item.key
        if (new_params_value_dict[item_key] === undefined) {
            new_params_value_dict[item_key] = item.value
        } else {
            item.value = new_params_value_dict[item_key]
        }
    })
    // modelValue.value.label = node.label
    // modelValue.value.size.width = node.size.width
    // modelValue.value.size.height = node.size.height
    // modelValue.value.label_font_size = node.label_font_size || 13
    onUpdate()
}

const exportNode = () => {
    const rawLabel = modelValue.value.label.replace(/\n/g, '_')
    downloadText(JSON.stringify(modelValue.value), `${rawLabel}.json`)
}

const importNode = () => {
    // 上传JSON文件
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
        const file = input.files![0]
        const reader = new FileReader()
        reader.onload = async () => {
            const data = JSON.parse(reader.result as string)
            try {
                setNode(data)
            } catch (e) {
                ElMessage.error('导入失败')
            }
        }
        reader.readAsText(file)
    }
    input.click()
}

const generateDefaultTree = () => {
    ElMessageBox.confirm(
        '确定要根据原始代码在图上生成行为树吗？该操作会删除原来的行为树！',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true
        }
    )
        .then(() => {
            manager.value.onGenerateDefaultBehaviorTree(modelValue.value.id)
        })
        .catch((e) => {
            console.error(e)
        })
}

const deleteChildren = async () => {
    ElMessageBox.confirm('确定要删除子树吗？该操作不可逆！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
    })
        .then(() => {
            manager.value.onDeleteChildren(modelValue.value)
        })
        .catch(() => {})
}

const selectChildren = async () => {
    manager.value.onSelectChildren(modelValue.value)
}
</script>

<template>
    <div class="node-editor">
        <div class="title">{{ title }}</div>

        <div class="btns">
            <!-- <el-button
                v-if="modelValue.data.disabled"
                class="button"
                size="default"
                type="success"
                @click="toggleDisabled"
                >激活</el-button
            >
            <el-button v-else class="button" size="default" type="info" @click="toggleDisabled"
                >禁用</el-button
            > -->
            <el-button class="button" size="default" type="primary" @click="selectChildren()"
                >选中子树</el-button
            >
            <el-button class="button" size="default" type="danger" @click="deleteChildren()"
                >删除子树
            </el-button>
            <el-button
                class="button"
                size="default"
                type="primary"
                @click="generateDefaultTree()"
                v-if="modelValue.data.type == 'platform' && manager.config.dev"
                >根据源代码生成行为树
            </el-button>
        </div>

        <el-tabs v-model="infobarActiveTab" stretch>
            <el-tab-pane label="信息" name="info">
                <el-collapse v-model="activeNames" class="collapse">
                    <div class="m-1">
                        <div>
                            <LabelValueItem label="key" :value="modelValue.data.key" />
                        </div>
                        <div>
                            <LabelValueItem label="id" :value="modelValue.id" />
                        </div>
                        <div>
                            <LabelValueItem label="类型" :value="modelValue.data.type" />
                        </div>
                        <div>
                            <LabelValueItem label="继承" :value="modelValue.data.inherit" />
                        </div>
                        <div>
                            <LabelValueItem label="index" :value="modelValue.data.index" />
                        </div>
                        <div>
                            <LabelValueItem label="源代码文件" :value="modelValue.data.path" />
                        </div>
                        <div>
                            <LabelValueItem label="源代码哈希" :value="modelValue.data.code_hash" />
                        </div>

                        <div v-if="group_title">
                            <LabelValueItem label="分组" :value="group_title" />
                        </div>
                        <div v-if="modelValue.data.platform?.side">
                            <LabelValueItem label="战队" :value="modelValue.data.platform?.side" />
                        </div>
                        <div v-if="modelValue.data.platform?.inherit">
                            <LabelValueItem
                                label="继承"
                                :value="modelValue.data.platform?.inherit"
                            />
                        </div>
                        <div>
                            <LabelValueItem label="子节点数" :value="modelValue.children?.length" />
                        </div>
                        <div>
                            <LabelValueItem
                                label="运行状态"
                                :value="formatExecStatus(execStatus)"
                            />
                        </div>

                        <div
                            v-if="
                                modelValue.data.type == 'platform' &&
                                modelValue.data.quantum_tasker_processor
                            "
                        >
                            <LabelValueItem
                                label="quantum_tasker_processor"
                                :value="modelValue.data.quantum_tasker_processor.name"
                            />
                        </div>

                        <el-divider />
                        <el-form-item label="是否禁用">
                            <el-switch v-model="modelValue.data.disabled" />
                        </el-form-item>
                        <el-form-item label="切换节点">
                            <el-select
                                class="button"
                                v-model="modelValue.data.key"
                                placeholder="请选择"
                                filterable
                                :style="{ width: '90%' }"
                            >
                                <el-option
                                    v-for="item in manager.stencil_nodes.filter(
                                        (item) => item.data.type == modelValue.data.type
                                    )"
                                    :key="item.data.key"
                                    :label="item.data.name"
                                    :value="item.data.key"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="展示名称">
                            <el-input
                                :rows="2"
                                type="textarea"
                                v-model="modelValue.label"
                                :placeholder="modelValue.data.name"
                                :autosize="{ minRows: 2, maxRows: 6 }"
                            />
                        </el-form-item>

                        <!-- <el-form-item label="变量名">
                            <el-tooltip content="以字母开头，只能包含字母、数字、下划线，不能重复">
                                <el-input
                                    :disabled="true"
                                    v-model="modelValue.data.name"
                                    :placeholder="modelValue.data.key"
                                    controls-position="right"
                                />
                            </el-tooltip>
                        </el-form-item> -->

                        <el-form-item label="描述">
                            <el-input
                                :rows="2"
                                type="textarea"
                                v-model="modelValue.data.desc"
                                :autosize="{ minRows: 2, maxRows: 6 }"
                            />
                        </el-form-item>

                        <template v-if="dev">
                            <el-divider />

                            <div v-if="modelValue.data.quantum_tasker_processor">
                                <el-input
                                    :rows="5"
                                    v-model="modelValue.data.quantum_tasker_processor.code"
                                    type="textarea"
                                />
                            </div>
                        </template>

                        <!-- <el-form-item label="描述">
                            <el-input
                                :rows="2"
                                type="textarea"
                                v-model="modelValue.data.desc"
                                :autosize="{ minRows: 2, maxRows: 6 }"
                            />
                        </el-form-item> -->
                    </div>

                    <!-- <el-descriptions :column="1" border>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> key </div>
                        </template>
                        {{ value.data.key }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> id </div>
                        </template>
                        {{ value.id }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="value.data.type">
                        <template #label>
                            <div class="cell-item"> 类型 </div>
                        </template>
                        {{ value.data.type }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> 状态 </div>
                        </template>
                        {{ formatExecStatus(props.execStatus) }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> 位置 </div>
                        </template>
                        {{ value.position.x }}, {{ value.position.y }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> index </div>
                        </template>
                        {{ value.data.index }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="value.group_title">
                        <template #label>
                            <div class="cell-item"> 分组 </div>
                        </template>
                        {{ value.group_title }}
                    </el-descriptions-item>

                    <el-descriptions-item v-if="value.data.platform && value.data.platform.side">
                        <template #label>
                            <div class="cell-item"> 战队 </div>
                        </template>
                        {{ value.data.platform.side }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="value.children">
                        <template #label>
                            <div class="cell-item"> 子节点数 </div>
                        </template>
                        {{ value.children.length }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="value.data.desc">
                        <template #label>
                            <div class="cell-item"> 描述 </div>
                        </template>
                        {{ value.data.desc }}
                    </el-descriptions-item>
                </el-descriptions> -->
                </el-collapse>
            </el-tab-pane>
            <el-tab-pane :label="'参数(' + modelValue.data.params.length + ')'" name="params">
                <el-button class="button" size="default" type="primary" @click="exportNode"
                    >导出参数</el-button
                >
                <el-button class="button" size="default" type="primary" @click="importNode"
                    >导入参数</el-button
                >
                <el-button class="button" size="default" type="warning" @click="resetDefault"
                    >重置参数</el-button
                >
                <el-collapse v-model="activeNames" class="collapse">
                    <ParamEditor
                        v-for="group in param_groups"
                        :key="group"
                        :params="modelValue.data.params"
                        :group="group"
                        @on-submit="onSubmit"
                    />
                </el-collapse>
            </el-tab-pane>
            <el-tab-pane label="外观" name="attrs">
                <el-form-item label="展示名称字号">
                    <el-input-number
                        v-model="modelValue.label_font_size"
                        controls-position="right"
                        :min="1"
                        :max="30"
                    />
                </el-form-item>
                <el-form-item label="位置 x">
                    <el-input-number v-model="modelValue.position.x" controls-position="right" />
                </el-form-item>

                <el-form-item label="位置 y">
                    <el-input-number v-model="modelValue.position.y" controls-position="right" />
                </el-form-item>

                <el-form-item label="尺寸 width">
                    <el-input-number v-model="modelValue.size.width" controls-position="right" />
                </el-form-item>

                <el-form-item label="尺寸 height">
                    <el-input-number v-model="modelValue.size.height" controls-position="right" />
                </el-form-item>
            </el-tab-pane>
            <!-- <el-tab-pane label="运行" name="execution">
                        <WorkplaceExecution :record="manager.exec_info" />
                    </el-tab-pane> -->
        </el-tabs>

        <!-- <el-divider />

        <template v-if="!!value.data.params">
            <div class="params pa2">
                <el-divider />
                <el-form
                    :model="value.data.params"
                    label-position="top"
                    @submit.native.prevent="onSubmit"
                >
                    <div v-for="(item, key) in value.data.params" :key="key">
                        <el-divider v-if="item.divider" />
                        <el-form-item :label="item.name || item.key">
                            <el-tooltip v-if="item.desc" :content="item.desc" placement="left">
                                <ParamInput v-model="item.value" :param="item" />
                            </el-tooltip>
                            <ParamInput v-else v-model="item.value" :param="item" />
                        </el-form-item>
                    </div>
                </el-form>
            </div>
        </template> -->
    </div>
</template>

<style scoped lang="less">
.title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    margin-left: 8px;
}

.node-editor {
    height: 99%;
    overflow: auto;
    width: 100%;
    padding-left: 6px;
    padding-right: 6px;
}

.cell-item {
    width: 60px;
}
.collapse {
    background-color: transparent;
}

.collapse-item {
    background-color: transparent;
}

.btns {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 12px;

    .button {
        margin-top: 12px;
        margin-left: 8px;
    }
}
</style>
