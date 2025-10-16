(function () {
  'use strict';

  const ACTIONS = {
    'play-preview': handlePlayPreview,
    'copy': handleCopy,
    'share': handleShare,
    'favorite': handleFavorite,
    'open-modal': handleOpenModal
  };

  // Inicializa: delegação de evento e ativação de botões estáticos
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    // Ignora se já tiver handler explícito (ex.: onclick inline)
    if (btn._hasExplicitHandler) return;

    const action = btn.dataset.action;
    if (action && ACTIONS[action]) {
      e.preventDefault();
      try { ACTIONS[action](btn, e); } catch (err) { console.error('Ação falhou:', err); }
      return;
    }

    // Se não tem data-action, aplica comportamento padrão
    applyDefaultBehavior(btn, e);
  }, true);

  // Marca botões que possuem handlers inline (simple detection)
  Array.from(document.querySelectorAll('button')).forEach((b) => {
    if (b.getAttribute('onclick') || getEventListenerFlag(b)) b._hasExplicitHandler = true;
  });

  // ----- Implementações de ações comuns -----

  function handlePlayPreview(btn) {
    const src = btn.dataset.src;
    if (!src) { showTempMessage(btn, 'Preview indisponível'); return; }
    let audio = btn._audio;
    if (!audio) {
      audio = new Audio(src);
      btn._audio = audio;
    }
    if (audio.paused) { audio.play().catch(() => showTempMessage(btn, 'Erro ao tocar')); setAriaPressed(btn, true); }
    else { audio.pause(); setAriaPressed(btn, false); }
  }

  function handleCopy(btn) {
    const text = btn.dataset.copy || btn.innerText || btn.value;
    if (!text) { showTempMessage(btn, 'Nada para copiar'); return; }
    navigator.clipboard?.writeText(text).then(
      () => showTempMessage(btn, 'Copiado'),
      () => showTempMessage(btn, 'Falha ao copiar')
    );
  }

  function handleShare(btn) {
    const url = btn.dataset.url || window.location.href;
    const title = btn.dataset.title || document.title;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => showTempMessage(btn, 'Compartilhamento cancelado'));
    } else {
      // fallback: copia URL
      navigator.clipboard?.writeText(url).then(
        () => showTempMessage(btn, 'Link copiado'),
        () => showTempMessage(btn, 'Não foi possível compartilhar')
      );
    }
  }

  function handleFavorite(btn) {
    const key = btn.dataset.key || null;
    const pressed = btn.getAttribute('aria-pressed') === 'true';
    setAriaPressed(btn, !pressed);
    showTempMessage(btn, pressed ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    // opcional: persistir em localStorage
    if (key) {
      const favs = JSON.parse(localStorage.getItem('favs::cifras') || '{}');
      if (!pressed) favs[key] = true; else delete favs[key];
      localStorage.setItem('favs::cifras', JSON.stringify(favs));
    }
  }

  function handleOpenModal(btn) {
    const selector = btn.dataset.target;
    if (!selector) { showTempMessage(btn, 'Modal não especificado'); return; }
    const modal = document.querySelector(selector);
    if (!modal) { showTempMessage(btn, 'Modal não encontrado'); return; }
    openModal(modal);
  }

  // ----- Utilitários -----

  function applyDefaultBehavior(btn, e) {
    e.preventDefault();
    ripple(btn, e);
    showTempMessage(btn, 'Botão sem função — personalize com data-action');
    console.info('Botão sem ação clicado:', btn);
  }

  function ripple(btn, e) {
    try {
      const rect = btn.getBoundingClientRect();
      const r = document.createElement('span');
      r.className = 'cc-ripple';
      const size = Math.max(rect.width, rect.height) * 1.2;
      r.style.position = 'absolute';
      r.style.pointerEvents = 'none';
      r.style.width = r.style.height = size + 'px';
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      r.style.borderRadius = '50%';
      r.style.background = 'rgba(0,0,0,0.15)';
      r.style.transform = 'scale(0)';
      r.style.transition = 'transform 500ms, opacity 500ms';
      btn.style.position = getComputedStyle(btn).position === 'static' ? 'relative' : btn.style.position;
      btn.appendChild(r);
      requestAnimationFrame(() => { r.style.transform = 'scale(1)'; r.style.opacity = '0'; });
      setTimeout(() => r.remove(), 600);
    } catch (err) { /* não crítico */ }
  }

  function showTempMessage(btn, msg, ms = 1200) {
    const tip = document.createElement('div');
    tip.className = 'cc-temp-msg';
    tip.textContent = msg;
    Object.assign(tip.style, {
      position: 'absolute',
      top: '-2.4em',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#222',
      color: '#fff',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      pointerEvents: 'none',
      zIndex: 9999,
      opacity: '0',
      transition: 'opacity 150ms'
    });
    btn.style.position = getComputedStyle(btn).position === 'static' ? 'relative' : btn.style.position;
    btn.appendChild(tip);
    requestAnimationFrame(() => tip.style.opacity = '1');
    setTimeout(() => { tip.style.opacity = '0'; setTimeout(() => tip.remove(), 150); }, ms);
  }

  function setAriaPressed(btn, value) {
    btn.setAttribute('aria-pressed', value ? 'true' : 'false');
  }

  function openModal(modal) {
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    // foco e close básico
    const focusable = modal.querySelector('[tabindex], button, a, input') || modal;
    focusable.focus?.();
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) closeModal(modal);
    }, { once: true });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { closeModal(modal); document.removeEventListener('keydown', esc); }
    });
  }

  function closeModal(modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  function getEventListenerFlag(node) {
    // heurística: detecta se elemento tem atributos data-listener ou role que sugiram handler
    return node.dataset.listener === 'true' || node.hasAttribute('data-has-listener') || false;
  }

  // Expor função para registro manual de actions adicionais
  window.CCButtonActions = {
    register: (name, fn) => { if (typeof fn === 'function') ACTIONS[name] = fn; }
  };

  // ...existing code...
})();