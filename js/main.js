document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initGallery();
    initHeaderScroll();
    initMobileMenu();
    initSmoothScroll();
    initLazyLoading();
});

/**
 * Gallery Slide Functionality
 * Handles image galleries with data-image attributes
 */
function initGallery() {
    const galleries = document.querySelectorAll('.gallery');
    
    galleries.forEach(gallery => {
        const slides = gallery.querySelectorAll('.gallery-slide');
        const mainImage = gallery.querySelector('.gallery-main-image');
        const nextBtn = gallery.querySelector('.gallery-next');
        const prevBtn = gallery.querySelector('.gallery-prev');
        
        if (!slides.length || !mainImage) return;
        
        let currentIndex = 0;
        
        // Set initial main image
        updateMainImage(mainImage, slides[currentIndex]);
        
        // Mark the first slide as active
        slides[currentIndex].classList.add('active');
        
        // Handle thumbnail clicks
        slides.forEach((slide, index) => {
            slide.addEventListener('click', () => {
                slides[currentIndex].classList.remove('active');
                currentIndex = index;
                slides[currentIndex].classList.add('active');
                updateMainImage(mainImage, slide);
            });
        });
        
        // Handle next button click
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                slides[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % slides.length;
                slides[currentIndex].classList.add('active');
                updateMainImage(mainImage, slides[currentIndex]);
            });
        }
        
        // Handle previous button click
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                slides[currentIndex].classList.remove('active');
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                slides[currentIndex].classList.add('active');
                updateMainImage(mainImage, slides[currentIndex]);
            });
        }
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!gallery.contains(document.activeElement)) return;
            
            if (e.key === 'ArrowRight') {
                nextBtn && nextBtn.click();
            } else if (e.key === 'ArrowLeft') {
                prevBtn && prevBtn.click();
            }
        });
    });
}

/**
 * Update main image based on data-image attribute
 */
function updateMainImage(mainImage, slide) {
    const image = slide.getAttribute('data-image') || slide.querySelector('img')?.src;
    if (!image) return;
    
    // Preload the image
    const preloadImg = new Image();
    preloadImg.src = image;
    
    // Add loading state
    mainImage.classList.add('loading');
    
    preloadImg.onload = () => {
        mainImage.style.backgroundImage = `url(${image})`;
        
        // Extract caption if available
        const caption = slide.getAttribute('data-caption');
        const captionEl = mainImage.querySelector('.gallery-caption');
        
        if (captionEl && caption) {
            captionEl.textContent = caption;
            captionEl.style.display = 'block';
        } else if (captionEl) {
            captionEl.style.display = 'none';
        }
        
        // Remove loading state
        mainImage.classList.remove('loading');
    };
}

/**
 * Header Scroll Behavior
 * Changes header appearance when scrolling
 */
function initHeaderScroll() {
    const header = document.querySelector('header');
    
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Trigger scroll event initially to set correct state
    window.dispatchEvent(new Event('scroll'));
}

/**
 * Mobile Menu Toggle
 * Handles mobile navigation menu toggling
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu, nav');
    
    if (!menuToggle || !mobileMenu) return;
    
    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        
        // Set appropriate ARIA attributes
        menuToggle.setAttribute('aria-expanded', isOpen);
        
        // Prevent scrolling when menu is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            menuToggle.click();
        }
    });
    
    // Close menu when escape key is pressed
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            menuToggle.click();
        }
    });
}

/**
 * Smooth Scrolling
 * Handles smooth scrolling for anchor links
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (!targetElement) return;
            
            // Get header height for offset
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            
            // Calculate position to scroll to
            const offsetTop = targetElement.offsetTop - headerHeight;
            
            // Scroll smoothly to target
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Update URL without refreshing the page
            history.pushState(null, null, targetId);
            
            // Close mobile menu if open
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle && menuToggle.classList.contains('active')) {
                menuToggle.click();
            }
        });
    });
}

/**
 * Image Lazy Loading
 * Loads images as they enter the viewport
 */
function initLazyLoading() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src], [data-background]');
        
        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    
                    if (lazyImage.hasAttribute('data-src')) {
                        // For regular images
                        lazyImage.src = lazyImage.getAttribute('data-src');
                        lazyImage.removeAttribute('data-src');
                    } else if (lazyImage.hasAttribute('data-background')) {
                        // For background images
                        lazyImage.style.backgroundImage = `url(${lazyImage.getAttribute('data-background')})`;
                        lazyImage.removeAttribute('data-background');
                    }
                    
                    lazyImage.classList.add('loaded');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        }, {
            rootMargin: '0px 0px 200px 0px' // Load images 200px before they enter viewport
        });
        
        lazyImages.forEach(lazyImage => {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        const lazyLoad = () => {
            const lazyImages = document.querySelectorAll('img[data-src], [data-background]');
            
            lazyImages.forEach(lazyImage => {
                const imageTop = lazyImage.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (imageTop < windowHeight + 200) {
                    if (lazyImage.hasAttribute('data-src')) {
                        lazyImage.src = lazyImage.getAttribute('data-src');
                        lazyImage.removeAttribute('data-src');
                    } else if (lazyImage.hasAttribute('data-background')) {
                        lazyImage.style.backgroundImage = `url(${lazyImage.getAttribute('data-background')})`;
                        lazyImage.removeAttribute('data-background');
                    }
                    
                    lazyImage.classList.add('loaded');
                }
            });
        };
        
        // Initial load
        lazyLoad();
        
        // Load on scroll
        window.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
    }
}

