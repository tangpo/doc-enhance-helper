<template>
  <div>
     <el-table
      :data="list"
      border>
      <el-table-column
        prop="elName"
        label="组件名"
        width="180">
      </el-table-column>
      <el-table-column
        label="操作">
        <template v-slot="{row}">
          <i class="el-icon-view" @click="previewCom(row)"></i>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ComponentTable extends Vue {
  @Prop({ default() { return []; } })
  list: Record<string, any>[]| undefined

  previewCom(row: { name: string }) {
    this.$emit('open-doc', row.name);
  }
}
</script>
