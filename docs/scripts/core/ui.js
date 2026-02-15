(function initUiNamespace() {
  window.GameHub = window.GameHub || {};

  const refs = {
    menuView: document.getElementById('menuView'),
    gameView: document.getElementById('gameView'),
    gameTitle: document.getElementById('gameTitle'),
    backToMenuBtn: document.getElementById('backToMenu'),
    menuButtons: document.querySelectorAll('.menu-btn'),
    mainCanvas: document.getElementById('mainCanvas'),
    nextCard: document.getElementById('nextCard'),
    nextCanvas: document.getElementById('nextCanvas'),
    settingsCard: document.getElementById('settingsCard'),
    settingsContainer: document.getElementById('settingsContainer'),
    statusList: document.getElementById('statusList'),
    controlsList: document.getElementById('controlsList'),
    stateText: document.getElementById('stateText')
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

    resetPanels() {
      this.showNextCanvas(false);
      this.setSettings([]);
      this.setStatus([]);
      this.setControls([]);
      this.setState('准备开始');
    }
  };

  window.GameHub.refs = refs;
  window.GameHub.ui = ui;
})();
