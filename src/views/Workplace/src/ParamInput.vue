<script setup lang="ts">
// modelValue
import { on } from 'events'
import { onMounted } from 'vue'
import { watch, computed } from 'vue'
const props = defineProps(['param', 'modelValue'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

const param = computed({
    get() {
        return props.param
    },
    set(value) {}
})

onMounted(() => {
    // 修正bool数据格式
    if (param.value.type == 'bool') {
        if (value.value == 'true' || value.value == 'false') return

        if (value.value == true) {
            value.value = 'true'
        } else if (value.value == false) {
            value.value = 'false'
        } else if (
            param.value.default == 'true' ||
            param.value.default == 'false' ||
            param.value.default == true ||
            param.value.default == false
        ) {
            value.value = param.value.default + ''
        }
    }
})
</script>

<template>
    <div class="flex">
        <template v-if="param.type == 'option'">
            <el-select
                v-model="value"
                :placeholder="param.default"
                filterable
                :clearable="param.clearable"
                :multiple="param.multiple"
                :disabled="param.disabled"
            >
                <el-option
                    v-for="item in param.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
        </template>
        <template v-else-if="param.type == 'text'">
            <el-input
                v-model="value"
                :rows="2"
                type="textarea"
                :disabled="param.disabled"
                :placeholder="param.default"
                :autosize="{ minRows: 2, maxRows: 6 }"
            />
        </template>
        <template v-else-if="param.type == 'bool'">
            <el-switch
                v-model="value"
                active-value="true"
                inactive-value="false"
                :disabled="param.disabled"
            />
        </template>
        <el-input v-else v-model="value" :placeholder="param.default" :disabled="param.disabled" />
    </div>
</template>

<style scoped></style>
