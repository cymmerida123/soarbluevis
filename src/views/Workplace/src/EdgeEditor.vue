<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps(['modelValue', 'execStatus'])
const emit = defineEmits(['update:modelValue'])
import { formatExecStatus } from './constants'
import LabelValueItem from '@/components/LabelValueItem.vue'

const modelValue = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

const execStatus = computed(() => {
    return props.execStatus
})
const onSubmit = () => {
    emit('update:modelValue', modelValue.value)
}

const title = computed(() => {
    return `${modelValue.value.source.label || modelValue.value.source.data.name} ==> ${
        modelValue.value.target.label || modelValue.value.target.data.name
    }`
})

const activeNames = ref(['__info__'])
</script>

<template>
    <div class="edge-editor">
        <el-collapse v-model="activeNames">
            <el-collapse-item :title="title" name="__info__">
                <div>
                    <div>
                        <LabelValueItem label="id" :value="modelValue.id" />
                    </div>
                    <div>
                        <LabelValueItem
                            label="起点"
                            :value="modelValue.source.label || modelValue.source.data.name"
                        />
                    </div>
                    <div>
                        <LabelValueItem
                            label="终点"
                            :value="modelValue.target.label || modelValue.target.data.name"
                        />
                    </div>
                    <div>
                        <LabelValueItem label="状态" :value="formatExecStatus(execStatus)" />
                    </div>
                </div>
                <!-- <el-descriptions :column="1" border>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> id </div>
                        </template>
                        {{ value.id }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> 起点 </div>
                        </template>
                        {{ value.source.name }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> 终点 </div>
                        </template>
                        {{ value.target.name }}
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <template #label>
                            <div class="cell-item"> 状态 </div>
                        </template>
                        {{ formatExecStatus(props.execStatus) }}
                    </el-descriptions-item>
                </el-descriptions> -->
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<style scoped>
.edge-editor {
    height: 92%;
    overflow: auto;
    width: 100%;
    padding: 4px;
}

.cell-item {
    width: 60px;
}
</style>
