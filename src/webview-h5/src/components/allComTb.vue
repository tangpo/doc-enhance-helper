<template>
  <div class="allcom-tb">
    <el-card class="box-card"
      v-for="item of showList"
      :key="item.groupName">
      <div slot="header" class="clearfix">
        <span>
          {{item.groupName}}
        </span>
      </div>
      <ul>
        <li v-for="data of item.list" :key="data.path" :data-path="data.path">
          <span class="com-title"
            @click="$emit('open-doc', data.path.replace('/', ''))">
            {{data.title}}
          </span>
          <el-tag class="com-name"
            v-if="!hideComName(data.comName)"
            :class="{'is-add': findValInEleKey(data.comName)}"
            @click="handleAddCode(data.comName, true)">
            <i class="el-icon-circle-plus-outline"></i>{{ data.comName }}
          </el-tag>
          <template v-if="data.relative">
            <el-tag v-for="relativeName of data.relative"
              :key="relativeName"
              class="com-name"
              :class="{'is-add': isMatchEleKeys(relativeName)}"
              type="info"
              @click="handleAddCode(relativeName, false)">
              <i class="el-icon-circle-plus-outline"></i>{{relativeName}}
            </el-tag>
          </template>
          <div class="r-btns-group">
            <el-button type="text"
              @click="$emit('open-doc', data.path.replace('/', ''))">
              查看文档
            </el-button>
            <!-- <el-button type="text" @click="addCode(data)">添加代码</el-button> -->
          </div>
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { postMessage } from '../utils/message';
import { getRelativeComName } from '../utils/index';

const context = require.context('../../config', true, /element-.*\.json$/);

const allJsonMap: Record<string, any> = context.keys()
  .reduce((pre: Record<string, any>, name: string) => {
    const key = name.replace('./', '').replace('.json', '');

    pre[key] = context(name);
    return pre;
  }, {});

@Component
export default class AllComponentTb extends Vue {
  @Prop(Array)
  showpart?: Record<string, any>[]

  list: Record<string, any>[] = []

  addCodeToEditor = this.$constants('events', 'addCodeToEditor')

  eleKeys = _globalVsData._ElementKeys

  get showList() {
    const { showpart } = this;
    if (!showpart || !showpart.length) {
      return this.list;
    }
    const tempPartMap: Record<string, boolean> = showpart.reduce((pre, next) => {
      pre[next.elName] = true;
      return pre;
    }, {});

    return this.findVisibleComList(showpart, tempPartMap);
  }

  findVisibleComList(showList, nameMap) {
    return this.list.map((data) => {
      const newList = data.list.filter((item) => {
        if (nameMap[item.comName]) {
          return true;
        }
        return item.relative
          ? ~(item.relative
            .findIndex((value) => ~showList.findIndex((name) => ~value.indexOf(name))))
          : false;
      });
      return {
        ...data,
        list: newList,
      };
    })
      .filter((item) => item.list.length);
  }

  hideComName(name) {
    return !!~['el-color', 'el-typography', 'el-border', 'el-icon'].indexOf(name);
  }

  addCode(data) {
    postMessage(this.addCodeToEditor, data);
  }

  isMatchEleKeys(name) {
    const val = getRelativeComName(name);
    if (!val) {
      return false;
    }

    return this.findValInEleKey(val);
  }

  findValInEleKey(data) {
    return this.eleKeys[data];
  }

  handleAddCode(name: string, isMain: boolean) {
    let canSend = false;
    if (isMain) {
      canSend = this.findValInEleKey(name);
    } else {
      canSend = this.isMatchEleKeys(name);
      name = canSend && getRelativeComName(name) || '';
    }
    if (canSend) {
      postMessage(this.addCodeToEditor, { comName: name });
    }
  }

  created() {
    const lang = 'zh-CN';
    const list: Record<string, any>[] = allJsonMap[`element-${_globalVsData._ELE_DOC_VER_}`][lang][0].groups;
    list.forEach((data) => {
      data.list.forEach((item) => {
        item.comName = item.main || `el-${item.path.replace('/', '')}`;
      });
    });
    this.list = list;
    this.$emit('init-list', list.slice(0));
  }
}
</script>
<style lang="less" scoped>
.allcom-tb {
  padding: 0 12px 10px 12px;
  overflow: auto;
  max-height: calc(100vh - 72px);
}
.box-card {
  width: 100%;
  margin-bottom: 10px;
  // margin: 10px auto;
  li {
    border-bottom: 1px solid #ccc;
    height: 48px;
    box-sizing: border-box;
    position: relative;
    padding-top: 20px;
    & + li {
      margin-top: 5px;
    }
  }
}
.com-title {
  font-size: 0.9em;
  color: #333;
  position: absolute;
  top: 2px;
}
.com-name {
  font-size: 13px;
  // color: #666;
  height: 20px;
  line-height: 20px;
  padding: 0 4px;
  margin-top: 0px;
  margin-left: 5px;
  &.is-add {
    cursor: pointer;
    .el-icon-circle-plus-outline {
      display: inline-block;
    }
    &:hover {
      background: #409EFF;
      color: #fff;
    }
  }
}

.r-btns-group {
  // float: right;
  position: absolute;
  right: 5px;
  top: -5px;
}
.el-icon-circle-plus-outline {
  display: none;
  margin-right: 5px;
}
.com-title {
  &:hover {
    color: #409EFF;
    cursor: pointer;
  }
}
</style>
