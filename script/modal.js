
  var modal = document.getElementById('statsModal');

// todo, this function is duplicated in script.js
  function getUrl(file = "generated.json") {
    if (window.location.host.match("c9users.io")) {
      // for testing outside github
      return "../dotabap-generated/" + file;
    } else {
      return "https://generated.dotabap.org/" + file;
    }
  }

// todo, this function is duplicated in script.js
  function ajax(url) {
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

  function renderStats(data, owner, name) {
    let html = `
    <a href="https://github.com/larshp/abaplint"><img src="./logos/abaplint.svg" height='50px' width='50px'></a>
    <b>${owner}/${name}</b><br>
    <table><tr><td width="50%">
    <table>
    <tr><td>Objects:</td><td style="text-align:right">${data.totals.objects}</td></tr>
    <tr><td>Files:</td><td style="text-align:right">${data.totals.files}</td></tr>
    <tr><td>Statements:</td><td style="text-align:right">${data.totals.statements}</td></tr>
    <tr><td>Tokens:</td><td style="text-align:right">${data.totals.tokens}</td></tr>
    <tr><td>Target:</td><td style="text-align:right">${data.target}</td></tr>
    </table>
    </td><td>
    <canvas id="statsObjects" width="300" height="200"></canvas>
    </td></tr></table>
    <br>
    <b>Statement Compatibility</b><br>
    <canvas id="statsStatements" width="500" height="300"></canvas>
    <br>
    <b>Object Orientation</b><br>
    <canvas id="statsObjectOrientation" width="500" height="200"></canvas>
    <br>
    <b>Method Length(Statements)</b><br>
    <canvas id="statsMethodLength" width="400" height="200"></canvas>
    <br>
    `;

    if (data.issues.length > 0) {
      html = html + `<b>Issues</b><br><table>`;
      for (const issue of data.issues) {
        html = html + `<tr><td>${issue.type}:&nbsp;</td><td style="text-align:right">${issue.count}</td></tr>`;
      }
      html = html + `</table>`;
    }

    html = html + `<br><small>abaplint ${data.version}, ${data.time}</small>`;

    document.getElementById("stats-modal").innerHTML = html;

    renderStatsObjects(data);
    renderStatsObjectOrientation(data);
    renderStatsMethodLength(data);
    renderStatsStatements(data);
  }

  function renderStatsObjectOrientation(data) {
    let green = "#3cba9f";
    let red = "#c45850";

    if (data.objectOrientation === undefined) {
      return;
    }

    var data = {
      datasets: [{data: [data.objectOrientation.oo, data.objectOrientation.non],
        backgroundColor: [green, red],
      }],
      labels: ["OO", "non OO"]};

    var ctx = document.getElementById("statsObjectOrientation").getContext('2d');

    var myChart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {legend: {display: false}
      }
    });
  }

  function renderStatsMethodLength(data) {
    let green = "#3cba9f";
    let red = "#c45850";
    let points = [];
    let labels = [];
    let colors = [];

    if (data.methodLength === undefined) {
      return;
    }

    for (let i = 0; i < data.methodLength.length ; i++) {
      labels.push(i);
      points.push(data.methodLength[i]);
      colors.push(green);
    }

    var data = {
      datasets: [{data: points,
        backgroundColor: colors,
      }],
      labels: labels};

    var ctx = document.getElementById("statsMethodLength").getContext('2d');

    var myChart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {legend: {display: false}}
    });
  }

  function renderStatsStatements(data) {
    let green = "#3cba9f";
    let red = "#c45850";
    let points = [];
    let labels = [];
    let colors = [];

    for (const object of data.statements) {
      labels.push(object.type);
      points.push(object.count);
      if (object.count === data.totals.statements) {
        colors.push(green);
      } else {
        colors.push(red);
      }
    }

    var data = {
      datasets: [{data: points,
        backgroundColor: colors,
      }],
      labels: labels};

    var ctx = document.getElementById("statsStatements").getContext('2d');

    var myChart = new Chart(ctx, {
      type: 'horizontalBar',
      data,
      options: {legend: {display: false}}
    });
  }

  function renderStatsObjects(data) {
    let points = [];
    let labels = [];

    for (const object of data.objects) {
      labels.push(object.type);
      points.push(object.count);
    }

    var data = {
      datasets: [{data: points,
        backgroundColor: ["#f4a460","#ee7942","#cd6839", "#a0522d", "#8b4513",
          "#f4a460","#ee7942","#cd6839", "#a0522d", "#8b4513",
          "#f4a460","#ee7942","#cd6839", "#a0522d", "#8b4513",
          "#f4a460","#ee7942","#cd6839", "#a0522d", "#8b4513",
          "#f4a460","#ee7942","#cd6839", "#a0522d", "#8b4513",
          "#f4a460","#ee7942","#cd6839", "#a0522d", "#8b4513",
          "#f4a460","#ee7942","#cd6839", "#a0522d", "#8b4513",
          "#f4a460","#ee7942","#cd6839", "#a0522d", "#8b4513"],
      }],
      labels: labels};

    var ctx = document.getElementById("statsObjects").getContext('2d');

    var myChart = new Chart(ctx, {
      type: 'pie',
      data,
      options: {legend: {position: "right"}}
    });
  }

  function catchStats(d) {
    document.getElementById("stats-modal").innerHTML = 'Error loading, try again later';
  }



export class StatsModal {
  static init() {
    window.stats = function (owner, name) {
      document.getElementById("stats-modal").innerHTML = 'Loading';

      modal.classList.add('is-active');

      const url = getUrl("stats/" + owner + "_" + name + ".json");
      ajax(url).then((d) => renderStats(d, owner, name)).catch(catchStats);
    }

    document.getElementsByClassName("modal-close")[0].onclick = function() {
      modal.classList.remove('is-active');
    }

    document.getElementsByClassName("modal-background")[0].onclick = function() {
      modal.classList.remove('is-active');
    }

    document.onkeydown = function (event) {
      if (event.keyCode === 27) { // escape
        modal.classList.remove('is-active');
      }
    };
  }
}