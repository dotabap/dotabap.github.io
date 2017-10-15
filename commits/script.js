let data = {};

function render() {
  var ctx = document.getElementById("myChart").getContext('2d');

  let labels = [];
  let result = [];
  for(let key in data) {
    labels.push(data[key].label);
    result.push(data[key].count);
  }

  /*global Chart*/
  var chart = new Chart(ctx, {
    type: 'line',
      data: {
				labels: labels,
				datasets: [{
					label: "Commits in abapGit based projects",
					fill: true,
					data: result,
				}]
			}
  });
}

function parse(json) {
  let month = 12;
  let year = 9999;

  for(let row of json) {
    let date = new Date(row.time);
    if (date.getFullYear() < year || ( date.getFullYear() === year && date.getMonth() < month )) {
      year = date.getFullYear();
      month = date.getMonth();
    }
  }

  while (true) {
    data[year+"-"+month] = {};
    data[year+"-"+month].count = 0;
    data[year+"-"+month].label = new Date(year+"-"+(month+1)+"-01").toLocaleString('en-US',{ month: "short" }) + " " + year;

    if(year == new Date().getFullYear() && month === new Date().getMonth()) {
      break;
    }

    month = month + 1;
    if(month === 12) {
      month = 0;
      year = year + 1;
    }
  }

  for(let row of json) {
    let date = new Date(row.time);
    let key = date.getFullYear()+"-"+ date.getMonth();
    data[key].count = data[key].count + 1;
  }

  render();
}

function callback(xhttp) {
  if (xhttp.readyState == 4 && xhttp.status == 200) {
    parse(JSON.parse(xhttp.responseText));
  }
}

function run() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = (() => callback(xhttp));
  xhttp.open("GET", "./commits.json", true);
  xhttp.send();
}