// 딥링크 처리 공통 함수
class DeepLinkHandler {
  constructor(config) {
    this.resourceType = config.resourceType; // 'post', 'marketplace'
    this.customScheme = config.customScheme; // 'unipia://post/', etc.
    this.playStoreUrl = 'https://play.google.com/store/apps/details?id=com.unipia.unipia&hl=en_GB';
    this.appStoreUrl = 'https://apps.apple.com/us/app/unipia/id1608830229';
    this.resourceId = this.extractResourceId();
    this.appOpened = false;
  }

  // URL에서 리소스 ID 추출 (쿼리 파라미터)
  extractResourceId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  // 딥링크 시도
  attemptDeepLink() {
    if (!this.resourceId) {
      console.log('No resource ID found');
      this.showStoreButtons();
      return;
    }

    const deepLinkUrl = `${this.customScheme}${this.resourceId}`;
    console.log('Attempting deep link:', deepLinkUrl);

    // iOS에서는 iframe을 사용해 커스텀 스킴 시도
    if (this.isIOS()) {
      this.tryIOSDeepLink(deepLinkUrl);
    } else {
      // Android는 직접 시도
      window.location.href = deepLinkUrl;
    }

    // 1.5초 후에도 페이지에 있으면 앱이 없는 것으로 판단
    setTimeout(() => {
      if (!this.appOpened) {
        this.showStoreButtons();
      }
    }, 1500);

    // 페이지 숨김 감지 (앱이 열린 경우)
    this.detectAppOpened();
  }

  // iOS 딥링크 시도 (iframe 사용)
  tryIOSDeepLink(url) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  // 앱 열림 감지
  detectAppOpened() {
    // visibilitychange 이벤트
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.appOpened = true;
        console.log('App opened (visibilitychange)');
      }
    });

    // pagehide 이벤트 (iOS Safari)
    window.addEventListener('pagehide', () => {
      this.appOpened = true;
      console.log('App opened (pagehide)');
    });

    // blur 이벤트
    window.addEventListener('blur', () => {
      this.appOpened = true;
      console.log('App opened (blur)');
    });
  }

  // 스토어 버튼 표시
  showStoreButtons() {
    const loadingEl = document.getElementById('loading');
    const storeButtonsEl = document.getElementById('store-buttons');

    if (loadingEl) loadingEl.style.display = 'none';
    if (storeButtonsEl) storeButtonsEl.style.display = 'flex';
  }

  // OS 감지
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  isAndroid() {
    return /android/i.test(navigator.userAgent);
  }

  // 스토어 리다이렉션
  redirectToStore() {
    if (this.isIOS()) {
      window.location.href = this.appStoreUrl;
    } else if (this.isAndroid()) {
      window.location.href = this.playStoreUrl;
    } else {
      // Desktop: 기본적으로 Play Store
      window.location.href = this.playStoreUrl;
    }
  }
}