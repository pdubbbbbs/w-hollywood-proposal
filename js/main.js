/**
 * main.js - W Hollywood Proposal
 * Main JavaScript file handling all interactive functionality
 */

// Immediately Invoked Function Expression (IIFE) to avoid global scope pollution
(function() {
    'use strict';

    // ====================
    // Utility Module
    // ====================
    const Utility = {
        /**
         * Debounce function to limit the rate at which a function can fire
         * @param {Function} func - The function to debounce
         * @param {number} wait - The time to wait in milliseconds
         * @returns {Function} - Debounced function
         */
        debounce: function(func, wait) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    func.apply(context, args);
                }, wait);
            };
        },

        /**
         * Check if an element is in viewport
         * @param {HTMLElement} el - The element to check
         * @param {number} offset - Optional offset
         * @returns {boolean} - True if element is in viewport
         */
        isInViewport: function(el, offset = 0) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
                rect.bottom >= 0 - offset &&
                rect.left <= (window.innerWidth || document.documentElement.clientWidth) + offset &&
                rect.right >= 0 - offset
            );
        },

        /**
         * Get screen size category
         * @returns {string} - Screen size category (mobile, tablet, desktop)
         */
        getScreenSize: function() {
            const width = window.innerWidth;
            if (width < 768) {
                return 'mobile';
            } else if (width < 1024) {
                return 'tablet';
            } else {
                return 'desktop';
            }
        },

        /**
         * Show error or success message
         * @param {string} message - Message to display
         * @param {string} type - Type of message (error, success)
         * @param {HTMLElement} container - Container element
         */
        showMessage: function(message, type, container) {
            const messageElement = document.createElement('div');
            messageElement.className = `message message-${type}`;
            messageElement.textContent = message;
            
            // Remove any existing messages
            const existingMessages = container.querySelectorAll('.message');
            existingMessages.forEach(msg => msg.remove());
            
            container.appendChild(messageElement);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                messageElement.classList.add('message-fade-out');
                setTimeout(() => {
                    messageElement.remove();
                }, 500);
            }, 5000);
        }
    };

    // ====================
    // Navigation Module
    // ====================
    const Navigation = {
        init: function() {
            this.mobileMenuToggle();
            this.dropdownHandling();
            this.setupResizeHandler();
        },

        /**
         * Handle mobile menu toggling
         */
        mobileMenuToggle: function() {
            const menuToggle = document.querySelector('.menu-toggle');
            const mobileMenu = document.querySelector('.mobile-menu');
            
            if (!menuToggle || !mobileMenu) return;
            
            menuToggle.addEventListener('click', function() {
                menuToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                
                // Toggle aria-expanded for accessibility
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
                menuToggle.setAttribute('aria-expanded', !isExpanded);
                
                // Prevent body scrolling when menu is open
                document.body.classList.toggle('menu-open');
            });
        },

        /**
         * Handle dropdown menus
         */
        dropdownHandling: function() {
            const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
            
            dropdownToggles.forEach(toggle => {
                // For mouse users
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const parent = this.parentElement;
                    const dropdown = parent.querySelector('.dropdown-menu');
                    
                    // Close other open dropdowns
                    const otherDropdowns = document.querySelectorAll('.dropdown.active');
                    otherDropdowns.forEach(item => {
                        if (item !== parent) {
                            item.classList.remove('active');
                            item.querySelector('.dropdown-menu').classList.remove('active');
                            item.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                        }
                    });
                    
                    // Toggle current dropdown
                    parent.classList.toggle('active');
                    dropdown.classList.toggle('active');
                    toggle.setAttribute('aria-expanded', dropdown.classList.contains('active'));
                });
                
                // For keyboard accessibility
                toggle.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });
            
            // Close dropdowns when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.dropdown')) {
                    const activeDropdowns = document.querySelectorAll('.dropdown.active');
                    activeDropdowns.forEach(dropdown => {
                        dropdown.classList.remove('active');
                        dropdown.querySelector('.dropdown-menu').classList.remove('active');
                        dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                    });
                }
            });
        },

        /**
         * Setup window resize handler for responsive navigation
         */
        setupResizeHandler: function() {
            const handleResize = Utility.debounce(function() {
                // Reset mobile menu when resizing to desktop
                if (Utility.getScreenSize() !== 'mobile') {
                    const mobileMenu = document.querySelector('.mobile-menu');
                    const menuToggle = document.querySelector('.menu-toggle');
                    
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        menuToggle.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                        document.body.classList.remove('menu-open');
                    }
                }
            }, 250);
            
            window.addEventListener('resize', handleResize);
        }
    };

    // ====================
    // LazyLoader Module
    // ====================
    const LazyLoader = {
        init: function() {
            this.setupImageLazyLoading();
            this.setupAnimations();
        },

        /**
         * Setup lazy loading for images
         */
        setupImageLazyLoading: function() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            
                            // Replace src placeholder with actual image source
                            const actualSrc = img.dataset.src;
                            if (actualSrc) {
                                img.src = actualSrc;
                                img.removeAttribute('data-src');
                            }
                            
                            // Handle srcset for responsive images
                            const actualSrcset = img.dataset.srcset;
                            if (actualSrcset) {
                                img.srcset = actualSrcset;
                                img.removeAttribute('data-srcset');
                            }
                            
                            // Add loaded class to reveal the image with transition
                            img.addEventListener('load', () => {
                                img.classList.add('loaded');
                            });
                            
                            // Stop observing the image
                            observer.unobserve(img);
                        }
                    });
                }, {
                    rootMargin: '50px 0px', // Load images 50px before they come into view
                    threshold: 0.1 // Trigger when at least 10% of the image is visible
                });

                // Target all images with data-src
                const lazyImages = document.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => {
                    imageObserver.observe(img);
                });
            } else {
                // Fallback for browsers that don't support IntersectionObserver
                this.loadAllImages();
            }
        },

        /**
         * Fallback for loading all images
         */
        loadAllImages: function() {
            const lazyImages = document.querySelectorAll('img[data-src]');
            
            lazyImages.forEach(img => {
                const actualSrc = img.dataset.src;
                if (actualSrc) {
                    img.src = actualSrc;
                    img.removeAttribute('data-src');
                }
                
                const actualSrcset = img.dataset.srcset;
                if (actualSrcset) {
                    img.srcset = actualSrcset;
                    img.removeAttribute('data-srcset');
                }
                
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            });
        },

        /**
         * Setup animations for elements entering viewport
         */
        setupAnimations: function() {
            if ('IntersectionObserver' in window) {
                const animationObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const element = entry.target;
                            
                            // Add animate class to trigger CSS animations
                            element.classList.add('animate');
                            
                            // Handle one-time animations vs repeating
                            if (!element.hasAttribute('data-animate-repeat')) {
                                observer.unobserve(element);
                            }
                        } else if (entry.target.hasAttribute('data-animate-repeat')) {
                            // Remove animation class when element leaves viewport
                            // for repeating animations
                            entry.target.classList.remove('animate');
                        }
                    });
                }, {
                    rootMargin: '0px',
                    threshold: 0.15 // Trigger when at least 15% of the element is visible
                });

                // Target all elements with animate-on-scroll class
                const animatedElements = document.querySelectorAll('.animate-on-scroll');
                animatedElements.forEach(element => {
                    // Add initial hidden state
                    element.classList.add('pre-animation');
                    animationObserver.observe(element);
                });
            } else {
                // Fallback for browsers that don't support IntersectionObserver
                const animatedElements = document.querySelectorAll('.animate-on-scroll');
                animatedElements.forEach(element => {
                    element.classList.add('animate');
                    element.classList.remove('pre-animation');
                });
            }
        }
    };

    // ====================
    // FormValidator Module
    // ====================
    const FormValidator = {
        init: function() {
            this.setupFormsValidation();
        },

        /**
         * Setup validation for all forms with data-validate attribute
         */
        setupFormsValidation: function() {
            const forms = document.querySelectorAll('form[data-validate]');
            
            forms.forEach(form => {
                form.addEventListener('submit', this.validateForm);
                
                // Real-time validation
                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    input.addEventListener('blur', this.validateField);
                    input.addEventListener('input', function() {
                        // Remove error styling on input
                        this.classList.remove('error');
                        const errorMsg = this.parentElement.querySelector('.error-message');
                        if (errorMsg) {
                            errorMsg.remove();
                        }
                    });
                });
            });
        },

        /**
         * Validate individual form field
         * @param {Event} event - Field blur event
         */
        validateField: function(event) {
            const field = event.target;
            const value = field.value.trim();
            const type = field.getAttribute('data-validate');
            let isValid = true;
            let errorMessage = '';
            
            // Remove any existing error messages
            const existingError = field.parentElement.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            field.classList.remove('error');
            
            // Skip validation if field is not required and empty
            if (!field.hasAttribute('required') && value === '') {
                return true;
            }
            
            // Validate based on data-validate type
            switch (type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    isValid = emailRegex.test(value);
                    errorMessage = 'Please enter a valid email address';
                    break;
                    
                case 'phone':
                    const phoneRegex = /^[\d\s\(\)\+\-]{7,20}$/;
                    isValid = phoneRegex.test(value);
                    errorMessage = 'Please enter a valid phone number';
                    break;
                    
                case 'number':
                    isValid = !isNaN(value) && value !== '';
                    errorMessage = 'Please enter a valid number';
                    break;
                    
                case 'text':
                    isValid = value.length > 0;
                    errorMessage = 'This field is required';
                    break;
                    
                default:
                    // If required attribute exists, check if empty
                    if (field.hasAttribute('required')) {
                        isValid = value.length > 0;
                        errorMessage = 'This field is required';
                    }
            }
            
            // Handle min/max length
            if (isValid && field.hasAttribute('minlength')) {
                const minLength = parseInt(field.getAttribute('minlength'));
                if (value.length < minLength) {
                    isValid = false;
                    errorMessage = `Please enter at least ${minLength} characters`;
                }
            }
            
            if (isValid && field.hasAttribute('maxlength')) {
                const maxLength = parseInt(field.getAttribute('maxlength'));
                if (value.length > maxLength) {
                    isValid = false;
                    errorMessage = `Please enter no more than ${maxLength} characters`;
                }
            }
            
            // Display error message if invalid
            if (!isValid) {
                field.classList.add('error');
                
                const errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.textContent = errorMessage;
                
                field.parentElement.appendChild(errorElement);
            }
            
            return isValid;
        },

        /**
         * Validate the entire form on submit
         * @param {Event} event - Form submit event
         */
        validateForm: function(event) {
            const form = event.target;
            const inputs = form.querySelectorAll('input, select, textarea');
            let isValid = true;
            
            // Validate each field
            inputs.forEach(input => {
                // Trigger validation for each field
                const fieldEvent = new Event('blur', { bubbles: true });
                input.dispatchEvent(fieldEvent);
                
                // Check if field has error class
                if (input.classList.contains('error')) {
                    isValid = false;
                }
            });
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
                
                // Scroll to first error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                
                // Show general form error message
                const formErrorContainer = form.querySelector('.form-errors') || form;
                Utility.showMessage('Please correct the errors in the form before submitting.', 'error', formErrorContainer);
            } else {
                // Form is valid, handle submission
                this.handleFormSubmission(form, event);
            }
            
            return isValid;
        },
        
        /**
         * Handle form submission when validation passes
         * @param {HTMLFormElement} form - The form element
         * @param {Event} event - The submit event
         */
        handleFormSubmission: function(form, event) {
            // Get form submission type
            const submitType = form.getAttribute('data-submit-type') || 'ajax';
            
            if (submitType === 'ajax') {
                event.preventDefault();
                
                // Show loading state
                const submitButton = form.querySelector('[type="submit"]');
                if (submitButton) {
                    const originalText = submitButton.textContent;
                    submitButton.disabled = true;
                    submitButton.textContent = 'Sending...';
                    
                    // Simulate AJAX form submission
                    setTimeout(() => {
                        // Show success message
                        const successMessage = form.getAttribute('data-success-message') || 'Form submitted successfully!';
                        Utility.showMessage(successMessage, 'success', form);
                        
                        // Reset form
                        form.reset();
                        
                        // Restore button state
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                    }, 1500);
                }
            }
            // For standard form submissions, let the default behavior happen
        }
