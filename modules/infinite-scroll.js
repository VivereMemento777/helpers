import InfiniteScroll from 'infinite-scroll';
import scriptLoader from 'services/script-loader';
import {sendEvent} from 'services/send-analitycs';
import initLazy from './lazy-loading';
import { getElements, getByIndex, map, path, qs, Maybe } from '../utils';
import { setOutbrainListener } from './outbrain-posts-tracker';
import makeAdvBorder from './adv-with-borders';
import { setPocketBtn } from './share-buttons';
import initPartialAd from './partial-ad';

const infiniteArticles = '.article-cards-list';
const INFINITE_SCROLL_DISTANCE = 500;

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
                    let body = qs('body');

                    let script;
                    while (script = regex.exec(response)) {
                        let scriptContent = script[1];
                        let scriptTag = qs('script');
                        scriptTag.innerText = scriptContent;
                        body.appendChild(scriptTag);
                    }

                    if (typeof FB !== 'undefined') {
                        FB.XFBML.parse(qs(`article[data-infinite-scroll-page="_page_${this.loadCount + 1}"]`));
                    }

                    document.dispatchEvent(new Event('infinite-scroll-update'));

                    if (typeof OBR !== 'undefined') {
                        OBR.extern.researchWidget();
                    }
                    setOutbrainListener(`article[data-infinite-scroll-page="_page_${this.loadCount + 1}"] .ob-dynamic-rec-container`);
                    lazyLoad(`article[data-infinite-scroll-page="_page_${this.loadCount + 1}"] .lazy`);
                    makeAdvBorder(`article[data-infinite-scroll-page="_page_${this.loadCount + 1}"] .adv`);
                    setPocketBtn(document, "pocket-btn-js", `article[data-infinite-scroll-page="_page_${this.loadCount + 1}"] .share-icons`);
                    initPartialAd(`article[data-infinite-scroll-page="_page_${this.loadCount + 1}"] .adv`);
                    sendEvent({
                        eventCategory: 'Infinite scroll',
                        eventAction: 'Page load',
                        eventValue: this.loadCount,
                        eventLabel: `Page ${this.loadCount}`
                    });

                })
                .on('error', (error, path) => console.error(error));
        }
    })
);

Maybe(qs(infiniteArticles))
    .map(() => infiniteScroll(initLazy));
