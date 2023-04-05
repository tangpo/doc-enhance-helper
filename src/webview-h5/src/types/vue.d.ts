import { $constants } from '../utils/constants';

declare module 'vue/types/vue' {
  interface Vue {
    $constants: $constants;
    $router: any;
  }
}
