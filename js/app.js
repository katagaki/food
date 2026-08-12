(function () {
  "use strict";

  var listEl = document.getElementById("recipeList");
  var contentEl = document.getElementById("content");
  var searchEl = document.getElementById("search");
  var backBtn = document.getElementById("backBtn");

  var manifest = [];
  var cache = {};

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function currentId() {
    var m = location.hash.match(/^#\/([\w-]+)/);
    return m ? m[1] : null;
  }

  /* ---------- Sidebar ---------- */

  function renderList(filter) {
    var q = (filter || "").trim().toLowerCase();
    var active = currentId();
    var shown = manifest.filter(function (r) {
      if (!q) return true;
      var hay = [r.title].concat(r.keywords || []).join(" ").toLowerCase();
      return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
    });

    if (!shown.length) {
      listEl.innerHTML = '<li class="no-results">No recipes match your search.</li>';
      return;
    }

    listEl.innerHTML = shown.map(function (r) {
      return (
        '<li><a class="recipe-link' + (r.id === active ? " active" : "") + '" href="#/' + esc(r.id) + '">' +
        '<span class="name">' + esc(r.title) + "</span>" +
        '<span class="meta">' + esc(r.time) + " &middot; serves " + esc(r.serves) + "</span>" +
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

  function ingredientItem(i) {
    return (
      "<li><span>" + esc(i.item) +
      (i.optional ? '<span class="optional">optional</span>' : "") +
      (i.note ? '<span class="item-note">' + esc(i.note) + "</span>" : "") +
      '</span><span class="amt">' + esc(i.amount) + "</span></li>"
    );
  }

  function renderRecipe(r) {
    document.title = r.title + " | One-Pan Food";
    contentEl.innerHTML =
      '<div class="page">' +
      '<header class="recipe-header">' +
      "<h1>" + esc(r.title) + "</h1>" +
      '<div class="tags"><span class="tag blue">' + esc(r.time) + '</span><span class="tag">Serves ' + esc(r.serves) + "</span></div>" +
      "</header>" +

      "<section><h2>Ingredients</h2>" +
      '<div class="cols">' +
      '<div class="panel"><h3>To buy</h3><ul class="items">' +
      r.ingredients.toBuy.map(ingredientItem).join("") +
      "</ul></div>" +
      '<div class="panel alt"><h3>From the pantry</h3><ul class="items">' +
      r.ingredients.fromThePantry.map(ingredientItem).join("") +
      "</ul></div>" +
      "</div></section>" +

      '<section><h2>Tools</h2><div class="table-wrap"><table>' +
      "<thead><tr><th>Tool</th><th>Needed?</th><th>Notes</th></tr></thead><tbody>" +
      r.tools.map(function (t) {
        return (
          "<tr><td>" + esc(t.name) + "</td>" +
          '<td class="status ' + (t.required ? "req" : "opt") + '">' + (t.required ? "Required" : "Optional") + "</td>" +
          "<td>" + esc(t.note || "") + "</td></tr>"
        );
      }).join("") +
      "</tbody></table></div></section>" +

      '<section><h2>Method</h2><ol class="steps">' +
      r.steps.map(function (s) {
        return (
          "<li>" +
          '<div class="step-body"><h3>' + esc(s.title) + "</h3><p>" + esc(s.text) + "</p>" +
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
    fetch(entry.file)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
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

  window.addEventListener("hashchange", route);

  fetch("recipes/index.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      manifest = (data.recipes || []).slice().sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });
      route();
    })
    .catch(function () {
      renderError("Couldn't load the recipe list. If you opened this file directly, serve it over HTTP instead.");
    });
})();
