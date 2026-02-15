(function initUiNamespace() {
  window.GameHub = window.GameHub || {};

  const refs = {
    menuView: document.getElementById('menuView'),
    gameView: document.getElementById('gameView'),
    gameTitle: document.getElementById('gameTitle'),
    backToMenuBtn: document.getElementById('backToMenu'),
    menuButtons: document.querySelectorAll('.menu-btn'),
    layout: document.querySelector('.layout'),
    panel: document.querySelector('.panel'),
    sidePanel: document.getElementById('sidePanel'),
    mainCanvas: document.getElementById('mainCanvas'),
    nextCard: document.getElementById('nextCard'),
    nextCanvas: document.getElementById('nextCanvas'),
    settingsCard: document.getElementById('settingsCard'),
    settingsContainer: document.getElementById('settingsContainer'),
    statusList: document.getElementById('statusList'),
    controlsList: document.getElementById('controlsList'),
    stateText: document.getElementById('stateText'),
    mobileControls: document.getElementById('mobileControls'),
    infoDrawer: document.getElementById('infoDrawer'),
    infoDrawerContent: document.getElementById('infoDrawerContent'),
    infoToggleBtn: document.getElementById('infoToggleBtn'),
    orientationOverlay: document.getElementById('orientationOverlay'),
    orientationMessage: document.getElementById('orientationMessage'),
    continuePortraitBtn: document.getElementById('continuePortraitBtn')
  };

  refs.mainCtx = refs.mainCanvas.getContext('2d');
  refs.nextCtx = refs.nextCanvas.getContext('2d');

  const ui = {
    setCanvasSize(width, height) {
      refs.mainCanvas.width = width;
      refs.mainCanvas.height = height;
    },

    clearMainCanvas() {
      refs.mainCtx.clearRect(0, 0, refs.mainCanvas.width, refs.mainCanvas.height);
    },

    setTitle(text) {
      refs.gameTitle.textContent = text;
    },

    setState(text) {
      refs.stateText.textContent = text;
    },

    setStatus(items) {
      refs.statusList.innerHTML = '';
      items.forEach((item) => {
        const p = document.createElement('p');
        p.textContent = `${item.label}：${item.value}`;
        refs.statusList.appendChild(p);
      });
    },

    setControls(lines) {
      refs.controlsList.innerHTML = '';
      lines.forEach((line) => {
        const p = document.createElement('p');
        p.textContent = line;
        refs.controlsList.appendChild(p);
      });
    },

    showNextCanvas(visible) {
      refs.nextCard.classList.toggle('hidden', !visible);
      if (!visible) {
        refs.nextCtx.clearRect(0, 0, refs.nextCanvas.width, refs.nextCanvas.height);
      }
    },

    setSettings(defs) {
      refs.settingsContainer.innerHTML = '';
      refs.settingsCard.classList.toggle('hidden', defs.length === 0);

      defs.forEach((def) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toggle-btn';
        btn.setAttribute('aria-pressed', String(def.enabled));
        btn.textContent = `${def.label}：${def.enabled ? '开' : '关'}`;
        btn.addEventListener('click', () => {
          def.onToggle();
        });
        refs.settingsContainer.appendChild(btn);
      });
    },

    setMobileControls(config) {
      refs.mobileControls.innerHTML = '';

      if (!config || !Array.isArray(config.rows) || config.rows.length === 0) {
        refs.mobileControls.className = 'mobile-controls hidden';
        return;
      }

      refs.mobileControls.className = 'mobile-controls';
      if (config.gameKey) {
        refs.mobileControls.classList.add(`mobile-controls--${config.gameKey}`);
      }
      refs.mobileControls.classList.add(
        config.layout === 'landscape' ? 'mobile-layout--landscape' : 'mobile-layout--portrait'
      );

      const hasDpad = config.rows.some((row) => {
        if (Array.isArray(row)) {
          return row.some((btn) => btn.pos);
        }
        return row && row.role === 'dpad';
      });
      refs.mobileControls.classList.add(hasDpad ? 'mobile-controls--has-dpad' : 'mobile-controls--actions-only');

      config.rows.forEach((rowDef) => {
        const buttons = Array.isArray(rowDef) ? rowDef : rowDef.buttons || [];
        if (!buttons.length) {
          return;
        }
        const rowRole = Array.isArray(rowDef) ? 'actions' : rowDef.role || 'actions';
        const rowEl = document.createElement('div');
        rowEl.className = 'mobile-row';
        rowEl.classList.add(`mobile-row--${rowRole}`);

        buttons.forEach((def) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'mobile-btn';
          if (def.pos) {
            btn.classList.add(`mobile-btn--dpad-${def.pos}`);
          } else {
            btn.classList.add('mobile-btn--action');
          }
          if (def.variant === 'warn') {
            btn.classList.add('mobile-btn--warn');
          }
          if (def.variant === 'accent') {
            btn.classList.add('mobile-btn--accent');
          }
          btn.textContent = def.label;
          btn.setAttribute('data-action', def.action);
          btn.setAttribute('data-repeat', def.repeat ? '1' : '0');
          rowEl.appendChild(btn);
        });

        refs.mobileControls.appendChild(rowEl);
      });
    },

    setOrientationOverlay(visible, message) {
      refs.orientationOverlay.classList.toggle('hidden', !visible);
      if (message) {
        refs.orientationMessage.textContent = message;
      }
    },

    setInfoDrawer(showButton, open) {
      refs.infoToggleBtn.classList.toggle('hidden', !showButton);
      refs.infoToggleBtn.setAttribute('aria-expanded', String(Boolean(open)));

      if (showButton && open) {
        if (refs.sidePanel.parentElement !== refs.infoDrawerContent) {
          refs.infoDrawerContent.appendChild(refs.sidePanel);
        }
      } else if (refs.sidePanel.parentElement !== refs.layout) {
        refs.layout.appendChild(refs.sidePanel);
      }

      refs.infoDrawer.classList.toggle('hidden', !showButton || !open);
      refs.infoDrawer.classList.toggle('info-drawer--open', showButton && open);
    },

    setFloatingNext(visible) {
      if (visible) {
        if (refs.nextCard.parentElement !== refs.panel) {
          refs.panel.appendChild(refs.nextCard);
        }
      } else if (refs.nextCard.parentElement !== refs.sidePanel) {
        refs.sidePanel.insertBefore(refs.nextCard, refs.settingsCard);
      }
      refs.nextCard.classList.toggle('floating-next', visible);
    },

    resetPanels() {
      this.showNextCanvas(false);
      this.setSettings([]);
      this.setStatus([]);
      this.setControls([]);
      this.setState('准备开始');
      this.setMobileControls(null);
      this.setInfoDrawer(false, false);
      this.setFloatingNext(false);
      this.setOrientationOverlay(false);
    }
  };

  window.GameHub.refs = refs;
  window.GameHub.ui = ui;
})();
