// Enhanced CYC Website JavaScript

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const bmiForm = document.getElementById('bmiForm');
const resultSection = document.getElementById('result');
const bmiValue = document.getElementById('bmiValue');
const bmiCategory = document.getElementById('bmiCategory');
const progressFill = document.getElementById('progressFill');
const progressIndicator = document.getElementById('progressIndicator');

// Global State
let currentBMI = 0;
let currentCategory = '';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeBMICalculator();
    initializeArticleFilters();
    initializeNewsletterForm();
    initializeScrollEffects();
    initializeCharacterCards();
    initializePlanCards();
    initializeGoalCards();

    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Navigation Functions
function initializeNavigation() {
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Navbar scroll effect
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = 'none';
        }

        lastScrollY = currentScrollY;
    });
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
}

// BMI Calculator Functions
function initializeBMICalculator() {
    if (!bmiForm) return;

    bmiForm.addEventListener('submit', handleBMICalculation);

    // Real-time calculation as user types
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    if (heightInput && weightInput) {
        [heightInput, weightInput].forEach(input => {
            input.addEventListener('input', debounce(calculateBMIRealTime, 500));
        });
    }
}

function handleBMICalculation(e) {
    e.preventDefault();

    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const heightUnit = document.getElementById('heightUnit').value;
    const weightUnit = document.getElementById('weightUnit').value;

    if (!height || !weight || height <= 0 || weight <= 0) {
        showError('Please enter valid height and weight values.');
        return;
    }

    // Convert units to metric
    let heightInMeters = height;
    let weightInKg = weight;

    if (heightUnit === 'ft') {
        heightInMeters = height * 0.3048;
    } else {
        heightInMeters = height / 100;
    }

    if (weightUnit === 'lbs') {
        weightInKg = weight * 0.453592;
    }

    // Calculate BMI
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const category = getBMICategory(bmi);

    displayBMIResult(bmi, category);
}

function calculateBMIRealTime() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

    if (!height || !weight || height <= 0 || weight <= 0) return;

    const heightUnit = document.getElementById('heightUnit').value;
    const weightUnit = document.getElementById('weightUnit').value;

    // Convert units to metric
    let heightInMeters = height;
    let weightInKg = weight;

    if (heightUnit === 'ft') {
        heightInMeters = height * 0.3048;
    } else {
        heightInMeters = height / 100;
    }

    if (weightUnit === 'lbs') {
        weightInKg = weight * 0.453592;
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const category = getBMICategory(bmi);

    displayBMIResult(bmi, category);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function getBMICategoryColor(category) {
    const colors = {
        'Underweight': '#3b82f6',
        'Normal': '#22c55e',
        'Overweight': '#f59e0b',
        'Obese': '#ef4444'
    };
    return colors[category] || '#22c55e';
}

function displayBMIResult(bmi, category) {
    currentBMI = bmi;
    currentCategory = category;

    // Update values
    bmiValue.textContent = bmi.toFixed(1);
    bmiCategory.textContent = category;
    bmiCategory.style.color = getBMICategoryColor(category);

    // Update progress bar
    const percentage = Math.min((bmi / 40) * 100, 100);
    progressFill.style.width = `${percentage}%`;
    progressIndicator.style.left = `${percentage}%`;
    progressIndicator.style.borderColor = getBMICategoryColor(category);

    // Show result section with animation
    resultSection.classList.remove('hidden');
    resultSection.style.animation = 'fadeInUp 0.5s ease';

    // Scroll to result
    setTimeout(() => {
        resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 100);

    // Update get plan button based on BMI
    updateGetPlanButton(category);
}

function updateGetPlanButton(category) {
    const getPlanBtn = document.querySelector('.get-plan-btn');
    if (!getPlanBtn) return;

    const buttonTexts = {
        'Underweight': 'Get Weight Gain Plan',
        'Normal': 'Get Maintenance Plan',
        'Overweight': 'Get Weight Loss Plan',
        'Obese': 'Get Weight Loss Plan'
    };

    getPlanBtn.textContent = buttonTexts[category] || 'Get My Fitness Plan';
}

function showError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">⚠️</span>
            <span class="toast-message">${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Article Filter Functions
function initializeArticleFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleCards = document.querySelectorAll('.article-card');

    if (!filterButtons.length || !articleCards.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter articles
            filterArticles(category, articleCards);
        });
    });

    // Load more functionality
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreArticles);
    }
}

function filterArticles(category, articleCards) {
    articleCards.forEach((card, index) => {
        const cardCategory = card.getAttribute('data-category');
        const shouldShow = category === 'all' || cardCategory === category;

        if (shouldShow) {
            card.style.display = 'block';
            card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
        } else {
            card.style.display = 'none';
        }
    });
}

