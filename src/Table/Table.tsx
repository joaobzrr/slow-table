import React, { useState, useRef, useLayoutEffect } from "react";
import { Column, ScrollPosition } from "../types";
import "./Table.scss";

const tableRowHeight = 32;
const tableColWidth = 200;
const overscan = 0;

type PropsType = {
    columns: Column[];
    data: Record<string, any>[];
    className?: string;
}

export default function Table(props: PropsType) {
    const { columns, data, className } = props;

    const [offsets, setOffsets] = useState([0, 0]);
    const [rowOffset, colOffset] = offsets;

    const viewRef = useRef<HTMLDivElement | null>(null);
    const viewWidth = viewRef.current?.clientWidth ?? 0;
    const viewHeight = viewRef.current?.clientHeight ?? 0;

    const scrollPositionRef = useRef<ScrollPosition>({ x: 0, y: 0 });

    useLayoutEffect(() => {
	const callback = () => {
	    const x = viewRef.current!.scrollLeft;
	    const y = viewRef!.current!.scrollTop;
	    scrollPositionRef.current = { x, y };
	}

	viewRef.current?.addEventListener("scroll", callback);
	return () => viewRef.current!.removeEventListener("scroll", callback);
    }, []);

    const rafIdRef = useRef<number>();

    useLayoutEffect(() => {
	const animate = () => {
	    const lastScrollPosition = scrollPositionRef.current;
	    const { x, y } = lastScrollPosition;

	    const newRowOffset = Math.floor(y / tableRowHeight);
	    const newColOffset = Math.floor(x / tableColWidth);
	    setOffsets([newRowOffset, newColOffset]);
	    
	    rafIdRef.current = requestAnimationFrame(animate);
	}

	rafIdRef.current = requestAnimationFrame(animate);
	return () => {
	    if (rafIdRef.current) {
		cancelAnimationFrame(rafIdRef.current);
	    }
	}
    }, []);

    const bodyActualWidth = tableColWidth * columns.length;
    const bodyActualHeight = tableRowHeight * data.length;

    const minColsToRender = 1 + Math.ceil(viewWidth / tableColWidth);
    const minRowsToRender = 1 + Math.ceil(viewHeight / tableRowHeight);

    const rowTop = rowOffset;
    const rowBottom = rowOffset + minRowsToRender;
    const rowStart = Math.max(rowTop - overscan, 0);
    const rowEnd = Math.min(rowBottom + overscan, data.length);
    
    const colLeft = colOffset;
    const colRight = colOffset + minColsToRender;
    const colStart = Math.max(colLeft - overscan, 0);
    const colEnd = Math.min(colRight + overscan, columns.length);

    return (
	<div
	    ref={viewRef}
	    className={`table ${className}`}
	>
	    <Body
		columns={columns}
		data={data}
		rowStart={rowStart}
		rowEnd={rowEnd}
		colStart={colStart}
		colEnd={colEnd}
		width={bodyActualWidth}
		height={bodyActualHeight}
	    />
	</div>
    );
}

type BodyProps = {
    columns: Column[];
    data: Record<string, any>[];
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
    width: number;
    height: number;
}

const Body = React.memo((props: BodyProps) => {
    const { columns, data, rowStart, rowEnd, colStart, colEnd, width, height } = props;

    const rows = [];
    for (let i = rowStart; i < rowEnd; i++) {
	rows.push(
	    <Row
		columns={columns}
		data={data[i]}
		colStart={colStart}
		colEnd={colEnd}
		rowIndex={i}
		key={i}
	    />
	);
    }

    return (
	<div
	    className="body"
	    style={{ width, height }}
	>
	    {rows}
	</div>
    );
});

type RowProps = {
    columns: Column[];
    data: Record<string, any>;
    colStart: number;
    colEnd: number;
    rowIndex: number;
}

const Row = React.memo((props: RowProps) => {
    const { columns, data, colStart, colEnd, rowIndex } = props;

    const cells = [];
    for (let i = colStart; i < colEnd; i++) {
	const { key } = columns[i];
	cells.push(
	    <Cell
		text={data[key]}
		colIndex={i}
		key={i}
	    />
	)
    }

    return (
	<div
	    className="row"
	    style={{
		width: columns.length * tableColWidth,
		height: tableRowHeight,
		top: rowIndex * tableRowHeight
	    }}
	>
	    {cells}
	</div>
    );
});

type CellProps = {
    text: string;
    colIndex: number;
}

const Cell = React.memo((props: CellProps) => {
    const { text, colIndex } = props;

    return (
	<div
	    className="cell"
	    style={{
		width: tableColWidth,
		left: colIndex * tableColWidth
	    }}
	>
	    <span className="content">{text}</span>
	</div>
    );
});
