(()=>{
  document.querySelectorAll('#prices .ak-tariff-card-head').forEach(head=>{
    if(!head.closest('.ak-tariff-carousel'))head.parentElement?.parentElement?.classList.add('ak-tariff-grid');
  });
  const toggle=document.querySelector('.ak-nav-toggle');
  const menu=document.querySelector('#ak-mobile-navigation');
  if(toggle&&menu){
    const close=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');};
    toggle.addEventListener('click',()=>{
      const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
    });
    menu.addEventListener('click',event=>{if(event.target.closest('a'))close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){close();toggle.focus();}});
    document.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!toggle.contains(event.target))close();});
    const desktop=matchMedia('(min-width:1280px)');desktop.addEventListener('change',()=>{if(desktop.matches)close();});
  }
  // Open the matching tariff when a visitor follows an in-page course link.
  const openCourse=()=>{
    const id=location.hash.slice(1);if(!id)return;
    const target=document.getElementById(id);const panel=target?.closest('#prices [role="tabpanel"]');
    if(!panel)return;
    const tab=document.querySelector('#prices [role="tab"][aria-controls="'+panel.id+'"]');
    tab?.click();requestAnimationFrame(()=>target.scrollIntoView({block:'center'}));
  };
  addEventListener('hashchange',openCourse);if(location.hash)openCourse();
  document.querySelectorAll('.elementor-element-87f3c3b,.elementor-element-01a9677').forEach(widget=>{
    let start=null;
    widget.addEventListener('touchstart',event=>{
      start=null;
      if(event.target.closest('video,button,.elementor-swiper-button')||(!widget.matches('.elementor-element-01a9677')&&event.target.closest('a')))return;
      start=[event.touches[0].clientX,event.touches[0].clientY];
    },{passive:true});
    widget.addEventListener('touchcancel',()=>{start=null;},{passive:true});
    widget.addEventListener('touchend',event=>{
      if(!start)return;
      const dx=start[0]-event.changedTouches[0].clientX,dy=start[1]-event.changedTouches[0].clientY;start=null;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)widget.querySelector('.elementor-swiper-button-'+(dx>0?'next':'prev'))?.click();
    },{passive:true});
    widget.addEventListener('keydown',event=>{
      if(!event.target.closest('.elementor-swiper-button'))return;
      if(event.key==='Enter'||event.key===' '){event.preventDefault();event.target.closest('.elementor-swiper-button').click();}
    });
  });
  // Keep keyboard focus inside the request dialog until it is closed.
  const modal=document.querySelector('#ak-course-modal');
  modal?.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const controls=[...modal.querySelectorAll('button,input,select,a[href]')].filter(e=>!e.disabled&&e.checkVisibility());
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  });
})();
