import 'todomvc-app-css';
import PageComponent from 'widgets/todomvc';
import Vue from 'vue';
import { isEmpty } from 'toxic-predicate-functions';

new Vue({
  el: '#container',
  template: '<page-component></page-component>',
  components: {
    PageComponent,
  },
});

// import { isEmpty } from 'toxic-predicate-functions';
import qs from 'qs';
const supportServiceworker = !isEmpty(navigator.serviceWorker);
const { downgrade } = qs.parse(location.search.slice(1));
if (downgrade && supportServiceworker) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
}
if (supportServiceworker && !downgrade) {
  navigator.serviceWorker.register('/offline/sw.js').then(function(registration) {
    console.log('Service worker registration succeeded:', registration);
  }).catch(function(error) {
    console.log('Service worker registration failed:', error);
  });
}
