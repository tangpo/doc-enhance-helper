import Vue from 'vue';
// import 'element-ui/lib/theme-chalk/index.css';
// import '@/assets/font_137970_p1tpzmomxp9cnmi.css';
// import 'element-ui/lib/theme-chalk/drawer.css';
// import 'element-ui/lib/theme-chalk/backtop.css';
// import ElementUI from 'element-ui';
import {
  Select,
  Option,
  Table,
  TableColumn,
  Tag,
  Icon,
  Card,
  Backtop,
  Button,
  Drawer,
} from 'element-ui';
import App from './App.vue';
import { $constants } from './utils/constants';

Vue.config.productionTip = false;

// Vue.use(ElementUI, { size: 'small', zIndex: 2000 });
Vue.prototype.$ELEMENT = { size: 'small', zIndex: 2000 };

Vue.use(Select);
Vue.use(Option);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Tag);
Vue.use(Icon);
Vue.use(Card);
Vue.use(Backtop);
Vue.use(Button);
Vue.use(Drawer);

// 防止弹出跳回国内网站的提示
localStorage.setItem('PREFER_GITHUB', 'true');
// 防止弹出主题定制的框
localStorage.setItem('KNOW_THEME', 'true');

// Vue.use(VueRouter);

Vue.prototype.$constants = $constants;

const router = new VueRouter({
  mode: 'hash',
});
const params = {
  render: (h: any) => h(App),
  router,
};
new Vue(params).$mount('#webApp');
