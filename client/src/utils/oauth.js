import { api } from '../store/authStore';
import faceio from '@faceio/fiojs';

let faceioInstance = null;

export const initializeFaceIO = () => {
  if (!faceioInstance) {
    faceioInstance = new faceio.FaceIO('fioa2d51');
  }
  return faceioInstance;
};

export const handleGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.google === 'undefined') {
      reject(new Error('Google SDK not loaded'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      callback: async (response) => {
        try {
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          
          const result = await api.post('/auth/google', {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            avatar: payload.picture
          });

          if (result.data.success) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('refreshToken', result.data.refreshToken);
            resolve(result.data);
          } else {
            reject(new Error('Google login failed'));
          }
        } catch (error) {
          reject(error);
        }
      }
    });

    const btnElement = document.getElementById('google-login-btn') || document.getElementById('google-signup-btn');
    if (btnElement) {
      window.google.accounts.id.renderButton(btnElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 200
      });
      btnElement.click();
    }
  });
};

export const handleAppleAuth = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.AppleID !== 'undefined') {
      window.AppleID.auth.signIn().then(async (response) => {
        try {
          const result = await api.post('/auth/apple', {
            appleId: response.user,
            email: response.authorization?.code,
            name: response.user?.name
          });

          if (result.data.success) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('refreshToken', result.data.refreshToken);
            resolve(result.data);
          } else {
            reject(new Error('Apple login failed'));
          }
        } catch (error) {
          reject(error);
        }
      }).catch(reject);
    } else {
      const btnElement = document.getElementById('apple-login-btn') || document.getElementById('apple-signup-btn');
      if (btnElement) {
        const originalContent = btnElement.innerHTML;
        btnElement.innerHTML = '<span>Please wait...</span>';
        
        setTimeout(() => {
          btnElement.innerHTML = originalContent;
          alert('Apple Sign In requires configuration. Please add your Apple Developer credentials.');
        }, 2000);
      }
      reject(new Error('Apple SDK not loaded'));
    }
  });
};

export const handleFaceAuth = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const faceio = initializeFaceIO();
      
      const btnElement = document.getElementById('face-login-btn') || document.getElementById('face-signup-btn');
      if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<span>Initializing camera...</span>';
      }

      const userInfo = await faceio.enroll({
        payload: {
          userInfo: 'cryptofx_user_' + Date.now()
        },
        consentCheckbox: {
          consentCheckboxId: 'faceioConsent',
          consentText: 'I agree to the facial recognition terms'
        }
      });

      const result = await api.post('/auth/face-login', {
        faceId: userInfo.facialId,
        email: `face_${userInfo.facialId}@cryptofx.io`,
        name: 'Face User'
      });

      if (btnElement) {
        btnElement.disabled = false;
      }

      if (result.data.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        resolve(result.data);
      } else {
        reject(new Error('Face login failed'));
      }
    } catch (error) {
      const btnElement = document.getElementById('face-login-btn') || document.getElementById('face-signup-btn');
      if (btnElement) {
        btnElement.disabled = false;
      }
      
      if (error.message?.includes('user declined')) {
        console.log('User declined face enrollment');
      } else {
        console.error('Face auth error:', error);
      }
      reject(error);
    }
  });
};

export const loadGoogleSDK = () => {
  return new Promise((resolve) => {
    if (typeof window.google !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

export const loadAppleSDK = () => {
  return new Promise((resolve) => {
    if (typeof window.AppleID !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};
