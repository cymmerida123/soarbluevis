<script setup lang="ts">
// modelValue
import { watch, computed } from 'vue'
const props = defineProps(['params', 'group'])
const emit = defineEmits(['onSubmit'])
import ParamInput from './ParamInput.vue'
const params = computed({
    get() {
        return props.params.filter((it) => (it.group || '') == props.group)
    },
    set(value) {}
})

const onSubmit = () => {
    emit('onSubmit')
}

const itemLabel = (item) => {
    const names = [item.name || item.key]
    if (item.type) {
        names.push(`(${item.type})`)
    }
    return names.join(' ')
}

const onDbClick = (item) => {
    console.log('onDbClick', item)
}
</script>

<template>
    <el-collapse-item :title="group || '参数' + '(' + params.length + ')'" :name="group">
        <el-form :model="params" label-position="top" @submit.prevent="onSubmit">
            <div v-for="(item, key) in params" :key="key">
                <el-divider v-if="item.divider" />
                <el-form-item :label="itemLabel(item)" @dbclick="onDbClick">
                    <div class="input-container">
                        <div class="param-input">
                            <el-tooltip v-if="item.desc" :content="item.desc" placement="left">
                                <ParamInput v-model="item.value" :param="item" />
                            </el-tooltip>
                            <ParamInput v-else v-model="item.value" :param="item" />
                        </div>
                        <!-- v-if="item.type == 'string' || item.type == 'option'" -->

                        <el-tooltip content="每次循环都更新" placement="left">
                            <el-checkbox class="checkbox" v-model="item.auto" />
                        </el-tooltip>
                    </div>
                </el-form-item>
            </div>
        </el-form>
    </el-collapse-item>
</template>

<style scoped lang="less">
.input-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.param-input {
    width: calc(100% - 60px);
}
.checkbox {
    width: 30px;
    margin-left: 4px;
}
</style>
