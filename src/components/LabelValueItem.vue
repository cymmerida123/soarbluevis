<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { defineProps } from 'vue'
import { copyToClipboard } from '@/utils'

const props = defineProps({
    label: String,
    value: String,
    size: {
        type: Number,
        default: 14
    },
    copy: {
        type: Boolean,
        default: true
    },
    labelWidth: {
        type: Number,
        default: 60
    }
})

const style = computed(() => {
    return {
        'font-size': (props.size || 14) + 'px'
    }
})

const label = computed(() => {
    return props.label
})

const value = computed(() => {
    return props.value
})

const copy = computed(() => {
    return props.copy
})

const onDblClick = () => {
    // 复制value到剪贴板
    copyToClipboard(value.value)
}
</script>

<template>
    <span :style="style" class="item">
        <span class="label">{{ label }}: </span>
        <slot>
            <span class="value" v-if="copy" @dblclick="onDblClick">{{ value }}</span>
            <span class="value" v-else>{{ value }}</span>
        </slot>
    </span>
</template>

<style scoped>
.item {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: nowrap;
    flex-direction: row;
}

.label {
    font-weight: 600;
    margin-right: 8px;
    word-break: keep-all;
}

.value {
    color: #606266;
    word-break: break-all;
}
</style>
