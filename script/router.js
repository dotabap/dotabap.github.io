import {Start} from "./pages/start.js";
import {Stats} from "./pages/stats.js";

export class Router {
  popstate() {
    if(window.location.hash === "") {
      Start.render();
    } else {
      const split = window.location.hash.split("/");
      Stats.render(split[2], split[3]);
    }
  }
}

const router = new Router();

document.addEventListener("DOMContentLoaded",function() {
  window.onpopstate = router.popstate;
  router.popstate();
});