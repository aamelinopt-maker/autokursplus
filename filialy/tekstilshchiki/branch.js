(()=>{
  'use strict';
  const data=JSON.parse(document.querySelector('#ak-branch-data').textContent);
  const forms=[...document.querySelectorAll('[data-branch-form]')];
  const modal=document.querySelector('#ak-course-modal');
  const modalForm=modal.querySelector('form');
  let opener=null,previousOverflow='';
  const defaultContext='Помогите выбрать программу';
  const tariffLinks=[...document.querySelectorAll('#prices a[href*="elementor-action"]')];
  const labelsByLink=tariffLinks.map(link=>{
    const panel=link.closest('[role="tabpanel"]');
    let card=link.parentElement;
    while(card&&card!==panel){
      if(card.querySelector('h2')&&card.querySelectorAll('a[href*="elementor-action"]').length===1)break;
      card=card.parentElement;
    }
    if(!card||card===panel)return '';
    const tab=document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent.trim();
    const category=tab==='Автомобиль (B)'?'Категория B':tab;
    let title=card.querySelector('h2')?.textContent.replace(/\s+/g,' ').trim();
    if(tab==='Автомобиль (B)'&&title)title=title[0]+title.slice(1).toLocaleLowerCase('ru');
    const amounts=[...card.querySelectorAll('p')].map(p=>p.textContent.replace(/\s+/g,' ').trim()).filter(t=>/\d[\d ]*\s*₽/.test(t));
    const price=amounts.find(t=>/₽/.test(t))?.match(/\d[\d ]*\s*₽/)?.[0];
    return [category,title,price].filter(Boolean).join(' · ')||link.dataset.courseLabel||'';
  });
  const tariffLabels=[...new Set(labelsByLink.filter(Boolean))];
  tariffLinks.forEach((link,index)=>{
    link.dataset.courseLabel=labelsByLink[index]||'';
  });
  const setFormContext=(form,text)=>{
    form.elements.context.value=text;
    form.querySelector('[data-form-context]').textContent='Филиал «Текстильщики» · '+text;
  };
  const hideResult=form=>{form.querySelector('[data-form-result]').hidden=true;};
  forms.forEach(form=>{
    tariffLabels.forEach(label=>form.elements.course.add(new Option(label,label)));
    form.elements.course.addEventListener('change',()=>{setFormContext(form,form.elements.course.value||defaultContext);hideResult(form);});
    form.elements.phone.addEventListener('input',event=>{
      const input=event.target;
      const digits=input.value.replace(/\D/g,'');
      const local=(digits.startsWith('7')||digits.startsWith('8')?digits.slice(1):digits).slice(0,10);
      let value=local?'+7 ('+local.slice(0,3):'';
      if(local.length>=3)value+=') '+local.slice(3,6);
      if(local.length>=6)value+='-'+local.slice(6,8);
      if(local.length>=8)value+='-'+local.slice(8,10);
      input.value=value;
      hideResult(form);
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      const result=form.querySelector('[data-form-result]');
      const button=form.querySelector('[type=submit]');
      const payload=Object.fromEntries(new FormData(form));
      const text=`Здравствуйте! Хочу записаться в филиал «Текстильщики».\n${payload.context}\nИмя: ${payload.name||'Не указано'}\nТелефон: ${payload.phone}`;
      result.replaceChildren();
      if(data.submissionEndpoint){
        button.disabled=true;
        try{
          const response=await fetch(data.submissionEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
          if(!response.ok)throw Error('Submission failed');
          result.textContent='Спасибо! Ваша заявка отправлена. Администратор свяжется с вами.';
          form.reset();setFormContext(form,defaultContext);
        }catch{
          result.textContent='Не удалось отправить заявку. Попробуйте ещё раз или позвоните: 8 (495) 488-69-02, добавочный 102.';
        }finally{button.disabled=false;result.hidden=false;}
      }else{
        // No backend is configured. Let the visitor explicitly send the prepared
        // request to the existing school contacts; never claim a submission.
        const p=document.createElement('p');
        p.textContent='Отправьте заявку администратору удобным способом:';
        const actions=document.createElement('div');actions.className='ak-branch-actions';
        for(const [label,url] of [
          ['В Telegram ↗','https://t.me/Avtokursplus?text='+encodeURIComponent(text)],
          ['В WhatsApp ↗','https://api.whatsapp.com/send?phone=74954886902&text='+encodeURIComponent(text)]
        ]){
          const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener';actions.append(a);
        }
        result.append(p,actions);result.hidden=false;
      }
    });
  });
  const closeModal=()=>{
    modal.hidden=true;modal.setAttribute('aria-hidden','true');
    document.body.style.overflow=previousOverflow;
    document.querySelector('main').inert=false;
    opener?.focus();
  };
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-open-ak-form], #prices a[href*="elementor-action"]');
    if(!trigger)return;
    event.preventDefault();event.stopImmediatePropagation();
    opener=trigger;
    previousOverflow=document.body.style.overflow;
    let context=defaultContext;
    if(trigger.dataset.group!==undefined){
      const group=data.groups[Number(trigger.dataset.group)];
      context=`${group.format} · ${group.displayDate} · ${group.time}`;
    }
    if(trigger.dataset.context)context=trigger.dataset.context;
    if(trigger.dataset.courseLabel)context=trigger.dataset.courseLabel;
    modalForm.elements.course.value=trigger.dataset.courseLabel||'';
    setFormContext(modalForm,context);hideResult(modalForm);
    modal.hidden=false;modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';document.querySelector('main').inert=true;
    modalForm.elements.name.focus();
  },true);
  modal.querySelector('.ak-modal__close').addEventListener('click',closeModal);
  modal.addEventListener('click',event=>{if(event.target===modal)closeModal();});
  document.addEventListener('keydown',event=>{
    if(modal.hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeModal();}
    if(event.key==='Tab'){
      const items=[...modal.querySelectorAll('button,input:not([type=hidden]),select,a[href]')].filter(e=>!e.disabled&&e.checkVisibility());
      const first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  // The map has its own space; contacts and directions are always regular HTML.
  const frame=document.querySelector('[data-map-src]');
  const cover=document.querySelector('.ak-branch-map-cover');
  let mapStarted=false,mapLoaded=false,mapHealthy=false,mapAttempt=0;
  const showMap=()=>{if(mapLoaded&&mapHealthy)cover.hidden=true;};
  const loadMap=()=>{
    const attempt=++mapAttempt;
    mapLoaded=false;mapHealthy=false;cover.hidden=false;
    frame.src=frame.dataset.mapSrc;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),8000);
    fetch('https://api-maps.yandex.ru/2.1/?lang=ru_RU',{mode:'no-cors',signal:controller.signal})
      .then(()=>{if(attempt===mapAttempt){mapHealthy=true;showMap();}})
      .catch(()=>{if(attempt===mapAttempt)cover.hidden=false;})
      .finally(()=>clearTimeout(timer));
  };
  const startMap=()=>{
    if(mapStarted)return;mapStarted=true;
    frame.addEventListener('load',()=>{mapLoaded=true;showMap();});
    frame.addEventListener('error',()=>{cover.hidden=false;});
    loadMap();
  };
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){startMap();observer.disconnect();}},{rootMargin:'300px'});
  observer.observe(frame);
  addEventListener('offline',()=>{cover.hidden=false;});
  addEventListener('online',()=>{if(mapStarted)loadMap();});
  const viewer=document.createElement('dialog');
  viewer.className='ak-photo-viewer';viewer.setAttribute('aria-labelledby','ak-photo-caption');
  viewer.innerHTML='<button type="button" aria-label="Закрыть фотографию">×</button><img alt=""><p id="ak-photo-caption"></p>';
  document.body.append(viewer);
  let photoOverflow='';
  document.querySelectorAll('[data-ak-photo]').forEach(button=>button.addEventListener('click',()=>{
    const img=viewer.querySelector('img');img.src=button.dataset.akPhoto;img.alt=button.dataset.akPhotoCaption;
    viewer.querySelector('p').textContent=button.dataset.akPhotoCaption;
    photoOverflow=document.body.style.overflow;document.body.style.overflow='hidden';viewer.showModal();
  }));
  viewer.querySelector('button').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',event=>{
    const bounds=viewer.getBoundingClientRect();
    if(event.target===viewer&&(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom))viewer.close();
  });
  viewer.addEventListener('close',()=>{document.body.style.overflow=photoOverflow;});
})();
