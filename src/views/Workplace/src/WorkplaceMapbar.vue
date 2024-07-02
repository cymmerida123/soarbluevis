<script setup lang="ts">
import { watch, computed, ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { ZoomIn, ZoomOut, ScaleToOriginal, Open, TurnOff } from '@element-plus/icons-vue'

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
    resetIcon
}

const manager = computed(() => props.manager)
</script>

<template>
    <div class="mapbar">
        <el-tooltip content="放大" placement="left">
            <el-button class="button" :icon="ZoomIn" circle @click="manager.onZoom(0.2)" />
        </el-tooltip>
        <el-tooltip content="缩小" placement="left">
            <el-button class="button" :icon="ZoomOut" circle @click="manager.onZoom(-0.2)" />
        </el-tooltip>
        <el-tooltip content="缩放到 1:1" placement="left">
            <el-button class="button" :icon="ScaleToOriginal" circle @click="manager.onZoomTo(1)" />
        </el-tooltip>
        <el-tooltip content="缩放到适应屏幕" placement="left">
            <el-button class="button" circle @click="manager.onZoomToFit()">
                <Icon :icon="icons.picCenterOutlined" />
            </el-button>
        </el-tooltip>
        <el-tooltip v-if="manager.infobar_visible" content="隐藏信息栏" placement="left">
            <el-button
                class="button"
                :icon="Open"
                circle
                @click="manager.infobar_visible = !manager.infobar_visible"
            />
        </el-tooltip>
        <el-tooltip v-else content="展示信息栏" placement="left">
            <el-button
                class="button"
                :icon="TurnOff"
                circle
                @click="manager.infobar_visible = !manager.infobar_visible"
            />
        </el-tooltip>
    </div>
</template>

<style scoped>
.mapbar {
    position: absolute;
    top: 24px;
    right: 24px;
    width: 30px;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.button {
    margin-top: 4px;
    margin-left: 4px;
}
</style>
