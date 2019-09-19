import Swiper from 'swiper';

const frontSlider = new Swiper('.front-slider__container', {
    slidesPerView: 1,
    spaceBetween: 30,
    pagination: {
        dynamicBullets: false,
        el: '.front-slider__pagination',
    },
    navigation: {
        nextEl: '.front-slider__next',
        prevEl: '.front-slider__prev',
    },
    loop: true,
    autoplay: {
        delay: 10000,
        disableOnInteraction: false,
    },
});

const videosSlider = new Swiper('.videos-slider__container', {
    slidesPerView: 3,
    spaceBetween: 30,
    navigation: {
        nextEl: '.videos-slider__next',
        prevEl: '.videos-slider__prev',
    },
    pagination: {
        dynamicBullets: false,
        el: '.videos-slider__pagination',
    },
    breakpoints: {
        768: {
            slidesPerView: 1,
            spaceBetween: 20
        },
        998: {
            slidesPerView: 2,
            spaceBetween: 30
        }
    }
});

const mostCommentedSlider = new Swiper('.most-commented-slider__container', {
    slidesPerView: 3,
    spaceBetween: 30,
    navigation: {
        nextEl: '.most-commented-slider__next',
        prevEl: '.most-commented-slider__prev',
    },
    breakpoints: {
        768: {
            slidesPerView: 1,
            spaceBetween: 20
        },
        998: {
            slidesPerView: 2,
            spaceBetween: 30
        }
    }
});
const bioSlider = new Swiper('.bio-slider__container', {
    slidesPerView: 3,
    spaceBetween: 30,
    navigation: {
        nextEl: '.bio-slider__next',
        prevEl: '.bio-slider__prev',
    },
    pagination: {
        dynamicBullets: false,
        el: '.bio-slider__pagination',
    },
    breakpoints: {
        768: {
            slidesPerView: 1,
            spaceBetween: 20
        },
        998: {
            slidesPerView: 2,
            spaceBetween: 30
        }
    }
});