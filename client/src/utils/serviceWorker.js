export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification();
              }
            });
          }
        });

        console.log('[SW] Service Worker registered:', registration.scope);
      } catch (error) {
        console.log('[SW] Service Worker registration failed:', error);
      }
    });
  }
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Inter', sans-serif;
      animation: slideIn 0.3s ease;
    ">
      <span style="font-size: 20px;">🔄</span>
      <div>
        <div style="font-weight: 600; margin-bottom: 2px;">Update Available</div>
        <div style="font-size: 13px; opacity: 0.9;">New version ready. Refresh to update.</div>
      </div>
      <button 
        onclick="location.reload()" 
        style="
          background: white;
          color: #10b981;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 12px;
        "
      >
        Refresh
      </button>
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;
  document.body.appendChild(notification);
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