/**
 * Fade In Elements
 * Animate elements as they enter the viewport
 */
function initFadeInElements() {
    const fadeElements = document.querySelectorAll('.fade-in, .fade-up, .fade-down, .fade-left, .fade-right');
    
    if ('IntersectionObserver' in window) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });
        
        fadeElements.forEach(element => {
            fadeObserver.observe(element);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        fadeElements.forEach(element => {
            element.classList.add('visible');
        });
    }
}

// Initialize fade-in animations
initFadeInElements();

/**
 * W Hollywood Proposal Website
 * Main JavaScript functionality
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initHeaderScroll();
  initMobileMenu();
  initRolodexGallery();
  initSmoothScroll();
});

/**
 * Header scroll effect
 * Changes header appearance when scrolling down
 */
const initHeaderScroll = () => {
  const header = document.querySelector('header');
  if (!header) return;
  
  const scrollThreshold = 100;
  
  const handleScroll = () => {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  // Initial check
  handleScroll();
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll);
};

/**
 * Mobile menu toggle
 * Handles the opening/closing of mobile navigation
 */
const initMobileMenu = () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  
  if (!menuToggle || !mobileNav) return;
  
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  });
  
  // Close menu when clicking on a link
  const mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });
};

/**
 * Rolodex Gallery
 * Creates an interactive slideshow with auto-play and manual controls
 */
const initRolodexGallery = () => {
  const galleries = document.querySelectorAll('.gallery-rolodex');
  
  galleries.forEach(gallery => {
    const slides = gallery.querySelectorAll('.gallery-slide');
    const nextBtn = gallery.querySelector('.next-slide');
    const prevBtn = gallery.querySelector('.prev-slide');
    const indicators = gallery.querySelector('.gallery-nav');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let slideInterval;
    const intervalTime = 5000; // Time between automatic slides (5 seconds)
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Create indicators if container exists
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('gallery-dot');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.dataset.slide = index;
        
        if (index === 0) {
          dot.classList.add('active');
        }
        }
        
        dot.addEventListener('click', () => {
          goToSlide(index);
          resetInterval();
        });
        
        indicators.appendChild(dot);
      });
    }
    
    // Show a specific slide
    const goToSlide = (n) => {
      // Hide current slide
      slides[currentSlide].classList.remove('active');
      
      // Update indicators if they exist
      if (indicators) {
        indicators.querySelectorAll('.gallery-dot').forEach((indicator, index) => {
          indicator.classList.toggle('active', index === n);
        });
      }
      
      // Update current slide
      currentSlide = (n + slides.length) % slides.length;
      
      // Show new current slide
      slides[currentSlide].classList.add('active');
    };
    
    // Next slide function
    const nextSlide = () => {
      goToSlide(currentSlide + 1);
    };
    
    // Previous slide function
    const prevSlide = () => {
      goToSlide(currentSlide - 1);
    };
    
    // Reset interval timer
    const resetInterval = () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, intervalTime);
    };
    
    // Add event listeners for controls if they exist
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
      });
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
      });
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!slides[currentSlide].closest('.gallery-rolodex').classList.contains('active-gallery')) {
        return;
      }
      
      if (e.key === 'ArrowRight') {
        nextSlide();
        resetInterval();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        resetInterval();
      }
    });
    
    // Show first slide
    slides[0].classList.add('active');
    
    // Start automatic slideshow
    slideInterval = setInterval(nextSlide, intervalTime);
    
    // Pause slideshow when hovering over gallery
    gallery.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
    });
    
    // Resume slideshow when mouse leaves gallery
    gallery.addEventListener('mouseleave', () => {
      slideInterval = setInterval(nextSlide, intervalTime);
    });
    
    // Add active-gallery class for keyboard navigation
    gallery.addEventListener('focusin', () => {
      document.querySelectorAll('.gallery-rolodex').forEach(g => {
        g.classList.remove('active-gallery');
      });
      gallery.classList.add('active-gallery');
    });
    
    // Add touch support for mobile devices
    gallery.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    gallery.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      resetInterval();
    }, { passive: true });
    
    // Handle swipe direction
    const handleSwipe = () => {
      const swipeThreshold = 50; // Minimum distance for a swipe
      const swipeDistance = touchEndX - touchStartX;
      
      if (swipeDistance > swipeThreshold) {
        // Swipe right - go to previous slide
        prevSlide();
      } else if (swipeDistance < -swipeThreshold) {
        // Swipe left - go to next slide
        nextSlide();
      }
    };
  });
};

/**
 * Smooth Scroll
 * Makes anchor links scroll smoothly to their target section
 */
const initSmoothScroll = () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (!targetElement) return;
      
      // Calculate header height for offset
      const headerOffset = document.querySelector('header')?.offsetHeight || 0;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
};

// Utility functions
const debounce = (func, wait = 20, immediate = true) => {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

