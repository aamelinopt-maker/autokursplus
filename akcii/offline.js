/* Minimal compatibility layer; Elementor, JetMenu and Swiper own their UI. */
document.addEventListener('DOMContentLoaded', () => {
  // Restore WP Rocket's serialized background rules without its network loader.
  const pairs = typeof rocket_pairs !== 'undefined' ? rocket_pairs : [];
  const excluded = typeof rocket_excluded_pairs !== 'undefined' ? rocket_excluded_pairs : [];
  for (const pair of [...pairs, ...excluded]) {
    const style = document.createElement('style');
    style.textContent = pair.style;
    document.head.append(style);
  }
  document.querySelectorAll('.elementor-invisible').forEach(element => element.classList.remove('elementor-invisible'));
  // Browser pattern v requires escaping a literal dash in the source's legacy
  // telephone expression. Keep the original accepted characters.
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.pattern = '\\+?[0-9\\s\\(\\)\\-]{7,}';
  });
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
      if(link.getAttribute('href')==='/autokursplus/akcii/'){link.href='#ak-offers';link.setAttribute('aria-current','page');}
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
});
