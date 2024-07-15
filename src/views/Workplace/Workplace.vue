<script setup lang="ts">
import '@antv/x6-vue-shape'
import { ref, reactive, watch } from 'vue'
import { GraphManager } from './src/manager'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOptimListApi } from '@/api'
const stores = useStore() // 全局vuex状态，便于快速获取type和id
const route = useRoute() // 获取路由参数
const sidebar = ref(null) // 侧边栏
const manager = reactive(new GraphManager()) // 图管理器
const sidebarMenu = ref(null) // 侧边栏菜单
const designTitle = ref(null) // 侧边栏标题
const sidebarHeight = ref(0) // 侧边栏高度
const designTitleHeight = ref(0) // 侧边栏标题高度
const tagsViewStore = useTagsViewStore()
const router = useRouter()
const getCaches = computed((): string[] => {
    return tagsViewStore.getCachedViews
})

// 用于切换子页面：行为设计和优化记录

const PageState = ref('BehaviorDesign')
const changePageState = async (state: string, id: number) => {
    stores.commit('getType')
    stores.commit('getId')
    if (state !== 'BehaviorDesign') {
        await manager.onSave({ toast: false, change_title: true })
        router.push({
            path: `/${stores.state.type}/${stores.state.graph_id}/optim_records/${id}`
        })
    }
    PageState.value = state
    await nextTick()
    if (state === 'BehaviorDesign') {
        router.push({
            path: `/${stores.state.type}/${stores.state.graph_id}`
        })
    }
}
const sidebarStyle = computed(() => {
    console.log('sidebarHeight', sidebarHeight.value, designTitleHeight.value)
    return {
        height: `calc(${sidebarHeight.value}px - 2*${designTitleHeight.value}px)` // 使用计算得到的高度
    }
})
const checkState = computed(() => {
    stores.commit('getType')
    if (stores.state.type === 'scenario') {
        return false
    } else return true
})

const listData = reactive({
    total: 100,
    list: []
})

const listState = reactive({
    page: 1,
    limit: 25,
    q: ''
})

// 获取优化记录列表
const onRefreshList = async () => {
    try {
        const res = (
            await getOptimListApi({
                page: listState.page,
                limit: listState.limit,
                q: listState.q,
                graph_id: stores.state.graph_id
            })
        ).data
        listData.list = res.list
        listData.total = res.total
        console.log('listData', listData)
    } catch (e) {
        console.error(e)
        ElMessage.error(e)
    }
}

onMounted(async () => {
    // await nextTick()
    console.log('Workplace:onMounted', route.params.id)
    onRefreshList()
    if (sidebarMenu.value) {
        sidebarHeight.value = sidebarMenu.value.offsetHeight
    }
    if (designTitle.value) {
        designTitleHeight.value = designTitle.value.offsetHeight
    }
    console.log('manager-graph', manager.graph)
})

onUnmounted(async () => {
    console.log('Workplace:onUnmounted')
})

watch(
    () => {
        return {
            name: manager.graph_data.name,
            desc: manager.graph_data.desc,
            env: manager.graph_data.env
        }
    },
    async (newData, oldData) => {
        if (JSON.stringify(newData) == JSON.stringify(oldData)) {
            return
        }
        manager.onChangeNameDescEnv()

        if (newData.env != oldData.env) {
            await manager.onSave({ toast: false, change_title: true })
            manager.initStencil()
        }
    },
    {
        deep: true
    }
)
</script>

<template>
    <section class="workplace" ref="sidebarMenu">
        <el-menu
            default-active="1"
            class="sidebar"
            v-show="manager.sidebar_visible"
            :collapse-transition="false"
            :unique-opened="true"
        >
            <el-sub-menu index="1" @click="changePageState('BehaviorDesign', 0)">
                <template #title>
                    <div ref="designTitle">
                        <el-icon><EditPen /></el-icon>
                        <span>行为设计</span>
                    </div>
                </template>
                <div ref="sidebar" class="stencil-container" :style="sidebarStyle"></div>
            </el-sub-menu>

            <el-sub-menu index="2-1" :disabled="checkState">
                <template #title>
                    <el-icon><Histogram /></el-icon>
                    <span>优化记录</span>
                </template>
                <el-menu-item
                    v-for="item in listData.list"
                    :key="item.optim_id"
                    @click="changePageState('ParamRecord', item.optim_id)"
                >
                    <el-icon><Document /></el-icon>
                    <span>{{ item.optim_name }}</span>
                </el-menu-item>
            </el-sub-menu>
        </el-menu>

        <router-view :manager="manager" :sidebar="sidebar">
            <template #default="{ Component, route }">
                <keep-alive :include="getCaches">
                    <component :is="Component" :key="route.fullPath" />
                </keep-alive>
            </template>
        </router-view>
    </section>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-workplace';

.@{prefix-cls} {
    background-color: var(--app-content-bg-color);
    :deep(.@{elNamespace}-scrollbar__view) {
        height: 100% !important;
    }
}

@sidebar-width: 250px;
@infobar-width: 320px;
@toolbar-height: 50px;
@toolbar-height: 30px;
@mapbar-width: 30px;
// @info-color: rgb(245, 246, 247);
@info-color: var(--app-content-bg-color);

.button {
    margin-top: 4px;
    margin-left: 4px;
}

.workplace {
    position: relative;
    padding: 0;
    font-family: sans-serif;
    width: 100%;
    height: 100%;

    .sidebar {
        width: @sidebar-width;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        background-color: info-color;
        border-right: 1px solid var(--el-border-color);

        .stencil-container {
            width: 100%;
            overflow: auto;
            border: 1px solid #ddd;
        }
    }
}

.export-btns {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
}
</style>
