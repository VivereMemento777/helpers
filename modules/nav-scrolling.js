import { getElement, addClass, removeClass, Maybe, setListener, hasClass } from "../utils";

const maxYOffset = 100;
const scrollMenu = getElement('.nav-scroll');

const navScrolling = () => {
    Maybe(window.pageYOffset > maxYOffset && scrollMenu.valueOf())
    .map(addClass('nav-scroll--fixed'))
    .orElse(scrollMenu.valueOf())
    .map(removeClass('nav-scroll--fixed'))
}

Maybe( window )
.map(setListener('scroll', navScrolling));