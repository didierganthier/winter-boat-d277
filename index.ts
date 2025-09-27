import { dates } from "./utils/date"




interface Message {
    role: 'system' | 'user'
    content: string
}

interface RenderReportOutput {
    output: string
}

const tickersArr: string[] = []

// Add types to other variables for clarity
const generateReportBtn: HTMLButtonElement = document.querySelector('.generate-report-btn') as HTMLButtonElement
const loadingArea: HTMLElement = document.querySelector('.loading-panel') as HTMLElement
const apiMessage: HTMLElement = document.getElementById('api-message') as HTMLElement

generateReportBtn.addEventListener('click', fetchStockData)

const tickerInputForm = document.getElementById('ticker-input-form');
if (tickerInputForm) {
    tickerInputForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const tickerInput = document.getElementById('ticker-input') as HTMLInputElement | null
        if (tickerInput && tickerInput.value.length > 2) {
            generateReportBtn.disabled = false
            const newTickerStr = tickerInput.value
            tickersArr.push(newTickerStr.toUpperCase())
            tickerInput.value = ''
            renderTickers()
        } else {
            const label = document.getElementsByTagName('label')[0]
            label.style.color = 'red'
            label.textContent = 'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.'
        }
    })
}

function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    if (!tickersDiv) return
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

async function fetchStockData() {
    const actionPanel = document.querySelector('.action-panel');
    if (actionPanel) {
        (actionPanel as HTMLElement).style.display = 'none';
    }
    loadingArea.style.display = 'flex'
    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_API_KEY}`
            const response = await fetch(url)
            const data = await response.text()
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating report...'
                return data
            } else {
                loadingArea.innerText = 'There was an error fetching stock data.'
            }
        }))
        fetchReport(stockData.join(''))
    } catch (err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        if (err instanceof Error) {
            console.error(err.message)
        } else {
            console.error(err)
        }
    }
}

async function fetchReport(data: String) {
    const messages = [
        {
            role: 'system',
            content: 'You are a trading guru. Given data on share prices over the past 3 days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell. Use the examples provided between ### to set the style your response.'
        },
        {
            role: 'user',
            content: `${data}
            ###
            OK baby, hold on tight! You are going to haate this! Over the past three days, Tesla (TSLA) shares have plummetted. The stock opened at $223.98 and closed at $202.11 on the third day, with some jumping around in the meantime. This is a great time to buy, baby! But not a great time to sell! But I'm not done! Apple (AAPL) stocks have gone stratospheric! This is a seriously hot stock right now. They opened at $166.38 and closed at $182.89 on day three. So all in all, I would hold on to Tesla shares tight if you already have them - they might bounce right back up and head to the stars! They are volatile stock, so expect the unexpected. For APPL stock, how much do you need the money? Sell now and take the profits or hang on and wait for more! If it were me, I would hang on because this stock is on fire right now!!! Apple are throwing a Wall Street party and y'all invited!
            ###
            Apple (AAPL) is the supernova in the stock sky – it shot up from $150.22 to a jaw-dropping $175.36 by the close of day three. We’re talking about a stock that’s hotter than a pepper sprout in a chilli cook-off, and it’s showing no signs of cooling down! If you’re sitting on AAPL stock, you might as well be sitting on the throne of Midas. Hold on to it, ride that rocket, and watch the fireworks, because this baby is just getting warmed up! Then there’s Meta (META), the heartthrob with a penchant for drama. It winked at us with an opening of $142.50, but by the end of the thrill ride, it was at $135.90, leaving us a little lovesick. It’s the wild horse of the stock corral, bucking and kicking, ready for a comeback. META is not for the weak-kneed So, sugar, what’s it going to be? For AAPL, my advice is to stay on that gravy train. As for META, keep your spurs on and be ready for the rally.
            ###
            `
        }
    ]

    /*
      Challenge:
        1. Make a fetch request to the Worker url:
          - The method should be 'POST'
          - In the headers, the 'Content-Type' should be 'application/json'
          - Set the body of the request to an empty string for now
        2. Parse the response to a JavaScript object and assign it to a const
        3. Log the response to the console to test
    */

    try {
        const url = "https://winter-boat-d277.nestinghaiti.workers.dev"
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages })
        });
        console.log('Response status:', response);
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message)
        } else {
            console.error(err)
        }
        loadingArea.innerText = 'Unable to access AI. Please refresh and try again'
    }
}

function renderReport(output: RenderReportOutput['output']): void {
    loadingArea.style.display = 'none'
    const outputArea: HTMLElement | null = document.querySelector('.output-panel')
    if (!outputArea) return
    const report: HTMLParagraphElement = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}