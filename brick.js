/*
Structure
    - Carousel
        - init(id, attributes)
        - goToSlide
        - next
        - prev
        - addSlide
        - removeSlide
    - Slide
    - Dots
    - Shoveler

Functionality
    - ability to init without explicitly saying so. if all the bootstrap data is there (data attributes), and maybe some class to signal, then just initialize
        - initialization NEEDS to be efficient. ideally we can initialize all of them at once
    - items per page
    - center mode
    - accessibility
    - ajax loading/getting more slides
        - future ajax slides can hold reference to args and an endpoint and slick can handle the call, if there is an assumption that the call will return one slide worth of items
    - autoplay + autoplay interval
    - clear autoplay when a click happens
    - dots/arrows on/off
    - looping
    - add/remove slide
    - swiping
    - custom events

Other random stuff/utilities
    - Get slot code
    - Optimizations
    - Remove carousel ID
    - Default items per page to 1
    - Clean up the bootstrapping

Usage
    var carousel = new Brick()

HTML Structure
    #brick-container (init with this)
        slide
        slide
        slide

CSS classes
    brick-slide for items
    brick-active for active slide
    brick-container for container
 */
(function() {
    'use strict';

    var BRICK_DEFAULTS = {
        /*
        prevArrow: '<button class="brick-arrow prev">Previous</button>',
        nextArrow: '<button class="brick-arrow next">Next</button>'
        */
    };

    class Brick {
        constructor(id, options) {
            // make an iife?
            this.rootId = id;
            this.rootNode = document.getElementById(id);
            this.currentSlideIndex = 0;
            this.options = options; // have defaults and join them, figure that out later

            this.init();
        }

        init() {
            // validate, delete self if it's no good
            this.rootNode.classList.add('brick-container');

            this.initSlides();
            this.initArrows();
        }

        initSlides() {
            var slides = [];

            for (var i = 0; i < this.rootNode.children.length; i++) {
                var slide = this.rootNode.children[i];
                slide.classList.add('brick-slide');
                slides.push(slide);
            }

            slides[0].classList.add('brick-active');

            this.slides = slides;
            this.currentSlide = this.slides[0];
        }

        initArrows() {
            // TODO: check for existing arrows to use, make this better
            var frag = new DocumentFragment();
            var prevArrow = document.createElement('button');
            var nextArrow = document.createElement('button');
            prevArrow.classList.add('brick-arrow');
            nextArrow.classList.add('brick-arrow');
            prevArrow.classList.add('prev');
            nextArrow.classList.add('next');
            frag.appendChild(prevArrow);
            frag.appendChild(nextArrow);

            prevArrow.addEventListener('click', this.prev.bind(this));
            nextArrow.addEventListener('click', this.next.bind(this));

            this.rootNode.append(frag);
        }

        goToSlide(index) {
            this.currentSlideIndex = index;

            // TODO: improve browser compatibility
            this.currentSlide.classList.remove('brick-active');
            this.currentSlide = this.slides[this.currentSlideIndex];
            this.currentSlide.classList.add('brick-active');
        }

        next() {
            if (this.currentSlideIndex < this.slides.length - 1) {
                this.goToSlide(this.currentSlideIndex + 1);
            } else {
                console.warn('Cannot go to next slide past the last one');
            }
        }

        prev() {
            if (this.currentSlideIndex > 0) {
                this.goToSlide(this.currentSlideIndex - 1);
            } else {
                console.warn('Cannot go to previous slide past 0');
            }
        }
    }

    window.Brick = Brick; // make this better

    window.b = Brick; //remove
})();
