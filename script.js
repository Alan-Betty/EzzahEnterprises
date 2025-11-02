// Basic form handling for Order and Contact forms, submits to Formsubmit (formsubmit.co) endpoints
(function(){
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(i=> i.setAttribute('min', today));

  // helper: display status
  function showStatus(el, message, type){
    el.textContent = message;
    el.classList.remove('success','error');
    if(type) el.classList.add(type);
  }

  // Modal helper
  const modal = document.getElementById('modal');
  const modalMessage = modal ? modal.querySelector('#modal-message') : null;
  function showModal(text, ms = 6000){
    if(!modal) return;
    modalMessage.textContent = text;
    modal.setAttribute('aria-hidden', 'false');
    // celebratory confetti
    try{ launchConfetti(40); }catch(e){}
    // auto dismiss
    clearTimeout(modal._timeout);
    modal._timeout = setTimeout(()=> closeModal(), ms);
  }
  function closeModal(){
    if(!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    clearTimeout(modal._timeout);
  }
  if(modal){
    modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
    const btn = modal.querySelector('.modal-close'); if(btn) btn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });
  }

  // Confetti launcher
  function launchConfetti(count = 36){
    const rootStyles = getComputedStyle(document.documentElement);
    const c1 = rootStyles.getPropertyValue('--accent').trim() || '#00c2a8';
    const c2 = rootStyles.getPropertyValue('--accent-2').trim() || '#6b46c1';
    const extras = ['#7dd3fc','#a78bfa','#34d399'];
    const colors = [c1, c2, ...extras];
    const pieces = [];
    for(let i=0;i<count;i++){
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random()*colors.length)];
      el.style.background = color;
      const left = Math.random()*100;
      el.style.left = left + 'vw';
      el.style.top = (-10 - Math.random()*5) + 'vh';
      const delay = Math.random()*300;
      const dur = 2000 + Math.random()*2200;
      el.style.animation = `confetti-fall ${dur}ms cubic-bezier(.2,.8,.3,1) ${delay}ms forwards`;
      el.style.transform = `rotate(${Math.random()*360}deg)`;
      document.body.appendChild(el);
      pieces.push(el);
    }
    // cleanup
    setTimeout(()=> pieces.forEach(p=>p.remove()), 7000);
  }

  async function submitForm(form, statusEl){
    const endpoint = form.action;


    const fd = new FormData(form);
    // add a little meta
    fd.append('_subject', `New submission from Ezzah Enterprises website (${form.id})`);

  // disable submit button while sending
  const submitBtn = form.querySelector('button[type="submit"]');
  const prevBtnText = submitBtn ? submitBtn.textContent : null;
  if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

    try{
      showStatus(statusEl, 'Sending...', null);
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
        headers: {
          'Accept': 'application/json'
        }
      });

      if(res.ok){
        form.reset();
        // show modal specific to which form
        if(form.id === 'order-form'){
          showModal('Order received — you will receive a mail regarding this shortly.');
        } else if(form.id === 'contact-form'){
          showModal('Thank you for submitting. You will shortly be contacted by one of our staff.');
        } else {
          showModal('Thanks — your message was sent!');
        }
        showStatus(statusEl, '', null);
      } else {
        const data = await res.json().catch(()=>({}));
        showStatus(statusEl, data.error || 'Submission failed. Please try again later.', 'error');
      }
    }catch(err){
      console.error(err);
      showStatus(statusEl, 'Network error. Please check your connection and try again.', 'error');
    } finally {
      if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = prevBtnText; }
    }
  }

  // attach handlers
  const orderForm = document.getElementById('order-form');
  if(orderForm){
    orderForm.addEventListener('submit', function(e){
      e.preventDefault();
      const statusEl = document.getElementById('order-status');

      // basic validation: numeric fields
      const quantity = Number(orderForm.querySelector('[name="quantity"]').value);
      const widthVal = Number(orderForm.querySelector('[name="width_mm"]').value);
      const length = Number(orderForm.querySelector('[name="length_mm"]').value);

      if(!Number.isFinite(quantity) || quantity < 1){
        showStatus(statusEl, 'Please enter a valid quantity (1+).', 'error');
        return;
      }

      if(!Number.isFinite(widthVal) || widthVal < 10){
        showStatus(statusEl, 'Please enter a valid width in mm (minimum 10).', 'error');
        return;
      }

      if(!Number.isFinite(length) || length <= 0){
        showStatus(statusEl, 'Please enter a valid length (mm).', 'error');
        return;
      }

      submitForm(orderForm, statusEl);
    });
  }

  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const statusEl = document.getElementById('contact-status');
      submitForm(contactForm, statusEl);
    });
  }

  // Reveal-on-scroll using IntersectionObserver
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){ ent.target.classList.add('in'); obs.unobserve(ent.target); }
    });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(n=>obs.observe(n));

  // Nav click behavior and active state
  const navLinks = document.querySelectorAll('.site-header nav a');
  navLinks.forEach(a=>{
    a.addEventListener('click', function(e){
      // smooth scroll to section
      const href = this.getAttribute('href');
      if(href && href.startsWith('#')){
        e.preventDefault();
        const target = document.querySelector(href);
        if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      }
      navLinks.forEach(n=>n.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Simple carousel auto-rotation and controls
  (function initCarousel(){
    const carousel = document.querySelector('.carousel');
    if(!carousel) return;
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dots = Array.from(carousel.querySelectorAll('.dot'));
    let current = slides.findIndex(s=>s.classList.contains('active')) || 0;
    let interval = null;
  const delay = 6000; // slower rotation per user request

    function goTo(index){
      slides.forEach((s,i)=> s.classList.toggle('active', i===index));
      dots.forEach((d,i)=> d.classList.toggle('active', i===index));
      current = index;
    }

    function next(){ goTo((current+1) % slides.length); }

    function start(){ if(interval) clearInterval(interval); interval = setInterval(next, delay); }
    function stop(){ if(interval) clearInterval(interval); interval = null; }

    // dot click
    dots.forEach(d=> d.addEventListener('click', (e)=>{ const i = Number(d.dataset.index||0); goTo(i); start(); }));

    // pause on hover
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    // make sure first slide is set
    goTo(current >= 0 ? current : 0);
    start();
  })();
})();
