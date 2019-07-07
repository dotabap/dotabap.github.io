import {Start} from "./pages/start.js";

export class Router {
  popstate() {
    Start.render();
  }
}

const router = new Router();

document.addEventListener("DOMContentLoaded",function() {
  window.onpopstate = router.popstate;
  router.popstate();
});