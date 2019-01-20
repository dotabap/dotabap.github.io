import {Start} from "./pages/start.js";

export class Router {
  run() {
    new Start().render();

    onLoad(); // from script.js
  }
}

const router = new Router();

document.addEventListener("DOMContentLoaded",function(){
  router.run();
});