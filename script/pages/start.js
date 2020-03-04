/*global Clipboard, moment, numeral, Shuffle*/

import {getUrl, ajax, hideLoading} from "../utils.js";

// todo, most of this to be moved to start.js class

function onLoad() {

/////////////////////////
// other logic

  function formatDate(date) {
    return moment(date).format("YYYY/MM/DD");
  }

  function parse(json) {
    let repos = [];
    for (let name in json) {
      repos.push({
        name: json[name].repo.name,
        description: json[name].repo.description ? json[name].repo.description : "",
        git_url: json[name].repo.clone_url,
        stars: json[name].repo.stargazers_count,
        html_url: json[name].repo.html_url,
        owner: json[name].repo.owner.login,
        owner_url: json[name].repo.owner.html_url,
        lines: json[name].lines,
        cloud: json[name].parsing.cloud,
        license: json[name].repo.license ? json[name].repo.license.name : "null",
        created_at: new Date(json[name].repo.created_at),
        pushed_at: new Date(json[name].repo.pushed_at)
      });
    }
    return { repos };
  }

  function render({ repos }) {
    let html = "";
    for (let i = 0; i < repos.length; ++i) {
      let repo = repos[i];

      let cloud = ``;
      if (repo.cloud === 0) {
        cloud = `<div class="level-item" title="cloud ready, only syntax, disregarding whitelist">
                 <span class="icon is-small"><i class="fa fa-cloud"></i></span>&nbsp;
                 </div>`;
      }

      html += `<div class="column is-half-tablet is-one-third-desktop" data-index="${i}">
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
                    <a href="${repo.html_url}"><strong class="huge">${repo.name}</strong></a>
                    <small><em>
                      created by
                      <a href="${repo.owner_url}">${repo.owner}</a>
                      <span title="${formatDate(repo.created_at)}">
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
                  <span class="icon is-small"><i class="fa fa-pencil"></i></span>&nbsp;${formatDate(repo.pushed_at)}
                </div>
                ${cloud}
                <div class="level-item" title="stats">
                  <a href="https://stats.abaplint.org/#/-/${repo.owner}/${repo.name}"><span class="icon is-small"><img src="./logos/abaplint.svg"></span></a>
                </div>
              </div>
            </nav>
          </div>
        </div>`;
    }
    document.getElementById("list").innerHTML = html;
    document.getElementById("burger").classList.remove("is-active");
    document.getElementById("menu").classList.remove("is-active");
    return repos;
  }

  function hideMenu() {
    document.getElementById("burger").classList.remove("is-active");
    document.getElementById("menu").classList.remove("is-active");
    return false;
  }

  function toggleMenu() {
    document.getElementById("burger").classList.toggle("is-active");
    document.getElementById("menu").classList.toggle("is-active");
    return false;
  }

  function afterRender(repos) {
    var shuffle = null;
    let cloud_filter = false;

    function sort(attribute, descending) {
      shuffle.sort({
        reverse: descending,
        by: element => {
          let v = repos[element.getAttribute("data-index")][attribute];
          return typeof v === "string" ? v.toLowerCase() : v
        }
      });
      hideMenu();
      return false;
    }

    let search = (function () {
      let inner = () => {
        let query = document.getElementById("search").value;
        let regex = new RegExp(query, 'i');
        let predicate = repo => (!cloud_filter || repo.cloud === 0) &&
          ( repo.description.match(regex) || repo.owner.match(regex) || repo.name.match(regex) );
        shuffle.filter(element => predicate(repos[element.getAttribute("data-index")]));
      }
      let timeout = null;
      let later = () => {
        timeout = null;
        inner();
      };
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(later, 500);
      }
    })();

    function rightClick() {
      document.getElementById("search").value = "";
      window.event.returnValue = false;
      search();
    }

    function filter(attribute) {
      cloud_filter = !cloud_filter;
      search();
      hideMenu();
      return false;
    }

    new Clipboard(".is-clipboard-enabled");
    shuffle = new Shuffle(document.getElementById("list"), { itemSelector: ".column", delimiter: "," });

    sort("pushed_at", true);

    setTimeout(() => {
      hideLoading();
      document.getElementById("search").onkeyup = search;
      document.getElementById("search").oncontextmenu = rightClick;
      document.getElementById("burger").onclick = toggleMenu;
      document.getElementById("search-button").onclick = search;
      document.getElementById("sort-by-name").onclick = sort.bind(null, "name", false);
      document.getElementById("sort-by-stars").onclick = sort.bind(null, "stars", true);
      document.getElementById("sort-by-updated").onclick = sort.bind(null, "pushed_at", true);
      document.getElementById("sort-by-size").onclick = sort.bind(null, "lines", true);
      document.getElementById("sort-by-created").onclick = sort.bind(null, "created_at", true);
      document.getElementById("sort-by-author").onclick = sort.bind(null, "owner", false);
      document.getElementById("filter-by-cloud").onclick = filter.bind(null, "cloud");
      shuffle.update();
    }, 500);

    shuffle.on(Shuffle.EventType.LAYOUT, function () {
// todo, how to deregister when page is changed?
      if (document.getElementById("loc_count") === null) {
        return;
      }
      let projects = 0;
      let total = 0;
      for (let item of shuffle.items) {
        if (item.isVisible === true) {
          projects = projects + 1;
          total    = total + repos[item.element.dataset.index].lines;
        }
      }
      document.getElementById("loc_count").innerHTML = numeral(total).format("0.[0]a");
      document.getElementById("project_count").innerHTML = numeral(projects).format("0.[0]a");
    });
  }

  ajax(getUrl())
    .then(parse)
    .then(render)
    .then(afterRender)
    .catch((e) => { console.log("Error loading"); console.dir(e); });
}


