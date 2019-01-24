export function getUrl(file = "generated.json") {
    if (window.location.host.match("c9users.io")) {
      // for testing outside github
      return "../dotabap-generated/" + file;
    } else {
      return "https://generated.dotabap.org/" + file;
    }
  }

export function ajax(url) {
    return new Promise((resolve, reject) => {
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          resolve(JSON.parse(xhttp.responseText));
        } else if (xhttp.readyState == 4) {
          reject({status: this.status, statusText: xhttp.statusText });
        }
      };
      xhttp.onerror = function () {
        reject({ status: this.status, statusText: xhttp.statusText });
      };
      xhttp.open("GET", url, true);
      xhttp.send();
    });
  }

export function hideLoading() {
      document.getElementById("main").classList.toggle("is-hidden");
      document.getElementById("loading").classList.toggle("is-hidden");
      document.getElementById("nav").classList.toggle("is-hidden");
      document.getElementById("footer").classList.toggle("is-hidden");
}