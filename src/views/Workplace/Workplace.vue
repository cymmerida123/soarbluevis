<script setup lang="ts">
import '@antv/x6-vue-shape'
import { ref, reactive, watch } from 'vue'
import { GraphManager } from './src/manager'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getTeleport } from '@antv/x6-vue-shape'
import NodeEditor from './src/NodeEditor.vue'
import EdgeEditor from './src/EdgeEditor.vue'
import WorkplaceGuide from './src/WorkplaceGuide.vue'
import { useDesign } from '@/hooks/web/useDesign'
import Dialog from '@/components/Dialog/src/Dialog.vue'
import CreateParam from './CreateParam.vue'
import WorkplaceToolbar from './src/WorkplaceToolbar.vue'
import WorkplaceMapbar from './src/WorkplaceMapbar.vue'
import WorkplaceEnvPanel from './src/WorkplaceEnvPanel.vue'
import { onUnmounted, computed, nextTick } from 'vue'

const TeleportContainer = getTeleport() // 获取Teleport容器，用于渲染节点
const route = useRoute() // 获取路由参数
const sidebar = ref(null) // 侧边栏
const content = ref(null) // 内容区
const minimap = ref(null) // 缩略图
const manager = reactive(new GraphManager()) // 图管理器
const sidebarMenu = ref(null) // 侧边栏菜单
const designTitle = ref(null) // 侧边栏标题
const sidebarHeight = ref(0) // 侧边栏高度
const designTitleHeight = ref(0) // 侧边栏标题高度

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('dialog')

const visibilitychangeListener = () => {
    manager.onVisibleChage(document.visibilityState == 'visible')
}

const PageState = ref('BehaviorDesign')
const changePageState = async (state) => {
    const pastState = PageState.value
    if (state !== pastState && state !== 'BehaviorDesign') {
        await manager.onSave({ toast: false, change_title: true })
    }
    PageState.value = state
    await nextTick()
    if (state !== pastState && state === 'BehaviorDesign') {
        manager.initView(
            route.path,
            route.params.id,
            sidebar.value,
            content.value,
            minimap.value,
            route.query.parent_graph_id,
            route.query.parent_node_id
        )
    }
}

onMounted(async () => {
    // await nextTick()
    console.log('Workplace:onMounted', route.params.id)
    manager.initView(
        route.path,
        route.params.id,
        sidebar.value,
        content.value,
        minimap.value,
        route.query.parent_graph_id,
        route.query.parent_node_id
    )

    document.addEventListener('visibilitychange', visibilitychangeListener)

    if (sidebarMenu.value) {
        sidebarHeight.value = sidebarMenu.value.offsetHeight
    }
    if (designTitle.value) {
        designTitleHeight.value = designTitle.value.offsetHeight
    }
    console.log('manager-graph', manager.graph)
})

const sidebarStyle = computed(() => {
    console.log('sidebarHeight', sidebarHeight.value, designTitleHeight.value)
    return {
        height: `calc(${sidebarHeight.value}px - 2*${designTitleHeight.value}px)` // 使用计算得到的高度
    }
})

