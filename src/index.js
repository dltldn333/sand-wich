class SandwichRenderer {
  constructor(options = {}) {
    this.frontSelector = options.frontSelector || '.front';
    this.midId = options.midId || 'mid';
    this.items = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    this.createLayers();
    this.setupMidLayer();
    this.hijackFrontElements();
    
    // 첫 렌더링 시 위치를 즉시 맞춥니다.
    this.syncPositions();
    this.setupObservers();

    this.isInitialized = true;
    console.log('🥪 sand-telepochi initialized!');
  }

  createLayers() {
    // Layer 2: Sandwich Filling (Middle)
    this.midLayer = document.createElement('div');
    this.midLayer.id = 'sand-layer-mid';
    Object.assign(this.midLayer.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9998',
      pointerEvents: 'none'
    });

    // Layer 3: Front Elements
    this.frontLayer = document.createElement('div');
    this.frontLayer.id = 'sand-layer-front';
    Object.assign(this.frontLayer.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      pointerEvents: 'none'
    });

    document.body.appendChild(this.midLayer);
    document.body.appendChild(this.frontLayer);
  }

  setupMidLayer() {
    const midElement = document.getElementById(this.midId);
    if (midElement) {
      this.midLayer.appendChild(midElement);
      midElement.style.pointerEvents = 'auto';
    }
  }

  hijackFrontElements() {
    const frontElements = document.querySelectorAll(this.frontSelector);

    frontElements.forEach((el) => {
      const placeholder = document.createElement('div');
      const originalStyle = window.getComputedStyle(el);

      // [중요] Placeholder가 원래 요소의 자리를 완벽히 지키도록 속성 복사
      placeholder.className = 'sand-placeholder';
      
      placeholder.style.display = originalStyle.display;
      placeholder.style.width = originalStyle.width;
      placeholder.style.height = originalStyle.height;
      placeholder.style.margin = originalStyle.margin;
      placeholder.style.padding = '0'; // 실제 알맹이는 el에 있으므로
      placeholder.style.visibility = 'hidden'; // 눈에는 안 보이지만 공간은 차지

      el.parentNode.insertBefore(placeholder, el);

      // 실제 요소를 Layer 3로 텔레포트
      this.frontLayer.appendChild(el);
      Object.assign(el.style, {
        position: 'fixed', // viewport 기준 절대 좌표
        margin: '0',
        pointerEvents: 'auto',
        // boxSizing: 'border-box' // 레이아웃 계산 오차 방지
      });

      this.items.push({ placeholder, original: el });
    });
  }

  syncPositions = () => {
    // 렌더링 성능 최적화를 위해 호출
    requestAnimationFrame(() => {
      this.items.forEach(({ placeholder, original }) => {
        const rect = placeholder.getBoundingClientRect();
        
        // placeholder의 화면 좌표를 그대로 주입
        original.style.top = `${rect.top}px`;
        original.style.left = `${rect.left}px`;
        original.style.width = `${rect.width}px`;
        original.style.height = `${rect.height}px`;
      });
    });
  };

  setupObservers() {
    window.addEventListener('scroll', this.syncPositions, { passive: true });
    window.addEventListener('resize', this.syncPositions, { passive: true });

    const resizeObserver = new ResizeObserver(this.syncPositions);
    this.items.forEach(({ placeholder }) => {
      resizeObserver.observe(placeholder);
    });
  }
}

export default SandwichRenderer;