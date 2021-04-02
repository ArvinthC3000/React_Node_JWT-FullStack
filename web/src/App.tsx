import './App.css';
import { useHelloQuery } from './generated/graphql';


function App() {

  const { data, loading } = useHelloQuery()

  if (loading || !data) {
    return <div>Loading...</div>
  }

  return (
    <div className="App">
      {JSON.stringify(data)}
    </div>
  );
}

export default App;
