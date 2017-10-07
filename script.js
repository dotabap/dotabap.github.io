let repos = [];

// todo, there must be some easier way to sort
function sortByName() {
  repos.sort((a, b) => {return a.name < b.name ? -1 : a.name > b.name;});
  render();
}

function sortByStars() {
  repos.sort((a, b) => {return a.stars > b.stars ? -1 : a.stars < b.stars;});
  render();
}

function sortByUpdated() {
  repos.sort((a, b) => {return a.pushed_at > b.pushed_at ? -1 : a.pushed_at < b.pushed_at;});
  render();
}

function sortByCreated() {
  repos.sort((a, b) => {return a.created_at > b.created_at ? -1 : a.created_at < b.created_at;});
  render();
}

function sortBySize() {
  repos.sort((a, b) => {return a.lines > b.lines ? -1 : a.lines < b.lines;});
  render();
}

function sortByAuthor() {
  repos.sort((a, b) => {return a.owner < b.owner ? -1 : a.owner > b.owner;});
  render();
}

function parse(json) {
  for(let name in json) {
    repos.push({name,
      description: json[name].description,
      git_url: json[name].git_url,
      stars: json[name].github.stargazers_count,
      html_url: json[name].github.html_url,
      owner: json[name].github.owner.login,
      owner_url: json[name].github.owner.html_url,
      lines: json[name].lines,
      created_at: new Date(json[name].github.created_at),
      pushed_at: new Date(json[name].github.pushed_at)
    })
  }
}

function render() {
  let html = "";
  for(let repo of repos) {
    html = html + "<div class=\"repo\">"+
      "<h3><a href="+repo.html_url+">" + repo.name + "</a></h3>" +
      "<h4>" + repo.description + "</h4>" +
      "<small>" +
      "Git URL: " + repo.git_url + "<br>" +
      "Owner: <a href=\""+repo.owner_url+"\">" + repo.owner + "</a><br>" +
      "Lines: " + repo.lines + "<br>" +
      "Stars: " + repo.stars + "<br>" +
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
    sortByUpdated();
  }
}

function run() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = (() => callback(xhttp));
  xhttp.open("GET", "https://dotabap.github.io/dotabap-generated/generated.json", true);
  xhttp.send();
}