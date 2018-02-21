/*
--------------------------------
Usage
--------------------------------
- var carousel = new Brick()
- bootstrapping the data

--------------------------------
Concepts
--------------------------------
- slide
    - a slide in a brick carousel represents all of the items that are visible in the carousel at once
- item
    - an item in a brick carousel is an individual element which you want to display in the carousel

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
Potential optimizations
--------------------------------
- Instead of each init function doing its own doc fragment and then adding them individually, could potentially create one
master fragment in the init, each sub init function can add to that, and then at the end of everything append the fragment
- Look into a way to be able to init all carousels at once without having to do them sequentially

--------------------------------
Main todo
--------------------------------
- implement centerMode
    - to get this fully working, will need support for infinite looping if we want to be able to see preview of the next/prev slides
- implement infinite
- implement items per scroll
- style dots and arrows
- bootstrapping the data
    - maybe have a master data-brick-bootstrap="true" to trigger it
- autoplay
    - disables when there's a manual user action of any kind
- swiping for mobile
- accessibility

--------------------------------
Other POTENTIAL features
--------------------------------
- custom events
- ajax loading, adding/removing slides dynamically
    - future ajax slides can hold reference to args and an endpoint and slick can handle the call, if there is an assumption that the call will return one slide worth of items

 */

(function() {
    'use strict';

    if (window.Brick || typeof window.Brick !== 'undefined') return;

    const BRICK_DEFAULTS = {
        itemsPerSlide: 1, // How many slides are visible at any given time
        centerMode: true, // Whether or not the active slide is centered
        infinite: false, // Whether or not the carousel is infinite
        dots: true, // Whether or not the dots should exist

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
            let frag = document.createDocumentFragment();
            let slider = document.createElement('div');
            slider.classList.add('brick-slider');
            this.rootNode.classList.add('brick-container');

            for (let i = 0; i < this.slides.length; i++) {
                slider.appendChild(this.slides[i]);
            }

            frag.appendChild(slider);
            this.rootNode.appendChild(frag);
            this.slider = slider;
        }

        initSlides() {
            let slides = [];

            for (let i = 0; i < this.rootNode.children.length; i++) {
                let slide = this.rootNode.children[i];
                slide.classList.add('brick-slide');
                // apparently just reading offsetWidth can cause a reflow https://www.sitepoint.com/10-ways-minimize-reflows-improve-performance/
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
            // Also check for if the dots option is enabled

            let frag = document.createDocumentFragment();
            let prevArrow = document.createElement('button');
            let nextArrow = document.createElement('button');
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
            let frag = document.createDocumentFragment();
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
            - improve browser compatibility? classList is IE10+
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
            setTimeout(() => { this.slider.classList.remove(bumpClass) }, 500) // this is poopy
        }
    }

    window.Brick = Brick;
})();
