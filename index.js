require('dotenv').config()
const axios = require('axios')
const cripto = require('crypto');

const URL_BASE = "https://api1.binance.com"

const HEADER = {
    "X-MBX-APIKEY": process.env.APIKEY,
}

const timestamp = Date.now()

const hash = data => cripto.createHmac('sha256', process.env.SECRET)
               .update(data)
               .digest('hex');

               const extrato = async () => {
                try {
                    const params = `timestamp=${timestamp.toString()}`
                    const request = `${URL_BASE}/api/v3/account?${params}&signature=${hash(params)}`
                    const result = await axios.get(request,{'headers': HEADER})
                    return result.data.balances.filter(b => b.free > 0 || b.locked > 0).filter(b => b.asset !== 'BTC' && b.asset !== 'BNB' ).map(b => ({[b.asset]: Number.parseFloat(b.free)+Number.parseFloat(b.locked)}))
                } catch (error) {
                    console.error(error)
                }
            }

            const trades = async (symbol) => {
                try {
                    const params = `symbol=${symbol}&timestamp=${timestamp.toString()}`
                    const request = `${URL_BASE}/api/v3/myTrades?${params}&signature=${hash(params)}`
                    const result = await axios.get(request,{'headers': HEADER})
                    //console.log(result.data)
                    let saldo = 0
                    const valor = result.data.reduce((acc,t) => {
                        saldo += Number.parseFloat(t.qty)
                        return acc + (Number.parseFloat(t.qty) * Number.parseFloat(t.price))
                    }, 0)
                    const valorMedio = Number(valor/saldo).toFixed(8)
                    
                    console.log(`Simbulo ${symbol}`,valorMedio)
                    return valorMedio
                } catch (error) {
                    console.error(error.message, error.response.data)
                }
            }
             
            async function teste (){
                const meuExtrato = await extrato()
                const meusTrades =  meuExtrato.map( m => {
                    const valor =  trades(Object.keys(m)[0]+'BTC')
                    return valor
                })
            }

            teste()