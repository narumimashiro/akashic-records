const messageAlert = (text) => {
  alert(text)
}

const prompttext = () => {
  let sum = 0
  
  while(true) {
    let value = +prompt("enter number", '')
    
    if(!value) break

    sum+=value
  }
  alert("sum : " + sum)
}

const whilefor = () => {
  for(let i = 0; i <= 10; ++i) {
    if(i % 2 === 0) {
      console.log(i)
    }
  }
}

const inputover100 = () => {
  let value
  while(true) {
    value = prompt("input num", '')

    if(!value || value > 100) break
  }
  alert(value)
}

const primeCheck = () => {
  // let inputValue
  // outer : for(let n = 0; n < 100; n++) {
  //   inputValue = parseInt(prompt("imput ", ''))

  //   if(!inputValue) {
  //     console.log('2')
  //     for(let i = 2; i < inputValue; ++i) {
  //       if(inputValue % i === 0) {
  //         console.log('1')
  //         break outer;
  //       }
  //     }
  //     alert(inputValue + 'is prime')
  //     break;
  //   }
  // }
  // alert('not prime')
  outer: for (let i = 0; i < 3; i++) {

    for (let j = 0; j < 3; j++) {
  
      let input = prompt(`Value at coords (${i},${j})`, '');
  
      // 文字から文字またはキャンセルされた場合、両方のループから抜ける
      if (!input) break outer; // (*)
  
      // 値に何かをする処理...
    }
  }
  
  alert('Done!');
}