import React from 'react'
import axios from 'axios'

export default class Game extends React.Component {
  constructor() {
    super()
    this.state = {
      score: 0,
      width: 100,
      time: 30000,
      gameState: 'loading',
      username: 'nuclearsheep',
      answers: ['a', 'b', 'c', 'd'],
      gameData: [
        { //empty index [0] is to prevents audio from starting as iframe will auto load data in state
          track_id: '',
          track_name: '',
          track_artist: '',
          track_preview: '',
          track_in_album: '',
          track_album_art: ''
        }
      ],
      collections: []
    }

    this.round = 0
    this.levelData = this.state.gameData[this.round]
    this.time = 30000
    this.uniqueCounter = []    
    this.timer = null
    this.result = null
    this.gameLength = 5
    this.scoreSheet = []
    this.timeSheet = 0
    this.minMax = []
    this.min = 0
    this.max = 0

    this.startRound = this.startRound.bind(this)
    this.nextRound = this.nextRound.bind(this)
    this.countdownTimer = this.countdownTimer.bind(this)
    this.startRound = this.startRound.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.handleChoice = this.handleChoice.bind(this)
    this.startGame = this.startGame.bind(this)
    
    //gamestate is either loading, start, play or end, or first for first game for animations
  }

  componentDidMount() {
    axios.get('api/retrieve')
      .then(res => this.setState({ username: res.data }))
      .then(() => this.secondMount())
  }

  numbers() {
    var arr = []
    while (arr.length < this.gameLength) {
      var r = Math.ceil(Math.random() * this.state.collections.length) - 1
      if (arr.indexOf(r) === -1) arr.push(r)
    }
    console.log('selections for the round', arr.sort((a,b) => a - b))
    return this.uniqueCounter = arr
  }

  secondMount() {
    axios.get('api/usersongs')
      .then(res => {
        const data = res.data
        console.log(data)
        const newdata = data.filter(song => song.owner === this.state.username)
        console.log(newdata)
        this.setState({ collections: newdata })
      })
      .then(() => {
        this.numbers()
        const tracksInPlay = []
        for (let i = 0; i < this.gameLength; i++) {
          // tracksInPlay.push(this.state.collections[[(Math.ceil(Math.random() * Math.ceil(this.state.collections.length - 1)))]])
          tracksInPlay.push(this.state.collections[this.uniqueCounter[i]])

        }
        this.setState({ gameData: [...this.state.gameData, ...tracksInPlay] })
        this.startRound()
 
      })
  }

  handleAnswers() {
    var answers = this.state.answers.map(() => (
      this.state.collections[(Math.ceil(Math.random() * Math.ceil(this.state.collections.length - 1)))].track_name)
    )
    if (!answers.includes(this.state.gameData[this.round].track_name)) {
      answers[(Math.ceil(Math.random() * Math.ceil(this.state.answers.length - 1)))] = this.state.gameData[this.round].track_name
    } 
    // console.log(answers)
    const dupes = [...new Set([...answers])]
    // console.log(dupes)
    if (dupes.length < 4) {
      // console.log('dupes', dupes)
      return this.handleAnswers()
    }
    this.setState({ answers })
  }

  startRound(n) {
    clearInterval(this.timer)
    console.log('Update recieved, updating data to round ', n)
    this.round === 0 ? setTimeout(() => this.setState({ gameState: 'start' }), 3000) : null 
  }

  startGame() {
    this.setState({ gameState: 'first' })
    console.log(this.gameState)

    this.nextRound()
    this.handleAnswers()
  }
  cancelGame(e){
    e.preventDefault()
    window.location.assign('/dash')
  }

  countdownTimer() {
    this.timer = setInterval(() => {
      const time = this.state.time - 200
      const width = Number(this.state.width - 0.68)
      this.setState({ time })
      this.points > 1 ? this.points = this.points - 2 : this.points = 0
      this.setState({ width })
    }, 200)
  }

  nextRound() {
    if (this.round === this.gameLength) {
      console.log('finished game')
      this.setState({ gameState: 'endscreen' })

      this.min = Math.min(this.minMax)
      this.max = Math.max(this.minMax)
      
      return this.round = 0
    }
    this.setState({ width: 100 })
    this.points = 300
    this.setState({ time: 30000 })
    this.round = this.round + 1
    console.log('Updating round to level', this.round)
    this.handleAnswers()
    setTimeout(() => {
      this.startRound(this.round)
      this.countdownTimer()
    }, 100)
    if (this.round === 1){
      return this.setState({ gameState: 'first' })
    } else {
      // this.fadeOut()
      return this.setState({ gameState: 'play' })
    }
  }

