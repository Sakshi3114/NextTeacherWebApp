"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteTeacherButton } from "@/components/delete-teacher-button";

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/teachers/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (row.original.department ? <Badge variant="secondary">{row.original.department}</Badge> : "—"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon" asChild aria-label={`Edit ${row.original.name}`}>
          <Link href={`/admin/teachers/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <DeleteTeacherButton teacherId={row.original.id} teacherName={row.original.name} />
      </div>
    ),
  },
];

export function TeachersTable({ teachers }) {
  return <DataTable columns={columns} data={teachers} emptyMessage="No teachers yet." />;
}
