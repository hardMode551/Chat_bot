import './App.css'
import Chat from './components/Chat'
import Decoration from './components/Decoration'

function App() {

  return (
    <div className='App'>
      <Decoration />

      <div className='title'>
        <h1>Bot Chat</h1>
        <p>AI-based service</p>
      </div>
      <Chat />
    </div>
  )
}

export default App
