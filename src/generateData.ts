import { Column } from "./types";

export default function generateData(rows: number, cols: number): [
  Column[],
  Record<string, any>[]
] {
    const columns = [];
    for (let i = 0; i < cols; i++) {
	columns.push({
	    name: `Column ${i + 1}`,
	    key: `column${i + 1}`
	});
    }

    const data = [];
    for (let i = 0; i < rows; i++) {
	data.push(Object.fromEntries(columns.map((column, index) => {
	    return [column.key, `${i + 1}/${index + 1}`];
	})));
    }

    return [columns, data];
}
