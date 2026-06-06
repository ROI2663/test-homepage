// Hamburger menu
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

function closeMenu() {
  nav.classList.remove('open');
  hamburger.classList.remove('open');
}

hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  nav.classList.toggle('open');
  hamburger.classList.toggle('open');
});

// Close nav on link click (mobile)
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close nav when clicking outside (on the overlay backdrop)
document.addEventListener('click', (e) => {
  if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== hamburger) {
    closeMenu();
  }
});

// Header scroll style
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.style.background = window.scrollY > 40
    ? 'rgba(10,14,26,0.97)'
    : 'rgba(10,14,26,0.9)';
});

// Counter animation for metrics
const counters = document.querySelectorAll('.metrics__num');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    const el = entry.target;
    const small = el.querySelector('small');
    const suffix = small ? small.textContent : '';
    const raw = el.textContent.replace(suffix, '').trim();
    const target = parseFloat(raw);
    const isDecimal = raw.includes('.');
    let start = 0;
    const duration = 1200;
    const step = timestamp => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const val = isDecimal
        ? (target * progress).toFixed(1)
        : Math.floor(target * progress);
      el.textContent = val;
      if (small) el.appendChild(small);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });

counters.forEach(c => observer.observe(c));

// Fade-in on scroll
const fadeEls = document.querySelectorAll('.card, .reason, .case-card, .voice-card');
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});

// ========== AI CHATBOT ==========
const chatWidget = document.getElementById('chatWidget');
const chatBubble = document.getElementById('chatBubble');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

const API_URL = '/api/chat';
const conversationHistory = [];
let isSending = false;

function toggleChat() {
  chatWidget.classList.toggle('open');
  if (chatWidget.classList.contains('open')) {
    chatInput.focus();
  }
}

chatBubble.addEventListener('click', toggleChat);
chatClose.addEventListener('click', toggleChat);

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg--${role === 'user' ? 'user' : 'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'chat-msg__bubble';
  bubble.textContent = text;
  div.appendChild(bubble);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--typing';
  div.id = 'typingIndicator';
  const bubble = document.createElement('div');
  bubble.className = 'chat-msg__bubble';
  bubble.textContent = '入力中...';
  div.appendChild(bubble);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isSending) return;

  isSending = true;
  chatSend.disabled = true;
  chatInput.value = '';
  chatInput.style.height = 'auto';

  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!res.ok) throw new Error('Server error');

    removeTyping();
    const data = await res.json();
    const text = data.text || '';
    appendMessage('assistant', text);
    conversationHistory.push({ role: 'assistant', content: text });
  } catch (err) {
    removeTyping();
    appendMessage('assistant', '申し訳ありません。現在チャットをご利用いただけません。お問い合わせフォームよりご連絡ください。');
    console.error(err);
  } finally {
    isSending = false;
    chatSend.disabled = false;
    chatInput.focus();
  }
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
});
