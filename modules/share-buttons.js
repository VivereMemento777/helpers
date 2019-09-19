import { getElement, getElements, setListener, sendData, getParent, path, Maybe, setAttribute, curry, setStyle, addClass } from '../utils';
const data = {
    eventCategory: "ShareButtonsClicked",
    eventAction: "",
    location: window.location.href
}
const setHref = curry((url, elem) => setAttribute('href', url)(elem));
const maybeEqualTo = curry((prop, fn, data) => Maybe(prop === fn(data)).map(() => data));
const sendSocialData = action => sendData({
            ...data,
            eventAction: action,
            location: window.location.href});

export const shareButtons = ({target}) => {

    const link = getParent('A')(target);

    return (
        Maybe(link)
            .chain(maybeEqualTo('facebook', path(['dataset', 'social'])))
            .map(setHref(`https://www.facebook.com/sharer/sharer.php?u=${link && link.dataset.url}?pk_campaign=ush`))
            .map(() => sendSocialData('FbClicked'))
            .orElse(link)
            .chain(maybeEqualTo('twitter', path(['dataset', 'social'])))
            .map(setHref(`https://www.twitter.com/share?url=${link && link.dataset.url}`))
            .map(() => sendSocialData('TwitterClicked'))
    )
};

export const setPocketBtn = (doc, selector, selector2) => {
        if (doc.getElementById(selector)) {
            const j = doc.createElement("script");
            j.id = selector;
            j.src = "https://widgets.getpocket.com/v1/j/btn.js?v=1";
            const w = doc.getElementById(selector);
            doc.body.appendChild(j);
            getElements(selector2)
            .map(arr => arr.filter((el, idx) => idx === 1))
            .map(arr => arr.map(el => addClass('share-icons--wide', el)))
        }
};

getElement('.article-cards-content')
    .map(setListener('click', e => shareButtons(e)));

getElements('.article-page .share-icons')
    .map(arr => arr.filter((el, idx) => idx === 1))
    .map(arr => arr.map(el => addClass('share-icons--wide', el)));