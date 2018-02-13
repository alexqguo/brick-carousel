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

    const BRICK_DEFAULTS = {
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
            this.slides = null;
            this.currentSlide = null;
            this.slider = null;
            this.xPosition = 0; // Using this?

            this.init();
        }

        init() {
            // validate, delete self if it's no good before proceeding
            this.initSlides();
            this.initContainer();
            this.initArrows();
            this.initDots();
        }

        initContainer() {
            this.rootNode.classList.add('brick-container');
            let slider = document.createElement('div');
            slider.classList.add('brick-slider');

            for (var i = 0; i < this.slides.length; i++) {
                // is this faster with doc fragment? less repaints?
                slider.appendChild(this.slides[i]);
            }

            this.rootNode.appendChild(slider);
            this.slider = slider;
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

        initDots() {
            // TODO
        }

        goToSlide(targetIndex) {
            if (!targetIndex || targetIndex === this.currentSlideIndex) return;

            let previousSlideIndex = this.currentSlideIndex;
            this.currentSlideIndex = targetIndex;

            // TODO: improve browser compatibility, maybe remove this if it's not used?
            this.currentSlide.classList.remove('brick-active');
            this.currentSlide = this.slides[this.currentSlideIndex];
            this.currentSlide.classList.add('brick-active');

            let pixelsToTravel = 0;
            let initialIndex;
            let endIndex;
            let goingForwards = previousSlideIndex < this.currentSlideIndex;

            if (goingForwards) {
                // Going forwards. Count up to but don't include the target slide. Include current
                initialIndex = previousSlideIndex;
                endIndex = targetIndex - 1;
            } else {
                // Going backwards. Count back to and include the target slide. Don't include current
                initialIndex = targetIndex;
                endIndex = previousSlideIndex - 1;
            }

            for (let i = initialIndex; i <= endIndex; i++) {
                pixelsToTravel += this.slides[i].clientWidth;
            }

            this.xPosition += pixelsToTravel * (goingForwards ? -1 : 1);
            this.slider.style.transform = createTransformStyle(`translateX(${this.xPosition}px) translateZ(0)`);
        }

        next() {
            if (this.currentSlideIndex < this.slides.length - 1) {
                this.goToSlide(this.currentSlideIndex + 1);
            } else {
                // TODO: bump
                console.warn('Cannot go to next slide past the last one');
            }
        }

        prev() {
            if (this.currentSlideIndex > 0) {
                this.goToSlide(this.currentSlideIndex - 1);
            } else {
                // TODO: bump
                console.warn('Cannot go to previous slide past 0');
            }
        }
    }

    window.Brick = Brick; // make this better

    window.b = Brick; //remove
})();
