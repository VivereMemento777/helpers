import InfiniteScroll from 'infinite-scroll';
import scriptLoader from 'services/script-loader';
import {sendEvent} from 'services/send-analitycs';
import sticky from './sticky';
import initLazy from './lazy-loading';
import { getElements, getByIndex, map, path } from '../utils';

const infiniteArticles = '.article-cards-list';
const INFINITE_SCROLL_DISTANCE = 500;

const lazyLoadOptions = loadFn => ({
    elements_selector: ".lazy",
    callback_load: elem => loadFn ? loadFn() : elem,
    callback_set: elem => {}
});
const getNextPostLinks = map(path(['dataset','nextPostNewLink']));
const infiniteScroll = (lazyLoad) => (
    new InfiniteScroll(infiniteArticles, {
        path() {
            return getElements('.next-post-link[data-next-post-new-link]')
                    .map(getNextPostLinks)
                    .map(getByIndex(this.loadCount))
                    .valueOf()
        },
        append: 'article',
        history: 'push',
        scrollThreshold: INFINITE_SCROLL_DISTANCE,
        loadOnScroll: true,
        onInit() {
            this
                .on('load', () => {
                setTimeout(() => lazyLoad.update(), 100);
                })
                .on('append', (response, path) => {
                    let remoteScriptRegex = /<script.*?src="(.*?)"/g;
                    let loadedScripts = [];

                    let remoteScript;
                    while (remoteScript = remoteScriptRegex.exec(response)) {
                        let scriptSrc = remoteScript[1];
                        if (!loadedScripts.includes(scriptSrc)) {
                            loadedScripts.push(scriptSrc);
                            scriptLoader(scriptSrc);
                        }
                    }

                    let regex = /<script class="advertisement-script-block">([\s\S]*?)<\/script>/g;
                    let body = document.querySelector('body');

                    let script;
                    while (script = regex.exec(response)) {
                        let scriptContent = script[1];
                        let scriptTag = document.createElement('script');
                        scriptTag.innerText = scriptContent;
                        body.appendChild(scriptTag);
                    }

                    if (typeof FB !== 'undefined') {
                        FB.XFBML.parse(document.querySelector(`article[data-infinite-scroll-page="_page_${this.loadCount + 1}"]`));
                    }

                    document.dispatchEvent(new Event('infinite-scroll-update'));
                    lazyLoad();
                    sendEvent({
                        eventCategory: 'Infinite scroll',
                        eventAction: 'Page load',
                        eventValue: this.loadCount,
                        eventLabel: `Page ${this.loadCount}`
                    });

                    if (typeof OBR !== 'undefined') {
                        OBR.extern.researchWidget();
                    }
                })
                .on('error', (error, path) => console.error(error));
        }
    })
);

const initInfiniteScroll = () => {
    if (document.querySelector(infiniteArticles)) {
        const lazyLoad = new LazyLoad(lazyLoadOptions(initAddingSession));
        infiniteScroll(lazyLoad);
    }
};

const afterLazyLoaded = () => {
    initInfiniteScroll();
    sticky();
}

const appendLazyloading = function (window, document) {
    const b = document.getElementsByTagName('head')[0];
    const s = document.createElement("script");
    s.async = true;
    const v = !("IntersectionObserver" in window) ? "8.16.0" : "10.19.0";
    s.src = "https://cdn.jsdelivr.net/npm/vanilla-lazyload@" + v + "/dist/lazyload.min.js";
    window.lazyLoadOptions = lazyLoadOptions(afterLazyLoaded);
    b.appendChild(s);
};

export default appendLazyloading;
