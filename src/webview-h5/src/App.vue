<template>
  <div>
    <div class="top-menus">
      <el-select v-model="selVer"
        placeholder="请选择版本"
        class="ver-sel"
        @change="onChangeVer">
        <el-option
          v-for="item in versonList"
          :key="item.value"
          :label="item.label"
          :value="item.label">
        </el-option>
      </el-select>
      <el-select v-model="selCom"
        filterable
        placeholder="搜索组件"
        value-key="tag"
        default-first-option
        @change="onChangeSelCom">
        <el-option
          v-for="item in showOptionalComponents"
          :key="`${item.tag}_${item.name}`"
          :label="item.tag"
          :value="item">
          <span>{{item.tag}}</span>
          <span class="assist-info">({{item.name}})</span>
        </el-option>
      </el-select>
      <vscode-button @click="showAllCom" class="get-text" v-if="!showAll">查看所有</vscode-button>
      <vscode-button @click="handleClickGetTxt" class="get-text">查看当前页面组件</vscode-button>
    </div>
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <ComponentTable :list="eleList" v-if="!showAll" @open-doc="onOpenDoc"/> -->
    <AllComTb ref="allComTb"
      :showpart="eleList"
      @open-doc="onOpenDoc"
      @init-list="onInitAllComList"/>
    <DocDrawer :visible.sync="isShowDoc" :name="comName"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ComponentTable from './components/component-table.vue';
import { eventBus, postMessage } from './utils/message';
import { hasUseComponents } from './utils/parseTmpl';
import AllComTb from './components/allComTb.vue';
import DocDrawer from './components/docDrawer.vue';
import { getRelativeComName } from './utils/index';

const versonList = require('../config/versions.json');

@Component({
  components: {
    ComponentTable,
    AllComTb,
    DocDrawer,
  },
})
export default class App extends Vue {
  receiveEditorData = this.$constants('events', 'receiveEditorData')

  changeDocVerEvtName = this.$constants('events', 'changeEleVer')

  loadedEvtName = this.$constants('events', 'loaded')

  showSelComEvtName = this.$constants('events', 'showSelCom')

  eleList: Record<string, any>[] | null= []

  showAll = true

  isShowDoc = false

  comName = ''

  versonList = Object.keys(versonList).map((name) => ({ label: `${name}`, value: versonList[name] }))

  selVer = _globalVsData._ELE_DOC_VER_ // || '2.15.7'

  componentList: Record<string, any>[] = []

  selCom = ''

  get showOptionalComponents() {
    if (!this.eleList?.length) {
      return this.componentList;
    }
    const list = this.componentList.filter((item) => (
      !!~this.eleList!.findIndex((data) => item.tag === data.elName)
    ));
    return list;
  }

  handleClickGetTxt() {
    this.showAll = false;
    postMessage(this.receiveEditorData);
  }

  onOpenDoc(name: string) {
    this.comName = name;
    this.isShowDoc = true;
  }

  created() {
    eventBus.$on(this.receiveEditorData, (payload: string) => {
      const names = hasUseComponents(payload);
      this.eleList = names.map((name) => ({ name: name.replace('el-', ''), elName: name }));
    });
    eventBus.$on(this.showSelComEvtName, (payload: Record<string, string>) => {
      this.onOpenDoc(payload.path.replace('/', ''));
      this.onChangeSelCom(payload);
    });
    postMessage(this.loadedEvtName);
  }

  onChangeVer(val: string) {
    postMessage(this.changeDocVerEvtName, { label: val, value: versonList[val] });
  }

  showAllCom() {
    this.eleList = null;
    this.showAll = true;
  }

  onInitAllComList(list: Record<string, any>[]) {
    const componentList: Record<string, any>[] = [];
    list.forEach((group) => {
      group.list.forEach((item) => {
        componentList.push(this.generateTagDesc(
          item.comName,
          item,
          { groupName: group.groupName },
        ));

        item.relative?.forEach((tagName) => {
          const otherTagName = getRelativeComName(tagName);
          let { title } = item;
          if (!otherTagName) {
            return;
          }
          if (tagName.length > otherTagName.length) {
            title = tagName.replace(otherTagName).trim();
          }
          componentList.push(this.generateTagDesc(otherTagName,
            {
              ...item,
              title,
            },
            { groupName: group.groupName }));
        });
      });
    });
    this.componentList = componentList;
  }

  generateTagDesc(tagName, data, { groupName }) {
    return {
      type: groupName,
      name: data.title,
      path: data.path, // .slice(1),
      tag: tagName,
      description: `${tagName},${data.title}`,
    };
  }

  onChangeSelCom(data) {
    if (!data) {
      return;
    }

    const $allComTb: any = this.$refs.allComTb;

    const liDom: HTMLLIElement = $allComTb.$el.querySelector(`[data-path="${data.path}"]`);

    if (!liDom) {
      return;
    }
    liDom.scrollIntoView();

    this.$nextTick(() => {
      this.selCom = '';
    });
  }
}
</script>
<style lang="less">
#app {
  display: none;
  .page-component__scroll {
    margin-top: 0;
  }
  .headerWrapper, .page-component__nav {
    display: none;
  }
  .page-component {
    .page-component__content {
      padding: 20px;
    }
  }
}
li {
  list-style: none;
}
ul {
  margin: 0;
  padding:0;
}
.el-card__body {
  padding: 10px;
}
</style>
<style lang="less" scoped>
.top-menus {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  padding-bottom: 0;
  margin-bottom: 15px;
}
.assist-info {
  color: #909399;
  margin-left: 5px;
}
.ver-sel {
  width: 100px;
}
</style>
