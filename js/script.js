var THEMEMASCOT = {};
(function($) {

	"use strict";


  /* ---------------------------------------------------------------------- */
  /* --------------------------- Start Demo Switcher  --------------------- */
  /* ---------------------------------------------------------------------- */

	var showSwitcher = false;
	var $style_switcher = $("#style-switcher");

	if (!$style_switcher.length && showSwitcher) {
		$.ajax({
			url: "color-switcher/style-switcher.html",
			dataType: "html",
			success: function (data) {
				try {
				const $parsed = $("<div>").html(data).contents();
				$("body").append($parsed);
				} catch (e) {
				console.error("Append failed:", e.message);
				console.warn("Response was:", data);
				}
			},
			error: function (xhr, status, error) {
				console.error("AJAX load failed:", status, error);
			}
		});
	}

  /* ---------------------------------------------------------------------- */
  /* ----------------------------- En Demo Switcher  ---------------------- */
  /* ---------------------------------------------------------------------- */


  THEMEMASCOT.isRTL = {
    check: function() {
      if( $( "html" ).attr("dir") === "rtl" ) {
        return true;
      } else {
        return false;
      }
    }
  };

  THEMEMASCOT.isLTR = {
    check: function() {
      if( $( "html" ).attr("dir") !== "rtl" ) {
        return true;
      } else {
        return false;
      }
    }
  };

	// gsap.registerPlugin(ScrollTrigger);

	//Hide Loading Box (Preloader)
	const svg = document.getElementById("preloaderSvg");
		if (svg) {
		const preTl = gsap.timeline({
			onComplete: startAnimationAfterPreloader,
		});
		const curve = "M0 502S175 272 500 272s500 230 500 230V0H0Z";
		const flat = "M0 2S175 1 500 1s500 1 500 1V0H0Z";
		preTl.to(".preloader-heading .load-text , .preloader-heading .cont", {
			delay: .25,
			y: -100,
			opacity: 0,
		});
		preTl
			.to(svg, {
				duration: 0.5,
				attr: { d: curve },
				ease: "power2.easeIn",
			})
			.to(svg, {
				duration: 0.5,
				attr: { d: flat },
				ease: "power2.easeOut",
			});
		preTl.to(".preloader", {
		delay: .25,
			y: -1500,
		});
		preTl.to(".preloader", {
			zIndex: -1,
			display: "none",
		});
		}
		let svgText = document.querySelector("svg text");
		function startAnimationAfterPreloader() {
			if (svgText) {
				// Add a class or directly apply styles to trigger the stroke animation
				svgText.classList.add("animate-stroke");
			}
	}

	//Update Header Style and Scroll to Top
	function headerStyle() {
		if($('.main-header').length){
			var windowpos = $(window).scrollTop();
			var siteHeader = $('.header-style-one');
			var scrollLink = $('.scroll-to-top');
			var sticky_header = $('.main-header .sticky-header');
			if (windowpos > 100) {
				sticky_header.addClass("fixed-header animated slideInDown");
				scrollLink.fadeIn(300);
			}else {
				sticky_header.removeClass("fixed-header animated slideInDown");
				scrollLink.fadeOut(300);
			}
			if (windowpos > 1) {
				siteHeader.addClass("fixed-header");
			}else {
				siteHeader.removeClass("fixed-header");
			}
		}
	}
	headerStyle();

	//Submenu Dropdown Toggle
	if($('.main-header li.dropdown ul').length){
		$('.main-header .navigation li.dropdown').append('<div class="dropdown-btn"><i class="fa fa-angle-down"></i></div>');
	}

	//Mobile Nav Hide Show
	if($('.mobile-menu').length){

		var mobileMenuContent = $('.main-header .main-menu .navigation').html();

		$('.mobile-menu .navigation').append(mobileMenuContent);
		$('.sticky-header .navigation').append(mobileMenuContent);
		$('.mobile-menu .close-btn').on('click', function() {
			$('body').removeClass('mobile-menu-visible');
		});

		//Dropdown Button
		$('.mobile-menu li.dropdown .dropdown-btn').on('click', function() {
			$(this).prev('ul').slideToggle(500);
			$(this).toggleClass('active');
		});

		//Menu Toggle Btn
		$('.mobile-nav-toggler').on('click', function() {
			$('body').addClass('mobile-menu-visible');
		});

		//Menu Toggle Btn
		$('.mobile-menu .menu-backdrop, .mobile-menu .close-btn').on('click', function() {
			$('body').removeClass('mobile-menu-visible');
		});

	}


	//Header Search
	if($('.search-btn').length) {
		$('.search-btn').on('click', function() {
			$('.main-header').addClass('moblie-search-active');
		});
		$('.close-search, .search-back-drop').on('click', function() {
			$('.main-header').removeClass('moblie-search-active');
		});
	}

	// Text Invert
	function initTextReveal() {
        if (document.body.classList.contains('dewford-home') && matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches) return;
		const tagetedElementContainer =
			document.querySelectorAll(".text-reveal-anim");
		if (tagetedElementContainer?.length) {
			tagetedElementContainer.forEach(e => {
				var t = new SplitType(e, {
					types: "words, chars",
				});
				gsap.from(t.chars, {
					scrollTrigger: {
						trigger: e,
						start: "top 75%",
						end: "top 25%",
						scrub: !0,
						duration: 0.5
					},
					opacity: 0.6,
					stagger: 5,
					ease: "back.out",
				});
			});
		}
	}
	initTextReveal();

	//service-carousel One
	if ($('.banner-slider-one').length) {
		var swiper = new Swiper(".banner-slider-one", {
			slidesPerView: 1,
			spaceBetween: 0,
			speed: 600,
			loop: true,
			navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
		});
	}

	// Blog Slider
	if ($(".testimonial-slider-h1").length) {
		var swiper = new Swiper(".testimonial-slider-h1", {
			spaceBetween: 24,
			speed: 1000,
			breakpoints: {
				991: {
					slidesPerView: 2,
				},
				1199: {
					slidesPerView: 2,
				},
				1399: {
					slidesPerView: 2,
				},
			},
			navigation: {
				nextEl: ".blog-slider-next",
				prevEl: ".blog-slider-prev",
			},
			pagination: {
				el: ".blog-slider-pagination",
				clickable: true,
			},
		});
	}

	// Blog Slider
	if ($(".testimonial-slider-h3").length) {
		var swiper = new Swiper(".testimonial-slider-h3", {
			spaceBetween: 24,
			speed: 2500,
			autoplay: true,
			breakpoints: {
				991: {
					slidesPerView: 1,
				},
				1199: {
					slidesPerView: 1,
				},
				1399: {
					slidesPerView: 1,
				},
			},
			navigation: {
				nextEl: ".blog-slider-next",
				prevEl: ".blog-slider-prev",
			},
			pagination: {
				el: ".blog-slider-pagination",
				clickable: true,
			},
		});
	}


	// Home 1 testimonial
	var slider = new Swiper('.service-active-h3', {
		slidesPerView: "auto",
		spaceBetween: 32,
		loop: true,
		speed: 5000,
		autoplay: true,
		centeredSlides: true,
		breakpoints: {
			'1600': {
				slidesPerView: 3.9,
			},
			'1400': {
				slidesPerView: 3.9,
			},
			'1200': {
				slidesPerView: 2.5,
			},
			'992': {
				slidesPerView: 2,
			},
			'768': {
				slidesPerView: 2,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
	});

	// Home BreakFast Gallery Section Slider
	var mySwiper = new Swiper('.project-swiper-container', {
	  loop: true,
	  speed: 1000,
	  autoplay: {
	    delay: 3000,
	  },
	  effect: 'coverflow',
	  grabCursor: true,
	  centeredSlides: true,
	  slidesPerView: 'auto',
	  coverflowEffect: {
	    rotate: 0,
	    stretch: 0,
	    depth: 450,
	    modifier: 3,
	    slideShadows: true,
	  },
	  // Navigation arrows
	  navigation: {
	    nextEl: '.swiper-button-next',
	    prevEl: '.swiper-button-prev',
	  },
	})


	if ($('.service-two-slider').length) {
		var swiper = new Swiper(".service-two-slider", {
			speed:1500,
			loop: true,
			slidesPerView: 1,
			spaceBetween: 0,
			breakpoints: {
				320: {
					slidesPerView: 1,
				},
				576: {
					slidesPerView: 1,
				},
				768: {
					slidesPerView: 2,
				},
				992: {
					slidesPerView: 3,
				},
				1023: {
					slidesPerView: 3,
				},
				1400: {
					slidesPerView: 4,
				},
			},
			// Navigation arrows
			navigation: {
				nextEl: '.slider-next',
				prevEl: '.slider-prev',
			},
		});
	}

	// Home 2 testimonial js
	var swiper = new Swiper(".testimonial-active-home-two", {
		speed:2500,
		loop: true,
		slidesPerView: 1,
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
			pauseOnMouseEnter: true,
		},
		// Navigation arrows
		navigation: {
			nextEl: '.slider-next',
			prevEl: '.slider-prev',
		},
	});

	//Home 03 Slider
	if (document.querySelector(".banner-active")) {
		var swiper = new Swiper(".banner-active", {
			speed: 1500,
			loop: true,
			slidesPerView: 1,
			effect: 'fade',
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
				pauseOnMouseEnter: false,
			},
			navigation: {
				nextEl: ".banner-section-three .array-next",
				prevEl: ".banner-section-three .array-prev",
			},
		});
	}

	// Home 2 banner js
	var swiper = new Swiper(".banner-active-home-two", {
		speed:2500,
		loop: true,
		slidesPerView: 1,
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
			pauseOnMouseEnter: true,
		},
		// Navigation arrows
		navigation: {
			nextEl: '.slider-next',
			prevEl: '.slider-prev',
		},
	});

	// Home 2 banner js
	var swiper = new Swiper(".banner-active-home-three", {
		speed:2500,
		loop: true,
		slidesPerView: 1,
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
			pauseOnMouseEnter: true,
		},
		// Navigation arrows
		navigation: {
			nextEl: '.slider-next',
			prevEl: '.slider-prev',
		},
	});

	if ($('.service-four-slider').length) {
		var swiper = new Swiper(".service-four-slider", {
			speed:1500,
			loop: document.querySelector(".service-four-slider").dataset.loop !== "false",
			slidesPerView: 1,
			spaceBetween: 0,
			breakpoints: {
				320: {
					slidesPerView: 1,
				},
				576: {
					slidesPerView: 1,
				},
				768: {
					slidesPerView: 2,
				},
				992: {
					slidesPerView: 2,
				},
				1023: {
					slidesPerView: 2,
				},
				1400: {
					slidesPerView: 3,
				},
				1599: {
					slidesPerView: 4,
				},
			},
			// Navigation arrows
			navigation: {
				nextEl: '.slider-next',
				prevEl: '.slider-prev',
			},
		});
	}

	// Home 1 Banner Js
	var swiper = new Swiper(".service-two-slider3", {
		speed:1500,
		loop: true,
		slidesPerView: 4,
		effect:'fade',
		autoplay: {
			delay: 3000,            // time between slides (in ms)
			disableOnInteraction: false, // keep autoplay after user interactions
			pauseOnMouseEnter: false,    // optional: autoplay won't pause on hover
		},
		// Navigation arrows
		navigation: {
			nextEl: '.slider-next',
			prevEl: '.slider-prev',
		},
		breakpoints: {
			320: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 3,
			},
			1023: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 4,
			},
		},
	});

	if ($('.service-block .inner-box').length) {
    $(document).ready(function() {
      const $stepBlocks = $('.service-block .inner-box');
      let $lastActiveBlock = $stepBlocks.eq(1); // Start with 2nd div active

      // Initialize - set middle block active
      $stepBlocks.removeClass('active');
      $lastActiveBlock.addClass('active');

      // Hover handling using .on()
      $stepBlocks.on('mouseenter', function() {
        $stepBlocks.removeClass('active');
        $(this).addClass('active');
        $lastActiveBlock = $(this);
      });

      $stepBlocks.on('mouseleave', function() {
        $stepBlocks.removeClass('active');
        $lastActiveBlock.addClass('active');
      });
		});
	}

	if ($('.swiper-slide .service-block-two .inner-box').length) {
    $(document).ready(function() {
      const $stepBlocks = $('.swiper-slide .service-block-two .inner-box');
      let $lastActiveBlock = $stepBlocks.eq(2); // Start with 2nd div active

      // Initialize - set middle block active
      $stepBlocks.removeClass('active');
      $lastActiveBlock.addClass('active');

      // Hover handling using .on()
      $stepBlocks.on('mouseenter', function() {
        $stepBlocks.removeClass('active');
        $(this).addClass('active');
        $lastActiveBlock = $(this);
      });

      $stepBlocks.on('mouseleave', function() {
        $stepBlocks.removeClass('active');
        $lastActiveBlock.addClass('active');
      });
		});
	}

	if ($('.service-block-five .inner-box').length) {
    $(document).ready(function() {
      const $stepBlocks = $('.service-block-five .inner-box');
      let $lastActiveBlock = $stepBlocks.eq(1); // Start with 2nd div active

      // Initialize - set middle block active
      $stepBlocks.removeClass('active');
      $lastActiveBlock.addClass('active');

      // Hover handling using .on()
      $stepBlocks.on('mouseenter', function() {
        $stepBlocks.removeClass('active');
        $(this).addClass('active');
        $lastActiveBlock = $(this);
      });

      $stepBlocks.on('mouseleave', function() {
        $stepBlocks.removeClass('active');
        $lastActiveBlock.addClass('active');
      });
		});
	}

	// Background image area start here ***
	$("[data-background]").each(function() {
	  $(this).css(
	    "background-image",
	    "url( " + $(this).attr("data-background") + "  )"
	  );
	});

	// Background image hover change area start here ***
	$(".service-block-two").hover(function() {
	  let newBackground = $(this).data("bg");
	  $(".service-section-two .outer-box")
	    .attr("data-background", newBackground)
	    .css("background-image", "url(" + newBackground + ")");
	});

	// Background image hover change area start here ***
	$(".service-block-four[data-bg]").hover(function() {
	  let newBackground = $(this).data("bg");
	  $(this).closest(".service-section-four").find(".outer-box")
	    .attr("data-background", newBackground)
	    .css("background-image", "url(" + newBackground + ")");
	});

	//Fact Counter + Text Count
	if ($('.product-details .bxslider').length) {
		$('.product-details .bxslider').bxSlider({
        nextSelector: '.product-details #slider-next',
        prevSelector: '.product-details #slider-prev',
        nextText: '<i class="fa fa-angle-right"></i>',
        prevText: '<i class="fa fa-angle-left"></i>',
        mode: 'fade',
        auto: 'true',
        speed: '700',
        pagerCustom: '.product-details .slider-pager .thumb-box'
    });
	};

	//Distance Range Slider
	if ($('.distance-range-slider').length) {
		$(".distance-range-slider").slider({
			range: true,
			min: 0,
			max: 2000,
			values: [0, 1500],
			slide: function (event, ui){
				$("input.range-amount").val(ui.values[0] + " - " + ui.values[1]);
			}
		});
		$("input.range-amount").val($(".distance-range-slider").slider("values", 0) + " - " + $(".distance-range-slider").slider("values", 1));
	}

  $(".quantity-box .add").on("click", function () {
    if ($(this).prev().val() < 999) {
      $(this)
        .prev()
        .val(+$(this).prev().val() + 1);
    }
  });
  $(".quantity-box .sub").on("click", function () {
    if ($(this).next().val() > 1) {
      if ($(this).next().val() > 1)
        $(this)
        .next()
        .val(+$(this).next().val() - 1);
    }
  });

	//Price Range Slider
	if($('.price-range-slider').length){
		$( ".price-range-slider" ).slider({
			range: true,
			min: 10,
			max: 99,
			values: [ 10, 60 ],
			slide: function( event, ui ) {
			$( "input.property-amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			}
		});

		$( "input.property-amount" ).val( $( ".price-range-slider" ).slider( "values", 0 ) + " - $" + $( ".price-range-slider" ).slider( "values", 1 ) );
	}

	//Accordion Box
	if ($('.accordion-box').length) {
		$(".accordion-box").on('click', '.acc-btn', function () {

			var outerBox = $(this).parents('.accordion-box');
			var target = $(this).parents('.accordion');

			if ($(this).hasClass('active') !== true) {
				$(outerBox).find('.accordion .acc-btn').removeClass('active ');
			}

			if ($(this).next('.acc-content').is(':visible')) {
				$(this).removeClass('active');
				target.removeClass('active-block');
				$(this).next('.acc-content').stop(true, true).slideUp(300);
				return false;
			} else {
				$(this).addClass('active');
				$(outerBox).children('.accordion').removeClass('active-block');
				$(outerBox).find('.accordion').children('.acc-content').slideUp(300);
				target.addClass('active-block');
				$(this).next('.acc-content').slideDown(300);
			}
		});
	}

	//Jquery Knob animation  // Pie Chart Animation
	if ($('.dial').length) {
		$('.dial').appear(function () {
			var elm = $(this);
			var color = elm.attr('data-fgColor');
			var perc = elm.attr('value');

			elm.knob({
				'value': 0,
				'min': 0,
				'max': 100,
				'skin': 'tron',
				'readOnly': true,
				'thickness': 0.15,
				'dynamicDraw': true,
				'displayInput': false
			});

			$({ value: 0 }).animate({ value: perc }, {
				duration: 2000,
				easing: 'swing',
				progress: function () {
					elm.val(Math.ceil(this.value)).trigger('change');
				}
			});

			//circular progress bar color
			$(this).append(function () {
				// elm.parent().parent().find('.circular-bar-content').css('color',color);
				//elm.parent().parent().find('.circular-bar-content .txt').text(perc);
			});

		}, { accY: 20 });
	}


	//Fact Counter + Text Count
	if($('.count-box').length){
		$('.count-box').appear(function(){

			var $t = $(this),
				n = $t.find(".count-text").attr("data-stop"),
				r = parseInt($t.find(".count-text").attr("data-speed"), 10);

			if (!$t.hasClass("counted")) {
				$t.addClass("counted");
				$({
					countNum: $t.find(".count-text").text()
				}).animate({
					countNum: n
				}, {
					duration: r,
					easing: "linear",
					step: function() {
						$t.find(".count-text").text(Math.floor(this.countNum));
					},
					complete: function() {
						$t.find(".count-text").text(this.countNum);
					}
				});
			}

		},{accY: 0});
	}

	//Tabs Box
	if ($('.tabs-box').length) {
		$('.tabs-box .tab-buttons .tab-btn').on('click', function (e) {
			e.preventDefault();
			var target = $($(this).attr('data-tab'));

			if ($(target).is(':visible')) {
				return false;
			} else {
				target.parents('.tabs-box').find('.tab-buttons').find('.tab-btn').removeClass('active-btn');
				$(this).addClass('active-btn');
				target.parents('.tabs-box').find('.tabs-content').find('.tab').fadeOut(0);
				target.parents('.tabs-box').find('.tabs-content').find('.tab').removeClass('active-tab animated fadeIn');
				$(target).fadeIn(300);
				$(target).addClass('active-tab animated fadeIn');
			}
		});
	}


	//Progress Bar
	if ($('.progress-line').length) {
		$('.progress-line').appear(function () {
			var el = $(this);
			var percent = el.data('width');
			$(el).css('width', percent + '%');
		}, { accY: 0 });
	}

	//LightBox / Fancybox
	if($('.lightbox-image').length) {
		$('.lightbox-image').fancybox({
			openEffect  : 'fade',
			closeEffect : 'fade',
			helpers : {
				media : {}
			}
		});
	}

	// Scroll to a Specific Div
	if($('.scroll-to-target').length){
		$(".scroll-to-target").on('click', function() {
			var target = $(this).attr('data-target');
		   // animate
		   $('html, body').animate({
			   scrollTop: $(target).offset().top
			 });

		});
	}

	// Elements Animation
	if($('.wow').length){
		var wow = new WOW(
		  {
			boxClass:     'wow',      // animated element css class (default is wow)
			animateClass: 'animated', // animation css class (default is animated)
			offset:       0,          // distance to the element when triggering the animation (default is 0)
			mobile:       false,       // trigger animations on mobile devices (default is true)
			live:         true       // act on asynchronously loaded content (default is true)
		  }
		);
		wow.init();
	}

	// count Bar
	if ($(".count-bar").length) {
		$(".count-bar").appear(
			function () {
					var el = $(this);
					var percent = el.data("percent");
					$(el).css("width", percent).addClass("counted");
				}, {
					accY: -50
			}
		);
	}


	//Image Reveal Animation
	if($('.reveal').length && !(document.body.classList.contains('dewford-home') && matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches)){
		gsap.registerPlugin(ScrollTrigger);
		let revealContainers = document.querySelectorAll(".reveal");
		revealContainers.forEach((container) => {
			let image = container.querySelector("img");
			let tl = gsap.timeline({
				scrollTrigger: {
				trigger: container,
				toggleActions: "play none none none"
				}
			});
			tl.set(container, { autoAlpha: 1 });
			tl.from(container, 1.5, {
				xPercent: -100,
				ease: Power2.out
			});
			tl.from(image, 1.5, {
				xPercent: 100,
				scale: 1.3,
				delay: -1.5,
				ease: Power2.out
			});
		});
	}

	document.querySelectorAll(".scroll-text").forEach((section) => {
		let tl = gsap.timeline({
			scrollTrigger: {
			trigger: section,
			start: "top 100%",
			end: "bottom top",
			scrub: 1,
			markers: false,
			},
		});
		tl.from(section.querySelector(".text1"), { xPercent: 20 })
		.from(section.querySelector(".text2"), { xPercent: -20 }, 0);
		tl.from(section.querySelector(".scroll-anim-top"), { yPercent: 10 }, 0)
		.from(section.querySelector(".scroll-anim-bottom"), { yPercent: -10 }, 0);
	});

	//Bg Parallax
	if($('.bg-parallax').length){
		gsap.to(".bg-parallax", {
			backgroundPosition: "70% 75%",
			ease: "ease1",
			scrollTrigger: {
			trigger: ".bg-parallax",
			start: "top bottom",
			end: "bottom top",
			scrub: 1
			}
		});
	}

		// Select2 Dropdown
	$('.custom-select').select2({
		minimumResultsForSearch: 7,
	});

	//Gallery Filters
	 if($('.filter-list').length){
	 	 $('.filter-list').mixItUp({});
	 }

	//Custom Data Attributes
	if($('[data-tm-bg-color]').length){
		$('[data-tm-bg-color]').each(function() {
		  $(this).css("cssText", "background-color: " + $(this).data("tm-bg-color") + " !important;");
		});
	}

	if($('.scroll-to-fixed-parent').length){
	  var scroll_childs = $('.scroll-to-fixed-child');
	  for (var i = 0, length = scroll_childs.length; i < length; i++) {
	    var scroll_child = $(scroll_childs[i]);
	    scroll_child.scrollToFixed({
	      marginTop: $('header').outerHeight(true) + 10,
	      zIndex: 2,
	      spacerClass: 'd-none',
	      removeOffsets: true,
	      limit: function() {
	        var parent = this.parents('.scroll-to-fixed-parent');
	        return parent.offset().top + parent.outerHeight(true) - this.outerHeight(true) - 20;
	      }
	    });
	  }
	 }

  /* ---------------------------------------------------------------------- */
  /* ----------- Activate Menu Item on Reaching Different Sections ---------- */
  /* ---------------------------------------------------------------------- */
  var $onepage_nav = $('.onepage-nav');
  var $sections = $('section');
  var $window = $(window);
  function TM_activateMenuItemOnReach() {
	  if( $onepage_nav.length > 0 ) {
	    var cur_pos = $window.scrollTop() + 2;
	    var nav_height = $onepage_nav.outerHeight();
	    $sections.each(function() {
	      var top = $(this).offset().top - nav_height - 80,
	        bottom = top + $(this).outerHeight();

	      if (cur_pos >= top && cur_pos <= bottom) {
	        $onepage_nav.find('a').parent().removeClass('current').removeClass('active');
	        $sections.removeClass('current').removeClass('active');
	        $onepage_nav.find('a[href="#' + $(this).attr('id') + '"]').parent().addClass('current').addClass('active');
	      }

	      if (cur_pos <= nav_height && cur_pos >= 0) {
	        $onepage_nav.find('a').parent().removeClass('current').removeClass('active');
	        $onepage_nav.find('a[href="#header"]').parent().addClass('current').addClass('active');
	      }
	    });
	  }
	}


/* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */

	$(window).on('scroll', function() {
		headerStyle();
		TM_activateMenuItemOnReach();
	});

/* ==========================================================================
   When document is loading, do
   ========================================================================== */

	$(window).on('load', function() {
		// handlePreloader();
	});

})(window.jQuery);