/**
    };
    
    // ====================
    // SmoothScroll Module
    // ====================
    const SmoothScroll = {
        init: function() {
            this.setupSmoothScrolling();
        },
        
        /**
         * Set up smooth scrolling for anchor links
         */
        setupSmoothScrolling: function() {
            const scrollLinks = document.querySelectorAll('a[href^="#"]');
            
            scrollLinks.forEach(link => {
                link.addEventListener('click', this.handleSmoothScroll);
            });
        },
        
        /**
         * Handle smooth scroll for an element
         * @param {Event} event - Click event
         */
        handleSmoothScroll: function(event) {
            const targetId = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                event.preventDefault();
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    if (menuToggle) menuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
                
                // Get header height for offset
                const headerHeight = document.querySelector('header') ? 
                    document.querySelector('header').offsetHeight : 0;
                
                // Scroll to target with offset for fixed header
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight - 20, // Extra padding
                    behavior: 'smooth'
                });
                
                // Update URL hash after scrolling
                setTimeout(() => {
                    history.pushState(null, null, targetId);
                }, 1000);
            }
        },
        
        /**
         * Scroll to a specific element programmatically
         * @param {string|HTMLElement} target - Target element or selector
         */
        scrollToElement: function(target) {
            const targetElement = typeof target === 'string' ? 
                document.querySelector(target) : target;
                
            if (targetElement) {
                const headerHeight = document.querySelector('header') ? 
                    document.querySelector('header').offsetHeight : 0;
                    
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });
            }
        }
    };
    
    /**
     * Setup global event listeners 
     */
    const setupEventListeners = function() {
        // Handle hash links on page load
        if (window.location.hash) {
            setTimeout(() => {
                SmoothScroll.scrollToElement(window.location.hash);
            }, 500);
        }
        
        // Back to top button
        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            // Show/hide button based on scroll position
            window.addEventListener('scroll', Utility.debounce(function() {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            }, 150));
            
            // Scroll to top when clicked
            backToTopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
        
        // Handle form errors when user interacts with field
        document.addEventListener('input', function(e) {
            if (e.target.matches('input, select, textarea')) {
                e.target.classList.remove('error');
                const errorMsg = e.target.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
    };
    
    // Initialize all modules when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize all modules
        Navigation.init();
        LazyLoader.init();
        FormValidator.init();
        SmoothScroll.init();
        
        // Initialize financial calculators if on finance page
        if (document.querySelector('.financial-calculators')) {
            FinancialCalculators.init();
        }
        
        // Add global event listeners
        setupEventListeners();
    });
/**
 * Financial Calculators Module
 * Handles all calculations related to mortgages, investments, and comparisons
 */
const FinancialCalculators = (() => {
    // Private variables
    const mortgageFormId = 'mortgage-calculator-form';
    const investmentFormId = 'investment-calculator-form';
    const comparisonFormId = 'comparison-calculator-form';
    
    // Default values
    const defaultInterestRate = 0.055; // 5.5%
    const defaultLoanTerm = 30; // 30 years
    const defaultAppreciationRate = 0.03; // 3% annual appreciation
    const defaultMonthlyRent = 7500; // $7,500 monthly rent

    // Initialize the financial calculators
    const init = () => {
        initializeMortgageCalculator();
        initializeInvestmentCalculator();
        initializeBuyVsRentComparison();
        renderInitialCharts();
    };

    // Calculate monthly mortgage payment
    const calculateMortgage = (principal, interestRate, loanTermYears) => {
        const monthlyRate = interestRate / 12;
        const totalPayments = loanTermYears * 12;
        
        // If interest rate is 0, simple division
        if (interestRate === 0) {
            return principal / totalPayments;
        }
        
        // Standard mortgage calculation formula
        const x = Math.pow(1 + monthlyRate, totalPayments);
        return principal * monthlyRate * x / (x - 1);
    };

    // Calculate investment returns over time
    const calculateInvestmentReturns = (principal, monthlyContribution, annualInterestRate, years) => {
        const monthlyRate = annualInterestRate / 12;
        const totalMonths = years * 12;
        let futureValue = principal;
        
        // Calculate compound interest with monthly contributions
        for (let i = 0; i < totalMonths; i++) {
            futureValue = futureValue * (1 + monthlyRate) + monthlyContribution;
        }
        
        return futureValue;
    };

    // Compare buying vs renting over a period
    const calculateBuyVsRent = (
        purchasePrice, 
        downPayment, 
        interestRate, 
        loanTerm, 
        monthlyRent, 
        annualAppreciation, 
        annualRentIncrease, 
        hoaMonthly, 
        propertyTaxRate, 
        years
    ) => {
        // Calculate loan amount
        const loanAmount = purchasePrice - downPayment;
        
        // Calculate monthly mortgage payment
        const monthlyMortgage = calculateMortgage(loanAmount, interestRate, loanTerm);
        
        // Monthly property tax
        const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;
        
        // Initialize results
        const results = {
            buying: {
                monthlyCosts: [],
                totalPaid: 0,
                equity: 0,
                netResult: 0
            },
            renting: {
                monthlyCosts: [],
                totalPaid: 0,
                investment: 0,
                netResult: 0
            }
        };
        
        // Current property value (starts at purchase price)
        let propertyValue = purchasePrice;
        
        // Current rent (starts at provided monthly rent)
        let currentRent = monthlyRent;
        
        // Calculate for each month
        for (let month = 0; month < years * 12; month++) {
            // Update property value with appreciation
            if (month > 0 && month % 12 === 0) {
                propertyValue *= (1 + annualAppreciation);
                currentRent *= (1 + annualRentIncrease);
            }
            
            // Monthly cost of buying
            const buyingMonthlyCost = monthlyMortgage + hoaMonthly + monthlyPropertyTax;
            results.buying.monthlyCosts.push(buyingMonthlyCost);
            results.buying.totalPaid += buyingMonthlyCost;
            
            // Monthly cost of renting
            const rentingMonthlyCost = currentRent;
            results.renting.monthlyCosts.push(rentingMonthlyCost);
            results.renting.totalPaid += rentingMonthlyCost;
            
            // Calculate what renter could invest (down payment + difference in monthly cost)
            if (month === 0) {
                results.renting.investment = downPayment;
            }
            
            const monthlyDifference = buyingMonthlyCost - rentingMonthlyCost;
            if (monthlyDifference > 0) {
                // Renter can invest the difference
                results.renting.investment *= (1 + (annualAppreciation / 12)); // Assume same return rate
                results.renting.investment += monthlyDifference;
            }
        }
        
        // Final calculations
        results.buying.equity = propertyValue - loanAmount;
        results.buying.netResult = results.buying.equity - results.buying.totalPaid;
        results.renting.netResult = results.renting.investment - results.renting.totalPaid;
        
        return results;
    };

    // Initialize mortgage calculator form
    const initializeMortgageCalculator = () => {
        const mortgageForm = document.getElementById(mortgageFormId);
        if (!mortgageForm) return;
        
        mortgageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(mortgageForm);
            
            const principal = parseFloat(formData.get('principal'));
            const interestRate = parseFloat(formData.get('interest-rate')) / 100;
            const loanTerm = parseInt(formData.get('loan-term'));
            
            const monthlyPayment = calculateMortgage(principal, interestRate, loanTerm);
            
            // Display result
            const resultElement = document.getElementById('mortgage-result');
            if (resultElement) {
                resultElement.textContent = `$${monthlyPayment.toFixed(2)} per month`;
                resultElement.classList.add('highlight');
                setTimeout(() => resultElement.classList.remove('highlight'), 1500);
            }
        });
    };

    // Initialize investment calculator form
    const initializeInvestmentCalculator = () => {
        const investmentForm = document.getElementById(investmentFormId);
        if (!investmentForm) return;
        
        investmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(investmentForm);
            
            const principal = parseFloat(formData.get('initial-investment'));
            const monthlyContribution = parseFloat(formData.get('monthly-contribution'));
            const interestRate = parseFloat(formData.get('annual-return')) / 100;
            const years = parseInt(formData.get('investment-period'));
            
            const futureValue = calculateInvestmentReturns(principal, monthlyContribution, interestRate, years);
            
            // Display result
            const resultElement = document.getElementById('investment-result');
            if (resultElement) {
                resultElement.textContent = `$${futureValue.toFixed(2)} after ${years} years`;
                resultElement.classList.add('highlight');
                setTimeout(() => resultElement.classList.remove('highlight'), 1500);
            }
        });
    };

    // Initialize buy vs rent comparison calculator
    const initializeBuyVsRentComparison = () => {
        const comparisonForm = document.getElementById(comparisonFormId);
        if (!comparisonForm) return;
        
        comparisonForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(comparisonForm);
            
            const purchasePrice = parseFloat(formData.get('purchase-price'));
            const downPayment = parseFloat(formData.get('down-payment'));
            const interestRate = parseFloat(formData.get('interest-rate')) / 100;
            const loanTerm = parseInt(formData.get('loan-term'));
            const monthlyRent = parseFloat(formData.get('monthly-rent'));
            const annualAppreciation = parseFloat(formData.get('annual-appreciation')) / 100;
            const annualRentIncrease = parseFloat(formData.get('annual-rent-increase')) / 100;
            const hoaMonthly = parseFloat(formData.get('monthly-hoa'));
            const propertyTaxRate = parseFloat(formData.get('property-tax-rate')) / 100;
            const years = parseInt(formData.get('comparison-period'));
            
            const results = calculateBuyVsRent(
                purchasePrice,
                downPayment,
                interestRate,
                loanTerm,
                monthlyRent,
                annualAppreciation,
                annualRentIncrease,
                hoaMonthly,
                propertyTaxRate,
                years
            );
            
            // Display results
            updateComparisonResults(results);
            
            // Update chart
            updateComparisonChart(results, years);
        });
    };

    // Update the comparison results in the DOM
    const updateComparisonResults = (results) => {
        const buyingTotalElement = document.getElementById('buying-total');
        const buyingEquityElement = document.getElementById('buying-equity');
        const buyingNetElement = document.getElementById('buying-net');
        
        const rentingTotalElement = document.getElementById('renting-total');
        const rentingInvestmentElement = document.getElementById('renting-investment');
        const rentingNetElement = document.getElementById('renting-net');
        
        if (buyingTotalElement) buyingTotalElement.textContent = `$${results.buying.totalPaid.toFixed(2)}`;
        if (buyingEquityElement) buyingEquityElement.textContent = `$${results.buying.equity.toFixed(2)}`;
        if (buyingNetElement) buyingNetElement.textContent = `$${results.buying.netResult.toFixed(2)}`;
        
        if (rentingTotalElement) rentingTotalElement.textContent = `$${results.renting.totalPaid.toFixed(2)}`;
        if (rentingInvestmentElement) rentingInvestmentElement.textContent = `$${results.renting.investment.toFixed(2)}`;
        if (rentingNetElement) rentingNetElement.textContent = `$${results.renting.netResult.toFixed(2)}`;
        
        // Highlight better option
        const comparisonResultElement = document.getElementById('comparison-result');
        if (comparisonResultElement) {
            if (results.buying.netResult > results.renting.netResult) {
                comparisonResultElement.textContent = 'Buying is financially advantageous in this scenario.';
                comparisonResultElement.className = 'result positive';
            } else {
                comparisonResultElement.textContent = 'Renting is financially advantageous in this scenario.';
                comparisonResultElement.className = 'result negative';
            }
        }
    };

    // Render initial empty charts
    const renderInitialCharts = () => {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js library not found. Charts will not be rendered.');
            return;
        }
        
        // Set up mortgage payment breakdown chart
        const mortgageCtx = document.getElementById('mortgage-chart');
        if (mortgageCtx) {
            new Chart(mortgageCtx, {
                type: 'pie',
                data: {
                    labels: ['Principal', 'Interest'],
                    datasets: [{
                        data: [70, 30],
                        backgroundColor: ['#4CAF50', '#FF5722']
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Mortgage Payment Breakdown'
                    }
                }
            });
        }
        
        // Set up buy vs rent comparison chart
        const comparisonCtx = document.getElementById('comparison-chart');
        if (comparisonCtx) {
            new Chart(comparisonCtx, {
                type: 'line',
                data: {
                    labels: [...Array(30).keys()].map(i => `Year ${i+1}`),
                    datasets: [
                        {
                            label: 'Net Worth - Buying',
                            data: Array(30).fill(0),
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            fill: true
                        },
                        {
                            label: 'Net Worth - Renting',
                            data: Array(30).fill(0),
                            borderColor: '#FF5722',
                            backgroundColor: 'rgba(255, 87, 34, 0.1)',
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Buy vs Rent - Net Worth Over Time'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Net Worth ($)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Years'
                            }
                        }
                    }
                }
            });
        }
    };

    // Update buy vs rent chart with actual data
    const updateComparisonChart = (results, years) => {
        if (typeof Chart === 'undefined') return;
        
        const comparisonChart = Chart.getChart('comparison-chart');
        if (!comparisonChart) return;
        
        // Generate yearly data points for net worth in both scenarios
        const yearLabels = [...Array(years).keys()].map(i => `Year ${i+1}`);
        
        // Calculate property value and remaining loan data points
        const buyingNetWorth = [];
        const rentingNetWorth = [];
        
        // Simplify for demonstration - we'll use the final results divided by years
        for (let year = 1; year <= years; year++) {
            buyingNetWorth.push(results.buying.netResult * (year / years));
            rentingNetWorth.push(results.renting.netResult * (year / years));
        }
        
        // Update chart data
        comparisonChart.data.labels = yearLabels;
        comparisonChart.data.datasets[0].data = buyingNetWorth;
        comparisonChart.data.datasets[1].data = rentingNetWorth;
        
        comparisonChart.update();
    };

    // Return public methods
    return {
        init,
        calculateMortgage,
                     } else {
                        const message = document.createElement('span');
                        message.classList.add('error-message');
                        message.textContent = `${field.getAttribute('placeholder') || 'Field'} is required`;
                        field.parentNode.insertBefore(message, field.nextSibling);
                    }
                } else {
                    field.classList.remove('error');
                    const errorMessage = field.nextElementSibling;
                    if (errorMessage && errorMessage.classList.contains('error-message')) {
                        errorMessage.textContent = '';
                    }
                }
                
                // Email validation
                if (field.type === 'email' && field.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value.trim())) {
                        isValid = false;
                        field.classList.add('error');
                        
                        const errorMessage = field.nextElementSibling;
                        if (errorMessage && errorMessage.classList.contains('error-message')) {
                            errorMessage.textContent = 'Please enter a valid email address';
                        } else {
                            const message = document.createElement('span');
                            message.classList.add('error-message');
                            message.textContent = 'Please enter a valid email address';
                            field.parentNode.insertBefore(message, field.nextSibling);
                        }
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
        
        // Clear error state on input
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('error');
                const errorMessage = this.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.textContent = '';
                }
            });
        });
    }
    
    // Unit comparison functionality
    const comparisonButtons = document.querySelectorAll('.compare-units-btn');
    
    if (comparisonButtons.length) {
        comparisonButtons.forEach(button => {
            button.addEventListener('click', function() {
                const comparisonContainer = document.querySelector('.comparison-table');
                if (comparisonContainer) {
                    comparisonContainer.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
});

