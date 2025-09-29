import Swiper from 'swiper';
import $ from "jquery";

const swiper = {
    setup: (parent, options = {}) => {
        console.log(parent('.swiper'))
        return new Swiper(parent('.swiper')[0], {
            slidesPerView: options.onView || 1,
            spaceBetween: options.spacing || 0,
            allowTouchMove: options.touchMove || false,
            navigation: options.nav ? ({
                nextEl: parent('.next')[0],
                prevEl: parent('.prev')[0],
                disabledClass: "disabled"
            }) : false,
            pagination: options.pagin ? ({
                el: parent('.pagination')[0],
                clickable: true
            }) : false,
            ...options,
            on: options.on
        })
    },
    changeCurrentItem: (parent, index, callback) => {
        parent(".curr-item").html(index);
        if (callback) callback();
    },
    initTotalSlide: (parent) => {
        let totalSlide = parent(".swiper-slide").length;
        parent(".total-slide").html(totalSlide);
    },
    initPagination: (parent) => {
        let totalSlide = parent(".swiper-slide").length;
        let paginationItem = parent('.bp-swiper-pagi-item');
        gsap.set(paginationItem, { width: `${100 / totalSlide}%`, left: 0 });
    },
    activePagination: (parent, index) => {
        let activeLine = parent('.bp-swiper-pagi-item')
        gsap.to(activeLine, { x: index * activeLine.width(), duration: 0.3, ease: 'expo'})
    },
    initClassName: (parent) => {
        parent('[data-swiper]').each((_, item) => {
            if ($(item).attr('data-swiper') == 'swiper')
                $(item).addClass('swiper')
            else
                $(item).addClass(`swiper-${$(item).attr('data-swiper')}`)
        })
    }
}

export default swiper;