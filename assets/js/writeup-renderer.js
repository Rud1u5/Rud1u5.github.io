// ============================================================
//  Rud1u5 Portfolio — writeup-renderer.js
//  Renderiza dinámicamente el contenido Markdown (.md)
// ============================================================

(function () {
  // 1. Obtener el parámetro 'id' de la URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    // Si no hay ID, redirigir al baúl de writeups
    window.location.href = 'writeups.html';
    return;
  }

  // 2. Buscar la máquina en los metadatos cargados desde writeups-data.js
  const machine = typeof WRITEUPS !== 'undefined' ? WRITEUPS.find(m => m.id === id) : null;

  if (!machine) {
    document.getElementById('writeup-body').innerHTML = `
      <p style="color:var(--red); font-weight:bold; margin-top:2rem;">
        [!] Error: No metadata found for the machine "${id}".
      </p>
      <p style="color:var(--text-dim); margin-top:0.5rem;">
        Make sure it is registered in assets/js/writeups-data.js.
      </p>
    `;
    return;
  }

  // 3. Establecer el título de la pestaña dinámicamente
  document.title = `${machine.title} Writeup // Rud1u5`;

  // 4. Renderizar la cabecera dinámica de la máquina
  const headerContainer = document.getElementById('writeup-header-container');
  if (headerContainer) {
    const diffClass = `diff-${machine.difficulty}`;
    const platClass = (typeof PLAT_CLASS !== 'undefined' && PLAT_CLASS[machine.platform]) || 'plat-htb';
    const diffLabel = (typeof DIFF_MAP !== 'undefined' && DIFF_MAP[machine.difficulty]) || machine.difficulty;
    const osIcon = (typeof OS_ICONS !== 'undefined' && OS_ICONS[machine.os]) || '💻';
    const osLabel = machine.os ? machine.os.charAt(0).toUpperCase() + machine.os.slice(1) : '';
    const typeIcon = machine.type === 'machine'
      ? '<i class="fa fa-server"></i>'
      : machine.type === 'challenge'
        ? '<i class="fa fa-puzzle-piece"></i>'
        : '';
    const typeLabel = machine.type ? machine.type.charAt(0).toUpperCase() + machine.type.slice(1) : '';
    const typeBadgeHtml = (machine.type)
      ? `<span class="type-os-badge">${typeIcon} ${typeLabel}</span>`
      : '';
    const tagsHtml = (machine.tags || []).map(t => `<span class="tag">${t}</span>`).join('\n');

    const platformLogo = (typeof PLAT_LOGOS !== 'undefined' && PLAT_LOGOS[machine.platform]) || 'Hackthebox-Logo.svg';

    headerContainer.innerHTML = `
      <div class="writeup-header">
        ${machine.avatar ? `<img src="${machine.avatar}" class="machine-avatar-large" alt="${machine.title}" />` : ''}
        <div style="flex: 1;">
          <h1>${machine.title}</h1>
          <div class="card-meta" style="margin-bottom:0.8rem">
            <img src="../assets/icon/${platformLogo}" class="writeup-platform-logo" alt="${machine.platform}" />
             <span class="diff-badge ${diffClass}">${diffLabel}</span>
             ${typeBadgeHtml}
             ${machine.os ? `<span class="os-badge">${osIcon} ${osLabel}</span>` : ''}
             ${machine.category ? `<span class="os-badge">${machine.category.charAt(0).toUpperCase() + machine.category.slice(1)}</span>` : ''}
            ${machine.release_date || machine.completed_date ? `
              <div class="writeup-dates">
                ${machine.release_date ? `<span>Release: ${machine.release_date}</span>` : ''}
                ${machine.completed_date ? `<span>Completed: ${machine.completed_date}</span>` : ''}
              </div>
            ` : `
              <span class="card-date">${machine.date}</span>
            `}
          </div>
          <div class="card-tags">
            ${tagsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // 5. Cargar contenido — con soporte para writeups bloqueados
  const writeupBody = document.getElementById('writeup-body');

  if (machine.locked) {
    const isChallenge = machine.type === 'challenge';
    const targetTypeStr = isChallenge ? 'challenge' : 'machine';
    const flagTypeStr   = isChallenge ? 'challenge flag' : 'root flag';
    const subtitleText  = `Active ${targetTypeStr} — enter the ${flagTypeStr} to access the writeup. Once retired, it will become public.`;

    // ── WRITEUP BLOQUEADO: mostrar pantalla de unlock ──────────
    writeupBody.innerHTML = `
      <div class="unlock-terminal writeup-unlocked" id="unlockTerminal">
        <div class="unlock-bar">
          <div class="unlock-bar-dots">
            <span class="d-red"></span>
            <span class="d-yellow"></span>
            <span class="d-green"></span>
          </div>
          <span>bash — unlock_writeup.sh — ${machine.title}</span>
        </div>
        <div class="unlock-body">
          <div class="unlock-icon-row">
            <span class="unlock-lock-icon"><i class="fa-solid fa-lock"></i></span>
            <div>
              <div class="unlock-title">WRITEUP LOCKED</div>
              <div class="unlock-subtitle">${subtitleText}</div>
            </div>
          </div>
          <div class="unlock-prompt-line">
            <span class="t-prompt">$</span>
            <span class="t-cmd">./unlock_writeup.sh --${targetTypeStr} ${machine.id}</span>
          </div>
          <div class="unlock-input-group">
            <input
              class="unlock-input"
              id="flagInput"
              type="text"
              placeholder="${isChallenge ? 'HTB{...} / Flag' : 'HTB{...} / Root flag'}"
              autocomplete="off"
              spellcheck="false"
            />
            <button class="unlock-btn" id="unlockBtn" onclick="attemptUnlock()">
              [ UNLOCK ]
            </button>
          </div>
          <div class="unlock-error" id="unlockError">
            [!] Access denied — wrong flag.
          </div>
        </div>
      </div>
    `;

    // Cargar el archivo .md cifrado en memoria para usarlo al desbloquear
    let encryptedBlob = null;
    fetch(`../writeups/${machine.id}.md`)
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(text => { encryptedBlob = text.trim(); })
      .catch(() => { encryptedBlob = null; });

    // Permitir Enter en el input
    document.getElementById('flagInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') attemptUnlock();
    });

    window.attemptUnlock = function () {
      const flag = document.getElementById('flagInput').value.trim();
      const terminal = document.getElementById('unlockTerminal');
      const errorEl = document.getElementById('unlockError');
      const btn = document.getElementById('unlockBtn');

      if (!flag) return;
      if (!encryptedBlob) {
        errorEl.textContent = '[!] Error — no se pudo cargar el archivo cifrado.';
        errorEl.classList.add('visible');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Verificando...';

      try {
        const bytes = CryptoJS.AES.decrypt(encryptedBlob, flag);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted || decrypted.length < 10) {
          throw new Error('wrong flag');
        }

        // ✅ FLAG CORRECTA — renderizar contenido
        let body = decrypted;
        if (decrypted.startsWith('---')) {
          const parts = decrypted.split('---');
          if (parts.length >= 3) body = parts.slice(2).join('---').trim();
        }

        const htmlContent = marked.parse(body);
        writeupBody.innerHTML = `<div class="writeup-unlocked">${htmlContent}</div>`;
        formatCallouts(writeupBody);
        highlightComments(writeupBody);
        addCopyButtons(writeupBody);
        renderMermaidDiagrams(writeupBody);
        if (typeof hljs !== 'undefined') { hljs.highlightAll(); }

      } catch (err) {
        // ❌ FLAG INCORRECTA — shake + mensaje de error
        terminal.classList.remove('shake');
        terminal.classList.remove('writeup-unlocked');
        void terminal.offsetWidth; // reflow para reiniciar animación
        terminal.classList.add('shake');
        setTimeout(() => terminal.classList.remove('shake'), 600);

        errorEl.classList.add('visible');
        btn.disabled = false;
        btn.textContent = '[ UNLOCK ]';
      }
    };

  } else {
    // ── WRITEUP PÚBLICO: flujo normal ──────────────────────────
    fetch(`../writeups/${machine.id}.md`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => {
        let body = text;
        if (text.startsWith('---')) {
          const parts = text.split('---');
          if (parts.length >= 3) body = parts.slice(2).join('---').trim();
        }
        if (typeof marked !== 'undefined') {
          writeupBody.innerHTML = `<div class="writeup-unlocked">${marked.parse(body)}</div>`;
          formatCallouts(writeupBody);
          highlightComments(writeupBody);
          addCopyButtons(writeupBody);
          renderMermaidDiagrams(writeupBody);
          if (typeof hljs !== 'undefined') { hljs.highlightAll(); }
        } else {
          throw new Error('La librería "marked" no se cargó.');
        }
      })
      .catch(err => {
        console.error('Error cargando writeup:', err);
        writeupBody.innerHTML = `
          <p style="color:var(--red); font-weight:bold; margin-top:2rem;">
            [!] Error loading the notes file.
          </p>
          <p style="color:var(--text-dim); margin-top:0.5rem; font-size:0.8rem;">
            Details: ${err.message}
          </p>
          <p style="color:var(--text-dim); font-size:0.8rem;">
            Path searched: writeups/${machine.id}.md
          </p>
        `;
      });
  }


  function highlightComments(container) {
    container.querySelectorAll('pre code').forEach(codeBlock => {
      const text = codeBlock.innerHTML;
      const lines = text.split('\n');
      const highlightedLines = lines.map(line => {
        const trimmed = line.trim();
        // Detectar si la línea comienza con '#' (evitando entidades HTML) o '//'
        if ((trimmed.startsWith('#') && !trimmed.startsWith('&#')) || trimmed.startsWith('//')) {
          return `<span class="code-comment">${line}</span>`;
        }
        return line;
      });
      codeBlock.innerHTML = highlightedLines.join('\n');
    });
  }

  function addCopyButtons(container) {
    container.querySelectorAll('pre').forEach(pre => {
      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code');

      btn.addEventListener('click', () => {
        const codeElement = pre.querySelector('code');
        const textToCopy = codeElement ? codeElement.innerText : pre.innerText;

        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.textContent = 'Copy';
              btn.classList.remove('copied');
            }, 2000);
          })
          .catch(err => {
            console.error('Error copying:', err);
            btn.textContent = 'Error';
          });
      });

      pre.appendChild(btn);
    });
  }

  function formatCallouts(container) {
    container.querySelectorAll('blockquote').forEach(bq => {
      const firstP = bq.querySelector('p');
      if (firstP) {
        const text = firstP.innerHTML;
        // Detecta patrones como [!INFO] o [!WARNING] (con o sin guion de colapsado)
        const match = text.match(/^\[!(INFO|WARNING|NOTE|TIP|IMPORTANT|CAUTION)\]-?\s*(.*)/i);
        if (match) {
          const type = match[1].toLowerCase();
          const title = match[2] || type.toUpperCase();

          bq.classList.add('callout', `callout-${type}`);

          // Reemplaza el texto feo literal con un título formateado y estilizado
          firstP.innerHTML = `<strong class="callout-title">// ${title}</strong>`;
        }
      }
    });
  }

  function renderMermaidDiagrams(container) {
    if (typeof mermaid !== 'undefined') {
      // 1. Configurar mermaid (tema oscuro)
      mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      
      // 2. Buscar todos los bloques que marked generó como <code class="language-mermaid">
      const mermaidBlocks = container.querySelectorAll('code.language-mermaid');
      if (mermaidBlocks.length === 0) return;

      mermaidBlocks.forEach((block) => {
        const pre = block.parentElement;
        // Solo si el padre directo es un <pre> (generado por marked.js)
        if (pre && pre.tagName === 'PRE') {
          const div = document.createElement('div');
          div.className = 'mermaid';
          div.textContent = block.textContent;
          div.style.textAlign = 'center';
          div.style.margin = '2rem 0';
          // Reemplazar el <pre> por el <div> de mermaid
          pre.parentNode.replaceChild(div, pre);
        }
      });

      // 3. Renderizar todos los div.mermaid a SVG
      mermaid.init(undefined, container.querySelectorAll('.mermaid'));
    }
  }
})();
