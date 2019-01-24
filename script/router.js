import {Start} from "./pages/start.js";

export class Router {
  run() {
    Start.render();
  }
}

const router = new Router();

document.addEventListener("DOMContentLoaded",function(){
  router.run();
});