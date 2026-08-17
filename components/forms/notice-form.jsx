"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { noticeSchema } from "@/lib/validations/notice";
import { createNotice } from "@/lib/actions/notice-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";

export function NoticeForm() {
  const form = useForm({
    resolver: zodResolver(noticeSchema),
    defaultValues: { title: "", body: "", expiresInDays: 30 },
  });
  const [isPending, startTransition] = useTransition();

  function onSubmit(values) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value ?? ""));
    startTransition(async () => {
      const result = await createNotice(null, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Notice posted.");
        form.reset({ title: "", body: "", expiresInDays: 30 });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Class rescheduled to Room 204" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Write the full notice text here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiresInDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visible for (days)</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={365} {...field} />
              </FormControl>
              <FormDescription>The notice is automatically hidden from the public feed after this.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Posting..." : "Post notice"}
        </Button>
      </form>
    </Form>
  );
}
