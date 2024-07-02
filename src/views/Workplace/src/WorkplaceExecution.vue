<script setup lang="ts">
import { ref, defineProps } from 'vue'

const props = defineProps(['record'])

const log = ref('')
</script>

<template>
    <div>
        <!-- <el-descriptions title="" :column="1" border>
            <el-descriptions-item>
                <template #label>
                    <div class="cell-item"> 开始时间 </div>
                </template>
                {{ props.record.start_time }}
            </el-descriptions-item>
        </el-descriptions> -->
        <span class="ml2">运行日志（正在开发中）</span>
        <el-input v-model="log" :disabled="true" :rows="20" type="textarea" />
    </div>
</template>

<style scoped></style>
