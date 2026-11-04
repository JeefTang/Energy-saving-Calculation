/* mobile nav toggle */
(function () {
  var b = document.getElementById("menuToggle"), u = document.getElementById("navList");
  if (!b || !u) return;
  b.addEventListener("click", function () {
    var open = u.classList.toggle("open");
    b.setAttribute("aria-expanded", open ? "true" : "false");
    b.innerHTML = open ? "&times;" : "&#9776;";
  });
})();
