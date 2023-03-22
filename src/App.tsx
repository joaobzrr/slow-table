import Table from "./Table";
import generateData from "./generateData";
import "./App.css";

const [columns, data] = generateData(1000, 100);

function App() {
  return (
    <div className="app">
      <Table
        columns={columns}
        data={data}
      />
    </div>
  );
}

export default App
