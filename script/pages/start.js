export class Start {
  render() {
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
          <a href="https://travis-ci.org/dotabap/dotabap-list">
            <img src="https://travis-ci.org/dotabap/dotabap-list.svg?branch=master" alt="build status"  class="has-tiny-top-margin">
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
  }
}