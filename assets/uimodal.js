/* uimodal.js - drop-in library (no modules) */
(function () {
  "use strict";

  const ID = "uimodal-root";
  let lastActive = null;
  let currentResolve = null;
  let closeFns = null;

  function qs(sel, root = document) { return root.querySelector(sel); }
  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v === false || v == null) continue;
      else n.setAttribute(k, String(v));
    }
    for (const c of children) n.appendChild(c);
    return n;
  }

  function ensureRoot() {
    let root = qs("#" + ID);
    if (root) return root;

    root = el("div", { id: ID, class: "uimodal-root", hidden: "" }, [
      el("div", { class: "uimodal-backdrop", "data-uimodal-close": "" }),
      el("div", { class: "uimodal-panel", role: "dialog", "aria-modal": "true", tabindex: "-1" }, [
        el("div", { class: "uimodal-header" }, [
          el("h2", { class: "uimodal-title", id: "uimodal-title" }),
          el("button", { class: "uimodal-x", type: "button", "aria-label": "Tancar", "data-uimodal-close": "", text: "✕" })
        ]),
        el("div", { class: "uimodal-body", id: "uimodal-body" }),
        el("div", { class: "uimodal-footer", id: "uimodal-footer" })
      ])
    ]);

    document.body.appendChild(root);
    return root;
  }

  function trapFocus(panel) {
    const sel = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    function handler(e) {
      if (e.key !== "Tab") return;
      const focusables = panel.querySelectorAll(sel);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    panel.addEventListener("keydown", handler);
    return () => panel.removeEventListener("keydown", handler);
  }

  function openModal({ title, bodyNode, buttons, focusSelector, closeOnBackdrop }) {
    const root = ensureRoot();
    const panel = qs(".uimodal-panel", root);
    const titleEl = qs("#uimodal-title", root);
    const bodyEl = qs("#uimodal-body", root);
    const footerEl = qs("#uimodal-footer", root);

    lastActive = document.activeElement;

    titleEl.textContent = title || "";
    bodyEl.innerHTML = "";
    footerEl.innerHTML = "";

    if (bodyNode) bodyEl.appendChild(bodyNode);
    for (const b of buttons) footerEl.appendChild(b);

    root.hidden = false;

    const untrap = trapFocus(panel);

    function close(reason = "close") {
      root.hidden = true;
      document.removeEventListener("keydown", onKey);
      root.removeEventListener("click", onClick);
      untrap();

      queueMicrotask(() => lastActive && lastActive.focus && lastActive.focus());

      const r = currentResolve;
      currentResolve = null;
      closeFns = null;
      if (r) r(reason);
    }

    function onClick(e) {
      const hit = e.target && e.target.closest && e.target.closest("[data-uimodal-close]");
      if (!hit) return;
      if (!closeOnBackdrop && hit.classList.contains("uimodal-backdrop")) return;
      close("dismiss");
    }

    function onKey(e) {
      if (e.key === "Escape") close("escape");
    }

    root.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);

    queueMicrotask(() => {
      const focusTarget = focusSelector ? qs(focusSelector, root) : null;
      (focusTarget || panel).focus();
    });

    closeFns = { close };
    return { close };
  }

  function btn(text, { kind = "ghost", danger = false, onClick } = {}) {
    const cls = ["uimodal-btn", kind];
    if (danger) cls.push("danger");
    return el("button", { type: "button", class: cls.join(" "), text, onclick: onClick });
  }

  // API pública
  const UIModal = {
    alert(message, opts = {}) {
      const { title = "Avís", okText = "D’acord", closeOnBackdrop = true } = opts;

      return new Promise((resolve) => {
        currentResolve = () => resolve();

        const body = el("div", {}, [el("p", { text: message ?? "" })]);

        const ok = btn(okText, {
          kind: "primary",
          onClick: () => closeFns && closeFns.close("ok")
        });

        openModal({
          title,
          bodyNode: body,
          buttons: [ok],
          focusSelector: ".uimodal-btn.primary",
          closeOnBackdrop
        });
      });
    },

    confirm(message, opts = {}) {
      const {
        title = "Confirmació",
        okText = "Sí",
        cancelText = "No",
        danger = false,
        closeOnBackdrop = true
      } = opts;

      return new Promise((resolve) => {
        currentResolve = () => resolve(false);

        const body = el("div", {}, [el("p", { text: message ?? "" })]);

        const cancel = btn(cancelText, {
          kind: "ghost",
          onClick: () => { resolve(false); closeFns && closeFns.close("cancel"); }
        });

        const ok = btn(okText, {
          kind: "primary",
          danger,
          onClick: () => { resolve(true); closeFns && closeFns.close("ok"); }
        });

        openModal({
          title,
          bodyNode: body,
          buttons: [cancel, ok],
          focusSelector: ".uimodal-btn.primary",
          closeOnBackdrop
        });
      });
    },

    prompt(message, opts = {}) {
      const {
        title = "Entrada",
        placeholder = "",
        defaultValue = "",
        okText = "Acceptar",
        cancelText = "Cancel·lar",
        type = "text",
        required = false,
        closeOnBackdrop = true
      } = opts;

      return new Promise((resolve) => {
        currentResolve = () => resolve(null);

        const input = el("input", {
          class: "uimodal-input",
          type,
          placeholder,
          value: defaultValue
        });

        const hint = el("div", { class: "uimodal-hint", text: "Enter accepta, Esc cancel·la." });

        const body = el("div", {}, [
          el("p", { text: message ?? "" }),
          input,
          hint
        ]);

        function accept() {
          const v = input.value ?? "";
          if (required && !v.trim()) { input.focus(); return; }
          resolve(v);
          closeFns && closeFns.close("ok");
        }

        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") accept();
        });

        const cancel = btn(cancelText, {
          kind: "ghost",
          onClick: () => { resolve(null); closeFns && closeFns.close("cancel"); }
        });

        const ok = btn(okText, {
          kind: "primary",
          onClick: accept
        });

        openModal({
          title,
          bodyNode: body,
          buttons: [cancel, ok],
          focusSelector: ".uimodal-input",
          closeOnBackdrop
        });

        queueMicrotask(() => input.focus());
      });
    },

    // Tema: "system" | "light" | "dark"
    setTheme(theme) {
      if (theme === "system") {
        document.documentElement.removeAttribute("data-uimodal-theme");
        localStorage.removeItem("uimodal-theme");
      } else {
        document.documentElement.setAttribute("data-uimodal-theme", theme);
        localStorage.setItem("uimodal-theme", theme);
      }
    },

    initTheme() {
      const saved = localStorage.getItem("uimodal-theme");
      if (saved === "light" || saved === "dark") this.setTheme(saved);
    }
  };

  // export global
  window.UIModal = UIModal;

  // init automàtic tema si volen
  document.addEventListener("DOMContentLoaded", () => {
    try { UIModal.initTheme(); } catch (_) {}
  });
})();
