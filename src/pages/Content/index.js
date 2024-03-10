function test() {
  //   const head = document.getElementsByClassName('devsite-page-title')[0];
  //   const newP = document.createElement('h1');
  //   newP.appendChild(document.createTextNode('this is extension created!'));
  //   head.parentElement.insertAdjacentElement('afterbegin', newP);
  const head = document.querySelector('h1')
  head.insertAdjacentText('afterend', 'extension word!')
  console.log('extsion work too!!!')
}

test()
