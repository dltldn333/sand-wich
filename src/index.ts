interface SandwichOptions {
  frontSelector?: string;
  midId?: string;
}

interface SandwichItem {
  placeholder: HTMLDivElement;
  original: HTMLElement;
}

export default class SandwichRenderer {
  private frontSelector: string;
  private midId: string;
  private items: SandwichItem[] = [];
  private isInitialized: boolean = false;
  private midLayer: HTMLDivElement | null = null;
  private frontLayer: HTMLDivElement | null = null;

  constructor(options: SandwichOptions = {}) {
    this.frontSelector = options.frontSelector || ".front";
    this.midId = options.midId || "mid";
    this.items = [];
    this.isInitialized = false;
  }

  init(): void {
    if (this.isInitialized) return;

    this.createLayers();
    this.setupMidLayer();
    this.hijackFrontElements();

    // 첫 렌더링 시 위치를 즉시 맞춤
    this.syncPositions();
    this.setupObservers();

    this.isInitialized = true;
    console.log("🥪 sand-telepochi initialized!");
  }

  createLayers(): void {
    // Layer 2: Sandwich Filling (Middle)
    this.midLayer = document.createElement("div");
    this.midLayer.id = "sand-layer-mid";
    Object.assign(this.midLayer.style, {
      position: "fixed",
      inset: "0",
      zIndex: "9998",
      pointerEvents: "none",
    });

    // Layer 3: Front Elements
    this.frontLayer = document.createElement("div");
    this.frontLayer.id = "sand-layer-front";
    Object.assign(this.frontLayer.style, {
      position: "fixed",
      inset: "0",
      zIndex: "9999",
      pointerEvents: "none",
    });

    document.body.appendChild(this.midLayer);
    document.body.appendChild(this.frontLayer);
  }

  setupMidLayer(): void {
    const midElement = document.getElementById(this.midId);
    if (midElement && this.midLayer) {
      this.midLayer.appendChild(midElement);
      midElement.style.pointerEvents = "auto";
    }
  }

  hijackFrontElements(): void {
    const frontElements = document.querySelectorAll<HTMLElement>(
      this.frontSelector,
    );

    if (!this.frontLayer) return;

    frontElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      const placeholder = document.createElement("div");

      // It's crucial to copy styles to ensure the placeholder perfectly occupies the original element's space.
      placeholder.className = "sand-placeholder";

      Object.assign(placeholder.style, {
        display:
          computed.display === "inline" ? "inline-block" : computed.display,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        boxSizing: "border-box",
        marginTop: computed.marginTop,
        marginBottom: computed.marginBottom,
        marginLeft: computed.marginLeft,
        marginRight: computed.marginRight,

        visibility: "hidden",
        pointerEvents: "none",
      });

      //   placeholder.style.display = originalStyle.display;
      //   placeholder.style.width = originalStyle.width;
      //   placeholder.style.height = originalStyle.height;
      //   placeholder.style.margin = originalStyle.margin;
      //   // placeholder.style.padding = "0"; // 실제 알맹이는 el에 있으므로
      //   placeholder.style.visibility = "hidden"; // 눈에는 안 보이지만 공간은 차지

      el.parentNode?.insertBefore(placeholder, el);

      // 실제 요소를 Layer 3로 텔레포트
      this.frontLayer!.appendChild(el);

      Object.assign(el.style, {
        position: "fixed",
        margin: "0",
        boxSizing: "border-box",
        width: `${rect.width}px`,
        height: `${rect.height}px`,

        pointerEvents: "auto",
      });

      this.items.push({ placeholder, original: el });
    });
  }

  syncPositions = (): void => {
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

  setupObservers(): void {
    window.addEventListener("scroll", this.syncPositions, { passive: true });
    window.addEventListener("resize", this.syncPositions, { passive: true });

    const resizeObserver = new ResizeObserver(this.syncPositions);
    this.items.forEach(({ placeholder }) => {
      resizeObserver.observe(placeholder);
    });
  }
}
