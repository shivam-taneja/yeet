import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://wxt.dev" target="_blank"></a>
        <a href="https://react.dev" target="_blank"></a>
      </div>
      <h1 className="bg-yellow-500">WXT + React</h1>
      <div className="card">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-red-500"
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
