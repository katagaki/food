(function () {
  "use strict";

  var listEl = document.getElementById("recipeList");
  var contentEl = document.getElementById("content");
  var searchEl = document.getElementById("search");
  var backBtn = document.getElementById("backBtn");
  var sortBtns = document.querySelectorAll(".seg-btn");
  var triedBtn = document.getElementById("triedFilter");

  var manifest = [];
  var cache = {};
  var sortMode = "title";
  var triedOnly = false;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Recipe JSON changes far more often than the browser's default cache policy
  // assumes, so every request revalidates and a 304 keeps it cheap.
  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  function currentId() {
    var m = location.hash.match(/^#\/([\w-]+)/);
    return m ? m[1] : null;
  }

  /* ---------- Sidebar ---------- */

  // "15 min" and "1 hr 10 min" both become a plain minute count. Anything
  // unparseable sorts to the bottom rather than to the top.
  function minutes(time) {
    var total = null;
    String(time || "").toLowerCase().replace(
      /(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)\b/g,
      function (_, n, unit) {
        total = (total || 0) + parseFloat(n) * (unit.charAt(0) === "h" ? 60 : 1);
        return "";
      }
    );
    return total === null ? Infinity : total;
  }

  function compare(a, b) {
    if (sortMode === "time") {
      var am = minutes(a.time);
      var bm = minutes(b.time);
      if (am !== bm) return am < bm ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  }

  function emptyMessage(q) {
    if (q && triedOnly) return "No human tested recipes match your search.";
    if (q) return "No recipes match your search.";
    return "No recipes have been human tested yet.";
  }

  function renderList(filter) {
    var q = (filter || "").trim().toLowerCase();
    var active = currentId();
    var shown = manifest.filter(function (r) {
      if (triedOnly && !r.tried) return false;
      if (!q) return true;
      var hay = [r.title].concat(r.keywords || []).join(" ").toLowerCase();
      return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
    }).sort(compare);

    if (!shown.length) {
      listEl.innerHTML = '<li class="no-results">' + esc(emptyMessage(q)) + "</li>";
      return;
    }

    listEl.innerHTML = shown.map(function (r) {
      return (
        '<li><a class="recipe-link' + (r.id === active ? " active" : "") + '" href="#/' + esc(r.id) + '">' +
        '<span class="name">' + esc(r.title) + "</span>" +
        '<span class="meta">' + esc(r.time) + " &middot; serves " + esc(r.serves) +
        (r.tried ? " &middot; human tested" : "") + "</span>" +
        "</a></li>"
      );
    }).join("");
  }

  /* ---------- Views ---------- */

  function renderHome() {
    document.title = "One-Pan Food";
    contentEl.innerHTML =
      '<div class="home-empty">' +
      "<h1>What are you cooking?</h1>" +
      '<p class="lede">Select a recipe from the sidebar to get started.</p>' +
      "</div>";
  }

  // Fresh and chilled holds the perishables, the pantry the cupboard
  // staples. A section is left out of the JSON entirely when it is empty.
  var ING_SECTIONS = [
    { key: "supermarket", title: "Fresh and chilled", cls: "" },
    { key: "general", title: "From the pantry", cls: " alt" },
    { key: "optional", title: "Optional", cls: " opt" }
  ];

  function tile(icon, name, meta, note) {
    return (
      '<li class="tile">' +
      '<img class="tile-icon" src="' + esc(icon) + '" alt="" loading="lazy" width="44" height="44">' +
      '<span class="tile-name">' + esc(name) + "</span>" +
      (meta ? '<span class="tile-meta">' + esc(meta) + "</span>" : "") +
      (note ? '<span class="tile-note">' + esc(note) + "</span>" : "") +
      "</li>"
    );
  }

  function tileGroup(title, cls, tiles) {
    if (!tiles.length) return "";
    return (
      '<div class="tile-group' + cls + '"><h3>' + title + "</h3>" +
      '<ul class="tile-grid">' + tiles.join("") + "</ul></div>"
    );
  }

  function ingredientGroups(ingredients) {
    return ING_SECTIONS.map(function (s) {
      var list = (ingredients && ingredients[s.key]) || [];
      return tileGroup(s.title, s.cls, list.map(function (i) {
        return tile(i.icon, i.item, i.amount, i.note);
      }));
    }).join("");
  }

  // Required and optional become the two headings, so a tile never has
  // to spell out which of the two a tool is.
  function toolGroups(tools) {
    function group(required) {
      return (tools || []).filter(function (t) {
        return !!t.required === required;
      }).map(function (t) { return tile(t.icon, t.name, "", t.note); });
    }
    return (
      tileGroup("Required", "", group(true)) +
      tileGroup("Optional", " opt", group(false))
    );
  }

  function renderRecipe(r) {
    document.title = r.title + " | One-Pan Food";
    contentEl.innerHTML =
      '<div class="page">' +
      '<header class="recipe-header">' +
      "<h1>" + esc(r.title) + "</h1>" +
      '<div class="tags"><span class="tag blue">' + esc(r.time) + '</span><span class="tag">Serves ' + esc(r.serves) + "</span>" +
      (r.tried ? '<span class="tag green">Human Tested</span>' : "") + "</div>" +
      "</header>" +

      "<section><h2>Ingredients</h2>" +
      ingredientGroups(r.ingredients) + "</section>" +

      "<section><h2>Tools</h2>" + toolGroups(r.tools) + "</section>" +

      '<section><h2>Method</h2><ol class="steps">' +
      r.steps.map(function (s) {
        return (
          "<li>" +
          '<div class="step-body"><h3>' + esc(s.title) + "</h3>" +
          '<ul class="step-points">' +
          (s.points || []).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") +
          "</ul>" +
          (s.hint ? '<p class="step-hint">' + esc(s.hint) + "</p>" : "") +
          "</div>" +
          '<div class="step-figure"><img src="' + esc(s.image) + '" alt="" loading="lazy"></div>' +
          "</li>"
        );
      }).join("") +
      "</ol></section>" +

      '<section><h2>When it goes wrong</h2><dl class="trouble">' +
      r.troubleshooting.map(function (t) {
        return "<dt>" + esc(t.problem) + "</dt><dd>" + esc(t.solution) + "</dd>";
      }).join("") +
      "</dl></section>" +
      "</div>";
  }

  function renderError(message) {
    contentEl.innerHTML = '<div class="page"><div class="state">' + esc(message) + "</div></div>";
  }

  /* ---------- Loading & routing ---------- */

  function loadRecipe(id) {
    var entry = manifest.find(function (r) { return r.id === id; });
    if (!entry) {
      renderError("That recipe doesn't exist. Pick one from the sidebar.");
      return;
    }
    if (cache[id]) {
      renderRecipe(cache[id]);
      return;
    }
    contentEl.innerHTML = '<div class="page"><div class="state">Loading&hellip;</div></div>';
    getJSON(entry.file)
      .then(function (data) {
        cache[id] = data;
        if (currentId() === id) renderRecipe(data);
      })
      .catch(function () {
        renderError("Couldn't load this recipe. Check your connection and try again.");
      });
  }

  function route() {
    var id = currentId();
    renderList(searchEl.value);
    if (id) {
      // Pushes the recipe view onto the stack on mobile
      document.body.classList.add("recipe-open");
      loadRecipe(id);
    } else {
      document.body.classList.remove("recipe-open");
      renderHome();
    }
    contentEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  /* ---------- Mobile navigation stack ---------- */

  function popToList() {
    location.hash = "#/";
  }

  backBtn.addEventListener("click", popToList);

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      document.body.classList.contains("recipe-open") &&
      window.matchMedia("(max-width: 720px)").matches
    ) {
      popToList();
    }
  });

  /* ---------- Boot ---------- */

  searchEl.addEventListener("input", function () {
    renderList(searchEl.value);
  });

  Array.prototype.forEach.call(sortBtns, function (btn) {
    btn.addEventListener("click", function () {
      sortMode = btn.getAttribute("data-sort");
      Array.prototype.forEach.call(sortBtns, function (other) {
        other.setAttribute("aria-pressed", other === btn ? "true" : "false");
      });
      renderList(searchEl.value);
    });
  });

  triedBtn.addEventListener("click", function () {
    triedOnly = !triedOnly;
    triedBtn.setAttribute("aria-pressed", triedOnly ? "true" : "false");
    renderList(searchEl.value);
  });

  window.addEventListener("hashchange", route);

  getJSON("recipes/index.json")
    .then(function (data) {
      manifest = data.recipes || [];
      route();
    })
    .catch(function () {
      renderError("Couldn't load the recipe list. If you opened this file directly, serve it over HTTP instead.");
    });
})();
