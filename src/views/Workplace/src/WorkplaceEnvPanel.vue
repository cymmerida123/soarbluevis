<script setup lang="ts">
import { watch, computed, ref, onMounted, onUnmounted } from 'vue'
const props = defineProps(['manager'])
const manager = computed(() => props.manager)
import { getEnvOptionsApi } from '@/api'
import { ElMessageBox } from 'element-plus'

const scripts_dirs = ref([])

onMounted(async () => {
    await refreshScriptsDir()
})

const refreshScriptsDir = async () => {
    const resp = (await getEnvOptionsApi()).data
    scripts_dirs.value = resp.list
    manager.value.initStencil()
}

const regenerateDefaultGraph = async () => {
    ElMessageBox.confirm('确定要根据原始代码在图上生成全图吗？该操作会删除原来的图！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
    })
        .then(() => {
            manager.value.onGenerateDefaultGraph()
        })
        .catch((e) => {
            console.error(e)
        })
}
</script>

<template>
    <div>
        <div class="select-env-info">
            <el-select
                v-model="manager.graph_data.env"
                filterable
                style="width: 95%"
                placeholder="请选择"
            >
                <el-option v-for="item in scripts_dirs" :key="item" :label="item" :value="item" />
            </el-select>
        </div>
        <div class="btns">
            <el-button type="success" size="default" @click="refreshScriptsDir">刷新</el-button>
            <el-button
                type="primary"
                size="default"
                @click="regenerateDefaultGraph"
                v-if="manager.config.dev"
                >根据源代码生成全图</el-button
            >
        </div>
        <div class="env-info ml-2">
            <div class="mt-2"> {{ manager.graph_data.env }} </div>
            <div class="mt-2"> 脚本根目录位于{{ manager.config.scripts_dir }} </div>
        </div>
    </div>
</template>

<style scoped>
.env-info {
    word-break: break-all;
    font-size: 15px;
    color: grey;
}
.select-env-info {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}

.btns {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 8px;
    margin-left: 8px;
}
</style>
