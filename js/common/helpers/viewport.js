let viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
}
const device = { lg: 1727, md: 991, sm: 767, xs: 476  }

const useRem = (vw, maxWidth) => {
    vw = viewport.width < maxWidth ? (vw * viewport.width) / 1000 : vw / 10;

    return (value) => Number((value * vw).toFixed(2));
};

/**
 * @param {Object} options - [viewport break]:
 * { md: (>991), sm: (<992), xs: (<768) }.
 */

const viewportBreak = (options) => {
    const { md, sm, xs } = options;
    let result;
    switch (true) {
        case viewport.width < 768:
            result = xs;
            break;
        case viewport.width < 992:
            result = sm;
            break;
        default:
            result = md;
            break;
    }
    return (result instanceof Function) ? result() : result;
}

const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
}

const documentHeightObserver = (action, observerEl, callback) => {
    let resizeObserver;
    let debounceTimer;
    console.log("init document height observer", observerEl)

    let previousHeight = observerEl?.getBoundingClientRect().height;
    function onRefresh() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const currentHeight = observerEl.getBoundingClientRect().height;

            if (currentHeight !== previousHeight) {
                console.log('document height changed', currentHeight, previousHeight);
                if (callback) {
                    callback();
                }
                previousHeight = currentHeight;
            }
        }, 200);
    }

    if (action === "init") {
        if (!observerEl) return;
        resizeObserver = new ResizeObserver(onRefresh);
        resizeObserver.observe(observerEl);
    } else if (action === "disconnect") {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    }
};

export { useRem, viewportBreak, viewport, isTouchDevice, documentHeightObserver };