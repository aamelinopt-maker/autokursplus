(()=>{
  const section=document.querySelector('.elementor-7878');
  const heading=section?.querySelector('.elementor-element-9e3d569');
  const widget=section?.querySelector('.elementor-element-e39c913');
  const image=section?.querySelector('.elementor-element-8911a99 img');
  if(!heading||!widget||!image)return;
  const items=[...widget.querySelectorAll('.elementor-toggle-item')];
  if(items.length!==10)return;
  section.classList.add('ak-faq-compact');
  heading.querySelector('h2').textContent='Вопросы и ответы';
  const illustration=image.cloneNode(false);
  illustration.removeAttribute('class');
  illustration.removeAttribute('data-lazy-srcset');
  illustration.removeAttribute('data-lazy-src');
  illustration.removeAttribute('data-lazy-sizes');
  illustration.alt='';illustration.className='ak-faq-illustration';
  heading.append(illustration);
  const grid=document.createElement('div');grid.className='ak-faq-columns';
  for(let i=0;i<2;i++){
    const column=document.createElement('div');column.className='elementor-toggle ak-faq-column';
    items.slice(i*5,i*5+5).forEach(item=>column.append(item));
    grid.append(column);
  }
  widget.replaceChildren(grid);
  section.querySelector('.elementor-element-491ca73')?.remove();
  section.querySelector('.elementor-element-169d2dd')?.remove();
})();
