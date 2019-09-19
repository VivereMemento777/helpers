import { once, getElement } from '../utils';

const activateSubscrube = once(() => getElement('#subscribePopupThanks').map(elem => elem.checked = true));
const showSubscribe = () => {
    const body = document.body;
    const html = document.documentElement;
    let documentHeight = Math.max( body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight );

    window.pageYOffset + window.innerHeight >= documentHeight - 100
       ? activateSubscrube()
       : null
};

window.addEventListener('scroll', showSubscribe);