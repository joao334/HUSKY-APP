(function () {
  const overlay = document.getElementById("husky-loader-overlay");
  const pull = document.getElementById("husky-pull-loader");
  const pullTitle = pull?.querySelector("strong");
  const pullSub = pull?.querySelector("span");
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function hideLoader() {
    if (!overlay) return;
    overlay.classList.add("is-hidden");
    window.setTimeout(() => {
      overlay.style.display = "none";
      overlay.classList.remove("is-pull-refresh");
    }, 620);
  }

  function showLoaderForRefresh() {
    if (!overlay) return;
    overlay.style.display = "grid";
    overlay.classList.remove("is-hidden");
    overlay.classList.add("is-pull-refresh");
    window.setTimeout(hideLoader, prefersReduced ? 200 : 1350);
  }

  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, prefersReduced ? 250 : 2100);
  });

  // Segurança: se algum script demorar muito, o loader não fica preso na tela.
  window.setTimeout(hideLoader, prefersReduced ? 600 : 4200);

  if (!pull) return;

  let startY = 0;
  let pulling = false;
  let distance = 0;
  const threshold = 86;

  function atTop() {
    return window.scrollY <= 2 && document.documentElement.scrollTop <= 2 && document.body.scrollTop <= 2;
  }

  function setPull(distancePx) {
    const y = Math.min(distancePx, 126);
    pull.classList.add("is-visible");
    pull.style.transform = `translate(-50%, ${-112 + y}%)`;
    const ready = distancePx >= threshold;
    pull.classList.toggle("is-ready", ready);
    if (pullTitle) pullTitle.textContent = ready ? "Solte para atualizar" : "Puxe para atualizar";
    if (pullSub) pullSub.textContent = ready ? "O Husky já está pronto ✨" : "Solte para dar um uivo";
  }

  function resetPull() {
    pull.classList.remove("is-visible", "is-ready", "is-loading");
    pull.style.transform = "translate(-50%, -112%)";
    if (pullTitle) pullTitle.textContent = "Puxe para atualizar";
    if (pullSub) pullSub.textContent = "Solte para dar um uivo";
  }

  window.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1 || !atTop()) return;
    startY = event.touches[0].clientY;
    pulling = true;
    distance = 0;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    if (!pulling || !atTop()) return;
    const current = event.touches[0].clientY;
    distance = Math.max(0, current - startY);
    if (distance > 8) setPull(distance);
  }, { passive: true });

  window.addEventListener("touchend", () => {
    if (!pulling) return;
    const shouldRefresh = distance >= threshold;
    pulling = false;
    if (shouldRefresh) {
      pull.classList.remove("is-ready");
      pull.classList.add("is-loading", "is-visible");
      if (pullTitle) pullTitle.textContent = "Atualizando...";
      if (pullSub) pullSub.textContent = "Buscando novidades da Husky";
      window.setTimeout(() => {
        resetPull();
        showLoaderForRefresh();
        window.dispatchEvent(new CustomEvent("husky:pull-refresh"));
        // Reaproveita o fluxo do sistema: força uma renderização leve quando Store existir.
        window.dispatchEvent(new CustomEvent("husky:data"));
      }, 420);
    } else {
      resetPull();
    }
    distance = 0;
  }, { passive: true });

  window.addEventListener("touchcancel", () => {
    pulling = false;
    distance = 0;
    resetPull();
  }, { passive: true });
})();
