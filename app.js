"use strict";

/**
 * Hauptklasse der Anwendung.
 *
 * TODO: Bei window/resize die Basisparameter neu rechnen und Positionen aktualisieren
 * TODO: Scroll-Verschiebung prozentual zum Zoom-Level vornehmen
 * TODO: Bei jedem Zoom die Folie in die Mitte des Schirms verschieben
 */
class App {
    /**
     * Konstruktor.
     * @param {Float} ratio Seitenverhältnis der <section>-Elemente, z.B. 16/9
     * @param {Float} width Maximale Breite der <section> in vw, z.B. 80
     * @param {Stromg} margin Abstand um die <section>, z.B. 2rem
     * @param {ẞtring} startWith ID der Startfolie
     */
    constructor(ratio, width, margin, startWith) {
        this._ratio = ratio;
        this._margin = margin;
        this._startWith = startWith;

        // Breite/Höhe der Kacheln in vw
        this._sectionWidth = width;
        this._sectionHeight = width / ratio;

        // Abstände zur Positionierung der Kacheln und des Betrachters
        this._xCenterOffset = ((100 - width) / 2.0) * window.innerWidth / 100;
        this._yCenterOffset = (window.innerHeight - (this._sectionHeight * window.innerWidth / 100)) / 2.0;

        this._xSkip = `${this._sectionWidth}vw + ${margin}`;
        this._ySkip = `${this._sectionHeight}vw + ${margin}`;

        this._xScroll = 0;
        this._yScroll = 0;
        this._zoom = 1.0;

        this._containerOuter = document.getElementById("container-outer");
    }

    /**
     * <section> platzieren und Anwendung starten.
     */
    run() {
        let sections = document.querySelectorAll("section");
        sections.forEach(section => section.classList.add("hidden"));

        this._resizeSections(sections);
        this._positionSections(this._startWith, 0, 0);

        let body = document.querySelector("body");
        body.addEventListener("keyup", event => this._handleKeyUpEvent(event));
    }

    /**
     * Größe der übergebenen <section> gemäß Seitenverhältnis ändern.
     * @param {DOM-Liste} sections Anzupassende DOM-Elemente
     */
    _resizeSections(sections) {
        sections.forEach(section => {
            section.style.width = `${this._sectionWidth}vw`;
            section.style.height = `${this._sectionHeight}vw`;
        });
    }

    /**
     * <section> um die Startfolie herum anordnen.
     * @param {String} id ID der zu positionierenden <section>
     * @param {Integer} xOffset X-Verschiebung der Kachel (Anzahl Kacheln)
     * @param {Integer} yOffset Y-Verschiebung der Kachel (Anzahl Kacheln)
     */
    _positionSections(id, xOffset, yOffset) {
        // <section> ermitteln
        let section = document.getElementById(id);

        if (!section) {
            console.warn(`Klasse App / _positionSections(): Element mit ID ${id} nicht gefunden!`);
            return;
        }

        // Neue Position setzen
        section.classList.remove("hidden");

        section.style.left = `calc(${this._xCenterOffset}px + (${xOffset} * (${this._xSkip})))`;
        section.style.top  = `calc(${this._yCenterOffset}px + (${yOffset} * (${this._ySkip})))`;

        // Kollisionsprüfung
        let above = document.querySelectorAll(`*[data-above="${id}"]`);
        let below = document.querySelectorAll(`*[data-below="${id}"]`);
        let left  = document.querySelectorAll(`*[data-left-of="${id}"]`);
        let right = document.querySelectorAll(`*[data-right-of="${id}"]`);

        if (above.length > 1) {
            console.warn(`Klasse App / _positionSections(): Kollision oberhalb von ${id}!`);
            console.warn(above);
        }

        if (below.length > 1) {
            console.warn(`Klasse App / _positionSections(): Kollision unterhalb von ${id}!`);
            console.warn(below);
        }

        if (left.length > 1) {
            console.warn(`Klasse App / _positionSections(): Kollision links von ${id}!`);
            console.warn(left);
        }

        if (right.length > 1) {
            console.warn(`Klasse App / _positionSections(): Kollision rechts von ${id}!`);
            console.warn(right);
        }

        // Umliegende Elemente positionieren
        above.forEach(element => this._positionSections(element.id, xOffset, yOffset - 1));
        below.forEach(element => this._positionSections(element.id, xOffset, yOffset + 1));
        left.forEach(element => this._positionSections(element.id, xOffset - 1, yOffset));
        right.forEach(element => this._positionSections(element.id, xOffset + 1, yOffset));
    }

    /**
     * Tastatarukommandos auswerten. Pfeiltasten = Scrollen, ENTER = Übersicht
     * @param {KeyUpEvent} event Abgefangenes Event
     */
    _handleKeyUpEvent(event) {
        if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;

        switch (event.key) {
            case "ArrowLeft":
                this._xScroll++;
                break;
            case "ArrowRight":
                this._xScroll--;
                break;
            case "ArrowUp":
                this._yScroll++;
                break;
            case "ArrowDown":
                this._yScroll--;
                break;
            case "-":
                this._zoom -= 0.2;
                break;
            case "+":
                this._zoom += 0.2;
                break;
            case "Enter":
                if (this._zoom <= 0.3 || this._zoom >= 3) {
                    this._zoom = 1;
                } else {
                    this._zoom = 0.2;
                }

                break;
            case " ":
            this._xScroll = 0;
            this._yScroll = 0;
        }

        if (this._zoom < 0.2) {
            this._zoom = 0.2;
        }

        this._containerOuter.style.left = `calc(${this._xScroll} * (${this._xSkip}))`;
        this._containerOuter.style.top = `calc(${this._yScroll} * (${this._ySkip}))`;
        this._containerOuter.style.transform = `scale(${this._zoom})`;
        console.log(this._zoom, this._containerOuter.style.transform);
    }
}
