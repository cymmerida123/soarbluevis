<script setup lang="ts"></script>

<template>
    <el-descriptions title="" :column="1" border>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 移动画布 </div>
            </template>
            按下Ctrl 或 Command的同时用鼠标拖拽画布
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 全选 </div>
            </template>
            Ctrl/Command + A
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 撤销 </div>
            </template>
            Ctrl/Command + Z
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 取消撤销 </div>
            </template>
            Ctrl/Command + Shift + Z
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 复制 </div>
            </template>
            Ctrl/Command + C
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 剪切 </div>
            </template>
            Ctrl/Command + X
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 粘贴 </div>
            </template>
            Ctrl/Command + V
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 删除 </div>
            </template>
            Delete/Backspace
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div class="cell-item"> 进入嵌套图 </div>
            </template>
            双击嵌套图节点
        </el-descriptions-item>
    </el-descriptions>
</template>

<style scoped></style>
