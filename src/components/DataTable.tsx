"use client"

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    loading?: boolean,
    getLayoutId?: (row: TData) => string,
    className?: string,
    sticky?: boolean,
    rowClicked?: (row: TData) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    loading = false,
    getLayoutId,
    className,
    sticky,
    rowClicked
}: DataTableProps<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    })

    const useLayout = getLayoutId !== undefined

    return (
        <div className={cn(
            "overflow-hidden rounded-md border bg-background w-full relative",
            loading && "animate-pulse",
            className
        )}>
            <Table>
                <TableHeader
                    className={cn(
                        sticky && "sticky top-0 bg-card z-10"
                    )}
                >
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>

                    {!useLayout && table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            onClick={() => { if (rowClicked) { rowClicked(row.original) } }}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                    {useLayout && table.getRowModel().rows.map((row) => {
                        const layoutId = getLayoutId(row.original)

                        return (
                            <motion.tr
                                key={layoutId}
                                data-state={row.getIsSelected() && "selected"}
                                data-slot="table-row"
                                className={"hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors bg-card"}
                                layout="position"
                                layoutId={layoutId}
                                transition={{ type: "spring", duration: 0.55 }}

                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}

                                onClick={() => {
                                    if (rowClicked) {
                                        rowClicked(row.original)
                                    }
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </motion.tr>
                        )
                    })}

                    {table.getRowModel().rows?.length === 0 && <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>}
                </TableBody>
            </Table>
        </div>
    )
}