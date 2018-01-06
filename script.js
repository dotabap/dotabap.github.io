let repos = null;
let original;

function sortDescending(field) {
  repos.sort((a, b) => {return a[field] > b[field] ? -1 : a[field] < b[field];});
  render();
}
function sortAscending(field) {
  repos.sort((a, b) => {return a[field] < b[field] ? -1 : a[field] > b[field];});
  render();
}
function sortAscendingString(field) {
  repos.sort((a, b) => {return a[field].toLowerCase() < b[field].toLowerCase() ? -1 : a[field].toLowerCase() > b[field].toLowerCase();});
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

function parse(json) {
  repos = [];
  for(let name in json) {
    repos.push({
      name: json[name].repo.name,
      description: json[name].repo.description,
      git_url: json[name].repo.clone_url,
      stars: json[name].repo.stargazers_count,
      html_url: json[name].repo.html_url,
      owner: json[name].repo.owner.login,
      owner_url: json[name].repo.owner.html_url,
      lines: json[name].lines,
      license: json[name].repo.license?json[name].repo.license.name:"null",
      created_at: new Date(json[name].repo.created_at),
      pushed_at: new Date(json[name].repo.pushed_at)
    });
  }
  original = repos;
}

function render() {
  let html = "";
  for(let repo of repos) {
    html = html + "<div class=\"repo\">"+
      "<h3><a href=" + repo.html_url + ">" + repo.name + "</a></h3>" +
      "<h4>" + repo.description + "</h4>" +
      "<small>" +
      "Git URL: " + repo.git_url + "<button class=\"btn\" data-clipboard-text=\"" + repo.git_url + "\"><i class=\"fa fa-clipboard\"></i></button><br>" +
      "Owner: <a href=\"" + repo.owner_url + "\">" + repo.owner + "</a><br>" +
      "<div class=\"inline\" title=\"Lines of ABAP code\">" + repo.lines + "</div>&nbsp;<i class=\"fa fa-code\"></i>&nbsp;" +
      "<div class=\"inline\" title=\"stars\">" + repo.stars + "</div>&nbsp;<i class=\"fa fa-star\"></i><br>" +
      repo.license + "<br>" +
      "Updated: " + repo.pushed_at.toLocaleDateString() + "<br>" +
      "Created: " + repo.created_at.toLocaleDateString() + "<br>" +
      "</small>" +
      "</div>";
  }
  document.getElementById("list").innerHTML = html;
}

function callback(xhttp) {
  if (xhttp.readyState == 4 && xhttp.status == 200) {
    parse(JSON.parse(xhttp.responseText));
    sortDescending('pushed_at');
  }
}

function run() {
  /*global Clipboard*/
  new Clipboard('.btn');

  let url = "";
  if(window.location.host.match("c9users.io")) {
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