export class Start {
  static render() {
    document.getElementById("main").innerHTML = `
    <div class="container">
      <div class="level">
        <div class="level-left">
          <h1 class="title">ABAP Open Source Projects</h1>
        </div>
        <div class="level-right">
          <h2 class="subtitle">
            <div id="projects" title="projects">Projects: <div style="display:inline" id="project_count">?</div>
              <i class="fa fa-github"></i>
            </div>
          </h2>
        </div>
        <div class="level-right">
          <h2 class="subtitle">
            <div id="totalLOC" title="total lines of code">Total: <div style="display:inline" id="loc_count">?</div>
              <i class="fa fa-code"></i>
            </div>
          </h2>
        </div>
        <div class="level-right">
          <a href="https://github.com/dotabap/dotabap-list/actions">
            <img src="https://github.com/dotabap/dotabap-list/workflows/Cron/badge.svg" alt="build status"  class="has-tiny-top-margin">
          </a>
        </div>
      </div>
      <div id="list" class="columns is-multiline is-centered is-vcentered">
        Loading
      </div>
    </div>
    `;

    document.getElementById("nav").innerHTML = `
    <div class="navbar-brand">
      <a class="navbar-item" href="http://dotabap.org">
        <img src="./logos/dotabap_logo.svg" alt="logo">
      </a>
      <div class="navbar-item">
        <div class="field has-addons is-underlined is-main-search">
          <div class="control">
            <input class="input is-header-input" type="text" placeholder="Find a project" id="search" autofocus>
          </div>
          <div class="control">
            <a class="button is-dark">
              <i class="fa fa-search" id="search-button"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="navbar-burger burger" id="burger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="navbar-menu" id="menu">
      <div class="navbar-start">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            Sort
          </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" id="sort-by-name">
              Name
            </a>
            <a class="navbar-item" id="sort-by-stars">
              Stars
            </a>
            <a class="navbar-item" id="sort-by-updated">
              Updated
            </a>
            <a class="navbar-item" id="sort-by-size">
              Size
            </a>
            <a class="navbar-item" id="sort-by-created">
              Created
            </a>
            <a class="navbar-item" id="sort-by-author">
              Author
            </a>
          </div>
        </div>

        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            Filter
          </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" id="filter-by-cloud">
              Cloud
            </a>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <p class="control">
            <a class="button is-dark" href="https://github.com/dotabap/dotabap-list">
              <span class="icon">
                <i class="fa fa-plus"></i>
              </span>
              <span>
                Add Project
              </span>
            </a>
          </p>
        </div>
        <div class="navbar-item">
          <p class="control">
            <a class="button is-white" href="https://github.com/dotabap/dotabap.github.io">
              <span class="icon">
                <i class="fa fa-github"></i>
              </span>
              <span>
                Fork Me
              </span>
            </a>
          </p>
        </div>
      </div>
    </div>
    `;

    onLoad();
  }
}
