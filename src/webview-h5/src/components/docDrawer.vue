<template>
  <el-drawer
    :withHeader="false"
    :modal="false"
    :visible.sync="isShow"
    direction="rtl"
    append-to-body
    size="90%"
    @opened="onOpened"
    @open="onOpen"
    @closed="closed">
    <div @click="scrollToIntro" class="show-config" v-show="canShowConf">查看配置说明</div>
    <div ref="eleDocs"></div>
    <el-backtop target=".el-drawer__body" v-if="isShow"></el-backtop>
  </el-drawer>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';

@Component
export default class DocDrawer extends Vue {
  @Prop(Boolean)
  visible?: boolean

  @Prop(String)
  name?: string

  isShow = false

  canShowConf = false

  confTarget: Element | null = null

  isOpening = false

  isOpend = false

  get isModelZindex() {
    return this.name === 'drawer' || this.name === 'dialog';
  }

  @Watch('visible')
  onWatchVisible(newval: boolean) {
    this.isShow = newval;
  }

  @Watch('name')
  onWatchName(name) {
    if (this.isOpend) {
      this.changeDocByName(name);

      this.refreshConfTg(name);
      setTimeout(() => {
        this.scrollToTop();
      }, 100);
    }
  }

  @Watch('isModelZindex')
  onWatchIsModelZindex(newval: boolean) {
    const clz = 'is-model-over';
    if (newval) {
      document.body.classList.add(clz);
    } else {
      document.body.classList.remove(clz);
    }
  }

  onOpened() {
    this.isOpend = true;
    if (!this.isOpening) {
      this.changeDocByName(this.name);
    } else {
      this.isOpening = false;
    }
    const eleDocs: Element = this.$refs.eleDocs as Element;
    const app: HTMLDivElement | null = document.querySelector('#app');
    if (!app || !eleDocs) {
      return;
    }

    this.refreshConfTg(this.name);

    if (eleDocs && !eleDocs.querySelector('#app')) {
      eleDocs.append(app);
      app.style.display = 'block';
    }
  }

  onOpen() {
    this.isOpening = true;
    this.changeDocByName(this.name);
  }

  refreshConfTg(name) {
    setTimeout(() => {
      this.getConfigTarget(name);
      this.canShowConf = !!this.confTarget;
    }, 100);
  }

  getConfigTarget(name) {
    let target = document.querySelector(`#${name}-attributes`);
    if (!target) {
      const match = /id="(.*?attributes)"/.exec(document.querySelector('#app')?.innerHTML || '');
      target = match ? document.querySelector(`#${match[1]}`) : null;
    }
    this.confTarget = target;
    return target;
  }

  scrollToIntro() {
    this.confTarget?.scrollIntoView();
  }

  scrollToTop() {
    const drawerBody = this.$el.querySelector('.el-drawer__body');

    if (drawerBody) {
      drawerBody.scrollTop = 0;
    }
  }

  changeDocByName(name) {
    window.location.hash = `/zh-CN/component/${name}`;
  }

  closed() {
    this.isOpend = false;
    this.$emit('update:visible', false);
    // document.querySelector('body')?.classList.remove('is-component');
  }

  mounted() {
    window.location.hash = '/zh-CN/component/button';
  }
}
</script>
<style lang="less" scoped>
.show-config {
  display: inline-block;
  position: fixed;
  right: 20px;
  top: 10px;
  color: #666;
  cursor: pointer;
  z-index: 999;
  &:hover {
    color: #409EFF;
  }
}
.el-icon-view {
  cursor: pointer;
}
</style>
<style lang="less">
.is-model-over {
  .v-modal {
    display: none !important;
  }
}
</style>
