(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    var toggle = document.getElementById('hh-mobile-toggle');
    var nav = document.getElementById('hh-primary-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    // Back to Top
    var topBtn = document.getElementById('hh-back-to-top');
    if (topBtn) {
      topBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Global Search Modal
    var searchOpenBtn = document.getElementById('hh-search-open');
    var searchCloseBtn = document.getElementById('hh-search-close');
    var searchModal = document.getElementById('hh-search-modal');
    var searchInput = document.getElementById('hh-global-search-input');
    var searchResults = document.getElementById('hh-global-search-results');

    function openSearch() {
      if (!searchModal) return;
      searchModal.classList.add('open');
      if (searchInput) searchInput.focus();
    }

    function closeSearch() {
      if (!searchModal) return;
      searchModal.classList.remove('open');
    }

    if (searchOpenBtn) searchOpenBtn.addEventListener('click', openSearch);
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
    if (searchModal) {
      searchModal.addEventListener('click', function (e) {
        if (e.target === searchModal) closeSearch();
      });
    }

    if (searchInput && searchResults) {
      var cachedDistricts = null;
      var cachedCulture = null;

      searchInput.addEventListener('input', function () {
        var q = searchInput.value.trim().toLowerCase();
        if (!q) {
          searchResults.innerHTML = '<p class="hh-meta">Type a district, festival, art, or monument name to search.</p>';
          return;
        }

        Promise.all([
          cachedDistricts ? Promise.resolve(cachedDistricts) : fetch('/api/districts').then(function (r) { return r.json(); }),
          cachedCulture ? Promise.resolve(cachedCulture) : fetch('/api/culture').then(function (r) { return r.json(); })
        ]).then(function (data) {
          cachedDistricts = data[0];
          cachedCulture = data[1];

          var hits = [];
          cachedDistricts.forEach(function (d) {
            if ((d.name + ' ' + d.region + ' ' + d.description).toLowerCase().indexOf(q) !== -1) {
              hits.push({ title: d.name, meta: 'District · ' + d.region, url: '/district/' + d.id });
            }
          });
          cachedCulture.forEach(function (c) {
            if ((c.title + ' ' + c.districtName + ' ' + c.category + ' ' + c.description).toLowerCase().indexOf(q) !== -1) {
              hits.push({ title: c.title, meta: c.category + ' · ' + c.districtName, url: '/culture?q=' + encodeURIComponent(c.title) });
            }
          });

          if (!hits.length) {
            searchResults.innerHTML = '<p class="hh-meta">No matching verified records found.</p>';
            return;
          }

          searchResults.innerHTML = hits.slice(0, 10).map(function (h) {
            return '<a href="' + h.url + '" style="display:block;padding:10px 0;border-bottom:1px solid #EADEC8;">' +
              '<div style="font-size:0.75rem;color:#941D2A;font-weight:600;">' + h.meta + '</div>' +
              '<div style="font-weight:500;color:#292522;">' + h.title + '</div></a>';
          }).join('');
        });
      });
    }

    // Scroll Reveal Animations
    var revealEls = document.querySelectorAll('.hh-reveal');
    if (revealEls.length) {
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { obs.observe(el); });
      } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      }
    }
  });
})();