function loadMoreArticles() {
    // Simulate loading more articles
    const articlesGrid = document.querySelector('.articles-grid');
    const loadMoreBtn = document.querySelector('.load-more-btn');

    if (!articlesGrid || !loadMoreBtn) return;

    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;

    setTimeout(() => {
        // Here you would typically fetch more articles from an API
        showToast('All articles loaded!', 'success');
        loadMoreBtn.style.display = 'none';
    }, 1000);
}

// Newsletter Functions
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', handleNewsletterSubmission);
}

function handleNewsletterSubmission(e) {
    e.preventDefault();

    const emailInput = e.target.querySelector('input[type="email"]');
    const submitBtn = e.target.querySelector('button');

    if (!emailInput || !emailInput.value) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    // Simulate subscription
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;

    setTimeout(() => {
        showToast('Successfully subscribed to newsletter!', 'success');
        emailInput.value = '';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Scroll Effects
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.edu-card, .character-card, .plan-card, .goal-card, .article-card'
    );

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Character Cards
function initializeCharacterCards() {
    const characterCards = document.querySelectorAll('.character-card');

    characterCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) scale(1.02)';
            card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Plan Cards
function initializePlanCards() {
    const planCards = document.querySelectorAll('.plan-card');

    planCards.forEach(card => {
        const startBtn = card.querySelector('.plan-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const planTitle = card.querySelector('h4').textContent;
                handlePlanSelection(planTitle, card);
            });
        }
    });
}

function handlePlanSelection(planTitle, cardElement) {
    // Animate card selection
    cardElement.style.transform = 'scale(0.98)';
    cardElement.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.3)';

    setTimeout(() => {
        cardElement.style.transform = 'scale(1)';
        showToast(`Selected: ${planTitle}. Redirecting to plan details...`, 'success');

        // Here you would typically redirect to plan details or show modal
        setTimeout(() => {
            console.log(`Starting plan: ${planTitle}`);
        }, 1500);
    }, 150);
}

// Goal Cards
function initializeGoalCards() {
    const goalCards = document.querySelectorAll('.goal-card');

    goalCards.forEach(card => {
        const goalBtn = card.querySelector('.goal-btn');
        if (goalBtn) {
            goalBtn.addEventListener('click', () => {
                const goalTitle = card.querySelector('h3').textContent;
                handleGoalSelection(goalTitle, card);
            });
        }
    });
}

function handleGoalSelection(goalTitle, cardElement) {
    // Remove previous selections
    document.querySelectorAll('.goal-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Mark as selected
    cardElement.classList.add('selected');
    cardElement.style.borderColor = 'var(--primary-green)';
    cardElement.style.boxShadow = '0 20px 25px -5px rgb(34 197 94 / 0.2)';

    showToast(`Goal selected: ${goalTitle}`, 'success');

    // Scroll to workout plans
    setTimeout(() => {
        const workoutPlans = document.getElementById('workout-plans');
        if (workoutPlans) {
            workoutPlans.scrollIntoView({ behavior: 'smooth' });
        }
    }, 1000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function scrollToGoals() {
    const goalsSection = document.getElementById('goals');
    if (goalsSection) {
        goalsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Education Card Interactions
document.addEventListener('DOMContentLoaded', function() {
    const eduCards = document.querySelectorAll('.edu-card');

    eduCards.forEach(card => {
        const learnMoreBtn = card.querySelector('.learn-more-btn');
        const topic = card.getAttribute('data-topic');

        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                handleEducationTopic(topic);
            });
        }
    });
});

function handleEducationTopic(topic) {
    const educationContent = {
        calories: {
            title: 'Understanding Calories',
            content: `Calories are units of energy that fuel your body's daily functions. 
                     Every activity from breathing to intense exercise requires energy from the food you eat.
                     Understanding your caloric needs is the foundation of any successful fitness journey.`
        },
        deficit: {
            title: 'Creating a Calorie Deficit',
            content: `A calorie deficit occurs when you burn more calories than you consume.
                     This is the fundamental principle behind weight loss. A moderate deficit of 
                     300-500 calories per day can lead to sustainable fat loss of 1-2 pounds per week.`
        },
        macros: {
            title: 'Macronutrients Explained',
            content: `Proteins, carbohydrates, and fats are the three macronutrients your body needs.
                     Protein builds and repairs tissue, carbs provide energy, and fats support hormone 
                     production and nutrient absorption. The right balance depends on your goals.`
        }
    };

    const content = educationContent[topic];
    if (content) {
        showEducationModal(content.title, content.content);
    }
}

function showEducationModal(title, content) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'education-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary">Learn More</button>
                    <button class="btn-secondary modal-close">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close modal functionality
    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(modal);
        });
    });

    // Close on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(modal);
        }
    });

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 50);
}

function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';

    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 300);
}

// Performance optimizations
window.addEventListener('load', function() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});