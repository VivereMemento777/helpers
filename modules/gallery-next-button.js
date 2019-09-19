import { getElement, Maybe, setStyle, idX } from '../utils';

const firstGalleryImageWrap = getElement('.page-text .article-image__picture');
const linkNext = getElement('.gallery-pagination__img-link');
const btnNext = getElement('.gallery-pagination__img-btn');

if (!linkNext.isNothing() && !firstGalleryImageWrap.isNothing()) {
    const imgClone = firstGalleryImageWrap.map(img => img.cloneNode(true)).valueOf();
    linkNext.map(link => link.appendChild(imgClone));
    firstGalleryImageWrap.map(img => img.replaceWith(linkNext.valueOf()));
}

Maybe(firstGalleryImageWrap.isNothing() && btnNext)
    .chain(idX)
    .map(setStyle('display', 'none'))
