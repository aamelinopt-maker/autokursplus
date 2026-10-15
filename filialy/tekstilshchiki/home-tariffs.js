(()=>{
  'use strict';
  const prices=document.querySelector('#prices');
  if(!prices)return;
  const tabs=[...prices.querySelectorAll('.e-n-tab-title')];
  const panels=[...prices.querySelectorAll('[role="tabpanel"]')];
  const carouselDraws=new Map();
  const activate=index=>{
    tabs.forEach((tab,i)=>{
      const active=i===index;
      tab.classList.toggle('e-active',active);
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
    });
    panels.forEach((panel,i)=>{
      const active=i===index;
      panel.classList.toggle('e-active',active);
      panel.style.display=active?'flex':'none';
    });
    const note=prices.querySelector('.ak-tariff-common-note');
    if(note)note.hidden=index===4;
    requestAnimationFrame(()=>carouselDraws.get(panels[index])?.forEach(draw=>draw()));
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(index));
    tab.addEventListener('keydown',event=>{
      let next=null;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==null){event.preventDefault();activate(next);tabs[next].focus();}
    });
  });
  prices.querySelectorAll('.ak-tariff-carousel').forEach(widget=>{
    const viewport=widget.querySelector('.e-n-carousel');
    const track=widget.querySelector('.swiper-wrapper');
    const slides=[...widget.querySelectorAll('.swiper-slide')];
    const prev=widget.querySelector('.elementor-swiper-button-prev');
    const next=widget.querySelector('.elementor-swiper-button-next');
    if(!viewport||!track||slides.length<2)return;
    viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Тарифы: листайте стрелками или свайпом');
    let index=0;
    const visible=()=>innerWidth<768?1:innerWidth<=1024?2:3;
    const draw=()=>{
      const width=slides[0].getBoundingClientRect().width;
      const gap=parseFloat(getComputedStyle(track).gap)||0;
      const max=Math.max(0,slides.length-visible());
      index=Math.max(0,Math.min(index,max));
      track.style.setProperty('--ak-tariff-offset',`${-index*(width+gap)}px`);
      track.style.transform=`translate3d(var(--ak-tariff-offset),0,0)`;
      track.style.transition='transform .3s ease';
      if(prev)prev.toggleAttribute('disabled',index===0);
      if(next)next.toggleAttribute('disabled',index===max);
      for(const button of [prev,next])if(button)button.setAttribute('aria-disabled',String(button.hasAttribute('disabled')));
      slides.forEach((slide,i)=>{const hidden=i<index||i>=index+visible();slide.inert=hidden;slide.setAttribute('aria-hidden',String(hidden));});
    };
    const bindArrow=(button,step)=>{
      if(!button)return;
      const move=event=>{event.preventDefault();if(button.hasAttribute('disabled'))return;index+=step;draw();};
      button.addEventListener('click',move);
      button.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){move(event);}
      });
    };
    bindArrow(prev,-1);
    bindArrow(next,1);
    window.akBindCarouselGestures(viewport,()=>{index--;draw();},()=>{index++;draw();});
    addEventListener('resize',draw,{passive:true});
    const panel=widget.closest('[role="tabpanel"]');
    if(!carouselDraws.has(panel))carouselDraws.set(panel,[]);
    carouselDraws.get(panel).push(draw);
    draw();
  });
  activate(0);
})();
