import {hideLoading} from "../utils.js";

export class Stats {
  static render(owner, name) {
    console.log(owner);
    console.log(name);

    hideLoading();
  }
}