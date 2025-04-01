/**
 * W Hollywood Residences - Main JavaScript
 * This file handles all interactive elements for the website
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  headerScrollBehavior();
  initSmoothScroll();
  initFormValidation();
  initAnimations();
  initMobileMenu();
  initHoverEffects();
});

/**
 * Header Scroll Behavior
 * Changes header from transparent to solid on scroll
 */
function headerScrollBehavior() {
  const header = document.querySelector('.site-header');
  const scrollThreshold = 100;

  if (!header) return;

  // Set initial state
  updateHeaderState();

  // Update on scroll
  window.addEventListener('scroll', updateHeaderState);

  function updateHeaderState() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
}

/**
 * Smooth Scroll
 * Enables smooth scrolling to anchors
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Form Validation
 * Validates forms and enhances form interaction
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    // Apply enhanced styling on focus
    const formElements = form.querySelectorAll('input, textarea, select');
    formElements.forEach(element => {
      // Add focus effects
      element.addEventListener('focus', () => {
        element.parentElement.classList.add('focused');
      });
      
      element.addEventListener('blur', () => {
        element.parentElement.classList.remove('focused');
        // Validate on blur
        if (element.value.trim() !== '') {
          element.parentElement.classList.add('has-value');
          validateField(element);
        } else {
          element.parentElement.classList.remove('has-value');
          element.parentElement.classList.remove('error');
        }
      });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
      let isValid = true;
      
      // Validate all fields
      formElements.forEach(element => {
        if (!validateField(element)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        // Scroll to first error
        const firstError = form.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Show loading state
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add('loading');
          submitBtn.originalText = submitBtn.textContent;
          submitBtn.textContent = 'Sending...';
          
          // For demo purposes, we'll reset the button after 2 seconds
          // In production, this would be handled by the form submission response
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = submitBtn.originalText;
          }, 2000);
        }
      }
    });
  });

  function validateField(field) {
    const parent = field.parentElement;
    const value = field.value.trim();
    let isValid = true;
    
    // Reset error state
    parent.classList.remove('error');
    
    // Required fields
    if (field.hasAttribute('required') && value === '') {
      parent.classList.add('error');
      isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        parent.classList.add('error');
        isValid = false;
      }
    }
    
    // Phone validation
    if (field.type === 'tel' && value !== '') {
      const phoneRegex = /^[\d\s\+\-\(\)]{10,15}$/;
      if (!phoneRegex.test(value)) {
        parent.classList.add('error');
        isValid = false;
      }
    }
    
    return isValid;
  }
}

/**
 * Animations
 * Adds animations for elements entering viewport
 */
function initAnimations() {
  // Define elements to animate
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if (animatedElements.length === 0) return;
  
  // Check if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Unobserve after animation is triggered
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    });
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    animatedElements.forEach(element => {
      element.classList.add('animated');
    });
  }
  
  // Animation for hero section
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.classList.add('loaded');
  }
}

/**
 * Mobile Menu Toggle
 * Handles mobile menu functionality
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;
  
  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener('click', () => {
    // Toggle active states
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    body.classList.toggle('menu-open');
  });
  
  // Close menu when clicking on links
  const menuLinks = mobileMenu.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      body.classList.remove('menu-open');
    });
  });
  
  // Close menu on resize (if switching to desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && mobileMenu.classList.contains('active')) {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      body.classList.remove('menu-open');
    }
  });
}

/**
 * Hover Effects
 * Adds interactive hover effects to various elements
 */
function initHoverEffects() {
  // Property cards hover effects
  const propertyCards = document.querySelectorAll('.property-card');
  
  propertyCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });
  
  // Button hover effects with custom cursor for luxury feel
  const luxuryButtons = document.querySelectorAll('.btn-luxury');
  
  luxuryButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      const btnRect = this.getBoundingClientRect();
      
      // Create or get custom cursor element
      let customCursor = document.querySelector('.custom-cursor');
      if (!customCursor) {
        customCursor = document.createElement('div');
        customCursor.classList.add('custom-cursor');
        document.body.appendChild(customCursor);
      }
      
      // Show custom cursor
      customCursor.classList.add('active');
      
      // Track mouse movement within button
      this.addEventListener('mousemove', trackMouseMovement);
    });
    
    button.addEventListener('mouseleave', function() {
      const customCursor = document.querySelector('.custom-cursor');
      if (customCursor) {
        customCursor.classList.remove('active');
      }
      
      this.removeEventListener('mousemove', trackMouseMovement);
    });
  });
  
  function trackMouseMovement(e) {
    const customCursor = document.querySelector('.custom-cursor');
    if (!customCursor) return;
    
    const btnRect = this.getBoundingClientRect();
    const x = e.clientX - btnRect.left;
    const y = e.clientY - btnRect.top;
    
    customCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    
    // Calculate position relative to center of button
    const centerX = btnRect.width / 2;
    const centerY = btnRect.height / 2;
    
    // Subtle tilt effect
    const tiltX = (centerX - x) / 10;
    const tiltY = (y - centerY) / 10;
    
    this.style.transform = `perspective(500px) rotateX(${tiltY}deg) rotateY(${-tiltX}deg) scale(1.05)`;
  }
  
  // Reset transforms when not hovering
  luxuryButtons.forEach(button => {
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(500px) rotateX(0) rotateY(0) scale(1)';
    });
  });
  
  // Navigation hover effects
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });
    
    link.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });
}

