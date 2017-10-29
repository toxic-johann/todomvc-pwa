import 'todomvc-app-css';
import PageComponent from 'widgets/todomvc';
import Vue from 'vue';

new Vue({
  el: '#container',
  template: '<page-component></page-component>',
  components: {
    PageComponent,
  },
});

