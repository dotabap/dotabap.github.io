import {hideLoading} from "../utils.js";

export class Stats {
  static render(owner, name) {
    hideLoading();

    document.getElementById("nav").innerHTML = `${owner}/${name}`;
    document.getElementById("main").innerHTML = `Loading`;
  }
}