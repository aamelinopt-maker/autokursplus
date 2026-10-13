(()=>{
  'use strict';
  const branches=JSON.parse(document.querySelector('#ak-contacts-data').textContent);
  const root=document.querySelector('.ak-contacts');
  const cards=[...root.querySelectorAll('.ak-contact-card')];
  cards.forEach((card,i)=>{card.id='ak-contact-branch-'+i;card.tabIndex=-1;});
  const directory=root.querySelector('.ak-contact-directory');
  const frame=root.querySelector('.ak-contact-map iframe');
  const fallback=root.querySelector('.ak-contact-map-fallback');
  const retry=fallback.querySelector('button');
  const selected=root.querySelector('.ak-contact-selected');
  const location=root.querySelector('.ak-contact-location');
  const compactView=matchMedia('(max-width:1023px)');
  // Keep the enlarged map square. On short screens cap the whole right card
  // by the available viewport height, including its compact branch toolbar.
  const fitMapColumn=()=>{
    const detailsHeight=selected.getBoundingClientRect().height;
    const minimumSide=innerHeight<=480?200:240;
    location.style.setProperty('--ak-contact-map-max-width',Math.max(minimumSide,innerHeight-detailsHeight-48)+'px');
  };
  new ResizeObserver(fitMapColumn).observe(selected);
  addEventListener('resize',fitMapColumn);
  const branchSelect=document.querySelector('#ak-branch');
  branchSelect.replaceChildren(new Option('Помогите выбрать филиал',''),...branches.map(b=>new Option(b.name,b.name)));
  let current=0,mapTimer=null,attempt=0,healthy=false,mapLoaded=false;
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  const showFallback=()=>{
    fallback.hidden=false;
    fallback.querySelector('h3').textContent='Карта временно недоступна';
    fallback.querySelector('p').textContent='Для интерактивной карты нужен интернет. Адрес и контакты филиала доступны в списке.';
    retry.hidden=false;
  };
  const revealMap=()=>{
    if(healthy&&mapLoaded){clearTimeout(mapTimer);fallback.hidden=true;}
  };
  frame.addEventListener('load',()=>{mapLoaded=true;revealMap();});
  frame.addEventListener('error',showFallback);
  const loadMap=()=>{
    const id=++attempt;
    healthy=false;mapLoaded=false;clearTimeout(mapTimer);
    fallback.hidden=false;retry.hidden=true;
    fallback.querySelector('h3').textContent='Карта загружается';
    fallback.querySelector('p').textContent='Москва, '+branches[current].address;
    // Search for the selected Moscow address instead of the original mixed-city constructor.
    frame.src='https://yandex.ru/map-widget/v1/?text='+encodeURIComponent('Москва, '+branches[current].address)+'&z=16';
    mapTimer=setTimeout(showFallback,12000);
    // Cross-origin iframe load is not enough to detect a blocked network.
    // A provider request rejects when disconnected; the rendered map is also
    // inspected in the accompanying browser checks.
    const controller=new AbortController();
    const probeTimer=setTimeout(()=>controller.abort(),12000);
    fetch('https://api-maps.yandex.ru/2.1/?lang=ru_RU',{mode:'no-cors',cache:'no-store',signal:controller.signal})
      .then(()=>{if(id===attempt){healthy=true;revealMap();}})
      .catch(()=>{if(id===attempt)showFallback();})
      .finally(()=>clearTimeout(probeTimer));
  };
  const selectBranch=(i,fromButton=false)=>{
    current=i;
    const b=branches[i];
    cards.forEach((card,index)=>{
      card.classList.toggle('is-selected',i===index);
      card.querySelector('[data-show-branch]').setAttribute('aria-pressed',String(i===index));
    });
    const title=(b.name==='Посёлок Восточный'?'':'м. ')+b.name;
    selected.innerHTML=`<div><a class="ak-contact-current-label" href="#${cards[i].id}" data-return-to-branch aria-label="Выбранный филиал ${escape(title)} — вернуться к карточке">Выбранный филиал</a><h3>${escape(title)}</h3></div><button type="button" class="ak-contact-button" data-open-ak-form data-branch="${escape(b.name)}">Записаться</button>`;
    loadMap();
    if(fromButton&&compactView.matches){
      setView('map');directory.scrollIntoView({behavior:'smooth',block:'start'});
    }
  };
  const setView=view=>{
    directory.dataset.view=view;
    root.querySelectorAll('[data-contact-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.contactView===view)));
  };
  root.querySelectorAll('[data-show-branch]').forEach(button=>button.addEventListener('click',()=>selectBranch(Number(button.dataset.showBranch),true)));
  root.querySelectorAll('[data-contact-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.contactView)));
  selected.addEventListener('click',event=>{
    const link=event.target.closest('[data-return-to-branch]');
    if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    // Native anchor navigation updates the fragment and scrolls to the card.
    // On mobile, reveal the list before the browser follows the anchor.
    setView('list');
    cards[current].focus({preventScroll:true});
  });
  retry.addEventListener('click',loadMap);
  addEventListener('online',loadMap);
  addEventListener('offline',showFallback);
  selectBranch(0);

  // A local, keyboard-accessible viewer for real client-supplied photos.
  // Empty slots remain non-clickable placeholders; no network photo requests.
  const photoViewer=document.createElement('dialog');
  photoViewer.className='ak-photo-viewer';
  photoViewer.setAttribute('aria-labelledby','ak-photo-caption');
  photoViewer.innerHTML='<button type="button" aria-label="Закрыть фотографию">×</button><img alt=""><p id="ak-photo-caption"></p>';
  document.body.append(photoViewer);
  let photoPreviousOverflow='';
  root.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-ak-photo]');
    if(!trigger)return;
    const caption=trigger.dataset.akPhotoCaption;
    const img=photoViewer.querySelector('img');
    img.src=trigger.dataset.akPhoto;img.alt=caption;
    photoViewer.querySelector('p').textContent=caption;
    photoPreviousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    photoViewer.showModal();
  });
  photoViewer.querySelector('button').addEventListener('click',()=>photoViewer.close());
  photoViewer.addEventListener('click',event=>{
    const bounds=photoViewer.getBoundingClientRect();
    if(event.target===photoViewer&&(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom))photoViewer.close();
  });
  photoViewer.addEventListener('close',()=>{document.body.style.overflow=photoPreviousOverflow;});

  // Adapted from the local home-page modal, with Moscow-only branch options.
  const modal=document.querySelector('#ak-course-modal');
  const form=document.querySelector('#ak-course-form');
  const phone=document.querySelector('#ak-phone');
  const message=document.querySelector('#ak-modal-message');
  let opener=null,previousOverflow='';
  const close=()=>{
    modal.hidden=true;modal.setAttribute('aria-hidden','true');
    document.body.style.overflow=previousOverflow;opener?.focus();
  };
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-open-ak-form]');
    if(!trigger)return;
    event.preventDefault();event.stopImmediatePropagation();
    opener=trigger;previousOverflow=document.body.style.overflow;
    branchSelect.value=trigger.dataset.branch||'';
    document.querySelector('#ak-topic').value=trigger.dataset.topic||'Запись на обучение';
    document.querySelector('#ak-modal-context').textContent=trigger.dataset.branch?'Филиал: '+trigger.dataset.branch:'Поможем выбрать филиал в Москве';
    message.hidden=true;modal.hidden=false;modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';phone.focus();
  },true);
  modal.querySelector('.ak-modal__close').addEventListener('click',close);
  modal.addEventListener('click',event=>{if(event.target===modal)close();});
  document.addEventListener('keydown',event=>{
    if(modal.hidden)return;
    if(event.key==='Escape')close();
    if(event.key==='Tab'){
      const items=[...modal.querySelectorAll('button,input,select,textarea,a[href]')].filter(e=>!e.disabled);
      const first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  phone.addEventListener('input',()=>{
    const digits=phone.value.replace(/\D/g,'');
    const local=(digits.startsWith('7')||digits.startsWith('8')?digits.slice(1):digits).slice(0,10);
    let value=local?'+7 ('+local.slice(0,3):'';
    if(local.length>=3)value+=') '+local.slice(3,6);
    if(local.length>=6)value+='-'+local.slice(6,8);
    if(local.length>=8)value+='-'+local.slice(8,10);
    phone.value=value;
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    if(!form.reportValidity())return;
    message.dataset.state='info';message.hidden=false;
    message.textContent='Это локальная версия страницы: данные не отправлены. Свяжитесь с нами по телефону или через мессенджер.';
  },true);
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
      if(link.href==='https://autokursplus.ru/kontakty/'){link.href='#main-content';link.setAttribute('aria-current','page');}
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
