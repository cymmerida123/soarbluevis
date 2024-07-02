<script setup lang="ts">
import { watch, computed, ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import arrowUpFromLine from '@iconify-icons/lucide/arrow-up-from-line'
import saveIcon from '@iconify-icons/ci/save'
import backIcon from '@iconify-icons/icon-park-outline/back'
import interfaceValidationCheckSquare2CheckFormValidationCheckmarkSuccessAddAdditionBoxSquare from '@iconify-icons/streamline/interface-validation-check-square-2-check-form-validation-checkmark-success-add-addition-box-square'
import debugStart from '@iconify-icons/codicon/debug-start'
import pauseIcon from '@iconify-icons/material-symbols/pause'
import stopIcon from '@iconify-icons/material-symbols/stop'
import fastForward from '@iconify-icons/ph/fast-forward'
import picCenterOutlined from '@iconify-icons/ant-design/pic-center-outlined'
import deleteFilled from '@iconify-icons/ant-design/delete-filled'
import downloadIcon from '@iconify-icons/material-symbols/download'
import aiGenerate from '@iconify-icons/ri/ai-generate'
import resetIcon from '@iconify-icons/carbon/reset'
import open28Filled from '@iconify-icons/fluent/open-28-filled'
import { Open, TurnOff } from '@element-plus/icons-vue'

const props = defineProps(['manager'])
const icons = {
    arrowUpFromLine,
    saveIcon,
    backIcon,
    interfaceValidationCheckSquare2CheckFormValidationCheckmarkSuccessAddAdditionBoxSquare,
    debugStart,
    pauseIcon,
    stopIcon,
    fastForward,
    picCenterOutlined,
    deleteFilled,
    downloadIcon,
    aiGenerate,
    resetIcon,
    open28Filled
}

import { EXEC_STATUS } from './constants'
const manager = computed(() => props.manager)
</script>

<template>
    <div class="toolbar">
        <el-tooltip v-if="manager.sidebar_visible" content="隐藏操作栏" placement="left">
            <el-button
                class="button"
                :icon="Open"
                circle
                @click="manager.sidebar_visible = !manager.sidebar_visible"
            />
        </el-tooltip>
        <el-tooltip v-else content="展示操作栏" placement="left">
            <el-button
                class="button"
                :icon="TurnOff"
                circle
                @click="manager.sidebar_visible = !manager.sidebar_visible"
            />
        </el-tooltip>

        <el-tooltip content="保存 ctrl+s" placement="bottom">
            <el-button class="button" circle @click="manager.onSave()">
                <div style="position: relative">
                    <Icon :icon="icons.saveIcon" />
                    <span
                        v-if="manager.is_modified"
                        style="position: absolute; right: -4px; top: -4px; font-size: 18px"
                        >*</span
                    >
                </div>
            </el-button>
        </el-tooltip>
        <!-- <el-tooltip content="清空画布" placement="bottom">
                <el-button class="button" circle @click="manager.onClear()">
                    <Icon :icon="icons.deleteFilled" />
                </el-button>
            </el-tooltip> -->
        <el-tooltip content="导入Graph" placement="bottom">
            <el-button class="button" circle @click="manager.onImport()">
                <Icon :icon="icons.arrowUpFromLine" />
            </el-button>
        </el-tooltip>

        <ElDropdown trigger="click" @command="manager.onExport($event)">
            <el-button circle class="button">
                <Icon :icon="icons.downloadIcon" />
            </el-button>
            <template #dropdown>
                <ElDropdownMenu>
                    <ElDropdownItem command="graph"> Graph </ElDropdownItem>
                    <!-- <ElDropdownItem command="svg"> SVG </ElDropdownItem> -->
                    <ElDropdownItem command="png"> PNG </ElDropdownItem>
                    <ElDropdownItem command="jpeg"> JPEG </ElDropdownItem>
                    <ElDropdownItem command="tree" v-if="manager.config.dev"> Tree </ElDropdownItem>
                </ElDropdownMenu>
            </template>
        </ElDropdown>

        <el-tooltip content="撤销 ctrl+z" placement="bottom">
            <el-button
                class="button"
                circle
                @click="manager.onUndo()"
                :disabled="!manager.can_undo"
            >
                <Icon :icon="icons.backIcon" />
            </el-button>
        </el-tooltip>
        <el-tooltip content="取消撤销 ctrl+shift+z" placement="bottom">
            <el-button
                class="button"
                circle
                @click="manager.onRedo()"
                :disabled="!manager.can_redo"
            >
                <Icon :horizontalFlip="true" :icon="icons.backIcon" />
            </el-button>
        </el-tooltip>
        <!-- <el-tooltip content="重置所有节点" placement="bottom">
            <el-button class="button" circle @click="manager.resetAllNode()">
                <Icon :icon="icons.resetIcon" />
            </el-button>
        </el-tooltip> -->
        <el-tooltip content="校验" placement="bottom">
            <el-button class="button" circle @click="manager.onValidate()">
                <Icon
                    :icon="
                        icons.interfaceValidationCheckSquare2CheckFormValidationCheckmarkSuccessAddAdditionBoxSquare
                    "
                />
            </el-button>
        </el-tooltip>
        <template v-if="manager.graph_data.type == 'scenario'">
            <el-tooltip content="生成仿真项目" placement="bottom">
                <el-button class="button" circle @click="manager.onGenerateProject()">
                    <Icon :icon="icons.aiGenerate" />
                </el-button>
            </el-tooltip>

            <el-tooltip content="用Wizard打开项目" placement="bottom">
                <el-button class="button" circle @click="manager.openProject('wizard')">
                    <Icon :icon="icons.open28Filled" />
                </el-button>
            </el-tooltip>

            <template v-if="manager.config.use_zmq">
                <el-tooltip
                    v-if="
                        [EXEC_STATUS.NOT_RUN, EXEC_STATUS.SUCCESS, EXEC_STATUS.FAIL].includes(
                            manager.exec_info.status
                        )
                    "
                    content="用Warlock开始仿真"
                    placement="bottom"
                >
                    <el-button class="button" circle @click="manager.onStartExec()">
                        <Icon :icon="icons.debugStart" />
                    </el-button>
                </el-tooltip>

                <el-tooltip
                    content="暂停仿真"
                    placement="bottom"
                    v-if="manager.exec_info.status == EXEC_STATUS.RUNNING"
                >
                    <el-button class="button" circle @click="manager.onPauseExec()">
                        <Icon :icon="icons.pauseIcon" />
                    </el-button>
                </el-tooltip>

                <el-tooltip
                    content="恢复仿真"
                    placement="bottom"
                    v-if="manager.exec_info.status == EXEC_STATUS.PAUSED"
                >
                    <el-button class="button" circle @click="manager.onResumeExec()">
                        <Icon :icon="icons.debugStart" />
                    </el-button>
                </el-tooltip>

                <el-tooltip
                    content="停止仿真"
                    placement="bottom"
                    v-if="
                        [EXEC_STATUS.RUNNING, EXEC_STATUS.PAUSED].includes(manager.exec_info.status)
                    "
                >
                    <el-button class="button" circle @click="manager.onStopExec()">
                        <Icon :icon="icons.stopIcon" />
                    </el-button>
                </el-tooltip>
            </template>
            <template v-else>
                <el-tooltip content="开始仿真" placement="bottom">
                    <el-button class="button" circle @click="manager.onStartExec()">
                        <Icon :icon="icons.debugStart" />
                    </el-button>
                </el-tooltip>
            </template>

            <!-- 
                    " -->

            <!-- <el-tooltip
                    content="设置仿真速率"
                    placement="bottom"
                    v-if="manager.graph_data.type == 'scenario'"
                >
                    <el-button class="button" circle @click="manager.onChangeRate()">
                        <Icon :icon="icons.fastForward" />
                    </el-button>
                </el-tooltip> -->
            <!-- <el-popover placement="bottom" :width="200" trigger="hover" content="快捷键信息">
                    <template #reference>
                        <el-button class="m-2" circle :icon="InfoFilled" />
                    </template>
                </el-popover> -->
        </template>
    </div>
</template>

<style scoped>
.button {
    margin-top: 4px;
    margin-left: 4px;
}

.toolbar {
    width: auto;
    position: absolute;
    left: 12px;
    top: 0px;
    right: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    align-content: flex-start;
}
</style>
