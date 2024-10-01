import { revalidatePath } from "next/cache";
import { db } from "#database";
import { todos } from "../_database/schema";
import { v7 as uuid } from "uuid";
import { Form } from "./form";

export const dynamic = "force-dynamic";

async function handleSubmit(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const id = uuid();

  await db.transaction(async (db) => {
    await db.insert(todos).values({
      id,
      title,
      description,
      status: "active",
    });
  });

  revalidatePath("/todos");
}

export default async function Home() {
  const result = await db.query.todos.findMany();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <table className="w-full border-collapse mb-8 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="p-3 text-center">ID</th>
            <th className="p-3 text-center">タイトル</th>
            <th className="p-3 text-center">説明</th>
            <th className="p-3 text-center">状態</th>
            <th className="p-3 text-center">作成日</th>
          </tr>
        </thead>
        <tbody className="[&>*:nth-child(odd)]:bg-gray-100 [&>*:nth-child(even)]:bg-white">
          {result.map((todo) => (
            <tr key={todo.id}>
              <td className="p-3 border-t border-gray-200">{todo.id}</td>
              <td className="p-3 border-t border-gray-200">{todo.title}</td>
              <td className="p-3 border-t border-gray-200">
                {todo.description}
              </td>
              <td className="p-3 border-t border-gray-200">{todo.status}</td>
              <td className="p-3 border-t border-gray-200">
                {todo.createdAt.toISOString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Form action={handleSubmit} />
    </div>
  );
}
