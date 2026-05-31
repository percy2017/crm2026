(function () {
  'use strict';

  var styles = '\n\
#crm-widget-btn {\n\
  position: fixed;\n\
  bottom: 20px;\n\
  z-index: 999999;\n\
  width: 56px;\n\
  height: 56px;\n\
  border-radius: 50%;\n\
  border: none;\n\
  cursor: pointer;\n\
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  transition: transform 0.2s, opacity 0.2s;\n\
  color: #fff;\n\
}\n\
#crm-widget-btn:hover { transform: scale(1.1); }\n\
#crm-widget-btn svg { width: 28px; height: 28px; }\n\
#crm-widget-panel {\n\
  position: fixed;\n\
  bottom: 90px;\n\
  z-index: 999998;\n\
  width: 360px;\n\
  height: 520px;\n\
  border-radius: 16px;\n\
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);\n\
  display: none;\n\
  flex-direction: column;\n\
  overflow: hidden;\n\
  background: #fff;\n\
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n\
}\n\
#crm-widget-panel.open { display: flex; }\n\
#crm-widget-header {\n\
  padding: 14px 16px;\n\
  color: #fff;\n\
  font-weight: 600;\n\
  font-size: 15px;\n\
  display: flex;\n\
  justify-content: space-between;\n\
  align-items: center;\n\
}\n\
#crm-widget-close {\n\
  background: none;\n\
  border: none;\n\
  color: #fff;\n\
  cursor: pointer;\n\
  padding: 4px;\n\
  opacity: 0.8;\n\
  font-size: 20px;\n\
  line-height: 1;\n\
}\n\
#crm-widget-close:hover { opacity: 1; }\n\
#crm-widget-greeting {\n\
  padding: 16px;\n\
  font-size: 14px;\n\
  color: #555;\n\
  text-align: center;\n\
  border-bottom: 1px solid #eee;\n\
}\n\
#crm-widget-messages {\n\
  flex: 1;\n\
  overflow-y: auto;\n\
  padding: 12px;\n\
  display: flex;\n\
  flex-direction: column;\n\
  gap: 8px;\n\
}\n\
.crm-msg {\n\
  max-width: 80%;\n\
  padding: 10px 14px;\n\
  border-radius: 16px;\n\
  font-size: 14px;\n\
  line-height: 1.4;\n\
  word-wrap: break-word;\n\
}\n\
.crm-msg-visitor {\n\
  align-self: flex-end;\n\
  background: #e3f2fd;\n\
  border-bottom-right-radius: 4px;\n\
}\n\
.crm-msg-agent {\n\
  align-self: flex-start;\n\
  background: #f5f5f5;\n\
  border-bottom-left-radius: 4px;\n\
}\n\
.crm-msg-time {\n\
  font-size: 11px;\n\
  color: #999;\n\
  margin-top: 4px;\n\
}\n\
#crm-widget-input-area {\n\
  display: flex;\n\
  padding: 10px 12px;\n\
  border-top: 1px solid #eee;\n\
  gap: 8px;\n\
  background: #fafafa;\n\
}\n\
#crm-widget-input {\n\
  flex: 1;\n\
  border: 1px solid #ddd;\n\
  border-radius: 20px;\n\
  padding: 10px 14px;\n\
  font-size: 14px;\n\
  outline: none;\n\
}\n\
#crm-widget-input:focus { border-color: var(--crm-color, #3b82f6); }\n\
#crm-widget-send {\n\
  background: var(--crm-color, #3b82f6);\n\
  border: none;\n\
  color: #fff;\n\
  border-radius: 50%;\n\
  width: 40px;\n\
  height: 40px;\n\
  cursor: pointer;\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  flex-shrink: 0;\n\
}\n\
#crm-widget-send:hover { opacity: 0.9; }\n\
#crm-widget-send svg { width: 18px; height: 18px; }\n\
@media (max-width: 480px) {\n\
  #crm-widget-panel {\n\
    width: 100vw;\n\
    height: 100vh;\n\
    bottom: 0;\n\
    right: 0 !important;\n\
    left: 0 !important;\n\
    border-radius: 0;\n\
  }\n\
}\n';

  var styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  var opts = window.CrmWidgetOptions || {};

  var position = opts.position || 'right';
  var color = opts.color || '#3b82f6';
  var greeting = opts.greeting || 'Hola, ¿en qué podemos ayudarte?';
  var server = opts.server || window.location.origin;
  var widgetId = null;
  var visitorId = null;
  var conversationId = null;
  var pollInterval = null;

  var chatIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var sendIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  var btn = document.createElement('button');
  btn.id = 'crm-widget-btn';
  btn.style.backgroundColor = color;
  btn.style[position] = '20px';
  btn.innerHTML = chatIcon;
  btn.setAttribute('aria-label', 'Open chat');
  document.body.appendChild(btn);

  var panel = document.createElement('div');
  panel.id = 'crm-widget-panel';
  panel.style[position] = '20px';
  panel.style.setProperty('--crm-color', color);
  document.body.appendChild(panel);

  panel.innerHTML = '\
    <div id="crm-widget-header" style="background:' + color + '">\
      <span>Chat</span>\
      <button id="crm-widget-close">' + closeIcon + '</button>\
    </div>\
    <div id="crm-widget-greeting">' + greeting + '</div>\
    <div id="crm-widget-messages"></div>\
    <div id="crm-widget-input-area">\
      <input id="crm-widget-input" type="text" placeholder="Escribe un mensaje..." />\
      <button id="crm-widget-send">' + sendIcon + '</button>\
    </div>\
  ';

  var messagesEl = panel.querySelector('#crm-widget-messages');
  var inputEl = panel.querySelector('#crm-widget-input');
  var sendBtn = panel.querySelector('#crm-widget-send');
  var closeBtn = panel.querySelector('#crm-widget-close');
  var greetingEl = panel.querySelector('#crm-widget-greeting');

  function getUuid() {
    var uuid = localStorage.getItem('crm_widget_uuid');
    if (!uuid) {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
      localStorage.setItem('crm_widget_uuid', uuid);
    }
    return uuid;
  }

  function api(path, opts = {}) {
    return fetch(server + '/api/widget' + path, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) { return r.ok ? r.json() : null; });
  }

  function init() {
    api('/config').then(function (data) {
      if (!data) return;
      widgetId = data.widget_id;
      color = data.color || color;
      position = data.position || position;
      greeting = data.greeting || greeting;
      btn.style.backgroundColor = color;
      panel.style.setProperty('--crm-color', color);
      panel.querySelector('#crm-widget-header').style.backgroundColor = color;
      greetingEl.textContent = greeting;
      btn.style[position] = '20px';
      panel.style[position] = '20px';

      var uuid = getUuid();
      api('/visitor', {
        method: 'POST',
        body: { uuid: uuid, current_page: window.location.href },
      }).then(function (data) {
        if (!data) return;
        visitorId = data.visitor.id;
      });
    });
  }

  function addMessage(content, isVisitor) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'crm-msg ' + (isVisitor ? 'crm-msg-visitor' : 'crm-msg-agent');
    msgDiv.textContent = content;
    var timeDiv = document.createElement('div');
    timeDiv.className = 'crm-msg-time';
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgDiv.appendChild(timeDiv);
    messagesEl.appendChild(msgDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function openChat() {
    panel.classList.add('open');
    btn.innerHTML = closeIcon;
    btn.setAttribute('aria-label', 'Close chat');
    messagesEl.innerHTML = '';

    if (!visitorId) {
      greetingEl.style.display = 'block';
      return;
    }

    api('/conversations?visitor_id=' + visitorId).then(function (data) {
      if (!data || !data.conversation) {
        greetingEl.style.display = 'block';
        return;
      }
      greetingEl.style.display = 'none';
      conversationId = data.conversation.id;
      data.conversation.messages.forEach(function (m) {
        addMessage(m.content, m.is_from_visitor);
      });
      startPolling();
    });
  }

  function closeChat() {
    panel.classList.remove('open');
    btn.innerHTML = chatIcon;
    btn.setAttribute('aria-label', 'Open chat');
    stopPolling();
  }

  function startPolling() {
    stopPolling();
    pollInterval = setInterval(function () {
      if (!conversationId) return;
      api('/conversations?visitor_id=' + visitorId).then(function (data) {
        if (!data || !data.conversation) return;
        var existing = messagesEl.querySelectorAll('.crm-msg').length - 1;
        var serverCount = data.conversation.messages.length;
        if (serverCount > existing) {
          messagesEl.innerHTML = '';
          data.conversation.messages.forEach(function (m) {
            addMessage(m.content, m.is_from_visitor);
          });
        }
      });
    }, 3000);
  }

  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  function sendMessage() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';

    if (!conversationId) {
      if (!widgetId || !visitorId) return;
      api('/conversations', {
        method: 'POST',
        body: { visitor_id: visitorId, widget_id: widgetId, message: text },
      }).then(function (data) {
        if (!data) return;
        conversationId = data.conversation.id;
        greetingEl.style.display = 'none';
        addMessage(text, true);
        startPolling();
      });
    } else {
      addMessage(text, true);
      api('/messages', {
        method: 'POST',
        body: { conversation_id: conversationId, content: text },
      });
    }
  }

  btn.addEventListener('click', function () {
    if (panel.classList.contains('open')) { closeChat(); }
    else { openChat(); }
  });

  closeBtn.addEventListener('click', closeChat);

  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });

  init();
})();
