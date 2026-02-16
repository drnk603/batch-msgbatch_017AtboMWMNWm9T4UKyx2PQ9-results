(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInitialized) return;
    app.burgerInitialized = true;

    var toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
    var navCollapse = document.querySelector('.navbar-collapse, #mainNav');
    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
    
    if (!toggle || !navCollapse) return;

    var isOpen = false;

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      navCollapse.classList.remove('show');
      navCollapse.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      navCollapse.classList.add('show');
      navCollapse.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    function toggleMenu() {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMenu();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !navCollapse.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 768 && isOpen) {
        closeMenu();
      }
    }, 250);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (app.smoothScrollInitialized) return;
    app.smoothScrollInitialized = true;

    var currentPath = window.location.pathname;
    var isHomePage = currentPath === '/' || currentPath.endsWith('/index.html');

    var anchorLinks = document.querySelectorAll('a[href^="#"]');

    for (var i = 0; i < anchorLinks.length; i++) {
      var link = anchorLinks[i];
      var href = link.getAttribute('href');

      if (href === '#' || href === '#!') continue;

      if (!isHomePage && href.indexOf('#') === 0) {
        link.setAttribute('href', '/' + href);
      }

      link.addEventListener('click', function(e) {
        var targetHref = this.getAttribute('href');
        var hash = targetHref.indexOf('#') !== -1 ? targetHref.substring(targetHref.indexOf('#')) : '';

        if (!hash || hash === '#' || hash === '#!') return;

        var targetId = hash.substring(1);
        var targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();

          var header = document.querySelector('.l-header, header');
          var headerHeight = header ? header.offsetHeight : 72;

          var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          history.pushState(null, '', hash);
        }
      });
    }
  }

  function initScrollSpy() {
    if (app.scrollSpyInitialized) return;
    app.scrollSpyInitialized = true;

    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link[href^="#"], .c-nav__link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    var scrollHandler = throttle(function() {
      var scrollPosition = window.pageYOffset + 100;

      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          for (var j = 0; j < navLinks.length; j++) {
            var link = navLinks[j];
            var linkHref = link.getAttribute('href');
            
            if (linkHref === '#' + sectionId) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            } else {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
            }
          }
          break;
        }
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });
  }

  function initActiveMenu() {
    if (app.activeMenuInitialized) return;
    app.activeMenuInitialized = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath) continue;

      var isMatch = false;

      if (linkPath === '/' || linkPath === '/index.html') {
        isMatch = currentPath === '/' || currentPath.endsWith('/index.html');
      } else if (linkPath.indexOf('#') === -1) {
        isMatch = currentPath === linkPath || currentPath.endsWith(linkPath);
      }

      if (isMatch) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    }
  }

  function initImages() {
    if (app.imagesInitialized) return;
    app.imagesInitialized = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isLogo = img.classList.contains('c-logo__img') || img.closest('.navbar-brand');
      var isCritical = img.hasAttribute('data-critical');

      if (!img.hasAttribute('loading') && !isLogo && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        var fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e0e0e0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EAfbeelding niet beschikbaar%3C/text%3E%3C/svg%3E';
        this.src = fallbackSvg;
      });
    }
  }

  app.notify = function(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    var alert = document.createElement('div');
    alert.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
    alert.setAttribute('role', 'alert');
    alert.innerHTML = message + '<button type="button" class="btn-close" aria-label="Sluiten"></button>';

    container.appendChild(alert);

    var closeBtn = alert.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        alert.classList.remove('show');
        setTimeout(function() {
          if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
          }
        }, 150);
      });
    }

    setTimeout(function() {
      alert.classList.remove('show');
      setTimeout(function() {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      }, 150);
    }, 5000);
  };

  function initForms() {
    if (app.formsInitialized) return;
    app.formsInitialized = true;

    var forms = document.querySelectorAll('form[data-form-newsletter], form[data-form-contact], form#contactForm');

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var form = this;
        var isValid = true;
        var errors = [];

        var nameField = form.querySelector('#contactName, #fullName');
        var emailFields = form.querySelectorAll('input[type="email"]');
        var phoneField = form.querySelector('#contactPhone, #phone');
        var messageField = form.querySelector('#contactMessage, #message, textarea[name="message"]');
        var consentFields = form.querySelectorAll('input[type="checkbox"][required], input[id*="Consent"]');

        if (nameField && nameField.hasAttribute('required')) {
          var nameValue = nameField.value.trim();
          var namePattern = /^[a-zA-ZÀ-ÿs-']{2,50}$/;
          
          if (nameValue === '') {
            isValid = false;
            errors.push('Naam is verplicht.');
            nameField.classList.add('is-invalid');
          } else if (!namePattern.test(nameValue)) {
            isValid = false;
            errors.push('Naam bevat ongeldige tekens.');
            nameField.classList.add('is-invalid');
          } else {
            nameField.classList.remove('is-invalid');
          }
        }

        for (var j = 0; j < emailFields.length; j++) {
          var emailField = emailFields[j];
          var emailValue = emailField.value.trim();
          var emailPattern = /^[^s@]+@[^s@]+.[^s@]+$/;
          
          if (emailField.hasAttribute('required') && emailValue === '') {
            isValid = false;
            errors.push('E-mailadres is verplicht.');
            emailField.classList.add('is-invalid');
          } else if (emailValue !== '' && !emailPattern.test(emailValue)) {
            isValid = false;
            errors.push('E-mailadres is ongeldig.');
            emailField.classList.add('is-invalid');
          } else {
            emailField.classList.remove('is-invalid');
          }
        }

        if (phoneField && phoneField.hasAttribute('required')) {
          var phoneValue = phoneField.value.trim();
          var phonePattern = /^[ds+-()]{10,20}$/;
          
          if (phoneValue === '') {
            isValid = false;
            errors.push('Telefoonnummer is verplicht.');
            phoneField.classList.add('is-invalid');
          } else if (!phonePattern.test(phoneValue)) {
            isValid = false;
            errors.push('Telefoonnummer is ongeldig.');
            phoneField.classList.add('is-invalid');
          } else {
            phoneField.classList.remove('is-invalid');
          }
        }

        if (messageField && messageField.hasAttribute('required')) {
          var messageValue = messageField.value.trim();
          
          if (messageValue === '') {
            isValid = false;
            errors.push('Bericht is verplicht.');
            messageField.classList.add('is-invalid');
          } else if (messageValue.length < 10) {
            isValid = false;
            errors.push('Bericht moet minimaal 10 tekens bevatten.');
            messageField.classList.add('is-invalid');
          } else {
            messageField.classList.remove('is-invalid');
          }
        }

        for (var k = 0; k < consentFields.length; k++) {
          var consentField = consentFields[k];
          if (!consentField.checked) {
            isValid = false;
            errors.push('U moet akkoord gaan met de privacyverklaring.');
            consentField.classList.add('is-invalid');
          } else {
            consentField.classList.remove('is-invalid');
          }
        }

        if (!isValid) {
          app.notify(errors.join('<br>'), 'danger');
          return;
        }

        var submitButton = form.querySelector('[type="submit"]');
        var originalText = submitButton ? submitButton.innerHTML : '';

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
        }

        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(value, key) {
          data[key] = value;
        });

        setTimeout(function() {
          app.notify('Bedankt! Uw bericht is succesvol verzonden.', 'success');
          form.reset();
          form.classList.remove('was-validated');
          
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
          }

          setTimeout(function() {
            window.location.href = 'thank_you.html';
          }, 1500);
        }, 1000);
      });
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInitialized) return;
    app.scrollToTopInitialized = true;

    var scrollBtn = document.querySelector('[data-scroll-top], .scroll-to-top');
    
    if (!scrollBtn) return;

    function toggleButton() {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    }

    scrollBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    var scrollHandler = throttle(toggleButton, 100);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    toggleButton();
  }

  function initModals() {
    if (app.modalsInitialized) return;
    app.modalsInitialized = true;

    var modalTriggers = document.querySelectorAll('[data-modal-open]');
    
    for (var i = 0; i < modalTriggers.length; i++) {
      modalTriggers[i].addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('data-modal-open');
        var modal = document.getElementById(targetId);
        
        if (modal) {
          modal.classList.add('is-open');
          document.body.classList.add('u-no-scroll');
        }
      });
    }

    var modalClosers = document.querySelectorAll('[data-modal-close]');
    
    for (var j = 0; j < modalClosers.length; j++) {
      modalClosers[j].addEventListener('click', function(e) {
        e.preventDefault();
        var modal = this.closest('.modal');
        
        if (modal) {
          modal.classList.remove('is-open');
          document.body.classList.remove('u-no-scroll');
        }
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var openModal = document.querySelector('.modal.is-open');
        if (openModal) {
          openModal.classList.remove('is-open');
          document.body.classList.remove('u-no-scroll');
        }
      }
    });
  }

  function initCountUp() {
    if (app.countUpInitialized) return;
    app.countUpInitialized = true;

    var counters = document.querySelectorAll('[data-count-up]');
    
    if (counters.length === 0) return;

    function animateCounter(element) {
      var target = parseInt(element.getAttribute('data-count-up'), 10);
      var duration = 2000;
      var start = 0;
      var increment = target / (duration / 16);
      var current = start;

      var timer = setInterval(function() {
        current += increment;
        if (current >= target) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current);
        }
      }, 16);
    }

    for (var i = 0; i < counters.length; i++) {
      animateCounter(counters[i]);
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initImages();
    initForms();
    initScrollToTop();
    initModals();
    initCountUp();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
