'use strict';

/* -------------------------
   Utilities
-------------------------*/
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); };

/* -------------------------
   Sidebar
-------------------------*/
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebarBtn && sidebar) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}

/* -------------------------
   Testimonials - inline "centered" expand (works on touch + mouse)
-------------------------*/
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");

// keep reference to current expanded elements
let expandedOverlay = null;
let expandedModal = null;
let currentSourceItem = null;
let escHandler = null;

function closeExpanded() {
  if (expandedModal) {
    expandedModal.classList.remove('visible');
    // allow transition to finish then remove
    setTimeout(() => {
      if (expandedModal && expandedModal.parentNode) expandedModal.parentNode.removeChild(expandedModal);
      expandedModal = null;
    }, 200);
  }
  if (expandedOverlay) {
    expandedOverlay.classList.remove('visible');
    setTimeout(() => {
      if (expandedOverlay && expandedOverlay.parentNode) expandedOverlay.parentNode.removeChild(expandedOverlay);
      expandedOverlay = null;
    }, 200);
  }
  currentSourceItem = null;
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
}

function buildExpandedModalFrom(item) {
  // read data from the clicked item
  const avatar = item.querySelector('[data-testimonials-avatar]');
  const title = item.querySelector('[data-testimonials-title]');
  const text = item.querySelector('[data-testimonials-text]');

  // create overlay
  expandedOverlay = document.createElement('div');
  expandedOverlay.className = 'expanded-overlay';
  document.body.appendChild(expandedOverlay);
  // allow animation
  requestAnimationFrame(() => expandedOverlay.classList.add('visible'));
  expandedOverlay.addEventListener('click', () => closeExpanded());

  // create modal container
  expandedModal = document.createElement('div');
  expandedModal.className = 'expanded-testimonial';
  expandedModal.innerHTML = `
    <button class="expanded-close" aria-label="Close testimonial">&times;</button>
    <div class="expanded-inner">
      <div class="expanded-header">
        <div class="modal-avatar-box expanded-avatar-box">
          ${avatar ? `<img src="${avatar.src}" alt="${avatar.alt || ''}" loading="lazy">` : ''}
        </div>
        <div class="expanded-title-wrap">
          <h4 class="h3 modal-title expanded-title">${title ? title.innerHTML : ''}</h4>
        </div>
      </div>
      <div class="expanded-body">
        ${text ? text.innerHTML : ''}
      </div>
    </div>
  `;
  document.body.appendChild(expandedModal);

  // small delay to trigger CSS transition
  requestAnimationFrame(() => expandedModal.classList.add('visible'));

  // close button
  const closeBtn = expandedModal.querySelector('.expanded-close');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeExpanded();
  });

  // stop clicks inside modal from closing via overlay
  expandedModal.addEventListener('click', (e) => e.stopPropagation());

  // ESC key to close
  escHandler = function (e) {
    if (e.key === 'Escape') closeExpanded();
  };
  document.addEventListener('keydown', escHandler);
}

function toggleExpand(item) {
  // if already expanded from this item -> close
  if (currentSourceItem === item) {
    closeExpanded();
    return;
  }
  // else close existing and open new
  closeExpanded();
  currentSourceItem = item;
  buildExpandedModalFrom(item);
}

// tap detection to avoid opening while swiping
testimonialsItem.forEach(function (item) {
  let pointerDown = false;
  let startX = 0;
  let startY = 0;
  let pointerId = null;

  item.addEventListener('pointerdown', function (e) {
    pointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
    pointerId = e.pointerId;
    try { item.setPointerCapture(pointerId); } catch (err) { /* ignore */ }
  });

  item.addEventListener('pointerup', function (e) {
    if (!pointerDown) return;
    pointerDown = false;
    try { item.releasePointerCapture(pointerId); } catch (err) { /* ignore */ }

    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);

    // threshold: treat as a tap if finger/mouse moved < 10px
    if (dx < 10 && dy < 10) {
      toggleExpand(item);
    }
  });

  item.addEventListener('pointercancel', function () {
    pointerDown = false;
    try { item.releasePointerCapture(pointerId); } catch (err) { /* ignore */ }
  });
});

/* -------------------------
   (Other page features kept from original)
-------------------------*/

/* custom select variables */
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) select.addEventListener("click", function () { elementToggleFunc(this); });

for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = this.innerText;
    if (select) elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

/* filter */
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
};

if (filterBtn && filterBtn.length > 0) {
  let lastClickedBtn = filterBtn[0];
  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      if (lastClickedBtn) lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  }
}

/* contact form validation */
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    if (!form || !formBtn) return;
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

/* page navigation */
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let j = 0; j < pages.length; j++) {
      if (this.innerHTML.toLowerCase() === pages[j].dataset.page) {
        pages[j].classList.add("active");
        navigationLinks[j].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[j].classList.remove("active");
        navigationLinks[j].classList.remove("active");
      }
    }
  });
}

/* WhatsApp form submission */
function sendWhatsApp(e) {
  e.preventDefault();
  const name = document.getElementById('fullname')?.value || '';
  const email = document.getElementById('email')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  const message = document.getElementById('message')?.value || '';

  const text = `Hello Adityapratap, 👋

My name is ${name}.  
You can reach me at ${email} or on ${phone}.  

Here’s my message for you:  
"${message}"  

Looking forward to your reply! 😊`;

  const whatsappNumber = "+917355259901";
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
