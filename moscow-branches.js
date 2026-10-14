(()=>{
  // Addresses and office hours from the local contacts page and saved branch pages.
  const branches=[
    ['Текстильщики','ул. 8-я Текстильщиков, д. 13, корп. 1','autokursplus.ru','Пн–Чт 10:00–18:00 · Пт 10:00–17:00 · Сб–Вс выходной'],
    ['Калужская','ул. Обручева, д. 34/63, стр. 2','kaluzhskaya.autokursplus.ru'],
    ['Профсоюзная','Нахимовский проспект, д. 48','nahimovskij-prospekt.autokursplus.ru'],
    ['Южная','ул. Кировоградская, д. 9, корп. 4','yuzhnaya.autokursplus.ru'],
    ['Алма-Атинская','ул. Борисовские Пруды, д. 26','borisovo.autokursplus.ru'],
    ['Чертановская','Северное Чертаново, д. 2, корп. 203','chertanovskaya.autokursplus.ru'],
    ['Бульвар Дмитрия Донского','ул. Куликовская, д. 6','bulvar-dmitriya-donskogo.autokursplus.ru'],
    ['Потапово','ул. Александры Монаховой, д. 89, корп. 2','potapovo.autokursplus.ru'],
    ['Юго-Восточная','ул. Ферганская, д. 12','yugo-vostochnaya.autokursplus.ru'],
    ['Окская','Мещерский переулок, д. 6','okskaya.autokursplus.ru'],
    ['Посёлок Восточный','ул. Главная, д. 19Б','vostochyi.autokursplus.ru']
  ];
  const old=document.querySelector('.elementor-118 .elementor-element-fef2d36');
  if(!old)return;
  // The old contacts grid and its large map duplicate this Moscow-only directory.
  document.querySelector('.elementor-element-50e6722a')?.remove();
  document.querySelector('.elementor-118 .elementor-element-4863cb78')?.remove();
  const section=document.createElement('section');
  section.id='branches';section.className='ak-moscow-branches';
  section.innerHTML=`<div class="ak-branches-wrap">
    <div class="elementor-widget-heading"><h2>Филиалы автошколы в Москве</h2></div>
    <div class="ak-branches-grid">
      <div class="ak-branches-picker"><label for="ak-branch-search">Поиск по метро или адресу</label><input id="ak-branch-search" type="search" placeholder="Метро, улица или район" autocomplete="off"><div class="ak-branches-list" role="group" aria-label="Московские филиалы"></div><p class="ak-branches-empty" hidden>Филиалы не найдены. Попробуйте другое название метро или улицы.</p></div>
      <div class="ak-branches-location"><div class="ak-branches-map"><iframe title="Филиалы автошколы Автокурс на карте Москвы" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div><div class="ak-branches-detail" aria-live="polite"><h3>Все московские филиалы</h3><p class="ak-branch-address">Выберите филиал в списке, чтобы посмотреть адрес и часы работы офиса.</p><p class="ak-branch-hours"></p><div class="ak-branches-actions"><button type="button" data-open-ak-form data-course-label="Подбор филиала в Москве">Помочь с выбором</button><a class="ak-branch-link" target="_blank" rel="noopener">Открыть карту ↗</a></div></div></div>
    </div></div>`;
  old.replaceWith(section);
  const list=section.querySelector('.ak-branches-list');
  const frame=section.querySelector('iframe');
  const cta=section.querySelector('[data-open-ak-form]');
  const link=section.querySelector('.ak-branch-link');
  const map=query=>{frame.src='https://yandex.ru/map-widget/v1/?text='+encodeURIComponent(query)+'&z=10';link.href='https://yandex.ru/maps/213/moscow/?text='+encodeURIComponent(query);};
  frame.src='https://yandex.ru/map-widget/v1/?um=constructor%3Ad255a2aedce0db7990816e4f9097205c0369662e233248f6456337ffbc966b7f&source=constructor&ll=37.62%2C55.70&z=9';
  link.href='https://yandex.ru/maps/?um=constructor%3Ad255a2aedce0db7990816e4f9097205c0369662e233248f6456337ffbc966b7f&source=constructorLink';
  const select=document.querySelector('#ak-branch');
  if(select){select.replaceChildren(new Option('Помогите выбрать филиал',''),...branches.map(b=>new Option(b[0],b[0])));}
  const schemaBranchIds=['tekstilshchiki','kaluzhskaya','profsoyuznaya','yuzhnaya','alma-atinskaya','chertanovskaya','bulvar-dmitriya-donskogo','potapovo','yugo-vostochnaya','okskaya','vostochnyy'];
  branches.forEach((branch,index)=>{
    const button=document.createElement('button');button.type='button';button.className='ak-branch-choice';button.setAttribute('aria-pressed','false');
    button.setAttribute('itemscope','');button.setAttribute('itemtype','https://schema.org/LocalBusiness');
    button.setAttribute('itemid','https://autokursplus.ru/#branch-'+schemaBranchIds[index]);
    const meta=(property,value,parent=button)=>{const node=document.createElement('meta');node.setAttribute('itemprop',property);node.content=value;parent.append(node);};
    meta('name','Автошкола Автокурс — '+branch[0]);meta('url','https://'+branch[2]+'/');meta('telephone','+74954886902');
    const name=document.createElement('strong');name.textContent=(index===10?'':'м. ')+branch[0];
    const address=document.createElement('span');address.setAttribute('itemprop','address');address.setAttribute('itemscope','');address.setAttribute('itemtype','https://schema.org/PostalAddress');
    const street=document.createElement('span');street.setAttribute('itemprop','streetAddress');street.textContent=branch[1];address.append(street);
    meta('addressLocality','Москва',address);meta('addressCountry','RU',address);button.append(name,address);list.append(button);
    button.addEventListener('click',()=>{
      list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      section.querySelector('h3').textContent=name.textContent;
      section.querySelector('.ak-branch-address').textContent='Москва, '+branch[1];
      section.querySelector('.ak-branch-hours').textContent='Часы работы офиса: '+(branch[3]||'Вт–Пт 11:00–19:00 · Сб 11:00–17:00 · Вс–Пн выходной');
      cta.textContent='Записаться в филиал';cta.dataset.branch=branch[0];cta.dataset.courseLabel='Филиал: '+branch[0];
      map('Москва, '+branch[1]);
    });
  });
  section.querySelector('input').addEventListener('input',event=>{
    const query=event.target.value.trim().toLocaleLowerCase('ru');let count=0;
    list.querySelectorAll('button').forEach(button=>{button.hidden=!button.textContent.toLocaleLowerCase('ru').includes(query);if(!button.hidden)count++;});
    section.querySelector('.ak-branches-empty').hidden=!!count;
  });
})();
