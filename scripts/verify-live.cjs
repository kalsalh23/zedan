const https = require('https')
https
  .get('https://mobily-bro.vercel.app/', (r) => {
    let h = ''
    r.on('data', (c) => (h += c))
    r.on('end', () => {
      const css = (h.match(/assets\/index-[\w-]+\.css/) || [])[0]
      https.get('https://mobily-bro.vercel.app/' + css, (r2) => {
        let b = ''
        r2.on('data', (c) => (b += c))
        r2.on('end', () => {
          console.log('ink #09090B:', b.includes('#09090B') || b.includes('rgb(9 9 11'))
          console.log('crimson #E11D48:', b.includes('#E11D48') || b.includes('rgb(225 29 72'))
          console.log('wa green:', b.includes('rgb(37 211 102'))
          console.log('purple gone:', !b.includes('rgb(108 43 217'))
          console.log('blue gone:', !b.includes('rgb(37 99 235'))
        })
      })
    })
  })
  .on('error', (e) => console.log('ERR', e.message))
