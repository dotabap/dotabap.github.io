/*global Clipboard, moment, numeral, Shuffle*/
function onLoad() {
  function formatDate(date) {
    return moment(date).format("YYYY/MM/DD");
  }

  function getUrl() {
    if (window.location.host.match("c9users.io")) {
      // for testing outside github
      return "../dotabap-generated/generated.json";
    } else {
      return "http://generated.dotabap.org/generated.json";
    }
  }

  function ajax(url) {
    return new Promise(resolve => {
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          resolve(JSON.parse(xhttp.responseText));
        }
      };
      xhttp.open("GET", url, true);
      xhttp.send();
    });
  }

  function parse(json) {
    let repos     = [];
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
      document.getElementById("main").classList.toggle("is-hidden");
      document.getElementById("loading").classList.toggle("is-hidden");
      document.getElementById("nav").classList.toggle("is-hidden");
      document.getElementById("footer").classList.toggle("is-hidden");
      document.getElementById("search").onkeyup = search;
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
      let projects = 0;
      let total = 0;
      for (let item of shuffle.items) {
        if (item.isVisible === true) {
          projects = projects + 1;
          total    = total + repos[item.id - 1].lines;
        }
      }
      document.getElementById("loc_count").innerHTML = numeral(total).format("0.[0]a");
      document.getElementById("project_count").innerHTML = numeral(projects).format("0.[0]a");
    });
  }

  ajax(getUrl())
    .then(parse)
    .then(render)
    .then(afterRender);
}