  handleChoice(e) {
    console.log(e.target.name)
    if (e.target.name !== this.state.gameData[this.round].track_name) {
      clearInterval(this.timer)
      this.result = false
      this.scoreSheet.push('false')
    } else {
      clearInterval(this.timer)
      const score = this.state.score + this.points
      this.setState({ score })
      this.result = true
      this.scoreSheet.push('true')
    }
    console.log(this.scoreSheet)
    const roundTime = (parseFloat(30 - this.state.time / 1000).toFixed(2))
    this.timeSheet += parseFloat(roundTime)
    this.minMax.push(parseFloat(roundTime))
    // this.fadeOut()
    return this.setState({ gameState: 'end' })
  }
  // fadeOut(){
  //   document.getElementById('game').classList.add('animated')
  //   document.getElementById('game').classList.add('fadeOutLeft')
  // }

  render() {
    // console.log(this.state)
    var progbar = {
      width: this.state.width + 'vw'
    }
    if (!this.state) return null
    return (
      <div className='bg-image2'>
        <div className='hidden'> {/* div where the music plays */}
          <iframe src={this.state.gameData[this.round].track_preview} allow='autoplay' id='player' />
        </div>

        <div className={`${this.state.gameState === 'loading' ? '' : 'hidden'}`}>
          
          <center>
            <img src='https://i.imgur.com/s2jF9xM.gif'></img> 
            <h2>Loading game...</h2> 
          </center>

        </div>
        <div className={`${this.state.gameState === 'start' ? 'startScreen' : 'hidden'}`}>
          <button  className='dashButtons' onClick={this.startGame} value='1' ><p>Play Game</p></button>
          <button  className='dashButtons' onClick={this.cancelGame} value='1' ><p>Cancel</p></button>
        </div>



        <div id='game' className={`${this.state.gameState === 'first' ? 'stage' : 'hidden'} || ${this.state.gameState === 'play' ? 'stage animated fadeInRight' : 'hidden' }`}>
          <div>
            {!this.round ? <h2 id='r2p'>Get Ready To Play!</h2> : <h2>Round {this.round}</h2>}
          </div>

          <div className='stagingArea'>
            <div className='questions'>
              {/* <h3></h3> */}
              <div className=''><h2>What's the name of this track?</h2></div>
              {/* map this.questions as this.questions populate on each round start */}
              <div className='choices'>
                {/*button on click function that checks the button.event.value to the levelData.track_name if != then wrong, if == TRUE then correct, then run next round*/}
                {this.state.answers.map((choice, i) => <button key={i} className='choiceButtons' name={choice} onClick={this.handleChoice}>{choice}</button>)}
              </div>
            </div> {/* end of questions */}
          </div> {/* end of stagingArea */}
        </div> {/* end of stage */}

        <div > {/* this is the cowndown timer */}
          <div className={this.state.gameState === 'endscreen' ? 'hidden' : 'countDownEmpty' }></div>
          <div className={this.state.gameState === 'endscreen' ? 'hidden' : 'countDown'} style={progbar}></div>
        </div>

        <div className={this.state.gameState === 'endscreen' ? 'hidden' : 'gameBottom'}>
          <h2>Score: {this.state.score}</h2>
        </div>


        <div className={`${this.state.gameState === 'end' ?  'stage animated fadeInRight' : 'hidden'}`}>
          <h2>Round {this.round}</h2>
          {/* {this.result ? <h3>Correct!</h3> : <h3>Wrong!</h3>} */}
          {this.round ? <div className='endRound'>

            
            <h4>+{this.result ? this.points : 0} points</h4>
            <div className='flex-row'>
              <img className='roundImg' src={this.state.gameData[this.round].track_album_art}></img>
              <div className='flex-right'>
                <em>Track: {this.state.gameData[this.round].track_name}</em>
                <em>Artist: {this.state.gameData[this.round].track_artist}</em>
                <em>From The Album: {this.state.gameData[this.round].track_in_album}</em>
                <br />
                <em>You guessed this track in {parseFloat(30 - this.state.time / 1000).toFixed(2)} seconds!</em>
              </div>
            </div>
          </div> : null
          }
          <button className='nextRound' onClick={this.nextRound} value='1'>{this.round === 10 ? 'end game' : 'next round'}</button>
        </div>

        
        <div className={`${this.state.gameState === 'endscreen' ? 'stagingArea' : 'hidden'}`}>
          <h3>Your Score: {this.state.score}</h3>
          <h3>Time Spent: {this.timeSheet.toFixed(2)} seconds</h3>
        

          <div className='endScreen'>
            {this.state.gameData.map((element, i) => (
              element.track_name !== '' ?

                <div className='resultsCard' key={i}>
                  <img className='endScreenImg' src={element.track_album_art}></img>
                  <p>{element.track_name} by {element.track_artist}</p>
                  <h2>{this.scoreSheet[i - 1] === 'true' ? '✔︎' : '✖︎'}</h2>
                  <p>{this.minMax[i - 1]}</p>
                </div> : null
            ))}

          </div>
        </div>




      </div>
    )
  }
}
