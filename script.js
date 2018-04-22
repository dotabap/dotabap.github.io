/*global Clipboard, moment, numeral*/
let repos = null;
let original;

function sortDescending(field) {
  repos.sort((a, b) => { return a[field] > b[field] ? -1 : a[field] < b[field]; });
  render();
}
function sortAscending(field) {
  repos.sort((a, b) => { return a[field] < b[field] ? -1 : a[field] > b[field]; });
  render();
}
function sortAscendingString(field) {
  repos.sort((a, b) => { return a[field].toLowerCase() < b[field].toLowerCase() ? -1 : a[field].toLowerCase() > b[field].toLowerCase(); });
  render();
}

function search(e) {
  if (repos === null) {
    // wait until JSON is loaded
    return;
  }

  if (e === "") {
    repos = original;
    render();
    return;
  }
  repos = [];
  for (let repo of original) {
    if (!repo.description) continue;
    let regex = new RegExp(e, 'i');
    if (repo.description.match(regex) || repo.owner.match(regex) || repo.name.match(regex)) {
      repos.push(repo);
    }
  }

  sortDescending("stars");
  render();
}

function toggleMenu() {
  document.getElementById("burger").classList.toggle("is-active");
  document.getElementById("menu").classList.toggle("is-active");
}

function checkSearchEnterPressed(e) {
  if (e.keyCode == 13) {
    search(document.getElementById("search").value);
  }
}

function parse(json) {
  let total = 0;
  repos = [];
  for (let name in json) {
    repos.push({
      name: json[name].repo.name,
      description: json[name].repo.description,
      git_url: json[name].repo.clone_url,
      stars: json[name].repo.stargazers_count,
      html_url: json[name].repo.html_url,
      owner: json[name].repo.owner.login,
      owner_url: json[name].repo.owner.html_url,
      lines: json[name].lines,
      license: json[name].repo.license ? json[name].repo.license.name : "null",
      created_at: new Date(json[name].repo.created_at),
      pushed_at: new Date(json[name].repo.pushed_at)
    });
    total = total + json[name].lines;
  }
  document.getElementById("totalLOC").innerHTML = document.getElementById("totalLOC").innerHTML.replace("?", numeral(total).format("0.[0]a"));
  original = repos;
}

function render() {
  let html = "";
  for (let i = 0; i < repos.length; ++i) {
    let repo = repos[i];
    html += `<div class="column ${['is-narrow', 'is-one-third', ''][i % 3]}">
      <div class="box">
          <article class="media">
          <figure class="media-left">
            <p class="image is-64x64">
              <img src="${repo.owner_url}.png?size=64">
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <a href="${repo.html_url}"><strong>${repo.name}</strong></a>
                <small><em>
                  created by 
                  <a href="${repo.owner_url}">${repo.owner}</a>
                  <span title="${repo.created_at.toLocaleDateString()}">
                    ${moment(repo.created_at).fromNow()}
                  </span>
                </em></small><br>
                ${repo.description}<br>
                <em>${repo.license}</em>
              </p>
            </div>
          </div>
        </article>
        <div class="field has-addons has-small-top-margin">
          <p class="control">
            <a class="button is-static">
              Git
            </a>
          </p>
          <p class="control is-expanded">
            <input class="input" type="text" value="${repo.git_url}" readonly>
          </p>
          <p class="control" title="copy to clipboard">
            <a class="button is-clipboard-enabled" data-clipboard-text="${repo.git_url}">
              <span class="icon"><i class="fa fa-clipboard"></i></span>
            </a>
          </p>
        </div>
        <nav class="level is-mobile">
          <div class="level-left">
            <div class="level-item" title="stars">
              <span class="icon is-small"><i class="fa fa-star"></i></span>&nbsp;${repo.stars}
            </div>
            <div class="level-item" title="lines of code">
              <span class="icon is-small"><i class="fa fa-code"></i></span>&nbsp;${numeral(repo.lines).format("0.[0]a")}
            </div>
            <div class="level-item" title="last updated at">
              <span class="icon is-small"><i class="fa fa-pencil"></i></span>&nbsp;${repo.pushed_at.toLocaleDateString()}
            </div>
          </div>
        </nav>
      </div>
    </div>`;

  }
  document.getElementById("list").innerHTML = html;
}

function callback(xhttp) {
  if (xhttp.readyState == 4 && xhttp.status == 200) {
    parse(JSON.parse(xhttp.responseText));
    sortDescending('pushed_at');
  }
}

function toggleLoader() {
  document.getElementById("main").classList.toggle("is-hidden");
  document.getElementById("loading").classList.toggle("is-hidden");
  document.getElementById("nav").classList.toggle("is-hidden");
  document.getElementById("footer").classList.toggle("is-hidden");
}

function run() {
  new Clipboard(".is-clipboard-enabled");
  setTimeout(toggleLoader, 500);

  let url = "";
  if (window.location.host.match("c9users.io")) {
    // for testing outside github
    url = "../dotabap-generated/generated.json";
  } else {
    url = "http://generated.dotabap.org/generated.json";
  }

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = (() => callback(xhttp));
  xhttp.open("GET", url, true);
  xhttp.send();
}
