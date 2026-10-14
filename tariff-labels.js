(()=>{
  const prices=document.querySelector('#prices');
  if(!prices)return;
  prices.querySelectorAll('[role="tabpanel"] h2').forEach(title=>{
    const head=title.closest('.elementor-widget-heading')?.parentElement;
    if(head?.querySelector('p.elementor-heading-title'))head.classList.add('ak-tariff-card-head');
  });
  prices.querySelectorAll('.ak-tariff-card-head').forEach(head=>{
    head.querySelectorAll('.elementor-widget-heading').forEach(widget=>{
      if(widget.textContent.trim().toLowerCase()==='популярный')widget.classList.add('ak-tariff-badge');
    });
    const title=head.querySelector('h2')?.textContent||'';
    const extra=/заняти/i.test(title);
    const amounts=[...head.querySelectorAll('p.elementor-heading-title')].filter(p=>/₽/.test(p.textContent));
    const priceBlock=amount=>{
      let block=amount.closest('.elementor-widget-heading');
      while(block?.parentElement&&block.parentElement!==head)block=block.parentElement;
      return block;
    };
    if(amounts[0])priceBlock(amounts[0])?.classList.add('ak-tariff-course-price');
    amounts.forEach(p=>p.querySelectorAll('sup').forEach(sup=>sup.remove()));
    if(extra){
      const price=amounts[0];
      if(!price)return;
      const heading=head.querySelector('h2').closest('.elementor-widget-heading');
      const row=priceBlock(price);
      const note=head.querySelector('.elementor-widget-text-editor');
      head.classList.add('ak-tariff-extra');
      row.classList.remove('ak-tariff-course-price');
      row.classList.add('ak-extra-price-row');
      price.textContent=price.textContent.replace(/\*/g,'');
      const oldPrice=row.querySelector('.strikethrough-red-bold');
      if(oldPrice){
        oldPrice.classList.remove('elementor-hidden-desktop','elementor-hidden-tablet','elementor-hidden-mobile','strikethrough-red-bold');
        oldPrice.classList.add('ak-extra-old-price');
      }
      if(note){
        note.classList.add('ak-extra-duration');
        note.querySelector('p').textContent='Длительность — 60 минут';
      }
      head.replaceChildren(heading,row,...(note?[note]:[]));
    }else if(amounts.length>=2){
      const total=Number(amounts[0].textContent.replace(/\D/g,''));
      amounts[0].classList.add('ak-price-total');
      amounts[1].textContent=Math.round(total/6).toLocaleString('ru-RU').replace(/\u00a0/g,' ');
      const marker=document.createElement('sup');
      marker.textContent='*';
      amounts[1].append(marker,' ₽');
      amounts[1].classList.add('ak-price-total');
      priceBlock(amounts[1])?.classList.add('ak-tariff-payment');
    }
  });
})();
