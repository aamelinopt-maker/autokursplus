// Same local header menu used on the Contacts page.
(()=>{
  'use strict';
  // Jet's Vue mobile component is deferred in the source snapshot. Reuse the
  // existing desktop navigation with a local dialog instead of a blank toggle.
  const mobileMenuHost=document.querySelector('[data-elementor-type="header"] .elementor-element-375fb7c .elementor-widget-container');
  const sourceMenu=document.querySelector('[data-elementor-type="header"] .elementor-nav-menu--main>ul');
  if(mobileMenuHost&&sourceMenu){
    const toggle=document.createElement('button');
    toggle.type='button';toggle.className='ak-site-menu-toggle';
    toggle.setAttribute('aria-label','Открыть меню');toggle.setAttribute('aria-haspopup','dialog');
    toggle.setAttribute('aria-controls','ak-site-menu');toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M1 4h22M1 12h22M1 20h22"/></svg>';
    mobileMenuHost.replaceChildren(toggle);
    const menu=document.createElement('dialog');
    menu.id='ak-site-menu';menu.className='ak-site-menu';menu.setAttribute('aria-label','Меню сайта');
    menu.innerHTML=`<details class="ak-menu-categories"><summary>Выбрать категорию</summary><div>
      <a href="https://autokursplus.ru/" class="ak-menu-category-current">Легковой автомобиль (B)</a>
      <a href="https://autokursplus.ru/kategorija-a/">Мотоцикл (A)</a>
      <a href="https://autokursplus.ru/kategorija-c/">Грузовой автомобиль (С)</a>
      <a href="https://autokursplus.ru/spectehnika/">Спецтехника</a>
      <a href="https://autokursplus.ru/dopolnitelnoe-obrazovanie/">Дополнительное образование</a>
    </div></details>
    <p class="ak-menu-address">8-я Текстильщиков, д.13, корп. 1</p>
    <div class="ak-menu-contact-row" data-menu-social><span>Соц.сети:</span></div>
    <div class="ak-menu-contact-row" data-menu-phone><span>Телефон:</span></div>
    <div class="ak-menu-controls"><button class="ak-menu-back" type="button" hidden aria-label="Назад в основное меню"><span>Информация</span><svg aria-hidden="true" viewBox="0 0 16 24"><path d="M12 4 4 12l8 8"/></svg></button><button class="ak-site-menu-close" type="button" aria-label="Закрыть меню">×</button></div>
    <nav aria-label="Основная навигация"></nav>`;
    const addIcon=(row,href,label,kind)=>{
      const original=[...document.querySelectorAll('[data-elementor-type="header"] a')].find(a=>a.href===href&&a.querySelector('svg'));
      if(!original)return;
      const link=document.createElement('a');link.href=href;link.className='ak-menu-social-icon '+kind;link.setAttribute('aria-label',label);
      const icon=original.querySelector('svg').cloneNode(true);icon.setAttribute('aria-hidden','true');
      link.append(icon);menu.querySelector(row).append(link);
    };
    addIcon('[data-menu-social]','https://t.me/avtokursschool','Telegram автошколы','is-telegram');
    addIcon('[data-menu-social]','https://vk.com/avtokursplus','ВКонтакте','is-vk');
    addIcon('[data-menu-social]','https://autokursplus.ru/max','MAX','is-max');
    addIcon('[data-menu-phone]','https://t.me/Avtokursplus','Написать в Telegram','is-telegram');
    addIcon('[data-menu-phone]','https://api.whatsapp.com/send?phone=74954886902','Написать в WhatsApp','is-whatsapp');
    menu.querySelector('[data-menu-phone]').insertAdjacentHTML('beforeend','<a class="ak-menu-phone" href="tel:+74954886902">8 (495) 488-69-02</a>');
    const nav=menu.querySelector('nav');
    const copyLink=original=>{
      const link=document.createElement('a');link.textContent=original.textContent.trim();link.href=original.getAttribute('href');
      if(link.href==='https://autokursplus.ru/stati/'){link.href='#main-content';link.setAttribute('aria-current','page');}
      return link;
    };
    [...sourceMenu.children].forEach(item=>{
      const original=item.querySelector(':scope>a');if(!original)return;
      const wrapper=document.createElement('div'),sub=item.querySelector(':scope>ul');
      if(sub){
        const summary=document.createElement('button'),links=document.createElement('div');
        summary.type='button';summary.className='ak-menu-submenu-toggle';summary.textContent=original.textContent.trim();
        summary.setAttribute('aria-expanded','false');summary.setAttribute('aria-controls','ak-menu-information');
        links.id='ak-menu-information';links.className='ak-menu-submenu';links.hidden=true;
        sub.querySelectorAll('a').forEach(link=>links.append(copyLink(link)));
        wrapper.append(summary);menu.append(links);
        const back=menu.querySelector('.ak-menu-back');
        summary.addEventListener('click',()=>{nav.hidden=true;links.hidden=false;back.hidden=false;menu.querySelector('.ak-site-menu-close').hidden=true;summary.setAttribute('aria-expanded','true');back.focus();});
        back.addEventListener('click',()=>{nav.hidden=false;links.hidden=true;back.hidden=true;menu.querySelector('.ak-site-menu-close').hidden=false;summary.setAttribute('aria-expanded','false');summary.focus();});
      }else wrapper.append(copyLink(original));
      nav.append(wrapper);
    });
    document.body.append(menu);
    let menuPreviousOverflow='';
    toggle.addEventListener('click',()=>{
      menuPreviousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
      toggle.setAttribute('aria-expanded','true');menu.showModal();
    });
    menu.querySelector('.ak-site-menu-close').addEventListener('click',()=>menu.close());
    menu.addEventListener('click',event=>{
      if(event.target.closest('a')){menu.close();return;}
      const bounds=menu.getBoundingClientRect();
      if(event.target===menu&&(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom))menu.close();
    });
    menu.addEventListener('close',()=>{document.body.style.overflow=menuPreviousOverflow;toggle.setAttribute('aria-expanded','false');});
    matchMedia('(min-width:1151px)').addEventListener('change',event=>{if(event.matches&&menu.open)menu.close();});
  }
  document.querySelectorAll('.elementor-nav-menu--main .menu-item-has-children').forEach(item=>{
    const link=item.querySelector(':scope > .elementor-item');
    if(!link || link.dataset.offlineMenuReady) return;
    link.dataset.offlineMenuReady='true';
    /* SmartMenus normally appends this exact control at runtime. Its online
       initialiser is intentionally absent offline, so recreate its markup
       instead of approximating its spacing with a CSS pseudo-element. */
    if(!link.querySelector(':scope > .offline-sub-arrow')){
      const arrow=document.createElement('span');
      arrow.className='sub-arrow offline-sub-arrow';
      arrow.setAttribute('aria-hidden','true');
      arrow.innerHTML='<svg class="e-font-icon-svg e-fas-caret-down" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path></svg>';
      link.append(arrow);
    }
    item.addEventListener('pointerenter',()=>item.classList.add('offline-submenu-open'));
    item.addEventListener('pointerleave',()=>item.classList.remove('offline-submenu-open'));
    link.addEventListener('click',event=>{event.preventDefault();item.classList.toggle('offline-submenu-open');},true);
  });
  // Make the source mobile menu usable independently of Elementor's loader.
  document.querySelectorAll('.elementor-menu-toggle').forEach(toggle=>{
    const panel=toggle.parentElement.querySelector('.elementor-nav-menu--dropdown');
    if(!panel)return;
    const change=event=>{
      event.preventDefault();event.stopImmediatePropagation();
      const open=toggle.getAttribute('aria-expanded')!=='true';
      toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('elementor-active',open);
      panel.style.setProperty('display',open?'block':'none','important');
      panel.style.setProperty('max-height',open?'none':'0','important');
      panel.style.setProperty('visibility',open?'visible':'hidden','important');
      panel.setAttribute('aria-hidden',String(!open));
      panel.querySelectorAll('a').forEach(a=>a.tabIndex=open?0:-1);
    };
    toggle.addEventListener('click',change,true);
    toggle.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')change(event);});
  });
})();
