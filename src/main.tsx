import { FC, useState } from "react";

import "./index.css";

import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { makeData, Person } from "./makeData";
import { useDrag, useDrop } from "react-dnd";
import { styled } from "@mui/material/styles";
import {
  Paper,
  TableCell,
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableRow,
} from "@mui/material";

const defaultColumns: ColumnDef<Person>[] = [
  {
    header: "Name",
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: "firstName",
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        footer: (props) => props.column.id,
      },
    ],
  },
  {
    header: "Info",
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: "age",
        header: () => "Age",
        footer: (props) => props.column.id,
      },
      {
        header: "More Info",
        columns: [
          {
            accessorKey: "visits",
            header: () => <span>Visits</span>,
            footer: (props) => props.column.id,
          },
          {
            accessorKey: "status",
            header: "Status",
            footer: (props) => props.column.id,
          },
          {
            accessorKey: "progress",
            header: "Profile Progress",
            footer: (props) => props.column.id,
          },
        ],
      },
    ],
  },
];

const DraggableRow: FC<{
  row: Row<Person>;
  reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void;
}> = ({ row, reorderRow }) => {
  const [, dropRef] = useDrop({
    accept: "row",
    drop: (draggedRow: Row<Person>) => reorderRow(draggedRow.index, row.index),
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => row,
    type: "row",
  });

  return (
    <tr ref={previewRef} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <td ref={dropRef}>
        <button ref={dragRef}>🟰</button>
      </td>
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

function MyTable() {
  const [columns] = useState(() => [...defaultColumns]);
  const [data, setData] = useState(() => makeData(20));

  const [columnResizeMode, setColumnResizeMode] =
    useState<ColumnResizeMode>("onChange");
  console.log(columnResizeMode);

  const reorderRow = (draggedRowIndex: number, targetRowIndex: number) => {
    data.splice(
      targetRowIndex,
      0,
      data.splice(draggedRowIndex, 1)[0] as Person
    );
    setData([...data]);
  };

  const rerender = () => setData(() => makeData(20));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.userId,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    "&:first-child": {
      paddingRight: theme.spacing(3),
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  return (
    <div className="p-2">
      <div className="h-4" />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => rerender()} className="border p-1">
          Regenerate
        </button>
      </div>
      <div className="h-4" />
      <TableContainer component={Paper}>
        <MuiTable
          {...{
            style: {
              width: table.getCenterTotalSize(),
            },
          }}
        >
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <StyledTableRow key={headerGroup.id}>
                <TableCell />
                {headerGroup.headers.map((header) => (
                  <StyledTableCell
                    {...{
                      key: header.id,
                      colSpan: header.colSpan,
                      style: {
                        width: header.getSize(),
                      },
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <div
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`,
                          style: {
                            transform:
                              columnResizeMode === "onEnd" &&
                              header.column.getIsResizing()
                                ? `translateX(${
                                    table.getState().columnSizingInfo
                                      .deltaOffset
                                  }px)`
                                : "",
                          },
                        }}
                      ></div>
                    </div>
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableHead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <DraggableRow key={row.id} row={row} reorderRow={reorderRow} />
            ))}
          </tbody>
          <tfoot>
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        </MuiTable>
      </TableContainer>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default MyTable;
