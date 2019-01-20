import {Start} from "./pages/start.js";
import {onLoad} from "./script.js";

export class Router {
  run() {
    Start.render();

    onLoad();
  }
}

const router = new Router();

document.addEventListener("DOMContentLoaded",function(){
  router.run();
});