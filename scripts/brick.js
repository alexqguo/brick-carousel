/*
--------------------------------
Functionality
--------------------------------
- ability to init without explicitly saying so. if all the bootstrap data is there (data attributes), and maybe some class to signal, then just initialize
    - initialization NEEDS to be efficient. ideally we can initialize all of them at once
- items per page
    - set the slide width to (totalWidth / itemsPerPage) pixels
    - if 1, center the content in the slides
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

--------------------------------
Other random stuff/utilities
--------------------------------
- Optimizations
- Remove carousel ID
- Default items per page to 1
- Clean up the bootstrapping

--------------------------------
Usage
--------------------------------
    - var carousel = new Brick()

--------------------------------
HTML Structure
--------------------------------
    #brick-container (init with this)
        brick-slider
            brick-slide
            brick-slide
            brick-slide
        brick-dots
        brick-arrow prev
        brick arrow next

--------------------------------
Main todo
--------------------------------
- implement centerMode
    - to get this fully working, will need support for infinite looping if we want to be able to see preview of the next/prev slides
 */
(function() {
    'use strict';

    if (window.Brick) return;

    const BRICK_DEFAULTS = {
        itemsPerSlide: 1, // How many slides are visible at any given time
        centerMode: true, // Whether or not the active slide is centered
        infinite: false, // Whether or not the carousel is infinite

        /*

        */
    };

    class Brick {
        constructor(id, options) {
            // make an iife?
            this.rootId = id;
            this.rootNode = document.getElementById(id);
            this.currentSlideIndex = 0;
            this.slides = null;
            this.currentSlide = null;
            this.slider = null;
            this.xPosition = 0;
            this.options = Object.assign(options, BRICK_DEFAULTS); // These are properties which come from the user
            // TODO: this will overwrite properties in options which we don't want, and also doesn't have good browser support

            // THIS IS DEBUGING AND SHOULD NOT BE PUSHED
            this.options.itemsPerSlide = 2;

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
                slide.style.width = `${this.rootNode.offsetWidth / this.options.itemsPerSlide}px`;
                slides.push(slide);
            }

            slides[0].classList.add('brick-active');

            this.slides = slides;
            this.currentSlide = this.slides[0];
        }

        initArrows() {
            // TODO: check for existing arrows to use, make this better
            // If arrows already exist, don't do any of this, just add event listeners

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
            let frag = new DocumentFragment();
            let dotsContainer = document.createElement('div');
            dotsContainer.classList.add('brick-dots');
            // We only want as many dots that would make sense given how many we show on each slide
            let numDots = this.slides.length - this.options.itemsPerSlide + 1;

            for (var i = 0; i < numDots; i++) {
                let dot = document.createElement('button');
                dot.classList.add('brick-dot');
                dot.setAttribute('data-slide', i);
                dotsContainer.appendChild(dot);
            }

            frag.appendChild(dotsContainer);
            this.rootNode.appendChild(frag);

            // Doing this so that only one event listener is needed per carousel
            dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('brick-dot') > -1) {
                    let slideNumber = e.target.getAttribute('data-slide');
                    this.goToSlide(Number.parseInt(slideNumber)); // 'this' is still okay, arrow func
                }
            });
        }

        /*
            TODO
            - improve browser compatibility? classList
            - remove brick-active if it isn't being used
            - need to vastly improve validation. if a string comes in, everything dies
        */
        goToSlide(targetIndex) {
            if (typeof targetIndex === 'undefined' || targetIndex === this.currentSlideIndex) return;

            // Restrict targetIndex in case we want to go to the last item, but we're showing multiple per page
            // In this case we want the target index (think of it as the anchor) to actually be earler than the one requested
            targetIndex = Math.min(targetIndex, this.slides.length - this.options.itemsPerSlide);

            let previousSlideIndex = this.currentSlideIndex;
            this.currentSlideIndex = targetIndex;

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
            this.slider.style.transform = `translateX(${this.xPosition}px) translateZ(0)`;
        }

        next() {
            if (this.currentSlideIndex < this.slides.length - this.options.itemsPerSlide) {
                this.goToSlide(this.currentSlideIndex + 1);
            } else {
                this.performBumpAnimation('right');
                console.warn('Cannot go to next slide past the last one');
            }
        }

        prev() {
            if (this.currentSlideIndex > 0) {
                this.goToSlide(this.currentSlideIndex - 1);
            } else {
                this.performBumpAnimation('left');
                console.warn('Cannot go to previous slide past 0');
            }
        }

        performBumpAnimation(direction) {
            if (!direction || ['left', 'right'].indexOf(direction) === -1) return;
            let bumpClass = `bump-${direction}`;

            this.slider.classList.add(bumpClass);
            setTimeout(() => { this.slider.classList.remove(bumpClass) }, 500)
        }
    }

    window.Brick = Brick;
})();
