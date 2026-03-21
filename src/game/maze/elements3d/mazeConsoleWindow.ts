import type { mazeEventBase } from "../../base/eventBus/mazeEventBase";
import type { mazeContext } from "../../base/mazeContext";
import mazeEventHurt from "../../base/eventOrigin/mazeEventHurt";
import type { mazeDynamicObject } from "../../base/objects3d/mazeDynamicObject";

const ROOT_STYLES: Partial<CSSStyleDeclaration> = {
    position: "fixed",
    top: "12px",
    left: "12px",
    width: "180px",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(12, 16, 15, 0.88)",
    border: "1px solid rgba(134, 255, 96, 0.35)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.28)",
    backdropFilter: "blur(6px)",
    zIndex: "20",
    fontFamily: "monospace",
    color: "#dcffe3",
};

const BAR_TRACK_STYLES: Partial<CSSStyleDeclaration> = {
    width: "100%",
    border: "1px solid rgba(134, 255, 96, 0.25)",
    borderRadius: "8px",
    overflow: "hidden",
    background: "rgba(0, 0, 0, 0.28)",
    height: "12px",
    boxSizing: "border-box",
};

const STATUS_STYLES: Partial<CSSStyleDeclaration> = {
    margin: "0 0 8px",
    fontSize: "13px",
    color: "#dfffe5",
};

const BAR_FILL_STYLES: Partial<CSSStyleDeclaration> = {
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, #72ff4b 0%, #b8ff63 100%)",
    transformOrigin: "left center",
};

const FOOTER_STYLES: Partial<CSSStyleDeclaration> = {
    margin: "8px 0 0",
    fontSize: "11px",
    color: "#99b9a0",
};

export default class mazeConsoleWindow implements mazeDynamicObject {
    private rootElement: HTMLDivElement | null = null;
    private statusElement: HTMLParagraphElement | null = null;
    private barFillElement: HTMLDivElement | null = null;
    private healthPercent = 100;

    getAABB(): null {
        return null;
    }

    init(mazeContext: mazeContext): void {
        if (this.rootElement) {
            this.dispose(mazeContext);
        }

        const rootElement = document.createElement("div");
        Object.assign(rootElement.style, ROOT_STYLES);

        const statusElement = document.createElement("p");
        Object.assign(statusElement.style, STATUS_STYLES);
        statusElement.textContent = "Health";

        const barTrackElement = document.createElement("div");
        Object.assign(barTrackElement.style, BAR_TRACK_STYLES);

        const barFillElement = document.createElement("div");
        Object.assign(barFillElement.style, BAR_FILL_STYLES);
        barTrackElement.appendChild(barFillElement);

        const footerElement = document.createElement("p");
        Object.assign(footerElement.style, FOOTER_STYLES);
        footerElement.textContent = "Player";

        rootElement.append(statusElement, barTrackElement, footerElement);
        document.body.appendChild(rootElement);

        this.rootElement = rootElement;
        this.statusElement = statusElement;
        this.barFillElement = barFillElement;
        this.healthPercent = 100;

        mazeContext.getEventBus().insert3dObjectEvent(this);
    }

    dispose(mazeContext: mazeContext): void {
        mazeContext.getEventBus().remove3dObjectEvent(this);

        if (this.rootElement?.parentElement) {
            this.rootElement.parentElement.removeChild(this.rootElement);
        }

        this.rootElement = null;
        this.statusElement = null;
        this.barFillElement = null;
        this.healthPercent = 100;
    }

    update(mazeEvent: mazeEventBase): void {
        if (!(mazeEvent instanceof mazeEventHurt) || !this.statusElement || !this.barFillElement) {
            return;
        }

        this.healthPercent = Math.max(0, this.healthPercent - mazeEvent.impact);
        //this.statusElement.textContent = `Vida: ${this.healthPercent}%`;
        this.barFillElement.style.transform = `scaleX(${this.healthPercent / 100})`;
    }
}
