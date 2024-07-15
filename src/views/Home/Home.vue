<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive, watch } from 'vue'
import { ElTag, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import {
    getGraphListApi,
    createGraphApi,
    deleteGraphApi,
    exportGraphDbApi,
    importGraphDbApi
} from '@/api'
import { Refresh } from '@element-plus/icons-vue'
import type { GraphModelData } from '@/api/types'
import { useRouter } from 'vue-router'
import { downloadText } from '@/utils'
import { useStore } from 'vuex'

const stores = useStore()
const router = useRouter()
const tableRef = ref<any>()
const selection = ref<GraphModelData[]>([])

const tableData = reactive({
    total: 100,
    list: []
})

const tableState = reactive({
    page: 1,
    limit: 25,
    q: ''
})

const onRefresh = async () => {
    const res = await getGraphListApi({
        page: tableState.page,
        limit: tableState.limit,
        q: tableState.q,
        type: ''
    })
    tableData.list = res.data.list
    tableData.total = res.data.total
}

const { t } = useI18n()

watch(
    tableState,
    () => {
        onRefresh()
    },
    { immediate: true }
)

const onCreateGraph = async (type = 'scenario') => {
    await createGraphApi({
        name: '',
        desc: '',
        type: type,
        content: '{}'
    })
    await onRefresh()
}

const handleSelectionChange = (val: GraphModelData[]) => {
    selection.value = val
}

const onDeleteSelection = async () => {
    ElMessageBox.confirm('确定要删除吗？该操作不可逆！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
    })
        .then(async () => {
            await deleteGraphApi({
                graph_id: selection.value.map((item) => item.id).join(',')
            })
            await onRefresh()
            ElMessage.success('已删除')
        })
        .catch(() => {})
}

const onExport = async () => {
    // 导出选中的图数据
    let export_ids = selection.value.map((item) => item.id).join(',')
    let text = (
        await exportGraphDbApi({
            graph_ids: export_ids
        })
    ).data

    // 下载text为export.json
    downloadText(text, 'export.json', 'application/json')
}

const onImport = async () => {
    // 导入图数据
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
        const file = input.files![0]
        const reader = new FileReader()
        reader.onload = async () => {
            const data = reader.result as string
            await importGraphDbApi({
                data: data,
                graph_id: ''
            })
            await onRefresh()
            ElMessage.success('导入成功')
        }
        reader.readAsText(file)
    }
    input.click()
}

const onEdit = async (graph: any) => {
    router.push({
        path: `/${graph.type}/${graph.id}`
    })
}

// 将时间格式化为XXXX-XX-XX XX:XX:XX
const formatDatetime = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
</script>

<template>
    <div>
        <el-row>
            <el-button class="mr2" type="success" circle :icon="Refresh" @click="onRefresh" />
            <el-input
                class="mr2"
                v-model="tableState.q"
                placeholder="搜索"
                clearable
                style="width: 300px"
            />
            <el-button type="primary" @click="onCreateGraph('scenario')">新建场景图</el-button>
            <el-button type="primary" @click="onCreateGraph('nest')">新建嵌套图</el-button>
            <el-button type="primary" @click="onExport">
                <template v-if="selection.length == 0"> 导出全部数据 </template>
                <template v-else> 导出选中数据 </template>
            </el-button>
            <el-button type="primary" @click="onImport">导入数据</el-button>
            <el-button
                type="danger"
                :disabled="selection.length === 0"
                @click.prevent="onDeleteSelection"
            >
                删除
            </el-button>
        </el-row>

        <el-table
            :data="tableData.list"
            class="table mt2"
            row-key="id"
            ref="tableRef"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" />
            <el-table-column fixed="left" label="操作" width="100">
                <template #default="scope">
                    <!-- <el-button link type="info" size="small" @click.prevent="() => {}">
                        预览
                    </el-button> -->
                    <el-button
                        v-if="scope.row.type === 'scenario'"
                        type="success"
                        @click.prevent="onEdit(scope.row)"
                    >
                        编辑
                    </el-button>
                    <el-button
                        v-else-if="scope.row.type === 'nest'"
                        type="warning"
                        @click.prevent="onEdit(scope.row)"
                    >
                        编辑
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="图名称" width="300" />
            <el-table-column prop="type" label="图类型" width="150">
                <template #default="scope">
                    <el-tag v-if="scope.row.type === 'scenario'" type="success">场景图</el-tag>
                    <el-tag v-else-if="scope.row.type === 'nest'" type="warning">嵌套图</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="图详情" width="250">
                <template #default="scope">
                    <span>节点数: {{ scope.row.node_count }}</span>
                    <span class="ml-4">边数: {{ scope.row.edge_count }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="desc" label="描述文本" />

            <el-table-column prop="update_time" label="更新时间" width="200">
                <template #default="scope">
                    {{ formatDatetime(scope.row.update_time) }}
                </template>
            </el-table-column>
        </el-table>

        <div class="pagination">
            <el-pagination
                background
                v-model:current-page="tableState.page"
                v-model:page-size="tableState.limit"
                :page-sizes="[25, 50, 100, 200]"
                layout="prev, pager, next, total"
                :total="tableData.total"
            />
        </div>
    </div>
</template>

<style scoped lang="less">
.table {
    width: 100%;
    min-height: calc(100vh - 200px);
}
.pagination {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
</style>