onUnmounted(async () => {
    console.log('Workplace:onUnmounted')
    document.removeEventListener('visibilitychange', visibilitychangeListener)
    manager.destroy()
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
            default-active="2"
            class="sidebar"
            v-show="manager.sidebar_visible"
            :collapse-transition="false"
            :unique-opened="true"
        >
            <el-sub-menu index="1" @click="changePageState('BehaviorDesign')">
                <template #title>
                    <div ref="designTitle">
                        <el-icon><EditPen /></el-icon>
                        <span>行为设计</span>
                    </div>
                </template>
                <div ref="sidebar" class="stencil-container" :style="sidebarStyle"></div>
            </el-sub-menu>

            <el-sub-menu index="2-1">
                <template #title>
                    <el-icon><Histogram /></el-icon>
                    <span>参数优化</span>
                </template>
                <el-menu-item index="2-1" @click="changePageState('CreateParam')">
                    <el-icon><DocumentAdd /></el-icon>
                    <span>创建优化</span>
                </el-menu-item>
                <el-menu-item index="2-2">
                    <el-icon><Document /></el-icon>
                    <span>优化历史</span>
                </el-menu-item>
            </el-sub-menu>
        </el-menu>

        <!-- <div class="sidebar" ref="sidebar" v-show="manager.sidebar_visible"></div> -->
        <div v-if="PageState === 'CreateParam'" class="contentParam">
            <CreateParam :manager="manager" />
        </div>

        <div v-if="PageState === 'BehaviorDesign'">
            <div
                class="content"
                :class="{
                    'sidebar-active': manager.sidebar_visible,
                    'infobar-active': manager.infobar_visible
                }"
            >
                <div ref="content"></div>
                <TeleportContainer />
                <WorkplaceToolbar :manager="manager" />

                <WorkplaceMapbar :manager="manager" />
            </div>

            <div class="infobar" v-if="manager.infobar_visible">
                <template
                    v-if="
                        manager.selected_node &&
                        manager.selected_node_data &&
                        manager.selected == 'node'
                    "
                >
                    <NodeEditor
                        v-model="manager.selected_node_data"
                        :exec-status="manager.selected_status"
                        :graph-id="manager.graph_id"
                        :manager="manager"
                    />
                </template>
                <template
                    v-else-if="
                        manager.selected_edge &&
                        manager.selected_edge_data &&
                        manager.selected == 'edge'
                    "
                >
                    <EdgeEditor
                        v-model="manager.selected_edge_data"
                        :exec-status="manager.selected_status"
                    />
                </template>
                <template v-else>
                    <div>
                        <el-input v-model="manager.graph_data.name" placeholder="名称">
                            <template #prepend
                                ><span v-if="manager.graph_data.type == 'scenario'">图</span
                                ><span v-else>图</span>名</template
                            >
                        </el-input>
                        <el-input
                            v-model="manager.graph_data.desc"
                            :rows="2"
                            type="textarea"
                            placeholder="请输入描述文本"
                            :autosize="{ minRows: 2, maxRows: 6 }"
                        >
                            <template #prepend>描述</template>
                        </el-input>
                    </div>
                    <el-tabs v-model="manager.infobar_active_tab" stretch>
                        <el-tab-pane label="环境变量" name="env">
                            <WorkplaceEnvPanel :manager="manager" />
                        </el-tab-pane>
                        <el-tab-pane label="引导" name="guide">
                            <WorkplaceGuide />
                        </el-tab-pane>
                        <!-- <el-tab-pane label="运行" name="execution">
                        <WorkplaceExecution :record="manager.exec_info" />
                    </el-tab-pane> -->
                    </el-tabs>
                </template>
            </div>
            <div class="minimap" ref="minimap" v-if="false"></div>

            <Dialog
                v-model="manager.open_project_dialog_visible"
                width="500px"
                max-height="170px"
                :class="prefixCls"
                title="已成功生成项目"
            >
                <div class="flex flex-col items-center flex-wrap">
                    <span
                        class="text-14px my-10px text-[var(--top-header-text-color)]"
                        style="white-space: normal; word-wrap: break-word"
                    >
                        项目路径: {{ manager.project_filepath }}
                    </span>
                </div>
                <template #footer>
                    <!-- <el-button type="primary" @click="manager.openProject('')">默认程序打开</el-button>
                <el-button type="primary" @click="manager.openProject('vscode')"
                    >VsCode打开</el-button
                > -->
                    <el-button type="primary" @click="manager.openProject('wizard')"
                        >Wizard打开</el-button
                    >
                    <el-button type="primary" @click="manager.onStartExec()">Warlock运行</el-button>
                    <el-button @click="manager.open_project_dialog_visible = false"
                        >取 消</el-button
                    >
                </template>
            </Dialog>
        </div>
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

    .infobar {
        width: @infobar-width;
        height: 100%;
        border: right 1px solid var(--border-color);
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: info-color;
        border-left: 1px solid var(--el-border-color);
    }

    .mapbar {
        position: absolute;
        top: 24px;
        right: 24px;
        width: @mapbar-width;
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    .content {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        bottom: 0;
        right: @infobar-width;
    }

    .contentParam {
        position: absolute;
        width: 100%;
        height: 100%;
        left: @sidebar-width;
        top: 0;
        bottom: 0;
        right: 0;
        padding: 20px;
    }

    .content.infobar-active {
        width: calc(100% - @infobar-width);
    }
    .content.sidebar-active {
        left: @sidebar-width;
        width: calc(100% - @sidebar-width);
    }
    .content.infobar-active.sidebar-active {
        left: @sidebar-width;
        width: calc(100% - @sidebar-width - @infobar-width);
    }

    .minimap {
        position: absolute;
        top: 12px;
        right: calc(@infobar-width + 12px);
        width: 200px;
        height: 150px;
    }

    .x6-widget-minimap-viewport {
        border: 2px solid #8f8f8f;
    }

    .x6-widget-minimap-viewport-zoom {
        border: 2px solid #8f8f8f;
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
